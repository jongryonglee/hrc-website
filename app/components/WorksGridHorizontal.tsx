"use client";

import type { CSSProperties } from "react";
import Image from "next/image";

const worksImages = [
  "/images/works-1.gif",
  "/gifs/11.gif",
  "/gifs/12.gif",
  "/gifs/13.gif",
  "/images/works-5.png",
  "/gifs/14.gif",
  "/images/works-7.png",
  "/gifs/15.gif",
  "/gifs/16.gif",
  "/gifs/17.gif",
  "/gifs/18.gif",
  "/gifs/20.gif"
];

const ITEMS_PER_ROW = 5;
const ROWS = 4;
const TOTAL_ITEMS = ITEMS_PER_ROW * ROWS; // 20個
const MOBILE_COLS = 4;
const MOBILE_ROWS = 4;
const MOBILE_MAX_ITEMS = MOBILE_COLS * MOBILE_ROWS; // モバイルは3行 x 4列
const ITEM_WIDTH = 268;
const GAP = 17;
const COLUMN_WIDTH = ITEM_WIDTH + GAP; // 1列分の幅（285px）
const MOBILE_ITEM_WIDTH = 268;
const MOBILE_GRID_WIDTH = MOBILE_ITEM_WIDTH * MOBILE_COLS + GAP * (MOBILE_COLS - 1);

export const WorksGridHorizontal = () => {
  const renderGrid = (key: string) => (
    <div 
      key={key}
      className="grid w-[var(--mobile-grid-width)] flex-shrink-0 grid-cols-4 gap-[17px] md:w-[1408px] md:grid-cols-5 md:gap-[17px]"
      style={{ "--mobile-grid-width": `${MOBILE_GRID_WIDTH}px` } as CSSProperties}
    >
      {Array.from({ length: TOTAL_ITEMS }).map((_, i) => (
        <div
          key={i}
          className={
            i >= MOBILE_MAX_ITEMS ? "hidden w-full flex-col md:flex" : "flex w-full flex-col"
          }
        >
          <div className="relative aspect-[268/204] w-full overflow-hidden">
            <Image
              src={worksImages[i % worksImages.length]}
              alt="Work thumbnail"
              fill
              className="object-cover scale-[1.05]"
              sizes="(max-width: 767px) 268px, 268px"
              priority={i < 4 && key === "grid-1"}
              unoptimized={false}
            />
            {/* 黒い縁のマスクを上に重ねる（コンテナより少し大きくして画像のはみ出しを隠す） */}
            <Image
              src="/works-mask.svg"
              alt=""
              aria-hidden="true"
              fill
              className="pointer-events-none select-none scale-[1.017]"
              unoptimized
            />
          </div>
        </div>
      ))}
    </div>
  );

  const GRID_WIDTH = ITEM_WIDTH * ITEMS_PER_ROW + GAP * (ITEMS_PER_ROW - 1); // 1408px

  return (
    <section className="flex-1 mb-[17px] overflow-y-auto overflow-x-hidden flex flex-col">
      <div className="works-scroll-container flex-1 flex flex-col justify-end overflow-hidden">
        <div className="works-scroll-content -mt-[140px] md:-mt-[140px]">
          {/* 無限ループ用に3つのグリッドを並べる */}
          {renderGrid("grid-1")}
          {renderGrid("grid-2")}
          {renderGrid("grid-3")}
        </div>
      </div>
    </section>
  );
};
