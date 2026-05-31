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
    expect(json2jsx.getComponentTag("foo", "functional", { id: 1 })).toBe(
      "<Foo {...props.foo} />"
    );
  });

  test("getComponentTag maps array children", () => {
    expect(
      json2jsx.getComponentTag("highlights", "functional", [{ label: "A" }])
    ).toContain("props.highlights?.map");
    expect(json2jsx.getComponentTag("highlights", "functional", [{ label: "A" }])).toContain(
      "<Highlights"
    );
  });

  test("getComponentTag maps nested array rows as separate children", () => {
    const tag = json2jsx.getComponentTag(
      "MyTestSubComponent",
      "functional",
      [[[1, 2, 3], [10, 20, 30]]]
    );
    expect(tag).toContain("props.MyTestSubComponent[0]?.map");
    expect(tag).toContain("items={item}");
    expect(tag).toContain("<MyTestSubComponent");
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

  test("getProp renders img for image-like fields", () => {
    expect(
      json2jsx.getProp(
        { name: "thumbnailUrl", value: "https://example.com/a.png" },
        "functional"
      )
    ).toContain("<img");
    expect(
      json2jsx.getProp(
        { name: "thumbnailUrl", value: "https://example.com/a.png" },
        "functional"
      )
    ).toContain("src={props.thumbnailUrl}");
    expect(
      json2jsx.getProp(
        { name: "thumbnailUrl", value: "https://example.com/a.png" },
        "functional"
      )
    ).toContain("<figcaption>");
  });

  test("getProp renders checkbox for booleans", () => {
    const prop = json2jsx.getProp(
      { name: "is_hidden", value: true, valueType: "boolean" },
      "functional"
    );
    expect(prop).toContain('type="checkbox"');
    expect(prop).toContain("checked={!!props.is_hidden}");
    expect(prop).toContain("readOnly");
  });

  test("manageData classifies booleans", () => {
    const { dataProps } = json2jsx.manageData({ is_default: true, name: "x" });
    expect(dataProps.find((p) => p.name === "is_default").valueType).toBe(
      "boolean"
    );
  });

  test("getProp renders anchor for url fields", () => {
    const prop = json2jsx.getProp(
      { name: "url", value: "https://example.com" },
      "functional"
    );
    expect(prop).toContain("<a href={props.url}");
    expect(prop).toContain('rel="noopener noreferrer"');
    expect(prop).not.toContain("<img");
  });

  test("getProp renders labels and formats arrays", () => {
    const prop = json2jsx.getProp(
      { name: "tags", value: "a, b", valueType: "array" },
      "functional"
    );
    expect(prop).toContain("<strong>Tags:</strong>");
    expect(prop).toContain('.join(", ")');
  });

  test("manageData treats primitive arrays as props", () => {
    const { dataProps, dataChildren } = json2jsx.manageData({
      tags: ["a", "b"],
      items: [{ id: 1 }],
    });
    expect(dataProps.find((p) => p.name === "tags").value).toBe("a, b");
    expect(dataProps.find((p) => p.name === "tags").valueType).toBe("array");
    expect(dataChildren).toContain("items");
  });

  test("manageData handles media-gallery shape", () => {
    const file = path.join(__dirname, "json_samples", "media-gallery.json");
    const { data } = json2jsx.getDataFromFile(file);
    const { dataChildren } = json2jsx.manageData(data.page);
    expect(dataChildren).toEqual(
      expect.arrayContaining([
        "author",
        "gallery",
        "highlights",
        "relatedLinks",
      ])
    );
    expect(data.page.gallery.items).toHaveLength(6);
    expect(data.page.heroImageUrl).toContain("images.unsplash.com");
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

  test("getDataSource resolves children from first array item", () => {
    const raw = [{ ability: { name: "limber" }, slot: 1 }];
    const normalized = json2jsx.normalizeComponentData(raw);
    const source = json2jsx.getDataSource(raw, normalized);
    expect(json2jsx.getChildData(source, "ability")).toEqual({
      name: "limber",
    });
  });
});
