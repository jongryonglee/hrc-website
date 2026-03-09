import { defineQuery } from "next-sanity";

export const WORKS_ITEMS_QUERY = defineQuery(/* groq */ `
  *[_type == "workItem"]
    | order(_createdAt desc) {
      _id,
      title,
      artist,
      duration,
      producer,
      category,
      videoUrl,
      "thumbnailUrl": thumbnail.asset->url
    }
`);
