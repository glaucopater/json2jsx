import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@generated/App.js";
import testSample from "../../../json_samples/test.json";
import gallerySample from "../../../json_samples/media-gallery.json";

const outputDir = import.meta.env.VITE_OUTPUT_DIR || "test_run_test";
const sample = outputDir.startsWith("gallery") ? gallerySample : testSample;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App {...sample} />
  </StrictMode>
);
