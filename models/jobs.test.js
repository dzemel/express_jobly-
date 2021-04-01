"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const { findAll } = require("./jobs.js");
const Job = require("./jobs.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
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
    companyHandle: "c1"
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({...newJob, id:expect.any(Number)});
  });
  
  test("incorrect creation", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
    } catch(err){
      expect(err instanceof BadRequestError).toBeTruthy();
  }
  });
});

describe("findAll", function () {
  test("works: no filter", async function () {
    console.log(testJobIds.rows[1]);
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: testJobIds.rows[0],
        title: "Job1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds.rows[1],
        title: "Job2",
        salary: 200,
        equity: "0.2",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds.rows[2],
        title: "Job3",
        salary: 300,
        equity: "0",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds.rows[3],
        title: "Job4",
        salary: null,
        equity: null,
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });
});
