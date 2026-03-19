"use client";

import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ScrambleText } from "../components/ScrambleText";
import { client, hasProjectId } from "@/sanity/lib/client";
import { WORKS_ITEMS_QUERY } from "@/sanity/lib/queries";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type WorkItem = {
  _id: string;
  title: string;
  artist: string;
  producer?: string | null;
  category: "music-video" | "sound-effect";
  videoUrl: string;
  thumbnailUrl?: string | null;
  label: string;
  role: string;
  date: string;
};

export default function WorkPage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<WorkItem | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [sourceItems, setSourceItems] = useState<WorkItem[]>([]);

  const handleRowClick = (id: string) => {
    router.push(`/works/${id}`);
  };

  useEffect(() => {
    if (!hasProjectId || !client) {
      setSourceItems([]);
      return;
    }

    let isMounted = true;
    client
      .fetch(WORKS_ITEMS_QUERY)
      .then((data) => {
        if (isMounted) setSourceItems(data as WorkItem[]);
      })
      .catch(() => {
        if (isMounted) setSourceItems([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const counts = sourceItems.reduce(
    (acc, item) => {
      acc.all += 1;
      if (item.category === "music-video") acc.musicVideo += 1;
      if (item.category === "sound-effect") acc.soundEffect += 1;
      return acc;
    },
    { all: 0, musicVideo: 0, soundEffect: 0 }
  );
  const summaryText =
    counts.all > 0
      ? `all${counts.all} / music video${counts.musicVideo} / sound effect${counts.soundEffect}`
      : "all1 / music video1 / sound effect0";

  return (
    <div className="flex min-h-full flex-col flex-1">
      <Header />

      {/* Title & summary */}
      <section>
        <div className="layout-grid">
          {/* (Works): 上から5グリッド分 */}
          <div className="grid-full [grid-row:span_4] md:[grid-row:span_5]">
            <h1>(Works)</h1>
          </div>
          <div className="grid-full [grid-row:span_2]">
            <p className="whitespace-nowrap">{summaryText}</p>
          </div>
        </div>

        <section className="mt-[15px] md:mt-[17px]">
          <div className="layout-grid">
            <div className="col-start-3 md:[grid-row:span_2] whitespace-nowrap">
              <p>(produced works)</p>
            </div>
          </div>

          <div className="layout-grid mt-[15px] md:mt-[17px] whitespace-nowrap">
            {sourceItems.map((work, index) => (
              <div
                key={work._id}
                className="group/row contents"
                onMouseEnter={() => {
                  setHovered(work);
                  setHoverIndex(index);
                }}
                onMouseLeave={() => {
                  setHovered(null);
                  setHoverIndex(null);
                }}
              >
                <div
                  className="col-span-6 md:col-span-4 [grid-row:span_1] relative z-10 cursor-pointer"
                  onClick={() => handleRowClick(work._id)}
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
                  onClick={() => handleRowClick(work._id)}
                >
                    <ScrambleText
                      text={work.label}
                      mode="lap"
                      speedMs={40}
                      durationMs={400}
                      active={hovered?._id === work._id}
                    />
                  </div>
                <div
                  className="hidden md:block md:col-span-3 md:[grid-row:span_1] relative z-10 cursor-pointer"
                  onClick={() => handleRowClick(work._id)}
                />
                <div
                  className="col-span-3 md:col-span-2 [grid-row:span_1] relative z-10 cursor-pointer"
                  onClick={() => handleRowClick(work._id)}
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
                  onClick={() => handleRowClick(work._id)}
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
                  onClick={() => handleRowClick(work._id)}
                >
                  <ScrambleText
                    text={work.date}
                    mode="lap"
                    speedMs={40}
                    durationMs={400}
                    active={hovered?._id === work._id}
                  />
                  <div className="pointer-events-none absolute left-1/2 bottom-0 h-px w-[200vw] -translate-x-1/2 bg-white/0 transition-colors group-hover/row:bg-white/70" />
                </div>
              </div>

              
            ))}
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
                <div className="relative aspect-[360/274] w-[600px] -translate-y-[51px]">
                  <img
                    src={hovered.thumbnailUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <img
                    src="/works-mask.svg"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </section>
        <div className="layout-grid">
          <div className="grid-full [grid-row:span_5] md:[grid-row:span_10]" />
        </div>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
