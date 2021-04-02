"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./jobs.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

//test creating a job
describe("create", function () {
  const newJob = {
    title: "new",
    salary: 100,
    equity: "0.1",
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({ ...newJob, id: expect.any(Number) });
  });

  test("incorrect creation", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("findAll", function () {
  test("works: no filter", async function () {
    const resultsJobs = await db.query(`
    INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES ('Job1', 100, '0.1', 'c1'),
           ('Job2', 200, '0.2', 'c1'),
           ('Job3', 300, '0', 'c1'),
           ('Job4', NULL, NULL, 'c1')
    RETURNING id`);
    let testJobIds = resultsJobs.rows.map((r) => r.id);
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "Job1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds[1],
        title: "Job2",
        salary: 200,
        equity: "0.2",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds[2],
        title: "Job3",
        salary: 300,
        equity: "0",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds[3],
        title: "Job4",
        salary: null,
        equity: null,
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });
});
