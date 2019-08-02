const fs = require("fs");
const {
  outputDir,
  defaultRootComponentName,
  cleanUpTestOutput
} = require("./options.json");
const { getFolderPrefix } = require("./helpers/functions");

describe("Test Generated Component according to the options, default folder name set to current date", () => {
  const defaultFolderPrefix = getFolderPrefix("currentdate");
  const componentName = "MyTestComponent";
  const subComponentName = "MyTestSubComponent";
  const outputFile = `./output/${defaultFolderPrefix}_test/${componentName}/${componentName}.jsx`;

  const appDir = `./output/${defaultFolderPrefix}_test/`;
  const rootFile = `./output/${defaultFolderPrefix}_test/${defaultRootComponentName}.js`;
  const rootCssFile = `./output/${defaultFolderPrefix}_test/${defaultRootComponentName}.css`;
  const componentFolder = `./output/${defaultFolderPrefix}_test/${componentName}/`;
  const subComponentFolder = `./output/${defaultFolderPrefix}_test/${componentName}/${subComponentName}`;
  const subComponentOutputFile = `./output/${defaultFolderPrefix}_test/${componentName}/${subComponentName}/${subComponentName}.jsx`;

  it("creates a folder containing with the react component structure", () => {
    const inputFile = "./json_samples/test.json";
    if (fs.existsSync(inputFile)) {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }

      //launch the command line mode
      const execSync = require("child_process").execSync;
      execSync(`node cli.js ${inputFile} ${defaultFolderPrefix}`);

      expect(fs.existsSync(outputDir)).toBe(true);
      expect(fs.existsSync(appDir)).toBe(true);
      expect(fs.existsSync(componentFolder)).toBe(true);
      expect(fs.existsSync(subComponentFolder)).toBe(true);
      expect(fs.existsSync(rootFile)).toBe(true);
      expect(fs.existsSync(rootCssFile)).toBe(true);

      if (cleanUpTestOutput) {
        //cleanup restoring the previous status of the file system
        fs.unlinkSync(outputFile);
        fs.unlinkSync(rootFile);
        fs.unlinkSync(rootCssFile);
        fs.unlinkSync(subComponentOutputFile);
        fs.rmdirSync(subComponentFolder);
        fs.rmdirSync(componentFolder);
        fs.rmdirSync(appDir);
        expect(fs.existsSync(appDir)).toBe(false);
      }
    }
  });
});

describe("Test Generated Component according to the options, default folder is generic", () => {
  const defaultFolderPrefix = getFolderPrefix("Abc_123");
  const componentName = "MyTestComponent";
  const subComponentName = "MyTestSubComponent";
  const outputFile = `./output/${defaultFolderPrefix}_test/${componentName}/${componentName}.jsx`;

  const appDir = `./output/${defaultFolderPrefix}_test/`;
  const rootFile = `./output/${defaultFolderPrefix}_test/${defaultRootComponentName}.js`;
  const rootCssFile = `./output/${defaultFolderPrefix}_test/${defaultRootComponentName}.css`;
  const componentFolder = `./output/${defaultFolderPrefix}_test/${componentName}/`;
  const subComponentFolder = `./output/${defaultFolderPrefix}_test/${componentName}/${subComponentName}`;
  const subComponentOutputFile = `./output/${defaultFolderPrefix}_test/${componentName}/${subComponentName}/${subComponentName}.jsx`;

  it("creates a folder containing with the react component structure", () => {
    const inputFile = "./json_samples/test.json";
    if (fs.existsSync(inputFile)) {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }

      //launch the command line mode
      const execSync = require("child_process").execSync;
      execSync(`node cli.js ${inputFile} ${defaultFolderPrefix}`);

      expect(fs.existsSync(outputDir)).toBe(true);
      expect(fs.existsSync(appDir)).toBe(true);
      expect(fs.existsSync(componentFolder)).toBe(true);
      expect(fs.existsSync(subComponentFolder)).toBe(true);
      expect(fs.existsSync(rootFile)).toBe(true);
      expect(fs.existsSync(rootCssFile)).toBe(true);

      //cleanup restoring the previous status of the file system

      if (cleanUpTestOutput) {
        fs.unlinkSync(outputFile);
        fs.unlinkSync(rootFile);
        fs.unlinkSync(rootCssFile);
        fs.unlinkSync(subComponentOutputFile);
        fs.rmdirSync(subComponentFolder);
        fs.rmdirSync(componentFolder);
        fs.rmdirSync(appDir);
        expect(fs.existsSync(appDir)).toBe(false);
      }
    }
  });
});
