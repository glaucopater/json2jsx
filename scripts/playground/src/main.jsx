import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@generated/App.js";

const samples = import.meta.glob("../../../json_samples/*.json", {
  eager: true,
  import: "default",
});

const outputDir = import.meta.env.VITE_OUTPUT_DIR || "test_run_test";
const jsonBasename = outputDir.includes("_")
  ? outputDir.slice(outputDir.lastIndexOf("_") + 1)
  : outputDir;
const samplePath = `../../../json_samples/${jsonBasename}.json`;
const sample =
  samples[samplePath] ?? samples["../../../json_samples/test.json"];

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App {...sample} />
  </StrictMode>
);
