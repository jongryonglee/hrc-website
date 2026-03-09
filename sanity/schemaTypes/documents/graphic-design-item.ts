import { defineField, defineType } from "sanity";
import { DocumentIcon } from "@sanity/icons";

export const graphicDesignItem = defineType({
  name: "graphicDesignItem",
  title: "Graphic Design Item",
  type: "document",
  icon: DocumentIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Event Flier", value: "event-flier" },
          { title: "Cover Art", value: "cover-art" },
          { title: "Gino Goods", value: "gino-goods" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
  ],
});
