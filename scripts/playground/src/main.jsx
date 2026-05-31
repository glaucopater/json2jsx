import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@generated/App.js";
import sample from "../../../json_samples/test.json";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App {...sample} />
  </StrictMode>
);
