import { defineField, defineType } from "sanity";
import { PlayIcon } from "@sanity/icons";

export const workItem = defineType({
  name: "workItem",
  title: "Work Item",
  type: "document",
  icon: PlayIcon,
  fields: [
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
      name: "producer",
      title: "Producer",
      type: "string",
    }),
    defineField({
      name: "label",
      title: "Label",
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
      type: "string",
      description: "例: 2025/10/17",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Music Video", value: "music-video" },
          { title: "Sound Effect", value: "sound-effect" },
        ],
        layout: "radio",
      },
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
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      validation: (rule) =>
        rule.required().uri({ scheme: ["http", "https"] }),
    }),
  ],
});
