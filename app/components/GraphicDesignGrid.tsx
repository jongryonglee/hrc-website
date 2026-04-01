"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { isAnimatedGifUrl } from "@/sanity/lib/image";

type GridItem = {
  image: string;
  title: string;
  alt: string;
};

type GraphicDesignGridProps = {
  items: GridItem[];
};

export const GraphicDesignGrid = ({ items }: GraphicDesignGridProps) => {
  const [selectedItem, setSelectedItem] = useState<GridItem | null>(null);

  useEffect(() => {
    if (!selectedItem) return;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedItem(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [selectedItem]);

  return (
    <>
      <section className="mb-[0px]">
        <div className="grid grid-cols-2 gap-x-[17px] md:grid-cols-5 md:gap-x-[17px] [grid-auto-rows:17px] h-full">
          {items.map((item, i) => (
            <div
              key={i}
              className="relative [grid-row:span_12] md:[grid-row:span_16] flex items-center justify-center cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <div className="absolute left-0 top-0 text-white whitespace-pre-line">
                {item.title}
              </div>
              <Image
                src={item.image}
                alt={item.alt}
                width={135}
                height={135}
                className="h-[80px] w-[80px] object-contain md:h-[135px] md:w-[135px] transition-opacity hover:opacity-70"
                sizes="(max-width: 767px) 80px, 135px"
                priority={i === 0}
                unoptimized={isAnimatedGifUrl(item.image)}
              />
            </div>
          ))}
        </div>
      </section>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setSelectedItem(null)}
        >
          {/* 画像 + closeボタンのコンテナ */}
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* closeボタン：画像右上に配置 */}
            <button
              className="absolute -top-6 right-0 z-10"
              onClick={() => setSelectedItem(null)}
              aria-label="閉じる"
            >
              <Image
                src="/icon/close.svg"
                alt="close"
                width={49}
                height={17}
              />
            </button>
            {/* 拡大画像（元サイズの3.5倍） */}
            <Image
              src={selectedItem.image}
              alt={selectedItem.alt}
              width={473}
              height={473}
              className="object-contain w-[280px] h-[280px] md:w-[473px] md:h-[473px]"
              sizes="(max-width: 767px) 280px, 473px"
              unoptimized={isAnimatedGifUrl(selectedItem.image)}
            />
          </div>
        </div>
      )}
    </>
  );
};
