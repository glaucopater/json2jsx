const fs = require("fs");
const { outputDir, defaultRootComponentName } = require("./options.json");
const { getFolderPrefix } = require("./helpers/functions");
const defaultFolderPrefix = getFolderPrefix("Abc_123");
const componentName = "MyTestComponent";
const outputFile = `./output/${defaultFolderPrefix}_test/${componentName}/${componentName}.jsx`;
const appDir = `./output/${defaultFolderPrefix}_test/`;
const rootFile = `./output/${defaultFolderPrefix}_test/${defaultRootComponentName}.js`;
const rootCssFile = `./output/${defaultFolderPrefix}_test/${defaultRootComponentName}.css`;
const componentFolder = `./output/${defaultFolderPrefix}_test/${componentName}/`;

describe("Test Generated Component according to the options", () => {
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
      expect(fs.existsSync(rootFile)).toBe(true);
      expect(fs.existsSync(rootCssFile)).toBe(true);

      //restore the previous status of the file system

      fs.unlinkSync(outputFile);
      fs.unlinkSync(rootFile);
      fs.unlinkSync(rootCssFile);
      fs.rmdirSync(componentFolder);
      fs.rmdirSync(appDir);
      expect(fs.existsSync(appDir)).toBe(false);
    }
  });
});
