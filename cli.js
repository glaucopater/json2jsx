#!/usr/bin/env node
const json2jsx = require("./index");
const fs = require("fs");
const path = require("path");
const {
  outputDir,
  defaultRootComponentName,
  defaultFolderPrefix,
} = require("./config.json");
const { name, description, version } = require("./package.json");
const versionKeywords = ["-v", "-ver", "--ver", "--version"];
const helpKeywords = ["-h", "--help", "help"];

const showHelp = () => {
  console.log(`${name} v${version} — ${description}`);
  console.log("");
  console.log("Usage:");
  console.log(`  ${name} <file.json> [folderPrefix]`);
  console.log("");
  console.log("Arguments:");
  console.log("  file.json      Path to the JSON input file (.json required)");
  console.log(
    `  folderPrefix   Output folder prefix (default: "${defaultFolderPrefix}" from config.json)`
  );
  console.log("");
  console.log("Output:");
  console.log(
    `  ${outputDir}/<prefix>_<basename>/  React components (${defaultRootComponentName}.js + nested .jsx)`
  );
  console.log("");
  console.log("Options:");
  console.log("  -h, --help     Show this help");
  console.log("  -v, --version  Show version");
  console.log("");
  console.log("Examples:");
  console.log(`  ${name} json_samples/test.json test_run`);
  console.log(`  ${name} json_samples/pokemon.json pokemon`);
  console.log(`  ${name} json_samples/media-gallery.json gallery`);
};

const showVersion = () => console.log(`${name} version: ${version}`);

async function generateOutput(inputFile, folderPrefix) {
  createDir(outputDir);
  const absolutePath = path.resolve(inputFile);
  await json2jsx.getRootComponent(
    defaultRootComponentName,
    absolutePath,
    folderPrefix
  );
  console.log(`${name}: output generated in the output folder.`);
}

function createDir(dirName) {
  fs.mkdirSync(dirName, { recursive: true });
}

async function main() {
  const [, , param, folderPrefix = defaultFolderPrefix] = process.argv;

  if (!param || helpKeywords.includes(param)) {
    showHelp();
  } else if (versionKeywords.includes(param)) {
    showVersion();
  } else if (fs.existsSync(param)) {
    await generateOutput(param, folderPrefix);
  } else {
    console.log(`${param} not found`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
