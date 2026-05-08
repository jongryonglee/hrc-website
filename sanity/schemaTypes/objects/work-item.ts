import { defineField, defineType } from "sanity";
import { orderRankField } from "@sanity/orderable-document-list";
import { PlayIcon } from "@sanity/icons";
import { CreditsBulkInput } from "../../components/CreditsBulkInput";

const hasCategory = ({ document }: { document?: Record<string, unknown> }) =>
  !document?.category;

const isMusicVideo = ({ document }: { document?: Record<string, unknown> }) =>
  document?.category !== "music-video";

/** Sound Effect / Audio Track で soundFile を表示 */
const hideSoundFile = ({ document }: { document?: Record<string, unknown> }) => {
  const c = document?.category;
  return c !== "sound-effect" && c !== "audio-track";
};

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
          { title: "Audio Track", value: "audio-track" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),

    // ── カテゴリ選択後に表示 ──

    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
      hidden: hasCategory,
    }),
    defineField({
      name: "video",
      title: "Video (Mux)",
      type: "mux.video",
      description:
        "Mux でホストする動画。アップロードすると自動的にストリーミング配信される。",
      hidden: isMusicVideo,
    }),
    defineField({
      name: "soundFile",
      title: "Sound file",
      type: "file",
      description:
        "Sound Effect / Audio Track 用の音源（MP3 / WAV / OGG など）。作品詳細の Sound ON で再生されます。",
      options: {
        accept: "audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac",
      },
      hidden: hideSoundFile,
    }),
    defineField({
      name: "videoUrl",
      title: "YouTube URL",
      type: "url",
      description: "YouTube の動画 URL（任意）",
      hidden: hasCategory,
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "soundCloudUrl",
      title: "SoundCloud URL",
      type: "url",
      description: "SoundCloud の URL（任意）",
      hidden: hasCategory,
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram URL",
      type: "url",
      description: "Instagram の URL（任意）",
      hidden: hasCategory,
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "credits",
      title: "Credits",
      type: "array",
      description:
        "通常入力 or 一括入力（「ラベル / 名前」形式で1行1クレジット）",
      of: [{ type: "workCreditLine" }],
      hidden: hasCategory,
      components: { input: CreditsBulkInput },
    }),
  ],
});
