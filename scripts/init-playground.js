const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const templateDir = path.join(__dirname, "playground");
const targetDir = path.join(repoRoot, "output", "playground");
const runInstall = process.argv.includes("--install");

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === "node_modules") {
      continue;
    }

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.name === "yarn.lock" && fs.existsSync(destPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(templateDir)) {
  console.error(`Missing template folder: ${templateDir}`);
  process.exit(1);
}

copyRecursive(templateDir, targetDir);

const lockFile = path.join(targetDir, "yarn.lock");
if (!fs.existsSync(lockFile)) {
  fs.writeFileSync(lockFile, "");
}

if (runInstall || !fs.existsSync(path.join(targetDir, "node_modules"))) {
  execSync("yarn install", { cwd: targetDir, stdio: "inherit" });
}

console.log(`Playground scaffolded at ${targetDir}`);
