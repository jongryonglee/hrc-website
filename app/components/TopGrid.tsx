"use client";

import { useRef, useEffect } from "react";
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

// 大セルが1行ずつ斜めにずれるジグザグ配置
//   y: col 3-4 / row 1-2（上）
//   z: col 1-2 / row 2-3（中）
//   w: col 4-5 / row 3-4（下）
const GRID_AREAS = [
  { name: "a" }, // row1 col1
  { name: "b" }, // row1 col2
  { name: "y" }, // 2×2: col 3-4 / row 1-2
  { name: "c" }, // row1 col5
  { name: "d" }, // row1 col6
  { name: "z" }, // 2×2: col 1-2 / row 2-3
  { name: "e" }, // row2 col5
  { name: "f" }, // row2 col6
  { name: "g" }, // row3 col3
  { name: "w" }, // 2×2: col 4-5 / row 3-4
  { name: "h" }, // row3 col6
  { name: "i" }, // row4 col1
  { name: "j" }, // row4 col2
  { name: "k" }, // row4 col3
  { name: "l" }, // row4 col6
] as const;

// 同名を2×2に並べることで各セルが2列×2行を占有
const GRID_TEMPLATE_AREAS = `
  "a b y y c d"
  "z z y y e f"
  "z z g w w h"
  "i j k w w l"
`;

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
  return (
    <div
      ref={innerRef}
      className="flex-shrink-0"
      style={{
        display: "grid",
        // 160% にすると 1列 ≈ 360px → aspect-[360/274] = 1:0.76 がちょうど成立
        gridTemplateColumns: "repeat(6, 1fr)",
        gridTemplateAreas: GRID_TEMPLATE_AREAS,
        gap: "17px",
        marginTop: "-34px",
        width: "100%",
      }}
    >
      {GRID_AREAS.map((area, i) => {
        const src =
          cmsItems[i]?.thumbnailUrl ??
          FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
        return (
          <div
            key={area.name}
            className="relative overflow-hidden"
            style={{ gridArea: area.name, aspectRatio: "360 / 274" }}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width: 1024px) 20vw, 33vw"
              className="object-cover"
            />
            <img
              src="/works-mask.svg"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
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

    // 1コピー分の幅 + gap を測定して keyframes を動的に設定
    const updateAnimation = () => {
      const w = copy.offsetWidth;
      const amount = w + 17; // gap = 17px

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
          to   { transform: translateX(-${amount}px); }
        }
      `;

      container.style.animation = "top-grid-scroll 40s linear infinite";
    };

    updateAnimation();

    const ro = new ResizeObserver(updateAnimation);
    ro.observe(copy);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex gap-[17px]"
      style={{ willChange: "transform" }}
    >
      <GridCopy cmsItems={cmsItems} innerRef={copyRef} />
      <GridCopy cmsItems={cmsItems} />
      <GridCopy cmsItems={cmsItems} />
    </div>
  );
}
