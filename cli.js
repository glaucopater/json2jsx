#!/usr/bin/env node
const json2jsx = require("./index");
const fs = require("fs");
var path = require("path");
const {
  outputDir,
  defaultRootComponentName,
  defaultFolderPrefix,
} = require("./options.json");
const { name, description, version } = require("./package.json");
const versionKeywords = ["-v", "-ver", "--ver", "--version"];

if (process.argv.length < 3) {
  console.log(`${name}: ${description}`);
} else if (process.argv[2]) {
  // a parameter is passed
  if (versionKeywords.includes(process.argv[2])) {
    console.log(`${name} version: ${version}`);
  } else if (fs.existsSync(process.argv[2])) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    const inputFile = process.argv[2];
    const folderPrefix = process.argv[3]
      ? process.argv[3]
      : defaultFolderPrefix;
    const absolutePath = path.resolve(inputFile);
    json2jsx.getRootComponent(
      defaultRootComponentName,
      absolutePath,
      folderPrefix
    );
    console.log(`${name}: output generated in the output folder.`);
  } else {
    console.log(`${process.argv[2]} not found`);
  }
}
