"use client";

import { useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { usePrefersReducedMotion } from "@/app/hooks/usePrefersReducedMotion";
import type { TopGridWorkItem } from "@/app/lib/cmsTypes";
import { nextImageUnoptimized } from "@/sanity/lib/image";
import { AstroidFlashProvider, AstroidRevealCell } from "./AstroidFlash";

const FALLBACK_IMAGES = [
  "/images/works-1.png",
  "/images/works-2.png",
  "/images/works-3.png",
  "/images/works-4.png",
  "/images/works-5.png",
  "/images/works-6.png",
  "/images/works-7.png",
  "/images/works-8.png",
];

const SLOT_COUNT = 15;
/** 巡目1の大3＋巡目2の大3。1ブロックで base[k]〜base[k+5] を大セルに順に割当 */
const BIG_SLOTS_PER_PAIR = 6;
/** 15 枚を大セルに一通り通すのに 6×3=18 枠（折り返しで 0,1,2 が再度大セルに出る） */
const BIG_BLOCK_COUNT = 3;

// 巡目1: 6×4（e / h / i = 2×2）
//   a b c d e e
//   f g h h e e
//   i i h h j k
//   i i l m n o
const GRID_CYCLE1 = {
  template: `
  "a b c d e e"
  "f g h h e e"
  "i i h h j k"
  "i i l m n o"
`,
  areas: [
    { name: "a" },
    { name: "b" },
    { name: "c" },
    { name: "d" },
    { name: "e" },
    { name: "f" },
    { name: "g" },
    { name: "h" },
    { name: "i" },
    { name: "j" },
    { name: "k" },
    { name: "l" },
    { name: "m" },
    { name: "n" },
    { name: "o" },
  ] as const,
  bigMaskAreas: new Set<string>(["e", "h", "i"]),
};

// 巡目2: 小セルは各ラベルで base[ラベル]。大セル（f / i / j）はブロック内の続きの3枚
//   b c d e f f
//   g h i i f f
//   j j i i k l
//   j j m n o a
const GRID_CYCLE2 = {
  template: `
  "b c d e f f"
  "g h i i f f"
  "j j i i k l"
  "j j m n o a"
`,
  areas: [
    { name: "b" },
    { name: "c" },
    { name: "d" },
    { name: "e" },
    { name: "f" },
    { name: "g" },
    { name: "h" },
    { name: "i" },
    { name: "j" },
    { name: "k" },
    { name: "l" },
    { name: "m" },
    { name: "n" },
    { name: "o" },
    { name: "a" },
  ] as const,
  bigMaskAreas: new Set<string>(["f", "i", "j"]),
};

/** グリッド・横ストリップ共通 gap */
const GRID_GAP_PX = 17;
/** 巡目1+gap+巡目2 が 1 セットだけだったときの 1 ループ秒数（見た目の速さの基準） */
const BASE_SECONDS_PER_PAIR_PERIOD = 80;
/** 1列の幅: モバイル 268px / md 以上 360px（--cell-w で切替） */
const CELL_W_CSS_VAR = "var(--cell-w)";

const LETTER_TO_INDEX: Record<string, number> = {
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  e: 4,
  f: 5,
  g: 6,
  h: 7,
  i: 8,
  j: 9,
  k: 10,
  l: 11,
  m: 12,
  n: 13,
  o: 14,
};

function modSlot(i: number): number {
  return ((i % SLOT_COUNT) + SLOT_COUNT) % SLOT_COUNT;
}

function smallUrlForBlock(
  base: string[],
  letter: string,
  blockIndex: number,
): string {
  const idx = LETTER_TO_INDEX[letter];
  if (idx === undefined) return base[0];
  const start = modSlot(blockIndex * BIG_SLOTS_PER_PAIR);
  // ブロックが進むごとに a…o 全体を同じオフセットで回す（小セルもスクロールで変わる）
  return base[modSlot(idx + start)];
}

/** 巡目1: 小セルはブロックオフセット付き。大セル e,h,i はブロック内 0,1,2 番目 */
function buildUrlsForCycle1(base: string[], blockIndex: number): string[] {
  const start = modSlot(blockIndex * BIG_SLOTS_PER_PAIR);
  const bigByName: Record<string, string> = {
    e: base[modSlot(start + 0)],
    h: base[modSlot(start + 1)],
    i: base[modSlot(start + 2)],
  };

  return GRID_CYCLE1.areas.map((area) => {
    if (GRID_CYCLE1.bigMaskAreas.has(area.name)) {
      return bigByName[area.name]!;
    }
    return smallUrlForBlock(base, area.name, blockIndex);
  });
}

/** 巡目2: 小セルはブロックオフセット付き。大セル f,i,j は同ブロックで 3,4,5 番目 */
function buildUrlsForCycle2(base: string[], blockIndex: number): string[] {
  const start = modSlot(blockIndex * BIG_SLOTS_PER_PAIR);
  const bigByName: Record<string, string> = {
    f: base[modSlot(start + 3)],
    i: base[modSlot(start + 4)],
    j: base[modSlot(start + 5)],
  };

  return GRID_CYCLE2.areas.map((area) => {
    if (GRID_CYCLE2.bigMaskAreas.has(area.name)) {
      return bigByName[area.name]!;
    }
    return smallUrlForBlock(base, area.name, blockIndex);
  });
}

/** CMS がなければ a…o 順に、直前と同じフォールバック URL だけ避ける */
function buildThumbnailUrls(cmsItems: TopGridWorkItem[]): string[] {
  const n = FALLBACK_IMAGES.length;
  const out: string[] = [];
  let prev: string | null = null;

  for (let i = 0; i < SLOT_COUNT; i++) {
    const cms = cmsItems[i]?.thumbnailUrl;
    if (cms) {
      out[i] = cms;
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
    out[i] = picked;
    prev = picked;
  }
  return out;
}

function GridCopy({
  variant,
  urls,
  innerRef,
  cellFlash,
}: {
  variant: 1 | 2;
  urls: string[];
  innerRef?: React.RefObject<HTMLDivElement | null>;
  cellFlash?: boolean;
}) {
  const cfg = variant === 1 ? GRID_CYCLE1 : GRID_CYCLE2;

  return (
    <div
      ref={innerRef}
      className="shrink-0 [--cell-w:268px]"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(6, ${CELL_W_CSS_VAR})`,
        gridTemplateAreas: cfg.template,
        gap: GRID_GAP_PX,
        marginTop: "-34px",
        width: `calc(6 * ${CELL_W_CSS_VAR} + 5 * ${GRID_GAP_PX}px)`,
      }}
    >
      {cfg.areas.map((area, i) => {
        const src = urls[i];
        const maskSrc = cfg.bigMaskAreas.has(area.name)
          ? "/icon/works-mask-big.svg"
          : "/works-mask.svg";

        const media = (
          <>
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 767px) 268px"
                className="object-cover object-center max-md:scale-[0.992] max-md:[transform-origin:center]"
                draggable={false}
                unoptimized={nextImageUnoptimized(src)}
              />
            </div>
            <img
              src={maskSrc}
              alt=""
              aria-hidden={true}
              draggable={false}
              className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover object-center select-none"
            />
          </>
        );

        return (
          <div
            key={`${variant}-${area.name}`}
            className="relative isolate aspect-[268/204]"
            style={{ gridArea: area.name }}
          >
            {cellFlash ? (
              <AstroidRevealCell>{media}</AstroidRevealCell>
            ) : (
              media
            )}
          </div>
        );
      })}
    </div>
  );
}

export function TopGrid({
  cmsItems,
  bootComplete,
}: {
  cmsItems: TopGridWorkItem[];
  bootComplete: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cycleMeasureRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = usePrefersReducedMotion();

  const baseUrls = useMemo(() => buildThumbnailUrls(cmsItems), [cmsItems]);

  const urlsByBlock = useMemo(
    () =>
      Array.from({ length: BIG_BLOCK_COUNT }, (_, blockIndex) => ({
        cycle1: buildUrlsForCycle1(baseUrls, blockIndex),
        cycle2: buildUrlsForCycle2(baseUrls, blockIndex),
      })),
    [baseUrls],
  );

  useEffect(() => {
    if (!bootComplete) return;
    const container = containerRef.current;
    const cycle = cycleMeasureRef.current;
    if (!container || !cycle) return;

    // ブロック×（巡目1+gap+巡目2）の1周期 + 外側 gap でループ（複製と同一でシームレス）
    const updateAnimation = () => {
      const w = cycle.offsetWidth;
      const periodPx = w + GRID_GAP_PX;
      // 中身が長くなった分だけ移動距離が伸びるので、秒数も比例させて px/s を旧 1 ペア相当に近づける
      const innerGapsBetweenBlocks =
        (BIG_BLOCK_COUNT - 1) * GRID_GAP_PX;
      const onePairWidth =
        (w - innerGapsBetweenBlocks) / BIG_BLOCK_COUNT;
      const onePairPeriodPx = onePairWidth + GRID_GAP_PX;
      const durationSec =
        (BASE_SECONDS_PER_PAIR_PERIOD * periodPx) / onePairPeriodPx;

      const styleId = "top-grid-keyframes";
      let el = document.getElementById(styleId) as HTMLStyleElement | null;
      if (!el) {
        el = document.createElement("style");
        el.id = styleId;
        document.head.appendChild(el);
      }
      el.textContent = `
        @keyframes top-grid-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-${periodPx}px); }
        }
      `;

      container.style.animation = `top-grid-scroll ${durationSec}s linear infinite`;
    };

    updateAnimation();

    const ro = new ResizeObserver(updateAnimation);
    ro.observe(cycle);
    return () => ro.disconnect();
  }, [bootComplete]);

  const renderScrollStrip = (cellFlash: boolean) => (
    <div
      ref={containerRef}
      className="flex w-max max-w-none shrink-0"
      style={{ gap: GRID_GAP_PX, willChange: "transform" }}
    >
      <div
        ref={cycleMeasureRef}
        className="flex shrink-0"
        style={{ gap: GRID_GAP_PX }}
      >
        {urlsByBlock.map((row, blockIndex) => (
          <div
            key={blockIndex}
            className="flex shrink-0"
            style={{ gap: GRID_GAP_PX }}
          >
            <GridCopy
              variant={1}
              urls={row.cycle1}
              cellFlash={cellFlash}
            />
            <GridCopy
              variant={2}
              urls={row.cycle2}
              cellFlash={cellFlash}
            />
          </div>
        ))}
      </div>
      <div className="flex shrink-0" style={{ gap: GRID_GAP_PX }}>
        {urlsByBlock.map((row, blockIndex) => (
          <div
            key={blockIndex}
            className="flex shrink-0"
            style={{ gap: GRID_GAP_PX }}
          >
            <GridCopy
              variant={1}
              urls={row.cycle1}
              cellFlash={cellFlash}
            />
            <GridCopy
              variant={2}
              urls={row.cycle2}
              cellFlash={cellFlash}
            />
          </div>
        ))}
      </div>
    </div>
  );

  /** ブート前: グリッドはレイアウトのまま invisible（display:hidden だと高さが消え CLS が悪化） */
  const gridBlock = (cellFlash: boolean) => (
    <div
      className={`flex min-h-0 min-w-0 flex-1 flex-col justify-end overflow-hidden${
        !bootComplete ? " invisible" : ""
      }`}
    >
      {renderScrollStrip(cellFlash)}
    </div>
  );

  /** flex-1 でメイン領域の縦をすべて使い、justify-end で下辺＝スペーサー直上に揃える。上は bg-black で塗り足し */
  const rootClass =
    "relative flex min-h-0 w-full flex-1 flex-col justify-end bg-black";

  if (prefersReducedMotion) {
    return (
      <div className={rootClass}>
        {gridBlock(false)}
      </div>
    );
  }

  return (
    <div className={rootClass}>
      {bootComplete ? (
        <AstroidFlashProvider>{gridBlock(true)}</AstroidFlashProvider>
      ) : (
        gridBlock(false)
      )}
    </div>
  );
}
