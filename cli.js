#!/usr/bin/env node
const json2jsx = require("./index");
const fs = require("fs");
var path = require("path");
const {
  outputDir,
  templatesFolder,
  silentMode,
  defaultComponentType,
  defaultRootComponentName,
  defaultFolderPrefix
} = require("./options.json");

if (process.argv[2] && fs.existsSync(process.argv[2])) {
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
} else if (!silentMode) {
  console.log(`The file ${filename} was created!`);
}
