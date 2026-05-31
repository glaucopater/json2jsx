import path from "path";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { transform } from "esbuild";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const generatedDir = path.resolve(
  __dirname,
  "..",
  process.env.VITE_OUTPUT_DIR || "test_run_test"
);
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
