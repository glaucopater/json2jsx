const {
  recursiveRendering,
  getCurrentDate,
  capitalize,
} = require("./functions");

test("recursiveRendering", () => {
  const st =
    "import React, { Component } from 'react'; ${importChildStatement} export default class ${name} extends Component { }";
  expect(
    recursiveRendering(st, { name: "Test", importChildStatement: "" })
  ).toBe(
    "import React, { Component } from 'react';  export default class Test extends Component { }"
  );
});

test("getCurrentDate", () => {
  expect(getCurrentDate().length).toBeGreaterThan(10);
});

test("capitalize", () => {
  expect(capitalize("abc")).toBe("Abc");
});
