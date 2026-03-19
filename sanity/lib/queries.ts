import { defineQuery } from "next-sanity";

export const WORKS_ITEMS_QUERY = defineQuery(/* groq */ `
  *[_type == "workItem"]
    | order(_createdAt desc) {
      _id,
      title,
      artist,
      producer,
      label,
      role,
      date,
      category,
      videoUrl,
      "thumbnailUrl": thumbnail.asset->url
    }
`);

export const WORK_ITEM_QUERY = defineQuery(/* groq */ `
  *[_type == "workItem" && _id == $id][0]{
    _id,
    title,
    artist,
    producer,
    category,
    videoUrl,
    "thumbnailUrl": thumbnail.asset->url,
    "nextId": coalesce(
      *[_type == "workItem" && _createdAt < ^._createdAt] | order(_createdAt desc)[0]._id,
      *[_type == "workItem"] | order(_createdAt desc)[0]._id
    )
  }
`);

export const OFFICE_REC_ITEMS_QUERY = defineQuery(/* groq */ `
  *[_type == "officeRecItem"]
    | order(_createdAt desc) {
      _id,
      title,
      artist,
      "thumbnailUrl": thumbnail.asset->url
    }
`);

export const GRAPHIC_DESIGN_ITEMS_QUERY = defineQuery(/* groq */ `
  *[_type == "graphicDesignItem"]
    | order(_createdAt desc) {
      _id,
      title,
      category,
      "thumbnailUrl": thumbnail.asset->url
    }
`);

export const PRODUCED_WORK_ITEMS_QUERY = defineQuery(/* groq */ `
  *[_type == "producedWorkItem"]
    | order(_createdAt desc) {
      _id,
      title,
      label,
      artist,
      role,
      date
    }
`);
