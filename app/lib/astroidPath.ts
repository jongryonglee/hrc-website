/**
 * 一般化アストロイド: x = cx + rx·cos^p t, y = cy + ry·sin^p t（p は奇数 ≥3 推奨）
 */
export function astroidPathD(
  viewSize = 100,
  segments = 96,
  opts?: { rx?: number; ry?: number; power?: number },
): string {
  const c = viewSize / 2;
  const rx = opts?.rx ?? viewSize / 2;
  const ry = opts?.ry ?? viewSize / 2;
  const p = opts?.power ?? 3;
  const parts: string[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * 2 * Math.PI;
    const x = c + rx * Math.cos(t) ** p;
    const y = c + ry * Math.sin(t) ** p;
    parts.push(`${i === 0 ? "M" : "L"}${x.toFixed(3)} ${y.toFixed(3)}`);
  }
  return `${parts.join(" ")} Z`;
}

export const SLIM_LIGHT_RX = 50;
export const SLIM_LIGHT_RY = 19;
export const SLIM_LIGHT_POWER = 5;

/** 横長スリム光（マスクと共通） */
export const ASTROID_PATH_SLIM_LIGHT_100 = astroidPathD(100, 96, {
  rx: SLIM_LIGHT_RX,
  ry: SLIM_LIGHT_RY,
  power: SLIM_LIGHT_POWER,
});
