"use client";

import { useRef, useEffect, useMemo } from "react";
import Image from "next/image";

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

// 6×4 パターン（x=1×1 / w,y,z=2×2）
//   xxxxww
//   xxyyww
//   zzyyxx
//   zzxxxx
//   w: col5-6 row1-2 / y: col3-4 row2-3 / z: col1-2 row3-4
const GRID_AREAS = [
  { name: "a" }, // x row1 col1
  { name: "b" }, // x row1 col2
  { name: "c" }, // x row1 col3
  { name: "d" }, // x row1 col4
  { name: "w" }, // 2×2: col5-6 / row1-2
  { name: "e" }, // x row2 col1
  { name: "f" }, // x row2 col2
  { name: "y" }, // 2×2: col3-4 / row2-3
  { name: "g" }, // x row3 col5
  { name: "h" }, // x row3 col6
  { name: "z" }, // 2×2: col1-2 / row3-4
  { name: "i" }, // x row4 col3
  { name: "j" }, // x row4 col4
  { name: "k" }, // x row4 col5
  { name: "l" }, // x row4 col6
] as const;

// 同名を2×2に並べることで各セルが2列×2行を占有
const GRID_TEMPLATE_AREAS = `
  "a b c d w w"
  "e f y y w w"
  "z z y y g h"
  "z z i j k l"
`;

/** 2×2 大セル（w / y / z）では大きいマスク SVG を使う */
const BIG_MASK_AREAS = new Set<string>(["w", "y", "z"]);

/** グリッド・横ストリップ共通 gap */
const GRID_GAP_PX = 17;
/** 1列の幅: モバイル 268px / md 以上 360px（--cell-w で切替） */
const CELL_W_CSS_VAR = "var(--cell-w)";

/** CMS がなければ GRID_AREAS 順に、直前と同じフォールバック URL だけ避ける */
function buildThumbnailUrls(cmsItems: WorkItem[]): string[] {
  const n = FALLBACK_IMAGES.length;
  const out: string[] = [];
  let prev: string | null = null;

  for (let i = 0; i < GRID_AREAS.length; i++) {
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

type WorkItem = {
  _id: string;
  thumbnailUrl?: string | null;
};

function GridCopy({
  cmsItems,
  innerRef,
}: {
  cmsItems: WorkItem[];
  innerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const urls = useMemo(() => buildThumbnailUrls(cmsItems), [cmsItems]);

  return (
    <div
      ref={innerRef}
      className="shrink-0 [--cell-w:268px] md:[--cell-w:360px]"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(6, ${CELL_W_CSS_VAR})`,
        gridTemplateAreas: GRID_TEMPLATE_AREAS,
        gap: GRID_GAP_PX,
        marginTop: "-34px",
        width: `calc(6 * ${CELL_W_CSS_VAR} + 5 * ${GRID_GAP_PX}px)`,
      }}
    >
      {GRID_AREAS.map((area, i) => {
        const src = urls[i];
        const maskSrc = BIG_MASK_AREAS.has(area.name)
          ? "/icon/works-mask-big.svg"
          : "/works-mask.svg";

        return (
          <div
            key={area.name}
            className="relative isolate aspect-[268/204] overflow-hidden md:aspect-[360/274]"
            style={{ gridArea: area.name }}
          >
            {/* 写真とマスクを同じ box に対して object-cover で合わせる（元画像のアスペクト比が変わっても枠に対して同じクロップになる） */}
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 767px) 268px, 360px"
              className="object-cover object-center"
              draggable={false}
            />
            <img
              src={maskSrc}
              alt=""
              aria-hidden={true}
              draggable={false}
              className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover object-center select-none"
            />
          </div>
        );
      })}
    </div>
  );
}

export function TopGrid({ cmsItems }: { cmsItems: WorkItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const copy = copyRef.current;
    if (!container || !copy) return;

    // 1コピー幅 + gap でループ（2枚目は1枚目と同一内容でシームレス）
    const updateAnimation = () => {
      const w = copy.offsetWidth;
      const periodPx = w + GRID_GAP_PX;

      // インライン keyframes を <style> タグで注入
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

      container.style.animation = "top-grid-scroll 40s linear infinite"; // 速度
    };

    updateAnimation();

    const ro = new ResizeObserver(updateAnimation);
    ro.observe(copy);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex w-max max-w-none shrink-0"
      style={{ gap: GRID_GAP_PX, willChange: "transform" }}
    >
      <GridCopy key="a" cmsItems={cmsItems} innerRef={copyRef} />
      <GridCopy key="b" cmsItems={cmsItems} />
    </div>
  );
}
