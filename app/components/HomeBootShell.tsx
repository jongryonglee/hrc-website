"use client";

import { useEffect, useState } from "react";
import { TopFooter } from "./TopFooter";
import { TopGrid } from "./TopGrid";

type WorkItem = {
  _id: string;
  thumbnailUrl?: string | null;
};

/** OFF スイッチ点滅が終わるまでの時間（TopFooter の bootComplete を遅らせる） */
const BOOT_PHASE_MS = 1800;

export function HomeBootShell({ cmsItems }: { cmsItems: WorkItem[] }) {
  const [bootComplete, setBootComplete] = useState(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setBootComplete(true);
      return;
    }

    const id = window.setTimeout(() => setBootComplete(true), BOOT_PHASE_MS);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="flex min-w-0 flex-col overflow-x-hidden overflow-y-hidden h-[calc(100dvh-30px)] md:h-[calc(100dvh-34px)]">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col justify-end">
        <TopGrid cmsItems={cmsItems} />
      </section>

      <div className="h-[var(--grid-row)]" />

      <TopFooter bootComplete={bootComplete} />
    </div>
  );
}
