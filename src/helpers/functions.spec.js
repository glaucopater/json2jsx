const {
  recursiveRendering,
  getCurrentDate,
  capitalize,
  pascalCase,
  pad2,
  isImageProp,
  isLinkProp,
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
  expect(isImageProp("fullImageUrl")).toBe(true);
  expect(isImageProp("avatarUrl")).toBe(true);
  expect(isImageProp("iconUrl")).toBe(true);
  expect(isImageProp("heroImage")).toBe(true);
  expect(isImageProp("url")).toBe(false);
  expect(isImageProp("apiUrl")).toBe(false);
  expect(isImageProp("profileUrl")).toBe(false);
  expect(isImageProp("title")).toBe(false);
});

test("isLinkProp", () => {
  expect(isLinkProp("url")).toBe(true);
  expect(isLinkProp("apiUrl")).toBe(true);
  expect(isLinkProp("href")).toBe(true);
  expect(isLinkProp("heroImageUrl")).toBe(false);
  expect(isLinkProp("thumbnailUrl")).toBe(false);
  expect(isLinkProp("title")).toBe(false);
});
