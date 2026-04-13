import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { muxInput } from "sanity-plugin-mux-input";
import { bulkDeletePlugin } from "./sanity/plugins/bulkDeletePlugin";
import { producedWorksCsvImportPlugin } from "./sanity/plugins/producedWorksCsvImportPlugin";
import { schemaTypes } from "./sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "h07klblt";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "default",
  title: "HRC Website",
  projectId,
  dataset,
  plugins: [
    deskTool({
      structure: (S, context) => {
        return S.list()
          .title("Content")
          .items([
            orderableDocumentListDeskItem({
              type: "workItem",
              title: "Works",
              S,
              context,
            }),
            orderableDocumentListDeskItem({
              type: "graphicDesignItem",
              title: "Graphic Design",
              S,
              context,
            }),
            orderableDocumentListDeskItem({
              type: "producedWorkItem",
              title: "Produced Works",
              S,
              context,
            }),
            orderableDocumentListDeskItem({
              type: "officeRecItem",
              title: "Office Rec",
              S,
              context,
            }),
          ]);
      },
    }),
    muxInput(),
    producedWorksCsvImportPlugin(),
    bulkDeletePlugin(),
  ],
  schema: {
    types: schemaTypes,
  },
});
