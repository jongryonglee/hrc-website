/**
 * トップグリッド各セルのフラッシュ表現。
 * astroid: SVG アストロイド抜き（従来）
 * crt: 矩形抜き + 白の中央光・横スリット（レンズフレア風）
 */
export type FlashCellMode = "astroid" | "crt";

export const DEFAULT_FLASH_CELL_MODE: FlashCellMode = "crt";
