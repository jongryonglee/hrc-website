import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { producedWorksCsvImportPlugin } from "./sanity/plugins/producedWorksCsvImportPlugin";
import { schemaTypes } from "./sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "default",
  title: "HRC Website",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [deskTool(), producedWorksCsvImportPlugin()],
  schema: {
    types: schemaTypes,
  },
});
