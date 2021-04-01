"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { create } = require("./company");

class Job {
  /* Create a job with data entered by admin. Only admin have the ability
  to update, create, or delete job data. 
  
  Users can only apply to Jobs.

  data entered for a job to be valid should be: {title, salary, equity, company_handle }
  
  Returns job data as: {id, title, salary, equity, company_handle }

  Throw bad request error if job already in database.

  */


static async create({title, salary, equity, companyHandle}){
  /*
  Check if job exists in the database.
  If it's a duplicate then throw an error.
  Otherwise insert it into the database if data is entered correctly.
  */
  // const duplicateCheck = await db.query(
  //   `SELECT title
  //       FROM jobs
  //       WHERE title = $1`,
  //   [title]
  // );
  // console.log("Testing", duplicateCheck);
  // if (duplicateCheck.rows[0]) {
  //   throw new BadRequestError(`Duplicate Job: ${title}`);
  // }
  const result = await db.query(
    `INSERT INTO jobs
        (title, salary, equity, company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
    [title, salary, equity, companyHandle]
  );
  const job = result.rows[0];
  console.log(result);

  return job;
  }
  //find all jobs and filter by equity if field is provided.
  static async findAll(filters = {}) {
    //grab the query params entered into the route function.
    //set a base query to modify. 
    const { title, minSalary, hasEquity} = filters;
    let jobsQuery = 
      `SELECT id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
      FROM jobs`;

    //make arrays to hold sql query WHERE AND additions and 
    //array storing specific company info to input.
    let sqlWhereAnd = [];
    let queryValues = [];

    //if title exists than push it to queryValues.
    if (title) {
      queryValues.push(`%${title}%`);
      sqlWhereAnd.push(`title ILIKE $${queryValues.length}`);

    //if minSalary exists than add it to the values array
    //and push necessary sql condition to conditions array.
    if (minSalary !== undefined) {
      queryValues.push(minSalary);
      sqlWhereAnd.push(`salary >= $${queryValues.length}`); 
    }

    if (hasEquity === true) {
      sqlWhereAnd.push(`equity >= 0`);
    }

    }
    //If the length of the first sql array is greater than 0 add 
    //necessary sequel statements to it.
    if (sqlWhereAnd.length > 0) {
      jobsQuery += " WHERE " + sqlWhereAnd.join(" AND ");
    }
    //add order by job title to sql query.
    //query by sql query with queryValues as validation and return.
    jobsQuery += " ORDER BY title";
    const jobsResults = await db.query(jobsQuery, queryValues)
    return jobsResults.rows;
  }

  //return data about a job if id is entered.
  //throw an error if not id is entered or id entered is not in database.
  static async get(id) {
  const jobResult = await db.query(
        `SELECT id, title, salary, equity, company_handle AS "companyHandle"
          FROM jobs
          WHERE id = $1`, 
        [id]);

  const job = jobRes.rows[0];

  if (!job) {
    throw new NotFoundError(`No jobs currently available: ${id}`);
  }
  const companiesRes = await db.query(
        `SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"
          FROM companies
          WHERE handle = $1`, 
        [job.companyHandle]);

  delete job.companyHandle;
  job.company = companiesRes.rows[0];

  return job;
  }
}
// //update job data.
// static async update(id, data) {
//   const { setCols, values } = sqlForPartialUpdate(
//       data,
//       {});
//   const idVarIdx = "$" + (values.length + 1);

//   const querySql = `UPDATE jobs 
//                     SET ${setCols} 
//                     WHERE id = ${idVarIdx} 
//                     RETURNING id, 
//                               title, 
//                               salary, 
//                               equity,
//                               company_handle AS "companyHandle"`;
//   const result = await db.query(querySql, [...values, id]);
//   const job = result.rows[0];

//   if (!job) throw new NotFoundError(`No job: ${id}`);

//   return job;
// }

// //remove a job.
// static async remove(id) {
//   const result = await db.query(
//         `DELETE
//           FROM jobs
//           WHERE id = $1
//           RETURNING id`, [id]);
//   const job = result.rows[0];

//   if (!job) throw new NotFoundError(`No job: ${id}`);
// }
// }
// }

module.exports = Job;