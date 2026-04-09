"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/app/hooks/usePrefersReducedMotion";
import type { TopGridWorkItem } from "@/app/lib/cmsTypes";
import { TopFooter } from "./TopFooter";
import { TopGrid } from "./TopGrid";

export function HomeBootShell({ cmsItems }: { cmsItems: TopGridWorkItem[] }) {
  const [bootDoneByTimer, setBootDoneByTimer] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const bootComplete = prefersReducedMotion || bootDoneByTimer;

  const onBootSequenceEnd = useCallback(() => {
    setBootDoneByTimer(true);
  }, []);

  /** animationend が来ない場合のみ（CSS `--switch-boot-animation-ms` とズレ対策） */
  useEffect(() => {
    if (prefersReducedMotion) return;
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--switch-boot-animation-ms")
      .trim();
    const ms = parseInt(raw, 10) || 2333;
    const id = window.setTimeout(() => {
      setBootDoneByTimer((done) => (done ? done : true));
    }, ms + 120);
    return () => clearTimeout(id);
  }, [prefersReducedMotion]);

  return (
    <div className="flex min-w-0 flex-col overflow-x-hidden overflow-y-hidden h-[calc(100dvh-30px)] md:h-[calc(100dvh-34px)]">
      <section className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <TopGrid cmsItems={cmsItems} bootComplete={bootComplete} />
        </div>
      </section>

      <div className="h-[var(--grid-row)]" />

      <TopFooter
        bootComplete={bootComplete}
        onBootSequenceEnd={onBootSequenceEnd}
      />
    </div>
  );
}
