import { defineQuery } from "next-sanity";

/**
 * Sanity CDN のサイズ指定。用途ごとに必要最小限の幅を指定して転送量を削減する。
 * auto=format で WebP/AVIF を自動選択。
 */
const IMG_SM  = '"?w=600&auto=format&fit=max&q=80"';   // グリッドセル・一覧サムネ
const IMG_MD  = '"?w=960&auto=format&fit=max&q=80"';   // ホバープレビュー
const IMG_LG  = '"?w=1600&auto=format&fit=max&q=82"';  // 詳細ページのヒーロー
const IMG_ICON = '"?w=480&auto=format&fit=max&q=80"';  // グラフィックデザイン小

// トップページ用：上位15件のサムネイルのみ取得
export const TOP_GRID_QUERY = defineQuery(/* groq */ `
  *[_type == "workItem"]
    | order(orderRank asc, _createdAt desc) [0...15] {
      _id,
      "thumbnailUrl": thumbnail.asset->url + ${IMG_SM}
    }
`);

export const WORKS_ITEMS_QUERY = defineQuery(/* groq */ `
  *[_type == "workItem"]
    | order(orderRank asc, _createdAt desc) {
      _id,
      title,
      artist,
      producer,
      label,
      role,
      date,
      category,
      videoUrl,
      "thumbnailUrl": thumbnail.asset->url + ${IMG_MD}
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
    "muxPlaybackId": video.asset->playbackId,
    "soundUrl": soundFile.asset->url,
    credits[]{
      _key,
      label,
      name
    },
    "thumbnailUrl": thumbnail.asset->url + ${IMG_LG},
    "nextId": coalesce(
      *[_type == "workItem" && orderRank > ^.orderRank] | order(orderRank asc)[0]._id,
      *[_type == "workItem"] | order(orderRank asc)[0]._id
    ),
    "prevId": coalesce(
      *[_type == "workItem" && orderRank < ^.orderRank] | order(orderRank desc)[0]._id,
      *[_type == "workItem"] | order(orderRank desc)[0]._id
    )
  }
`);

export const OFFICE_REC_ITEMS_QUERY = defineQuery(/* groq */ `
  *[_type == "officeRecItem"]
    | order(orderRank asc, _createdAt desc) {
      _id,
      title,
      artist,
      "thumbnailUrl": thumbnail.asset->url + ${IMG_SM}
    }
`);

export const OFFICE_REC_ITEM_QUERY = defineQuery(/* groq */ `
  *[_type == "officeRecItem" && _id == $id][0]{
    _id,
    title,
    artist,
    videoUrl,
    "muxPlaybackId": video.asset->playbackId,
    "thumbnailUrl": thumbnail.asset->url + ${IMG_LG},
    "nextId": coalesce(
      *[_type == "officeRecItem" && orderRank > ^.orderRank] | order(orderRank asc)[0]._id,
      *[_type == "officeRecItem"] | order(orderRank asc)[0]._id
    ),
    "prevId": coalesce(
      *[_type == "officeRecItem" && orderRank < ^.orderRank] | order(orderRank desc)[0]._id,
      *[_type == "officeRecItem"] | order(orderRank desc)[0]._id
    )
  }
`);

export const GRAPHIC_DESIGN_ITEMS_QUERY = defineQuery(/* groq */ `
  *[_type == "graphicDesignItem"]
    | order(orderRank asc, _createdAt desc) {
      _id,
      title,
      category,
      "thumbnailUrl": thumbnail.asset->url + ${IMG_ICON}
    }
`);

export const PRODUCED_WORK_ITEMS_QUERY = defineQuery(/* groq */ `
  *[_type == "producedWorkItem"]
    | order(orderRank asc, _createdAt desc) {
      _id,
      title,
      artist,
      role,
      album,
      label
    }
`);
