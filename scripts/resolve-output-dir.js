const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const outputRoot = path.join(repoRoot, "output");

function hasGeneratedApp(dir) {
  return fs.existsSync(path.join(dir, "App.js"));
}

function listGeneratedDirs() {
  if (!fs.existsSync(outputRoot)) {
    return [];
  }
  return fs
    .readdirSync(outputRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "playground")
    .map((entry) => path.join(outputRoot, entry.name))
    .filter(hasGeneratedApp)
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
}

function resolveOutputDir(requestedName) {
  if (requestedName) {
    const candidate = path.isAbsolute(requestedName)
      ? requestedName
      : path.join(outputRoot, requestedName);
    if (hasGeneratedApp(candidate)) {
      return candidate;
    }
    throw new Error(
      `Generated output not found at output/${path.basename(candidate)}.\n` +
        `Run: json2jsx json_samples/test.json test_run\n` +
        `Or:  yarn demo`
    );
  }

  const preferred = path.join(outputRoot, "test_run_test");
  if (hasGeneratedApp(preferred)) {
    return preferred;
  }

  const generated = listGeneratedDirs();
  if (generated.length > 0) {
    return generated[0];
  }

  throw new Error(
    "No generated App.js under output/. Run: yarn demo (or json2jsx json_samples/test.json test_run)"
  );
}

function resolveOutputDirName(requestedName) {
  return path.basename(resolveOutputDir(requestedName));
}

if (require.main === module) {
  const name = resolveOutputDirName(process.argv[2] || process.env.VITE_OUTPUT_DIR);
  console.log(name);
}

module.exports = { resolveOutputDir, resolveOutputDirName, listGeneratedDirs };
