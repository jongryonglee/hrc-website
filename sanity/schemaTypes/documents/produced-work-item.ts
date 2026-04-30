import { defineField, defineType } from "sanity";
import { orderRankField } from "@sanity/orderable-document-list";
import { DocumentIcon } from "@sanity/icons";

export const producedWorkItem = defineType({
  name: "producedWorkItem",
  title: "Produced Work Item",
  type: "document",
  icon: DocumentIcon,
  fields: [
    orderRankField({ type: "producedWorkItem" }),
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
      name: "category",
      title: "Category",
      description: "プロジェクト種別（About の produced works 一覧のフィルターに使用）",
      type: "string",
      options: {
        list: [
          { title: "Commercial Projects", value: "commercial-projects" },
          { title: "Label Releases", value: "label-releases" },
          { title: "Indie Projects", value: "indie-projects" },
        ],
        layout: "radio",
      },
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
      name: "date",
      title: "Date",
      description: "例: 2025/10/17",
      type: "string",
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "url",
      validation: (rule) =>
        rule.uri({
          scheme: ["http", "https"],
          allowRelative: true,
        }),
    }),
  ],
});
