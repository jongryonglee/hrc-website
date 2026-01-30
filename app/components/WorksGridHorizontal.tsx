"use client";

import Image from "next/image";

const worksImages = [
  "/images/works-1.gif",
  "/images/works-2.png",
  "/images/works-3.png",
  "/images/works-4.png",
  "/images/works-5.png",
  "/images/works-6.png",
  "/images/works-7.png",
  "/images/works-8.png",
];

const ITEMS_PER_ROW = 5;
const ROWS = 4;
const TOTAL_ITEMS = ITEMS_PER_ROW * ROWS; // 20個
const ITEM_WIDTH = 268;
const GAP = 17;
const COLUMN_WIDTH = ITEM_WIDTH + GAP; // 1列分の幅（285px）

export const WorksGridHorizontal = () => {
  const renderGrid = (key: string) => (
    <div 
      key={key}
      className="grid grid-cols-2 gap-[17px] md:grid-cols-5 md:gap-[17px] flex-shrink-0"
      style={{ width: `${ITEM_WIDTH * ITEMS_PER_ROW + GAP * (ITEMS_PER_ROW - 1)}px` }}
    >
      {Array.from({ length: TOTAL_ITEMS }).map((_, i) => (
        <div key={i} className="flex w-full flex-col">
          <div className="relative aspect-[268/204] w-full overflow-hidden">
            <Image
              src={worksImages[i % worksImages.length]}
              alt="Work thumbnail"
              fill
              className="object-cover scale-[1.05]"
              sizes="268px"
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
      <div className="works-scroll-container flex-1 flex flex-col justify-end">
        <div className="works-scroll-content">
          {/* 無限ループ用に3つのグリッドを並べる */}
          {renderGrid("grid-1")}
          {renderGrid("grid-2")}
          {renderGrid("grid-3")}
        </div>
      </div>
    </section>
  );
};
