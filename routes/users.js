"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const jobApplicationSchema = require("../schemas/jobApplication.json");

const router = express.Router();

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: login
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, userNewSchema);
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  const user = await User.register(req.body);
  const token = createToken(user);
  return res.status(201).json({ user, token });
});

/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: login
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  const users = await User.findAll();
  return res.json({ users });
});

/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin }
 *
 * Authorization required: login or admin
 **/

router.get(
  "/:username",
  ensureLoggedIn || ensureAdmin,
  async function (req, res, next) {
    const user = await User.get(req.params.username);
    return res.json({ user });
  }
);

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: login or admin
 **/

router.patch(
  "/:username",
  ensureLoggedIn || ensureAdmin,
  async function (req, res, next) {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  }
);

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: login or admin
 **/

router.delete(
  "/:username",
  ensureLoggedIn || ensureAdmin,
  async function (req, res, next) {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  }
);

router.post(
  "/:username/jobs/:id",
  ensureLoggedIn || ensureAdmin,
  async function (req, res, next) {
    console.log(req.query)
    const validator = jsonschema.validate(req.body, jobApplication);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    let applied = await User.apply(req.params.body);
    return res.json({"applied": applied.job.id});
  }
);

module.exports = router;
