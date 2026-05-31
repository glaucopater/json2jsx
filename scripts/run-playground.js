const path = require("path");
const { execSync } = require("child_process");
const { resolveOutputDirName } = require("./resolve-output-dir");

const repoRoot = path.resolve(__dirname, "..");
const playgroundDir = path.join(repoRoot, "output", "playground");
const requested = process.argv[2] || process.env.VITE_OUTPUT_DIR;
const outputDirName = resolveOutputDirName(requested);

console.log(`Previewing output/${outputDirName}`);

execSync("yarn dev", {
  cwd: playgroundDir,
  stdio: "inherit",
  env: {
    ...process.env,
    VITE_OUTPUT_DIR: outputDirName,
  },
});
