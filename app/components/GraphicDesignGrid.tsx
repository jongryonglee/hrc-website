"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { nextImageUnoptimized } from "@/sanity/lib/image";

type GdCategory = "event-flier" | "cover-art" | "gino-goods";
type FilterCategory = "all" | GdCategory;

type GridItem = {
  image: string;
  title: string;
  alt: string;
  category: GdCategory;
};

type GraphicDesignGridProps = {
  items: GridItem[];
};

const EXIT_DURATION_MS = 280;

export const GraphicDesignGrid = ({ items }: GraphicDesignGridProps) => {
  const [selectedItem, setSelectedItem] = useState<GridItem | null>(null);
  const [phase, setPhase] = useState<"enter" | "exit" | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [filter, setFilter] = useState<FilterCategory>("all");

  const counts = items.reduce(
    (acc, item) => {
      acc.all += 1;
      if (item.category === "event-flier") acc.eventFlier += 1;
      if (item.category === "cover-art") acc.coverArt += 1;
      if (item.category === "gino-goods") acc.ginoGoods += 1;
      return acc;
    },
    { all: 0, eventFlier: 0, coverArt: 0, ginoGoods: 0 },
  );

  const filterButtons: { key: FilterCategory; label: string; count: number }[] = [
    { key: "all", label: "all", count: counts.all },
    { key: "event-flier", label: "event flier", count: counts.eventFlier },
    { key: "cover-art", label: "cover art", count: counts.coverArt },
    { key: "gino-goods", label: "gino goods", count: counts.ginoGoods },
  ];

  const filteredItems =
    filter === "all"
      ? items
      : items.filter((item) => item.category === filter);

  const open = useCallback((item: GridItem) => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    setSelectedItem(item);
    setPhase("enter");
  }, []);

  const close = useCallback(() => {
    if (phase === "exit") return;
    setPhase("exit");
    exitTimerRef.current = setTimeout(() => {
      exitTimerRef.current = null;
      setSelectedItem(null);
      setPhase(null);
    }, EXIT_DURATION_MS);
  }, [phase]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!selectedItem) return;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [selectedItem, close]);

  const backdropCls =
    phase === "enter"
      ? "gd-lightbox-backdrop-enter"
      : phase === "exit"
        ? "gd-lightbox-backdrop-exit"
        : "";

  const imgCls =
    phase === "enter"
      ? "gd-lightbox-img-enter"
      : phase === "exit"
        ? "gd-lightbox-img-exit"
        : "";

  return (
    <>
      <div className="layout-grid">
        <div className="grid-full [grid-row:span_2]">
          <p className="whitespace-nowrap">
            {filterButtons.map((btn, i) => (
              <span key={btn.key}>
                {i > 0 && " / "}
                <button
                  type="button"
                  onClick={() => setFilter(btn.key)}
                  className="cursor-pointer"
                >
                  <span
                    className={filter === btn.key ? "line-through" : ""}
                  >
                    {btn.label}
                  </span>
                  <sup className="ms-[2px] text-[0.65em] leading-none">
                    {btn.count}
                  </sup>
                </button>
              </span>
            ))}
          </p>
        </div>
      </div>

      <section className="mb-[0px]">
        <div className="grid grid-cols-2 gap-x-[17px] md:grid-cols-5 md:gap-x-[17px] [grid-auto-rows:17px] h-full">
          {filteredItems.map((item, i) => (
            <div
              key={i}
              className="relative [grid-row:span_12] md:[grid-row:span_16] flex items-center justify-center cursor-pointer"
              onClick={() => open(item)}
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
                unoptimized={nextImageUnoptimized(item.image)}
              />
            </div>
          ))}
        </div>
      </section>

      {selectedItem && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 ${backdropCls}`}
          onClick={close}
        >
          <div
            className={`relative ${imgCls}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-6 right-0 z-10"
              onClick={close}
              aria-label="閉じる"
            >
              <Image
                src="/icon/close.svg"
                alt="close"
                width={49}
                height={17}
              />
            </button>
            <Image
              src={selectedItem.image}
              alt={selectedItem.alt}
              width={473}
              height={473}
              className="object-contain w-[280px] h-[280px] md:w-[473px] md:h-[473px]"
              sizes="(max-width: 767px) 280px, 473px"
              unoptimized={nextImageUnoptimized(selectedItem.image)}
            />
          </div>
        </div>
      )}
    </>
  );
};
