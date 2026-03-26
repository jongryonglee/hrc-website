"use client";

import { useMemo, useState } from "react";

type WorkListItem = {
  _id: string;
  title: string;
  label: string;
  artist: string;
  role: string;
  date: string;
  thumbnailUrl?: string | null;
};

type WorksListWithHoverProps = {
  items: WorkListItem[];
};

const PREVIEW_WIDTH = 360;
const PREVIEW_HEIGHT = 240;
const PREVIEW_OFFSET = 24;

export const WorksListWithHover = ({ items }: WorksListWithHoverProps) => {
  const [hovered, setHovered] = useState<WorkListItem | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  const previewStyle = useMemo(() => {
    if (!hovered || !hovered.thumbnailUrl || typeof window === "undefined") {
      return { transform: "translate(-9999px, -9999px)" };
    }

    let x = cursor.x + PREVIEW_OFFSET;
    let y = cursor.y + PREVIEW_OFFSET;

    if (x + PREVIEW_WIDTH > window.innerWidth - 8) {
      x = cursor.x - PREVIEW_OFFSET - PREVIEW_WIDTH;
    }
    if (y + PREVIEW_HEIGHT > window.innerHeight - 8) {
      y = cursor.y - PREVIEW_OFFSET - PREVIEW_HEIGHT;
    }

    return { transform: `translate(${x}px, ${y}px)` };
  }, [cursor.x, cursor.y, hovered]);

  return (
    <div className="relative">
      <div className="layout-grid mt-[15px] md:mt-[17px] whitespace-nowrap">
        {items.map((work) => (
          <div
            key={work._id}
            className="group/row contents"
            onMouseEnter={() => setHovered(work)}
            onMouseLeave={() => setHovered(null)}
            onMouseMove={(event) =>
              setCursor({ x: event.clientX, y: event.clientY })
            }
          >
            <div className="col-span-6 md:col-span-4 [grid-row:span_1]">
              {work.title}
            </div>
            <div className="col-span-3 md:col-span-2 [grid-row:span_1] text-right">
              {work.label}
            </div>
            <div className="hidden md:block md:col-span-3 md:[grid-row:span_1]" />
            <div className="col-span-3 md:col-span-2 [grid-row:span_1]">
              {work.artist}
            </div>
            <div className="col-span-3 md:col-span-2 [grid-row:span_1] md:text-right">
              {work.role}
            </div>
            <div className="col-span-3 md:col-span-5 [grid-row:span_1] text-right relative overflow-visible">
              {work.date}
              <div className="pointer-events-none absolute left-1/2 bottom-0 h-px w-[200vw] -translate-x-1/2 bg-white/0 transition-colors group-hover/row:bg-white/70" />
            </div>
          </div>
        ))}
      </div>

      {hovered?.thumbnailUrl && (
        <div
          className="pointer-events-none fixed left-0 top-0 z-50"
          style={previewStyle}
        >
          <img
            src={hovered.thumbnailUrl}
            alt=""
            className="h-auto w-[260px] md:w-[360px]"
          />
        </div>
      )}
    </div>
  );
};
