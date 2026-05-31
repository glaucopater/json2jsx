#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const json2jsx = require("../index");
const { getFolderPrefix } = require("../src/helpers/functions");

const repoRoot = path.resolve(__dirname, "..");
const initScript = path.join(__dirname, "init-playground.js");
const runScript = path.join(__dirname, "run-playground.js");

const [, , ...argv] = process.argv;
const serve = !argv.includes("--setup-only");
const filtered = argv.filter((arg) => !arg.startsWith("--"));

const defaultJson = path.join(repoRoot, "json_samples", "test.json");
const defaultPrefix = "test_run";

const inputFile = path.resolve(filtered[0] || defaultJson);
const folderPrefix = filtered[1] || defaultPrefix;

async function main() {
  if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    process.exit(1);
  }

  const { baseFilename } = json2jsx.getDataFromFile(inputFile);
  const prefix = getFolderPrefix(folderPrefix);
  const outputDirName = `${prefix}_${baseFilename}`;

  console.log(`Generating from ${path.relative(repoRoot, inputFile)} → output/${outputDirName}/`);
  await json2jsx.getRootComponent("App", inputFile, folderPrefix);

  execSync(`node "${initScript}" --install`, {
    cwd: repoRoot,
    stdio: "inherit",
  });

  console.log(`Playground ready at output/playground/`);

  if (serve) {
    console.log(`Starting preview for output/${outputDirName}/ …`);
    execSync(`node "${runScript}" ${outputDirName}`, {
      cwd: repoRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        VITE_OUTPUT_DIR: outputDirName,
      },
    });
  } else {
    console.log(`Preview without dev server:`);
    console.log(`  yarn playground -- ${outputDirName}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
