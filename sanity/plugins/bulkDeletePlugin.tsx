import { TrashIcon } from "@sanity/icons";
import { definePlugin } from "sanity";
import { BulkDeleteTool } from "../tools/BulkDeleteTool";

export const bulkDeletePlugin = definePlugin({
  name: "bulk-delete",
  tools: [
    {
      name: "bulk-delete",
      title: "Bulk Delete",
      icon: TrashIcon,
      component: BulkDeleteTool,
    },
  ],
});
