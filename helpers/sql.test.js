const { sqlForPartialUpdate } = require("./sql")
const { BadRequestError} = require("../expressError");

describe("sqlForPartialUpdate", function () {
  test("works: 1 value", function () {
    const result = sqlForPartialUpdate(
      {v1: "v1"},
      {v2: "v2", vv2: "v3"}
    );
    expect(result).toEqual({
      setCols: "\"v1\"=$1",
      values: [
         "v1",
      ]
  
    });
  });
    test("works: 2 values", function () {
      const result = sqlForPartialUpdate(
        {v1: "v1", e2: "e2"},
        {col2: "v2"}
      );
      expect(result).toEqual({
        setCols: "\"v1\"=$1, \"e2\"=$2",
        values: [
           "v1","e2"
        ]
    
      });
    });
  });

  // test("works: admin", function () {
  //   const token = createToken({ username: "test", isAdmin: true });
  //   const payload = jwt.verify(token, SECRET_KEY);
  //   expect(payload).toEqual({
  //     iat: expect.any(Number),
  //     username: "test",
  //     isAdmin: true,
  //   });
  // });

  // test("works: default no admin", function () {
  //   // given the security risk if this didn't work, checking this specifically
  //   const token = createToken({ username: "test" });
  //   const payload = jwt.verify(token, SECRET_KEY);
  //   expect(payload).toEqual({
  //     iat: expect.any(Number),
  //     username: "test",
  //     isAdmin: false,
  //   });
  // });
