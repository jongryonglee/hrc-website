import type { TopGridWorkItem } from "@/app/lib/cmsTypes";

const FALLBACK_IMAGES = [
  "/images/works-1.webp",
  "/images/works-2.webp",
  "/images/works-3.webp",
  "/images/works-4.webp",
  "/images/works-5.webp",
  "/images/works-6.webp",
  "/images/works-7.webp",
  "/images/works-8.webp",
];

const SLOT_COUNT = 15;

type SlotEntry = { url: string };

/** TopGrid と同一ロジックで 15 スロットを組み立てる（サーバー preload とクライアントで共有） */
export function buildThumbnailSlots(cmsItems: TopGridWorkItem[]): SlotEntry[] {
  const n = FALLBACK_IMAGES.length;
  const out: SlotEntry[] = [];
  let prev: string | null = null;

  for (let i = 0; i < SLOT_COUNT; i++) {
    const cms = cmsItems[i]?.thumbnailUrl;
    if (cms) {
      out[i] = { url: cms };
      prev = cms;
      continue;
    }
    const start = i % n;
    let picked = FALLBACK_IMAGES[start];
    for (let step = 0; step < n; step++) {
      const url = FALLBACK_IMAGES[(start + step) % n];
      if (url !== prev) {
        picked = url;
        break;
      }
    }
    out[i] = { url: picked };
    prev = picked;
  }
  return out;
}

/** DOM 先頭セル（巡目1・ブロック0・エリア a）と同じ URL。preload / priority 用 */
export function getTopGridLcpImageUrl(cmsItems: TopGridWorkItem[]): string {
  const base = buildThumbnailSlots(cmsItems);
  return base[0]?.url ?? "";
}
