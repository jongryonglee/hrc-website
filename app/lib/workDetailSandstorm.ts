import type { CSSProperties } from "react";

/**
 * 作品詳細の砂嵐 mp4（サムネ枠内・画像の上）の見え方。
 * マスク用 `<img>` の SVG / サイズは変えず、映像が窓からはみ出さないようにする。
 * `WorkDetailClient` / `OfficeRecDetailClient` ではサムネ `Image` と同じ `TW_IMAGE_FILL_UNDER_MASK` を video にも付け、スケールを揃える。
 */

/**
 * `contain` … 映像全体を枠内に収め、マスクの透明窓から見切れない（レターボックスは `SANDSTORM_VIDEO_BG`）。
 * `cover` … 枠いっぱい（はみ出しはクロップ）。窓から溢れて見える場合は `contain` 推奨。
 */
export const SANDSTORM_VIDEO_OBJECT_FIT: "cover" | "contain" = "cover";

/** レターボックス／ピラーボックスの色（マスクの黒枠に馴染ませる） */
export const SANDSTORM_VIDEO_BG = "#000000";

/** クロップ位置（`cover` のときや `contain` の寄せ） */
export const SANDSTORM_VIDEO_OBJECT_POSITION = "center center";

/**
 * 追加の縦横スケール（`contain` でも窓ぎりぎりなら 0.98 などに下げる）。
 * マスク SVG 自体は変更しない。
 */
export const SANDSTORM_VIDEO_SCALE_X = 1;
export const SANDSTORM_VIDEO_SCALE_Y = 1;

export function getSandstormVideoSurfaceStyle(): CSSProperties {
  const base: CSSProperties = {
    objectFit: SANDSTORM_VIDEO_OBJECT_FIT,
    objectPosition: SANDSTORM_VIDEO_OBJECT_POSITION,
    backgroundColor: SANDSTORM_VIDEO_BG,
  };
  if (SANDSTORM_VIDEO_SCALE_X !== 1 || SANDSTORM_VIDEO_SCALE_Y !== 1) {
    base.transform = `scale(${SANDSTORM_VIDEO_SCALE_X}, ${SANDSTORM_VIDEO_SCALE_Y})`;
    base.transformOrigin = "center center";
  }
  return base;
}
