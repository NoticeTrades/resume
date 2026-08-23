import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes/index.js";

export default defineConfig({
  name: "default",
  title: "Nicholas Thomas — Signals & Notes",
  projectId: "vzrug3c0",
  dataset: "production",
  plugins: [structureTool(), visionTool({ defaultApiVersion: "2026-08-23" })],
  schema: {
    types: schemaTypes,
  },
});
