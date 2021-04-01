"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(filters = {}) {
    //grab the query params entered into the route function.
    //set a base query to modify. 
    const { name, minEmployees, maxEmployees } = filters;
    let companiesQuery = 
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies`;

    //make arrays to hold sql query WHERE AND additions and 
    //array storing specific company info to input.
    let sqlWhereAnd = [];
    let queryValues = [];

    //if min or max employees exist exist then add them to the arrays.
    if (minEmployees !== undefined) {
      queryValues.push(minEmployees);
      sqlWhereAnd.push(`num_employees >= $${queryValues.length}`); 
    }

    if (maxEmployees !== undefined) {
      queryValues.push(maxEmployees);
      sqlWhereAnd.push(`num_employees <= $${queryValues.length}`);
    }
    //if min greater than max throw bad request error.
    if (minEmployees > maxEmployees) {
      throw new BadRequestError(
        "Max employees must be greater than Min employees"
      );
    }
    //if name is valid than push it to both query strings.
    if (name) {
      queryValues.push(`%${name}%`);
      sqlWhereAnd.push(`name ILIKE $${queryValues.length}`);
    }
    //If the length of the first sql array is greater than 0 add necessary sequel statements to it.
    if (sqlWhereAnd.length > 0) {
      companiesQuery += " WHERE " + sqlWhereAnd.join(" AND ");
    }
    //add order by company name to sql query.
    //query by sql query with queryValues as validation anf return.
    companiesQuery += " ORDER BY name";
    const companyResults = await db.query(companiesQuery, queryValues)
    return companyResults.rows;

  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Company;
