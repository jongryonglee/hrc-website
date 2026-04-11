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
    defineField({
      name: "video",
      title: "Video (Mux)",
      type: "mux.video",
      description:
        "Mux でホストする動画。アップロードすると自動的にストリーミング配信される。",
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      description: "YouTube などの外部動画 URL。",
      validation: (rule) => rule.required(),
    }),
  ],
});
