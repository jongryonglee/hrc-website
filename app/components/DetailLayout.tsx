"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import MuxVideo from "@mux/mux-video-react";
import { useRouter } from "next/navigation";
import { nextImageUnoptimized } from "@/sanity/lib/image";
import { CrtFlashProvider, CrtRevealCell } from "./CrtFlash";
import { Header } from "./Header";
import { ScrambleText } from "./ScrambleText";
import { SoundToggle } from "./SoundToggle";

const SANDSTORM_SRC = "/videos/transition_effect03.mp4";
const SANDSTORM_ENTER_HOLD_MS = 200;
const NAV_COOLDOWN_MS = 1400;
const WHEEL_NEXT_ON_SCROLL_UP = false;

export type DetailLayoutData = {
  _id: string;
  title: string;
  thumbnailUrl?: string | null;
  muxPlaybackId?: string | null;
  videoUrl?: string | null;
  nextId?: string | null;
  prevId?: string | null;
};

type StorageKeys = {
  enter: string;
  enterTargetId: string;
  crtFromList: string;
  lock: string;
};

type LinkItem = {
  label: string;
  url?: string | null;
};

export type DetailLayoutProps = {
  data: DetailLayoutData | null;
  basePath: string;
  storageKeys: StorageKeys;
  enableBackspaceNav?: boolean;

  renderInfo: (textAnim: string) => ReactNode;
  links: LinkItem[];
  soundToggleAudioSrc?: string | null;

  /** Extra content in the right column above SoundToggle (e.g. Prev/Next buttons). */
  renderRightExtra?: (params: {
    sequentialNav: boolean;
    tryNavigateNext: () => void;
    tryNavigatePrev: () => void;
  }) => ReactNode;

  /** Credits block rendered below the main grid (Works only). */
  renderCredits?: (creditsAnim: string) => ReactNode;

  /** Show a centered scroll hint instead of Prev/Next buttons (Works style). */
  showCenterScrollHint?: boolean;
};

