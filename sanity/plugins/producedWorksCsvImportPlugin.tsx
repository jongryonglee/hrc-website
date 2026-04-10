import { DocumentIcon } from "@sanity/icons";
import { definePlugin } from "sanity";
import { ProducedWorksCsvTool } from "../tools/ProducedWorksCsvTool";

export const producedWorksCsvImportPlugin = definePlugin({
  name: "produced-works-csv-import",
  tools: [
    {
      name: "produced-works-csv-import",
      title: "Produced Works CSV Import",
      icon: DocumentIcon,
      component: ProducedWorksCsvTool,
    },
  ],
});
