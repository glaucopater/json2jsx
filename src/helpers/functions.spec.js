const {
  recursiveRendering,
  getCurrentDate,
  capitalize,
  pascalCase,
  pad2,
  isImageProp,
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
  expect(getCurrentDate()).toMatch(/^\d{14}$/);
});

test("pad2", () => {
  expect(pad2(3)).toBe("03");
  expect(pad2(12)).toBe("12");
});

test("capitalize", () => {
  expect(capitalize("abc")).toBe("Abc");
});

test("pascalCase", () => {
  expect(pascalCase("hello")).toBe("Hello");
  expect(pascalCase("my_component")).toBe("MyComponent");
});

test("isImageProp", () => {
  expect(isImageProp("heroImageUrl")).toBe(true);
  expect(isImageProp("thumbnailUrl")).toBe(true);
  expect(isImageProp("title")).toBe(false);
});
