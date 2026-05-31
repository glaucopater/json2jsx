const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const {
  outputDir,
  defaultRootComponentName,
  cleanUpTestOutput,
} = require("./config.json");
const { getFolderPrefix } = require("./src/helpers/functions");

const node = process.execPath;
const cliPath = path.join(__dirname, "cli.js");
const inputFile = path.join(__dirname, "json_samples", "test.json");

function runCli(folderPrefix) {
  execFileSync(node, [cliPath, inputFile, folderPrefix], {
    cwd: __dirname,
    stdio: "pipe",
  });
}

function removeOutputTree(appDir) {
  if (!fs.existsSync(appDir)) {
    return;
  }
  fs.rmSync(appDir, { recursive: true, force: true });
}

function buildPaths(folderPrefix) {
  const componentName = "MyTestComponent";
  const subComponentName = "MyTestSubComponent";
  const appDir = path.join(outputDir, `${folderPrefix}_test`);
  return {
    componentName,
    subComponentName,
    appDir,
    rootFile: path.join(appDir, `${defaultRootComponentName}.js`),
    rootCssFile: path.join(appDir, `${defaultRootComponentName}.css`),
    componentFolder: path.join(appDir, componentName),
    subComponentFolder: path.join(appDir, componentName, subComponentName),
    componentFile: path.join(appDir, componentName, `${componentName}.jsx`),
    subComponentFile: path.join(
      appDir,
      componentName,
      subComponentName,
      `${subComponentName}.jsx`
    ),
  };
}

function assertGeneratedStructure(paths) {
  expect(fs.existsSync(paths.appDir)).toBe(true);
  expect(fs.existsSync(paths.componentFolder)).toBe(true);
  expect(fs.existsSync(paths.subComponentFolder)).toBe(true);
  expect(fs.existsSync(paths.rootFile)).toBe(true);
  expect(fs.existsSync(paths.rootCssFile)).toBe(true);

  const rootSource = fs.readFileSync(paths.rootFile, "utf8");
  expect(rootSource).toContain("const App = (props)");
  expect(rootSource).toContain("MyTestComponent");

  const childSource = fs.readFileSync(paths.componentFile, "utf8");
  expect(childSource).toContain("MyTestSubComponent");
}

describe.each([
  ["currentdate", () => getFolderPrefix("currentdate")],
  ["fixed prefix", () => getFolderPrefix("Abc_123")],
])("generated component tree (%s)", (_label, getPrefix) => {
  let paths;
  let folderPrefix;

  beforeAll(() => {
    if (!fs.existsSync(inputFile)) {
      return;
    }
    fs.mkdirSync(outputDir, { recursive: true });
    folderPrefix = getPrefix();
    paths = buildPaths(folderPrefix);
    removeOutputTree(paths.appDir);
    runCli(folderPrefix);
  });

  afterAll(() => {
    if (cleanUpTestOutput && paths) {
      removeOutputTree(paths.appDir);
    }
  });

  it("creates react component files with expected structure", () => {
    if (!fs.existsSync(inputFile)) {
      return;
    }
    assertGeneratedStructure(paths);
  });
});
