import { defineQuery } from "next-sanity";

/** Sanity CDN で事前に縮小・フォーマット変換（巨大PNGのままだと next/image が 500 になりやすい） */
const SANITY_IMG_OPT = '"?w=1920&auto=format&fit=max&q=85"';

// トップページ用：最新15件のサムネイルのみ取得
export const TOP_GRID_QUERY = defineQuery(/* groq */ `
  *[_type == "workItem"]
    | order(_createdAt desc) [0...15] {
      _id,
      "thumbnailUrl": thumbnail.asset->url + ${SANITY_IMG_OPT}
    }
`);

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
      "thumbnailUrl": thumbnail.asset->url + ${SANITY_IMG_OPT}
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
    "thumbnailUrl": thumbnail.asset->url + ${SANITY_IMG_OPT},
    "nextId": coalesce(
      *[_type == "workItem" && _createdAt < ^._createdAt] | order(_createdAt desc)[0]._id,
      *[_type == "workItem"] | order(_createdAt desc)[0]._id
    ),
    "prevId": coalesce(
      *[_type == "workItem" && _createdAt > ^._createdAt] | order(_createdAt asc)[0]._id,
      *[_type == "workItem"] | order(_createdAt asc)[0]._id
    )
  }
`);

export const OFFICE_REC_ITEMS_QUERY = defineQuery(/* groq */ `
  *[_type == "officeRecItem"]
    | order(_createdAt desc) {
      _id,
      title,
      artist,
      "thumbnailUrl": thumbnail.asset->url + ${SANITY_IMG_OPT}
    }
`);

export const OFFICE_REC_ITEM_QUERY = defineQuery(/* groq */ `
  *[_type == "officeRecItem" && _id == $id][0]{
    _id,
    title,
    artist,
    "thumbnailUrl": thumbnail.asset->url + ${SANITY_IMG_OPT},
    "nextId": coalesce(
      *[_type == "officeRecItem" && _createdAt < ^._createdAt] | order(_createdAt desc)[0]._id,
      *[_type == "officeRecItem"] | order(_createdAt desc)[0]._id
    ),
    "prevId": coalesce(
      *[_type == "officeRecItem" && _createdAt > ^._createdAt] | order(_createdAt asc)[0]._id,
      *[_type == "officeRecItem"] | order(_createdAt asc)[0]._id
    )
  }
`);

export const GRAPHIC_DESIGN_ITEMS_QUERY = defineQuery(/* groq */ `
  *[_type == "graphicDesignItem"]
    | order(_createdAt desc) {
      _id,
      title,
      category,
      "thumbnailUrl": thumbnail.asset->url + ${SANITY_IMG_OPT}
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
