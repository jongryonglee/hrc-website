import { defineField, defineType } from "sanity";
import { orderRankField } from "@sanity/orderable-document-list";
import { PlayIcon } from "@sanity/icons";

export const workItem = defineType({
  name: "workItem",
  title: "Work Item",
  type: "document",
  icon: PlayIcon,
  fields: [
    orderRankField({ type: "workItem" }),
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
      description:
        "Music Video のときは必須。Sound Effect のときは任意（YouTube など）。",
      validation: (rule) =>
        rule.custom((value, context) => {
          const category = (context.document as { category?: string } | undefined)
            ?.category;
          const empty = value == null || value === "";
          if (category === "sound-effect") {
            if (empty) return true;
          } else if (empty) {
            return "Music Video では動画 URL を入力してください";
          }
          if (typeof value === "string" && value) {
            try {
              const u = new URL(value);
              if (u.protocol !== "http:" && u.protocol !== "https:") {
                return "http または https の URL を入力してください";
              }
            } catch {
              return "有効な URL を入力してください";
            }
          }
          return true;
        }),
    }),
    defineField({
      name: "credits",
      title: "Credits",
      type: "array",
      description:
        "クレジット行を任意件数で追加。左がラベル（役職など）、右が名前。",
      of: [{ type: "workCreditLine" }],
    }),
    defineField({
      name: "soundFile",
      title: "Sound file",
      type: "file",
      description:
        "Sound Effect 用の音源（MP3 / WAV / OGG など）。作品詳細の Sound ON で再生されます。",
      options: {
        accept: "audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac",
      },
      hidden: ({ document }) => document?.category !== "sound-effect",
    }),
  ],
});
