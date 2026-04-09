import { defineField, defineType } from "sanity";

/** 作品クレジットの1行（役職ラベルと名前。件数・文言は作品ごとに自由） */
export const workCreditLine = defineType({
  name: "workCreditLine",
  title: "Credit line",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "例: Prod. / Camera / Mix / Special Thanks",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "クレジット名（複数名はカンマ区切りなど自由に）",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      label: "label",
      name: "name",
    },
    prepare({ label, name }: { label?: string; name?: string }) {
      return {
        title: label || "—",
        subtitle: name || "",
      };
    },
  },
});
