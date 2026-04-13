"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { WorkListItem } from "@/app/lib/cmsTypes";
import { useCanHover } from "@/app/hooks/useCanHover";
import { nextImageUnoptimized } from "@/sanity/lib/image";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { ScrambleText } from "../components/ScrambleText";

/** WorkDetailClient と同じキー。一覧から詳細へ行くときだけ CRT 許可 */
const STORAGE_CRT_FROM_WORKS_LIST = "workDetailCrtFromWorksList";

export type WorkItem = WorkListItem;

type Props = {
  initialItems: WorkItem[];
};

type FilterCategory = "all" | "music-video" | "sound-effect";

export function WorksPageClient({ initialItems }: Props) {
  const router = useRouter();
  const canHover = useCanHover();
  const [hovered, setHovered] = useState<WorkItem | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterCategory>("all");

  const handleRowClick = useCallback((id: string) => {
    try {
      sessionStorage.setItem(STORAGE_CRT_FROM_WORKS_LIST, id);
    } catch {
      /* private mode 等 */
    }
    router.push(`/works/${id}`);
  }, [router]);

  /** ホバー prefetch に近づける（モバイルはタップ直前に先読み） */
  const rowPointerProps = useCallback(
    (id: string) => ({
      onPointerDown: () => router.prefetch(`/works/${id}`),
      onClick: () => handleRowClick(id),
    }),
    [router, handleRowClick],
  );

  const counts = initialItems.reduce(
    (acc, item) => {
      acc.all += 1;
      if (item.category === "music-video") acc.musicVideo += 1;
      if (item.category === "sound-effect") acc.soundEffect += 1;
      return acc;
    },
    { all: 0, musicVideo: 0, soundEffect: 0 }
  );

  const filterButtons: { key: FilterCategory; label: string; count: number }[] = [
    { key: "all", label: "all", count: counts.all },
    { key: "music-video", label: "music video", count: counts.musicVideo },
    { key: "sound-effect", label: "sound effect", count: counts.soundEffect },
  ];

  const filteredItems =
    filter === "all"
      ? initialItems
      : initialItems.filter((item) => item.category === filter);

  const showHoverPreview =
    !!(hovered?.thumbnailUrl && hoverIndex !== null);

  return (
    <div className="flex min-h-full flex-col flex-1 px-[10px] py-[15px] md:p-[17px]">
      <Header />

      {/* Title & summary */}
      <section className="mt-[30px] md:mt-[0px]">
        <div className="layout-grid">
          {/* (Works): 上から5グリッド分 */}
          <div className="grid-full [grid-row:span_4] md:[grid-row:span_5]">
            <h1>(Works)</h1>
          </div>
          <div className="grid-full [grid-row:span_1]">
            <p className="whitespace-nowrap">
              {filterButtons.map((btn, i) => (
                <span key={btn.key}>
                  {i > 0 && " / "}
                  <button
                    type="button"
                    onClick={() => setFilter(btn.key)}
                    className={`cursor-pointer transition-opacity ${
                      filter === btn.key ? "opacity-100" : "opacity-40 hover:opacity-70"
                    }`}
                  >
                    {btn.label}
                    {btn.count}
                  </button>
                </span>
              ))}
            </p>
          </div>
        </div>

        <section
          className={`mt-[15px] md:mt-[17px]${
            canHover && !showHoverPreview ? " pb-[calc(600px*204/268)]" : ""
          }`}
        >
          <div className="layout-grid">
            <div className="col-start-3 md:[grid-row:span_2] whitespace-nowrap">
              <p>(produced works)</p>
            </div>
          </div>

          <div className="layout-grid mt-[15px] md:mt-[17px] whitespace-nowrap">
            {filteredItems.map((work, index) => {
              const rowProps = rowPointerProps(work._id);
              return (
              <div
                key={work._id}
                className="group/row contents"
                onMouseEnter={() => {
                  if (!canHover) return;
                  setHovered(work);
                  setHoverIndex(index);
                }}
                onMouseLeave={() => {
                  if (!canHover) return;
                  setHovered(null);
                  setHoverIndex(null);
                }}
              >
                <div
                  className="col-span-6 md:col-span-4 [grid-row:span_1] relative z-10 cursor-pointer"
                  {...rowProps}
                >
                  <ScrambleText
                    text={work.title}
                    mode="lap"
                    speedMs={40}
                    durationMs={400}
                    active={hovered?._id === work._id}
                  />
                </div>
                <div
                  className="col-span-3 md:col-span-2 [grid-row:span_1] text-right relative z-10 cursor-pointer"
                  {...rowProps}
                >
                  <ScrambleText
                    text={work.label}
                    mode="lap"
                    speedMs={40}
                    durationMs={400}
                    active={hovered?._id === work._id}
                  />
                </div>
                <div className="hidden md:block md:col-span-3 md:[grid-row:span_1] relative z-10 cursor-pointer" {...rowProps} />
                <div
                  className="col-span-3 md:col-span-2 [grid-row:span_1] relative z-10 cursor-pointer"
                  {...rowProps}
                >
                  <ScrambleText
                    text={work.artist}
                    mode="lap"
                    speedMs={40}
                    durationMs={400}
                    active={hovered?._id === work._id}
                  />
                </div>
                <div
                  className="col-span-3 md:col-span-2 [grid-row:span_1] md:text-right relative z-10 cursor-pointer"
                  {...rowProps}
                >
                  <ScrambleText
                    text={work.role}
                    mode="lap"
                    speedMs={40}
                    durationMs={400}
                    active={hovered?._id === work._id}
                  />
                </div>
                <div
                  className="col-span-3 md:col-span-5 [grid-row:span_1] text-right relative overflow-visible z-10 cursor-pointer"
                  {...rowProps}
                >
                  <ScrambleText
                    text={work.date}
                    mode="lap"
                    speedMs={40}
                    durationMs={400}
                    active={hovered?._id === work._id}
                  />
                  <div
                    className={
                      "pointer-events-none absolute left-1/2 bottom-0 h-px w-[200vw] -translate-x-1/2 bg-white/0 transition-colors" +
                      (canHover ? " group-hover/row:bg-white/70" : "")
                    }
                  />
                </div>
              </div>
            );
            })}
          </div>

          {hovered?.thumbnailUrl && hoverIndex !== null && (
            <div
              className="pointer-events-none col-start-1 col-span-9 md:col-span-18 z-0 relative"
              style={{
                gridRowStart: Math.max(1, hoverIndex + 1 - 4),
                gridRowEnd: "span 1",
                alignSelf: "start",
              }}
            >
              <div className="flex justify-center">
                <div className="relative aspect-[268/204] w-[600px] -translate-y-[51px]">
                  <Image
                    src={hovered.thumbnailUrl}
                    alt=""
                    fill
                    sizes="600px"
                    className="object-cover object-center max-md:scale-[0.992] max-md:[transform-origin:center]"
                    unoptimized={nextImageUnoptimized(hovered.thumbnailUrl)}
                  />
                  <img
                    src="/works-mask.svg"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
