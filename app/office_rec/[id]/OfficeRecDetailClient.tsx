"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { OfficeRecDetailItem } from "@/app/lib/cmsTypes";
import { nextImageUnoptimized } from "@/sanity/lib/image";
import { Header } from "../../components/Header";
import { SoundToggle } from "../../components/SoundToggle";

const STORAGE_ENTER = "officeRecDetailEnterTransition";
const STORAGE_LOCK = "officeRecDetailNavLockUntil";

const NAV_COOLDOWN_MS = 1400;
const EXIT_MS = 420;

const WHEEL_NEXT_ON_SCROLL_UP = false;

type Props = {
  data: OfficeRecDetailItem | null;
};

export function OfficeRecDetailClient({ data }: Props) {
  const router = useRouter();
  const [exiting, setExiting] = useState(false);
  const [enterActive, setEnterActive] = useState(false);
  const exitingRef = useRef(false);
  const lockUntilRef = useRef(0);

  useLayoutEffect(() => {
    const lockStr = sessionStorage.getItem(STORAGE_LOCK);
    if (lockStr) {
      const until = parseInt(lockStr, 10);
      if (!Number.isNaN(until) && Date.now() < until) {
        lockUntilRef.current = until;
      }
      sessionStorage.removeItem(STORAGE_LOCK);
    }

    const enter = sessionStorage.getItem(STORAGE_ENTER);
    if (enter === "1") {
      sessionStorage.removeItem(STORAGE_ENTER);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage は描画外の同期読み取り
      setEnterActive(true);
    }
  }, []);

  const transitionTo = useCallback(
    (href: string) => {
      if (exitingRef.current) return;
      if (Date.now() < lockUntilRef.current) return;

      exitingRef.current = true;
      const until = Date.now() + NAV_COOLDOWN_MS;
      lockUntilRef.current = until;
      sessionStorage.setItem(STORAGE_LOCK, String(until));
      sessionStorage.setItem(STORAGE_ENTER, "1");
      setExiting(true);

      window.setTimeout(() => {
        router.push(href);
      }, EXIT_MS);
    },
    [router]
  );

  /** 複数件あるときだけ前後へ遷移（1件のみのときは nextId / prevId が自分自身になる） */
  const sequentialNav = Boolean(data?.nextId && data.nextId !== data._id);

  const tryNavigateNext = useCallback(() => {
    const nextId = data?.nextId;
    if (!nextId || nextId === data?._id) return;
    transitionTo(`/office_rec/${nextId}`);
  }, [data?._id, data?.nextId, transitionTo]);

  const tryNavigatePrev = useCallback(() => {
    const prevId = data?.prevId;
    if (!prevId || prevId === data?._id) return;
    transitionTo(`/office_rec/${prevId}`);
  }, [data?._id, data?.prevId, transitionTo]);

  const nextHref = data?.nextId ? `/office_rec/${data.nextId}` : "/office_rec";

  const onNextLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    transitionTo(nextHref);
  };

  const tryNavigateNextRef = useRef(tryNavigateNext);
  const tryNavigatePrevRef = useRef(tryNavigatePrev);

  useLayoutEffect(() => {
    tryNavigateNextRef.current = tryNavigateNext;
    tryNavigatePrevRef.current = tryNavigatePrev;
  }, [tryNavigateNext, tryNavigatePrev]);

  useEffect(() => {
    if (!sequentialNav) return;

    const onWheel = (e: WheelEvent) => {
      const dy = e.deltaY;
      if (dy === 0) return;
      const isScrollUp = dy < 0;
      const wantsNext = WHEEL_NEXT_ON_SCROLL_UP ? isScrollUp : !isScrollUp;
      if (wantsNext) tryNavigateNextRef.current();
      else tryNavigatePrevRef.current();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [sequentialNav]);

  useEffect(() => {
    if (!sequentialNav) return;

    let startY = 0;
    const threshold = 48;

    const onTouchStart = (e: TouchEvent) => {
      startY = e.changedTouches[0]?.clientY ?? 0;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0]?.clientY ?? startY;
      const delta = endY - startY;
      if (delta > threshold) tryNavigateNextRef.current();
      else if (-delta > threshold) tryNavigatePrevRef.current();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [sequentialNav]);

  const thumbnailContent = data?.thumbnailUrl ? (
    <>
      <Image
        src={data.thumbnailUrl}
        alt=""
        fill
        priority
        sizes="(min-width: 768px) 60vw, 95vw"
        className="object-cover"
        unoptimized={nextImageUnoptimized(data.thumbnailUrl)}
      />
      <img
        src="/works-mask.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </>
  ) : (
    <div className="absolute inset-0 rounded-[16px] bg-white/10" />
  );

  const imgAnim = exiting
    ? "work-detail-exit"
    : enterActive
      ? "work-detail-enter-img"
      : "";

  const textAnim = exiting
    ? "work-detail-exit"
    : enterActive
      ? "work-detail-enter-text"
      : "";

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <section
        className="flex flex-col flex-1 md:grid overflow-hidden"
        style={{ gridTemplateRows: "1fr" }}
      >
        <div className="md:[grid-area:1/1] relative md:z-20 pointer-events-none self-start w-full">
          <div className="pointer-events-auto">
            <Header />
          </div>
        </div>

        <div className="mt-[var(--grid-row)] md:mt-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none">
          <div className="layout-grid md:items-start pointer-events-auto">
            <div
              className={`col-span-9 md:col-span-8 md:[grid-row-start:7] md:[grid-row-end:9] ${textAnim}`}
            >
              <p>(Office Rec) /</p>
              <h2 className="text-[26px] leading-tight md:text-[32px] mt-[17px]">
                {data?.title ?? "Vol.1 - Reunited"}
              </h2>
              <h2 className="text-[26px] leading-tight md:text-[32px]">
                {data?.artist ?? "takeisme"}
              </h2>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="md:[grid-area:1/1] md:z-0 md:flex md:items-center md:justify-center"
        >
          <div
            className={`relative aspect-[360/274] overflow-hidden w-[95vw] mx-auto md:w-auto md:mx-0 md:h-[80vh] ${imgAnim}`}
          >
            {thumbnailContent}
          </div>
        </div>

        <div className="mt-[var(--grid-row)] md:mt-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none md:flex md:flex-col md:justify-end md:pb-[34px]">
          <div className="layout-grid pointer-events-auto">
            <div className="col-span-6 md:col-span-4 flex flex-col gap-1 min-h-[1px]" />
            <div className="col-start-8 col-span-2 md:col-start-17 md:col-span-2 self-end">
              <SoundToggle />
            </div>
          </div>
        </div>

        <div className="mt-[calc(2*var(--grid-row))] pb-[34px] md:mt-0 md:pb-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none">
          <div className="layout-grid md:items-start pointer-events-auto">
            {sequentialNav && (
              <div className="col-start-3 col-span-5 mt-[var(--grid-row)] md:mt-0 md:col-start-16 md:col-span-3 md:[grid-row-start:24]">
                <Link
                  href={nextHref}
                  onClick={onNextLinkClick}
                  className="hover:opacity-70 transition-opacity inline-flex items-center gap-2"
                >
                  <Image src="/arrow-down.svg" alt="" width={9} height={9} />
                  next
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
