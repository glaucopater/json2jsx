const path = require("path");
const json2jsx = require("./index");

describe("json2jsx API", () => {
  test("manageData extracts props and children from objects", () => {
    const { dataProps, dataChildren } = json2jsx.manageData({
      title: "hello",
      nested: { a: 1 },
      empty: null,
    });
    expect(dataProps.map((p) => p.name)).toEqual(
      expect.arrayContaining(["title", "empty"])
    );
    expect(dataChildren).toContain("nested");
  });

  test("manageData handles array root using first element", () => {
    const { dataProps, dataChildren } = json2jsx.manageData([
      { name: "x", child: { id: 1 } },
    ]);
    expect(dataProps.map((p) => p.name)).toContain("name");
    expect(dataChildren).toContain("child");
  });

  test("getComponentTag uses props for functional components", () => {
    expect(json2jsx.getComponentTag("foo", "functional")).toBe(
      "<Foo {...props.foo} />"
    );
  });

  test("getComponentTag uses this.props for statefull components", () => {
    expect(json2jsx.getComponentTag("foo", "statefull")).toBe(
      "<Foo {...this.props.foo} />"
    );
  });

  test("getProp renders functional prop binding", () => {
    expect(
      json2jsx.getProp({ name: "title", value: "x" }, "functional")
    ).toContain("{props.title}");
  });

  test("getDataFromFile rejects non-json extension", () => {
    expect(() =>
      json2jsx.getDataFromFile(path.join(__dirname, "index.js"))
    ).toThrow(/\.json extension/);
  });

  test("getDataFromFile loads json_samples/test.json", () => {
    const file = path.join(__dirname, "json_samples", "test.json");
    const { baseFilename, data } = json2jsx.getDataFromFile(file);
    expect(baseFilename).toBe("test");
    expect(data.MyTestComponent).toBeDefined();
  });
});
