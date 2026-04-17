/**
 * Sanity GROQ の結果形（ページ／クライアント間で共有）
 */

/** TOP_GRID_QUERY */
export type TopGridWorkItem = {
  _id: string;
  thumbnailUrl?: string | null;
};

/** WORKS_ITEMS_QUERY */
export type WorkListItem = {
  _id: string;
  title: string;
  artist: string;
  producer?: string | null;
  category: "music-video" | "sound-effect";
  /** Music Video では必須想定。Sound Effect では未設定の場合あり */
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  label: string;
  role: string;
  date: string;
};

/** workItem.credits の1行（Sanity の workCreditLine） */
export type WorkCreditLine = {
  _key?: string;
  label: string;
  name: string;
};

/** WORK_ITEM_QUERY */
export type WorkDetailItem = {
  _id: string;
  title: string;
  artist: string;
  producer?: string | null;
  category: "music-video" | "sound-effect";
  videoUrl?: string | null;
  soundCloudUrl?: string | null;
  instagramUrl?: string | null;
  muxPlaybackId?: string | null;
  soundUrl?: string | null;
  credits?: WorkCreditLine[] | null;
  thumbnailUrl?: string | null;
  nextId?: string | null;
  prevId?: string | null;
};

/** OFFICE_REC_ITEMS_QUERY */
export type OfficeRecListItem = {
  _id: string;
  title: string;
  artist: string;
  thumbnailUrl?: string | null;
};

/** OFFICE_REC_ITEM_QUERY */
export type OfficeRecDetailItem = {
  _id: string;
  title: string;
  artist: string;
  videoUrl?: string | null;
  muxPlaybackId?: string | null;
  thumbnailUrl?: string | null;
  nextId?: string | null;
  prevId?: string | null;
};

/** GRAPHIC_DESIGN_ITEMS_QUERY */
export type GraphicDesignListItem = {
  _id: string;
  title: string;
  category: "event-flier" | "cover-art" | "gino-goods";
  thumbnailUrl?: string | null;
};

/** PRODUCED_WORK_ITEMS_QUERY */
export type ProducedWorkItem = {
  _id: string;
  title: string;
  artist: string;
  role: string;
  album: string;
  label: string;
  link?: string | null;
};
