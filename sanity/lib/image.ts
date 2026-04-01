/**
 * next/image はアニメGIFを最適化しない（警告が出る）。
 * 該当 URL のときは unoptimized を付ける。
 */
export function isAnimatedGifUrl(src: string): boolean {
  try {
    const pathname = new URL(src).pathname.toLowerCase();
    return pathname.endsWith(".gif");
  } catch {
    return /\.gif(\?|#|$)/i.test(src);
  }
}
