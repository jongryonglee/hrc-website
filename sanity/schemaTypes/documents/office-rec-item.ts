import { defineField, defineType } from "sanity";
import { orderRankField } from "@sanity/orderable-document-list";
import { DocumentIcon } from "@sanity/icons";

export const officeRecItem = defineType({
  name: "officeRecItem",
  title: "Office Rec Item",
  type: "document",
  icon: DocumentIcon,
  fields: [
    orderRankField({ type: "officeRecItem" }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "artist",
      title: "Artist",
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
  ],
});
