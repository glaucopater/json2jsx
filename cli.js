#!/usr/bin/env node
const json2jsx = require("./index");
const fs = require("fs");
var path = require("path");
const {
  outputDir,
  defaultRootComponentName,
  defaultFolderPrefix
} = require("./options.json");

const versionKeywords = ["-v", "-ver", "--ver", "--version"];

if (process.argv[2] && versionKeywords.includes(process.argv[2])) {
  const { name, version } = require("./package.json");
  console.log(`${name} version: ${version}`);
} else if (process.argv[2] && fs.existsSync(process.argv[2])) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const inputFile = process.argv[2];
  const folderPrefix = process.argv[3] ? process.argv[3] : defaultFolderPrefix;
  var absolutePath = path.resolve(inputFile);
  json2jsx.getRootComponent(
    defaultRootComponentName,
    absolutePath,
    folderPrefix
  );
}
