/**
 * Works 系サムネイルの縦横比・マスク SVG・Next/Image sizes を一箇所で管理する。
 *
 * 縦横比は works-mask.svg の viewBox（268×204）に一本化する。
 * 旧「大セル 360×274px」もこの比と実質一致するため、aspect-[360/274] は使わない。
 */

/** 全サムネ枠で共通（マスク・セル・詳細を同じ比率に）
 *  overflow は付けない（マスクの drop-shadow 外周が切れないようにする） */
export const TW_CELL_TOP_GRID = "relative isolate aspect-[268/204]";

/** 写真・動画だけを枠内にクリップ（マスク SVG は外に重ねる） */
export const TW_IMAGE_CLIP_LAYER = "absolute inset-0 overflow-hidden";

/** 一覧カード・ホーム横スクロールグリッドのセル */
export const TW_CELL_CARD = "relative aspect-[268/204] w-full";

/** Works 一覧ホバーで出すサムネ枠（マスクは MASK_SRC_SMALL） */
export const TW_CELL_WORKS_LIST_HOVER =
  "relative aspect-[268/204] w-[600px] -translate-y-[51px]";

/** 作品／Office Rec 詳細のサムネ外枠（`touch-pan-y` なし。詳細ページでは `TW_SHELL_DETAIL_THUMB_WORK` を使う） */
export const TW_SHELL_DETAIL_THUMB =
  "relative aspect-[268/204] w-[95vw] mx-auto md:h-[80vh] md:w-auto md:max-w-none md:shrink-0 md:mx-0";

/** 作品／Office Rec 詳細：サムネ上で前後スワイプ */
export const TW_SHELL_DETAIL_THUMB_WORK =
  "relative aspect-[268/204] touch-pan-y w-[95vw] mx-auto md:h-[80vh] md:w-auto md:max-w-none md:shrink-0 md:mx-0";

export const MASK_SRC_SMALL = "/works-mask.svg";

export const MASK_SRC_LARGE = "/icon/works-mask-big.svg";

export function maskSrcForTopGridCell(isBigCell: boolean): string {
  return isBigCell ? MASK_SRC_LARGE : MASK_SRC_SMALL;
}

export const TW_MASK_LAYER_TOP_GRID =
  "pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover object-center select-none";

/** 作品／Office Rec 詳細サムネ（単一窓＝小セル用マスクのみ。大セル用 big SVG は TopGrid の 2×2 のみ） */
export const TW_MASK_LAYER_WORK_DETAIL =
  "pointer-events-none absolute inset-0 z-[2] h-full w-full object-cover object-center select-none";

/** Works 一覧ホバー用マスク重ね（小セル SVG） */
export const TW_MASK_LAYER_WORKS_LIST_HOVER =
  "pointer-events-none absolute inset-0 h-full w-full object-cover object-center";

/** next/image fill 用の小マスク（ContentGrid・WorksGridHorizontal） */
export const TW_MASK_NEXT_IMAGE_SMALL = "pointer-events-none select-none";

export const IMAGE_SIZES_TOP_GRID_CELL =
  "(max-width: 767px) 268px";

/**
 * マスク下の写真用。マスクの scale は変えず、モバイルだけ画像をわずかに縮めて縁よりはみ出すのを防ぐ。
 */
export const TW_IMAGE_FILL_UNDER_MASK =
  "object-cover object-center max-md:scale-[0.992] max-md:[transform-origin:center]";
