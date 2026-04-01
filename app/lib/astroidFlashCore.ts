/**
 * アストロイドフラッシュのタイミング・マスク穴のスケール計算（AstroidFlash / テストページ共通）
 */

export const DURATION_SEC = 0.5;
/** 中央の光（パルス）の長さ: 出現→少し拡大→縮小→消滅（短いほど見える時間が減る） */
export const CENTER_CORE_MS = 250;
/** 横線: 光の後を追う遅延 → 水平に伸びる → フェードアウト（縦方向の展開はしない） */
export const LINE_FOLLOW_MS = 42;
export const LINE_H_SWEEP_MS = 95;
export const LINE_LINE_FADE_MS = 10;
export const LINE_Y_MIN = 0.07;
/** フラッシュレイヤ全体（中央と横線の長い方まで） */
export const FLASH_MS = Math.max(
  CENTER_CORE_MS,
  LINE_FOLLOW_MS + LINE_H_SWEEP_MS + LINE_LINE_FADE_MS + 80,
);
/** プチュン: 中央光のスケール（パルス用）。sy を抑えて細く、sx より急に立ち上げて刃っぽく */
export const POP_SCALE_X_START = 0.06;
export const POP_SCALE_Y_START = 0.008;
export const POP_SCALE_PEAK_X = 1;
/** 縦を抑えるほど細いスリット（sx との差で「角度」が出る） */
export const POP_SCALE_PEAK = 1;

const MAIN_MS = DURATION_SEC * 1000;
/**
 * フラッシュ後、マスクの縦スケールが 0→1 になるまでの時間（短く調整しやすい）
 * 開き終わってから TOTAL_CELL_MS までは穴は開いたまま
 */
export const MASK_EXPAND_MS = 200;
/** プチュン〜マスクが開き切るまで */
export const TOTAL_CELL_MS = MAIN_MS;

export const MASK_PAD = 20000;
export const MASK_ORIGIN = 50 - MASK_PAD / 2;
/** マスク穴の縦スケール 0 = 隙間なし（0.001 だと細いスリットが残る） */
export const MASK_CLOSED_SY = 0;

export function centerScaleTransform(sx: number, sy: number): string {
  return `translate(50 50) scale(${sx} ${sy}) translate(-50 -50)`;
}

/** 中央の光: 出現 → 少し拡大 → 縮小 → 消滅 */
export function centerLightState(localT: number): {
  sx: number;
  sy: number;
  opacity: number;
} {
  if (localT <= 0 || localT >= CENTER_CORE_MS) {
    return { sx: POP_SCALE_X_START, sy: POP_SCALE_Y_START, opacity: 0 };
  }
  const u = localT / CENTER_CORE_MS;
  let amp: number;
  /**
   * 中間の放物（丸い屈曲）を置かず、立ち上がり→単調減衰の 2 相に。
   * ピーク付近の「なだらかなカーブ」を減らし、角を鋭く・見える区間を短くする。
   */
  const riseEnd = 0.22;
  if (u < riseEnd) {
    const k = u / riseEnd;
    amp = 1 - (1 - k) ** 5;
  } else {
    const k = (u - riseEnd) / (1 - riseEnd);
    amp = (1 - k) ** 2.85;
  }
  const sx =
    POP_SCALE_X_START + (POP_SCALE_PEAK_X - POP_SCALE_X_START) * amp;
  /** sy は amp より強く遅らせて細い刃に見せる */
  const sy =
    POP_SCALE_Y_START +
    (POP_SCALE_PEAK - POP_SCALE_Y_START) * amp ** 1.45;
  let opacity = 1;
  const fadeStart = 0.3;
  if (u > fadeStart) {
    opacity = 1 - ((u - fadeStart) / (1 - fadeStart)) ** 2.2;
  }
  return { sx, sy, opacity: opacity < 0.02 ? 0 : opacity };
}

/** 横線: 光に遅れて水平のみ、その後フェード */
export function horizontalLineState(localT: number): {
  sx: number;
  sy: number;
  opacity: number;
} {
  if (localT < LINE_FOLLOW_MS) {
    return { sx: 0, sy: LINE_Y_MIN, opacity: 0 };
  }
  const afterFollow = localT - LINE_FOLLOW_MS;
  if (afterFollow < LINE_H_SWEEP_MS) {
    const h = afterFollow / LINE_H_SWEEP_MS;
    const sx = 1 - (1 - h) ** 3;
    return { sx, sy: LINE_Y_MIN, opacity: 0.9 };
  }
  const afterH = afterFollow - LINE_H_SWEEP_MS;
  const fadeT = clamp01(afterH / LINE_LINE_FADE_MS);
  const opacity = 0.92 * (1 - fadeT ** 2);
  return {
    sx: 1,
    sy: LINE_Y_MIN,
    opacity: opacity < 0.02 ? 0 : opacity,
  };
}

export function clamp01(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t;
}

export function setHoleScale(g: SVGGElement, sx: number, sy: number): void {
  const x = Number.isFinite(sx) ? sx : 1;
  const y = Number.isFinite(sy) ? sy : MASK_CLOSED_SY;
  g.setAttribute("transform", centerScaleTransform(x, y));
}

/** フラッシュ後のマスク穴: 幅は常に全幅、縦だけが開いて上下に広がる（sy は 0→1） */
export function maskExpandScales(u: number): [number, number] {
  const t = clamp01(u);
  const syEase = 1 - (1 - t) ** 1.55;
  return [1, syEase];
}

/** プチュンもマスク穴の scale のみ（白レイヤは使わない）。中央パルスと横スリットを合成 */
export function mergedHoleFlash(localT: number): { sx: number; sy: number } {
  const center = centerLightState(localT);
  const line = horizontalLineState(localT);
  const sxHole = Math.max(center.sx, line.sx);
  const syHole = Math.max(
    center.sy,
    line.opacity > 0.02 ? LINE_Y_MIN : 0,
  );
  return { sx: sxHole, sy: syHole };
}

/** フラッシュ終了直前の縦（矩形マスク展開の sy 起点。sx は常に 1） */
export const FLASH_END_SY = mergedHoleFlash(
  Math.max(0, FLASH_MS - 0.001),
).sy;
