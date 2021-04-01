"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/jobs");
const jobSearch = require("../schemas/jobSearch.json");

const router = express.Router();

//Show all jobs. Optional search criteria.
//Authorization not required
router.get("/", async function (req, res, next) {
  const query = req.query;
  // arrive as strings from querystring, but we want as int/bool
  if (query.minSalary !== undefined) {
    query.minSalary = +query.minSalary;
    query.hasEquity = query.hasEquity === "true";
  }

  const validator = jsonschema.validate(query, jobSearch);
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  const jobs = await Job.findAll(query);
  return res.json({ jobs });
});

// get a job based off a id passed in as a paramter
// no authorization required
// returns a job as a json object
router.get("/:id", async function (req, res, next) {
  const job = await Job.get(req.params.id);
  return res.json({ job });
});

/**
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.patch("/:handle", ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, jobUpdateSchema);
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.update(req.params.id, req.body);
  return res.json({ job });
});

// DELETE job from the database

// Authorization: admin

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  await Job.remove(req.params.id);
  return res.json({ deleted: req.params.id });
});
