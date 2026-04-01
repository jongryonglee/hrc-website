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
  videoUrl: string;
  thumbnailUrl?: string | null;
  label: string;
  role: string;
  date: string;
};

/** WORK_ITEM_QUERY */
export type WorkDetailItem = {
  _id: string;
  title: string;
  artist: string;
  producer?: string | null;
  category: "music-video" | "sound-effect";
  videoUrl: string;
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
  label: string;
  artist: string;
  role: string;
  date: string;
};