export function DetailLayout({
  data,
  basePath,
  storageKeys,
  enableBackspaceNav = false,
  renderInfo,
  links,
  soundToggleAudioSrc,
  renderRightExtra,
  renderCredits,
  showCenterScrollHint = false,
}: DetailLayoutProps) {
  const router = useRouter();
  const [enterActive, setEnterActive] = useState(false);
  const [sandstormEnter, setSandstormEnter] = useState(false);
  const [useCrtEnter, setUseCrtEnter] = useState(false);
  const [muxSoundOn, setMuxSoundOn] = useState(false);
  const lockUntilRef = useRef(0);
  const sandstormVideoRef = useRef<HTMLVideoElement | null>(null);
  const muxVideoRef = useRef<HTMLVideoElement | null>(null);
  const thumbnailGestureRef = useRef<HTMLDivElement | null>(null);

  const hasMuxVideo = Boolean(data?.muxPlaybackId);

  const handleMuxSoundChange = useCallback((on: boolean) => {
    setMuxSoundOn(on);
    const v = muxVideoRef.current;
    if (v) v.muted = !on;
  }, []);

  useLayoutEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const lockStr = sessionStorage.getItem(storageKeys.lock);
    if (lockStr) {
      const until = parseInt(lockStr, 10);
      if (!Number.isNaN(until) && Date.now() < until) {
        lockUntilRef.current = until;
      }
      sessionStorage.removeItem(storageKeys.lock);
    }

    if (!data?._id) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const enter = sessionStorage.getItem(storageKeys.enter);
    const targetId = sessionStorage.getItem(storageKeys.enterTargetId);
    const isSequentialEnter = enter === "1" && targetId === data._id;

    if (isSequentialEnter) {
      setEnterActive(true);
      setUseCrtEnter(false);
      const allowSandstorm =
        (Boolean(data?.thumbnailUrl) || hasMuxVideo) && !reduceMotion;
      setSandstormEnter(allowSandstorm);
      try {
        sessionStorage.removeItem(storageKeys.crtFromList);
      } catch {
        /* ignore */
      }
      if (!allowSandstorm) {
        try {
          sessionStorage.removeItem(storageKeys.enter);
          sessionStorage.removeItem(storageKeys.enterTargetId);
        } catch {
          /* ignore */
        }
      }
    } else {
      setEnterActive(false);
      setSandstormEnter(false);
      const stored = sessionStorage.getItem(storageKeys.crtFromList);
      const fromList = stored === data._id;
      setUseCrtEnter(fromList && !reduceMotion);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [
    data?._id,
    data?.thumbnailUrl,
    hasMuxVideo,
    storageKeys.lock,
    storageKeys.enter,
    storageKeys.enterTargetId,
    storageKeys.crtFromList,
  ]);

  useEffect(() => {
    if (!data?._id) return;
    const stored = sessionStorage.getItem(storageKeys.crtFromList);
    if (stored !== data._id) return;
    queueMicrotask(() => {
      try {
        sessionStorage.removeItem(storageKeys.crtFromList);
      } catch {
        /* ignore */
      }
    });
  }, [data?._id, storageKeys.crtFromList]);

  const transitionTo = useCallback(
    (targetId: string) => {
      if (!targetId || targetId === data?._id) return;
      if (Date.now() < lockUntilRef.current) return;
      const until = Date.now() + NAV_COOLDOWN_MS;
      lockUntilRef.current = until;
      try {
        sessionStorage.setItem(storageKeys.lock, String(until));
        sessionStorage.setItem(storageKeys.enter, "1");
        sessionStorage.setItem(storageKeys.enterTargetId, targetId);
      } catch {
        /* ignore */
      }
      router.push(`${basePath}/${targetId}`);
    },
    [data?._id, router, basePath, storageKeys],
  );

  const tryNavigateNext = useCallback(() => {
    const nextId = data?.nextId;
    if (!nextId || nextId === data?._id) return;
    transitionTo(nextId);
  }, [data?._id, data?.nextId, transitionTo]);

  const tryNavigatePrev = useCallback(() => {
    const prevId = data?.prevId;
    if (!prevId || prevId === data?._id) return;
    transitionTo(prevId);
  }, [data?._id, data?.prevId, transitionTo]);

  const tryNavigateNextRef = useRef(tryNavigateNext);
  const tryNavigatePrevRef = useRef(tryNavigatePrev);

  useLayoutEffect(() => {
    tryNavigateNextRef.current = tryNavigateNext;
    tryNavigatePrevRef.current = tryNavigatePrev;
  }, [tryNavigateNext, tryNavigatePrev]);

  useEffect(() => {
    if (!data?._id) return;
    const n = data.nextId;
    const p = data.prevId;
    if (n && n !== data._id) router.prefetch(`${basePath}/${n}`);
    if (p && p !== data._id) router.prefetch(`${basePath}/${p}`);
  }, [data?._id, data?.nextId, data?.prevId, router, basePath]);

  useEffect(() => {
    if (!sandstormEnter) return;
    const v = sandstormVideoRef.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play().catch(() => {});
  }, [sandstormEnter]);

  useEffect(() => {
    if (!sandstormEnter) return;
    const t = window.setTimeout(() => {
      setSandstormEnter(false);
      try {
        sessionStorage.removeItem(storageKeys.enter);
        sessionStorage.removeItem(storageKeys.enterTargetId);
      } catch {
        /* ignore */
      }
    }, SANDSTORM_ENTER_HOLD_MS);
    return () => window.clearTimeout(t);
  }, [sandstormEnter, storageKeys]);

  useEffect(() => {
    if (!enableBackspaceNav) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Backspace" || e.isComposing) return;
      const el = e.target as HTMLElement | null;
      if (!el) return;
      if (el.closest("input, textarea, select, [contenteditable='true']"))
        return;
      if (el.isContentEditable) return;
      e.preventDefault();
      router.back();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enableBackspaceNav, router]);

  const sequentialNav = Boolean(data?.nextId && data.nextId !== data._id);

  useEffect(() => {
    if (!sequentialNav) return;
    const el = thumbnailGestureRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      const dy = e.deltaY;
      const dx = e.deltaX;
      if (dy === 0) return;
      if (Math.abs(dx) >= Math.abs(dy)) return;
      const isScrollUp = dy < 0;
      const wantsNext = WHEEL_NEXT_ON_SCROLL_UP ? isScrollUp : !isScrollUp;
      if (wantsNext) tryNavigateNextRef.current();
      else tryNavigatePrevRef.current();
    };

    el.addEventListener("wheel", onWheel, { passive: true });
    return () => el.removeEventListener("wheel", onWheel);
  }, [sequentialNav]);

  useEffect(() => {
    if (!sequentialNav) return;
    const el = thumbnailGestureRef.current;
    if (!el) return;

    let startY = 0;
    let startX = 0;
    let multiTouchGesture = false;
    const threshold = 48;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        multiTouchGesture = true;
        return;
      }
      multiTouchGesture = false;
      startY = e.touches[0]?.clientY ?? 0;
      startX = e.touches[0]?.clientX ?? 0;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length > 0) return;
      if (multiTouchGesture) {
        multiTouchGesture = false;
        return;
      }
      const t = e.changedTouches[0];
      if (!t) return;
      const deltaY = t.clientY - startY;
      const deltaX = t.clientX - startX;
      if (Math.abs(deltaX) >= Math.abs(deltaY)) return;
      if (deltaY > threshold) tryNavigateNextRef.current();
      else if (-deltaY > threshold) tryNavigatePrevRef.current();
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [sequentialNav]);

  /* ── derived visual state ─────────────────────────────── */

  const showSandstorm =
    (Boolean(data?.thumbnailUrl) || hasMuxVideo) && sandstormEnter;

  const sandstormVideoEl = showSandstorm ? (
    <video
      ref={sandstormVideoRef}
      src={SANDSTORM_SRC}
      className="work-detail-sandstorm-video max-md:scale-[0.992] max-md:[transform-origin:center]"
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden
    />
  ) : null;

  const worksMask = (
    <img
      src="/works-mask.svg"
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full object-cover object-center select-none"
    />
  );

  const thumbnailContent = hasMuxVideo ? (
    <>
      <div className="absolute inset-0 overflow-hidden">
        <MuxVideo
          ref={muxVideoRef}
          playbackId={data!.muxPlaybackId!}
          autoPlay="muted"
          muted={!muxSoundOn}
          loop
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover object-center max-md:scale-[0.992] max-md:[transform-origin:center]"
        />
        {sandstormVideoEl}
      </div>
      {worksMask}
    </>
  ) : data?.thumbnailUrl ? (
    <>
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={data.thumbnailUrl}
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 60vw, 95vw"
          className="object-cover object-center max-md:scale-[0.992] max-md:[transform-origin:center]"
          unoptimized={nextImageUnoptimized(data.thumbnailUrl)}
        />
        {sandstormVideoEl}
      </div>
      {worksMask}
    </>
  ) : (
    <div className="absolute inset-0 rounded-[16px] bg-white/10" />
  );

  const imgAnim = enterActive && !useCrtEnter ? "" : "";

  const textAnim = enterActive && sandstormEnter
      ? "opacity-0"
      : enterActive
        ? "work-detail-enter-text"
        : "";

  const creditsAnim = enterActive && sandstormEnter
      ? "opacity-0"
      : enterActive
        ? "work-detail-enter-credits"
        : "";

  return (
    <div className="flex flex-col flex-1 overflow-hidden px-[10px] py-[15px] md:p-[17px]">
      <section
        className="flex flex-col flex-1 md:grid overflow-hidden"
        style={{ gridTemplateRows: "1fr" }}
      >
        {/* Header */}
        <div className="md:[grid-area:1/1] relative md:z-20 pointer-events-none self-start w-full">
          <Header />
        </div>

        {/* Info text */}
        <div className="mt-[var(--grid-row)] md:mt-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none">
          <div className="layout-grid md:items-start pointer-events-auto md:pointer-events-none">
            {renderInfo(textAnim)}
          </div>
        </div>

        {/* Thumbnail */}
        <div
          aria-hidden="true"
          className="md:[grid-area:1/1] md:z-0 md:flex md:items-center md:justify-center"
        >
          <div
            ref={thumbnailGestureRef}
            className={`relative aspect-[268/204] touch-pan-y w-[95vw] mx-auto md:h-[80vh] md:w-auto md:max-w-none md:shrink-0 md:mx-0 ${imgAnim}`}
          >
            {useCrtEnter ? (
              <CrtFlashProvider>
                <CrtRevealCell>{thumbnailContent}</CrtRevealCell>
              </CrtFlashProvider>
            ) : (
              thumbnailContent
            )}
          </div>
        </div>

        {/* Bottom: links (left) + right column */}
        <div className="mt-[var(--grid-row)] md:mt-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none md:flex md:flex-col md:justify-end md:mb-[17px]">
          <div className="layout-grid pointer-events-auto md:pointer-events-none">
            <div className="col-span-3 md:col-span-2 flex flex-col gap-1 md:pointer-events-auto justify-end">
              {links.map(({ label, url }) =>
                url ? (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link_co flex items-center gap-2 whitespace-nowrap"
                  >
                    <ScrambleText
                      text={label}
                      mode="lap"
                      speedMs={40}
                      durationMs={400}
                    />
                    <Image
                      src="/icon-hicard.svg"
                      alt=""
                      width={9}
                      height={9}
                      className="link_co-icon"
                    />
                  </a>
                ) : (
                  <span
                    key={label}
                    className="link_co flex items-center gap-2 whitespace-nowrap"
                    aria-disabled="true"
                  >
                    <ScrambleText
                      text={label}
                      mode="lap"
                      speedMs={40}
                      durationMs={400}
                    />
                    <Image
                      src="/icon-hicard.svg"
                      alt=""
                      width={9}
                      height={9}
                      className="link_co-icon"
                    />
                  </span>
                ),
              )}
            </div>
            <div className="col-start-8 col-span-2 md:col-start-17 md:col-span-2 self-end flex flex-col items-start gap-[34px] md:pointer-events-auto">
              {renderRightExtra?.({
                sequentialNav,
                tryNavigateNext,
                tryNavigatePrev,
              })}
              <SoundToggle
                audioSrc={soundToggleAudioSrc}
                onSoundChange={hasMuxVideo ? handleMuxSoundChange : undefined}
              />
            </div>
          </div>
        </div>

        {/* Center scroll hint (Works style) */}
        {showCenterScrollHint && sequentialNav && (
          <div
            className="hidden md:flex md:[grid-area:1/1] relative md:z-10 pointer-events-none items-center justify-center"
            style={{ height: "100%" }}
          >
            <div
              className="layout-grid w-full"
              style={{ position: "absolute", top: "70%" }}
            >
              <div className="md:col-start-14 md:col-span-5 flex justify-center">
                <p className="flex items-center gap-2 text-[15px] leading-[1.1]">
                  <Image
                    src="/arrow-down.svg"
                    alt=""
                    width={11}
                    height={11}
                    className="shrink-0"
                    aria-hidden
                  />
                  scroll
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Credits (Works only) */}
        {renderCredits && (
          <div className="mt-[calc(2*var(--grid-row))] pb-[34px] md:mt-0 md:pb-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none">
            <div className="layout-grid md:items-start pointer-events-auto md:pointer-events-none">
              {renderCredits(creditsAnim)}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
