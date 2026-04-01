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

export function isSanityCdnUrl(src: string): boolean {
  try {
    return new URL(src).hostname === "cdn.sanity.io";
  } catch {
    return false;
  }
}

/**
 * next/image の optimizer（sharp）が Sanity の巨大画像で 500 になることがある。
 * GROQ では既に `?w=1920&auto=format` 等で CDN 側を最適化しているので再処理しない。
 */
export function nextImageUnoptimized(src: string): boolean {
  return isSanityCdnUrl(src) || isAnimatedGifUrl(src);
}
