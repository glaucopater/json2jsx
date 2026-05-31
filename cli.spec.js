const { execFileSync } = require("child_process");
const path = require("path");

const cliPath = path.join(__dirname, "cli.js");
const node = process.execPath;

describe("cli", () => {
  test("--version prints package version", () => {
    const { version } = require("./package.json");
    const output = execFileSync(node, [cliPath, "--version"], {
      encoding: "utf8",
    });
    expect(output).toContain(version);
  });

  test("missing file prints not found", () => {
    const output = execFileSync(
      node,
      [cliPath, "definitely-missing-file.json"],
      { encoding: "utf8" }
    );
    expect(output).toContain("not found");
  });
});
