import fs from "fs";
import path from "path";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { transform } from "esbuild";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const outputRoot = path.resolve(__dirname, "..");

function resolveGeneratedDirName() {
  const requested = process.env.VITE_OUTPUT_DIR;
  if (requested) {
    const candidate = path.join(outputRoot, requested);
    if (fs.existsSync(path.join(candidate, "App.js"))) {
      return requested;
    }
  }

  const preferred = "test_run_test";
  if (fs.existsSync(path.join(outputRoot, preferred, "App.js"))) {
    return preferred;
  }

  const dirs = fs
    .readdirSync(outputRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "playground")
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(outputRoot, name, "App.js")))
    .sort(
      (a, b) =>
        fs.statSync(path.join(outputRoot, b)).mtimeMs -
        fs.statSync(path.join(outputRoot, a)).mtimeMs
    );

  if (dirs.length > 0) {
    return dirs[0];
  }

  throw new Error(
    "No generated App.js under output/. Run: yarn demo (or json2jsx json_samples/test.json test_run)"
  );
}

const generatedDirName = resolveGeneratedDirName();
const generatedDir = path.join(outputRoot, generatedDirName);
const normalizedGenerated = generatedDir.split(path.sep).join("/");

function isGeneratedJsFile(filePath) {
  const normalized = filePath.split(path.sep).join("/");
  return (
    normalized.startsWith(normalizedGenerated) && normalized.endsWith(".js")
  );
}

function generatedJsxEsbuildPlugin() {
  return {
    name: "generated-js-as-jsx",
    setup(build) {
      build.onLoad({ filter: /\.js$/ }, async (args) => {
        if (!isGeneratedJsFile(args.path)) {
          return;
        }
        const contents = await readFile(args.path, "utf8");
        return { contents, loader: "jsx" };
      });
    },
  };
}

function jsxInGeneratedJs() {
  return {
    name: "jsx-in-generated-js",
    enforce: "pre",
    async transform(code, id) {
      if (!isGeneratedJsFile(id)) {
        return null;
      }
      const result = await transform(code, {
        loader: "jsx",
        jsx: "automatic",
        sourcefile: id,
      });
      return result.map
        ? { code: result.code, map: result.map }
        : { code: result.code };
    },
  };
}

export default defineConfig({
  plugins: [jsxInGeneratedJs(), react()],
  optimizeDeps: {
    esbuildOptions: {
      jsx: "automatic",
      plugins: [generatedJsxEsbuildPlugin()],
    },
  },
  resolve: {
    alias: {
      "@generated": generatedDir,
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
});
