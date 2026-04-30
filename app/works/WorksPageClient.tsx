"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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

const HOVER_THUMB_W_PX = 600;
/** `.layout-grid` の column-gap（md 以上は 17px）に合わせた 4 単位。ホバー行の下線より上にサムネ上辺を置くオフセット */
const HOVER_THUMB_TOP_OFFSET_GRID_PX = 17 * 4;

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
  const [hoverPreviewTop, setHoverPreviewTop] = useState(0);
  const [filter, setFilter] = useState<FilterCategory>("all");
  const listHoverAreaRef = useRef<HTMLDivElement | null>(null);
  const rowMeasureRefs = useRef<(HTMLDivElement | null)[]>([]);

  const updateHoverPreviewTop = useCallback((index: number) => {
    const area = listHoverAreaRef.current;
    const rowEl = rowMeasureRefs.current[index];
    if (!area || !rowEl) return;
    const areaRect = area.getBoundingClientRect();
    const rowRect = rowEl.getBoundingClientRect();
    const rowLineY = rowRect.bottom - areaRect.top;
    setHoverPreviewTop(rowLineY - HOVER_THUMB_TOP_OFFSET_GRID_PX);
  }, []);

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

  useLayoutEffect(() => {
    if (hoverIndex === null) return;
    updateHoverPreviewTop(hoverIndex);
  }, [hoverIndex, hovered, filter, filteredItems.length, updateHoverPreviewTop]);

  useEffect(() => {
    if (hoverIndex === null) return;
    const onWin = () => updateHoverPreviewTop(hoverIndex);
    window.addEventListener("scroll", onWin, { passive: true });
    window.addEventListener("resize", onWin);
    const area = listHoverAreaRef.current;
    const ro =
      typeof ResizeObserver !== "undefined" && area
        ? new ResizeObserver(onWin)
        : null;
    if (area && ro) ro.observe(area);
    return () => {
      window.removeEventListener("scroll", onWin);
      window.removeEventListener("resize", onWin);
      ro?.disconnect();
    };
  }, [hoverIndex, updateHoverPreviewTop]);

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
                    className="cursor-pointer"
                  >
                    <span
                      className={
                        filter === btn.key ? "line-through" : ""
                      }
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

        <section className="mt-[15px] md:mt-[17px]">
          <div className="layout-grid">
            <div className="col-start-3 md:[grid-row:span_2] whitespace-nowrap">
              <p>(produced works)</p>
            </div>
          </div>

          <div
            ref={listHoverAreaRef}
            className={`relative mt-[15px] md:mt-[17px]${
              canHover ? " pb-[calc(600px*204/268)]" : ""
            }`}
          >
            <div className="layout-grid whitespace-nowrap">
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
                    ref={(el) => {
                      rowMeasureRefs.current[index] = el;
                    }}
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
                className="pointer-events-none absolute inset-x-0 z-0"
                style={{ top: hoverPreviewTop }}
              >
                <div className="flex justify-center">
                  <div
                    className="relative aspect-[268/204] max-w-full"
                    style={{ width: HOVER_THUMB_W_PX }}
                  >
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
          </div>
        </section>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
