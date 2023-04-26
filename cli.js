#!/usr/bin/env node
const json2jsx = require("./index");
const fs = require("fs");
const path = require("path");
const { outputDir, defaultRootComponentName, defaultFolderPrefix } = require("./config.json");
const { name, description, version } = require("./package.json");
const versionKeywords = ["-v", "-ver", "--ver", "--version"];

const showHelp = () => console.log(`${name}: ${description}`);

const showVersion = () => console.log(`${name} version: ${version}`);

const generateOutput = (inputFile, folderPrefix) => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const absolutePath = path.resolve(inputFile);
  json2jsx.getRootComponent(defaultRootComponentName, absolutePath, folderPrefix);
  console.log(`${name}: output generated in the output folder.`);
};

const [,, param, folderPrefix = defaultFolderPrefix] = process.argv;

if (!param) {
  showHelp();
} else if (versionKeywords.includes(param)) {
  showVersion();
} else if (fs.existsSync(param)) {
  generateOutput(param, folderPrefix);
} else {
  console.log(`${param} not found`);
}
