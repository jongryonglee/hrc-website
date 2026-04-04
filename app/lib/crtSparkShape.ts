/**
 * CRT 中央の細かいギザ（非円形）viewBox 0 0 100 100。塗りは #ffffff。
 */
function buildSparkPolygon(cx: number, cy: number): string {
  const parts: string[] = [];
  /** 尖りを多くしてチクチクを細かく */
  const spikes = 32;
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i * Math.PI) / spikes - Math.PI / 2;
    const outer = i % 2 === 0;
    const ro = outer
      ? 42 +
        0.55 * Math.sin(i * 0.62) +
        0.28 * Math.cos(i * 0.24) +
        0.2 * Math.sin(i * 1.1)
      : 20 +
        0.65 * Math.sin(i * 0.51) +
        0.32 * Math.cos(i * 0.37) +
        0.18 * Math.cos(i * 0.88);
    parts.push(
      `${(cx + ro * Math.cos(a)).toFixed(2)},${(cy + ro * Math.sin(a)).toFixed(2)}`,
    );
  }
  return parts.join(" ");
}

export const CRT_SPARK_POLYGON_POINTS = buildSparkPolygon(50, 50);
