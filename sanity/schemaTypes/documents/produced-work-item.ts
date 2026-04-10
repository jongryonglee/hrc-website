import { defineField, defineType } from "sanity";
import { DocumentIcon } from "@sanity/icons";

export const producedWorkItem = defineType({
  name: "producedWorkItem",
  title: "Produced Work Item",
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
      name: "label",
      title: "Label",
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
      name: "role",
      title: "Role",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "album",
      title: "Album",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
});
