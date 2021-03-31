const { BadRequestError } = require("../expressError");

/* Helper assists in making query update
return dataToUpdate as column names in an object with numeric values to mae insertion
possible.
Map js to colNums.

dataToUpdate = object {
  firstField: newval,
  secondField: newval
}
jsToSql{
  firstName:"what ever is currently there"
  age = "whatever is there"
}
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");
  console.log("data to update", dataToUpdate),
  console.log("jsToSql", jsToSql);
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );
  console.log("cols", cols);
  console.log(cols.join(", "));
  console.log(Object.values(dataToUpdate));
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
