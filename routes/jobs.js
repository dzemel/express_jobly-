"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobSearch = require("../schemas/jobSearch.json");

const router = express.Router();

//Show all jobs. Optional search criteria.
//Authorization required
router.get("/", async function (req, res, next) {
  const query = req.query;
  // arrive as strings from querystring, but we want as int/bool
  if (query.minSalary !== undefined) { 
    query.minSalary = +query.minSalary;
    query.hasEquity = query.hasEquity === "true";
  }

  const validator = jsonschema.validate(query, jobSearch);
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const jobs = await Job.findAll(query);
  return res.json({ jobs });
});