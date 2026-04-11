"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import MuxVideo from "@mux/mux-video-react";
import { useRouter } from "next/navigation";
import type { WorkCreditLine, WorkDetailItem } from "@/app/lib/cmsTypes";
import { nextImageUnoptimized } from "@/sanity/lib/image";
import { CrtFlashProvider, CrtRevealCell } from "../../components/CrtFlash";
import { Header } from "../../components/Header";
import { ScrambleText } from "../../components/ScrambleText";
import { SoundToggle } from "../../components/SoundToggle";

const STORAGE_ENTER = "workDetailEnterTransition";
const STORAGE_ENTER_TARGET_ID = "workDetailEnterTargetId";
const STORAGE_CRT_FROM_WORKS_LIST = "workDetailCrtFromWorksList";

const SANDSTORM_SRC = "/videos/transition_effect03.mp4";
const SANDSTORM_ENTER_HOLD_MS = 600;

const NAV_COOLDOWN_MS = 1400;
const EXIT_MS = 420;
const WHEEL_NEXT_ON_SCROLL_UP = false;

const FALLBACK_CREDITS: WorkCreditLine[] = [
  { label: "Prod.", name: "theeluu" },
  { label: "Directer", name: "Hikaru Jamie Masamiya" },
  { label: "Camera", name: "Shintaro Teramoto" },
  { label: "Camera assistant", name: "Kosei Yamazaki" },
  { label: "Color", name: "Hikaru Jamie Masamiya" },
  { label: "Flower Design", name: "ai" },
  { label: "Still Photography", name: "Fumiya Kawasaki" },
  { label: "Act", name: "Fumiya Kawasaki, Gino" },
  { label: "Styling", name: "Daichi Inamura (Intro)" },
  { label: "Make-up artist", name: "Rei" },
  { label: "Assistant", name: "Ikuya Sada" },
  { label: "Special Thanks", name: "KAKKY" },
  { label: "Lyric", name: "takeisme" },
  { label: "Beat", name: "theeluu" },
  { label: "Mix", name: "theeluu" },
  { label: "Mastering", name: "theeluu" },
];

type Props = {
  data: WorkDetailItem | null;
};

export function WorkDetailClient({ data }: Props) {
  const creditLines =
    data?.credits && data.credits.length > 0 ? data.credits : FALLBACK_CREDITS;

  const router = useRouter();
  const [exiting, setExiting] = useState(false);
  const [enterActive, setEnterActive] = useState(false);
  const [sandstormExit, setSandstormExit] = useState(false);
  const [sandstormEnter, setSandstormEnter] = useState(false);
  const [useCrtEnter, setUseCrtEnter] = useState(false);
  const [muxSoundOn, setMuxSoundOn] = useState(false);
  const exitingRef = useRef(false);
  const lockUntilRef = useRef(0);
  const transitionPushTimerRef = useRef<number | null>(null);
  const sandstormVideoRef = useRef<HTMLVideoElement | null>(null);
  const muxVideoRef = useRef<HTMLVideoElement | null>(null);
  const thumbnailGestureRef = useRef<HTMLDivElement | null>(null);

  const hasMuxVideo = Boolean(data?.muxPlaybackId);

  const handleMuxSoundChange = useCallback((on: boolean) => {
    setMuxSoundOn(on);
    const v = muxVideoRef.current;
    if (v) v.muted = !on;
  }, []);

  useEffect(() => {
    exitingRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExiting(false);
    setSandstormExit(false);
  }, [data?._id]);

  useLayoutEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const lockStr = sessionStorage.getItem("workDetailNavLockUntil");
    if (lockStr) {
      const until = parseInt(lockStr, 10);
      if (!Number.isNaN(until) && Date.now() < until) {
        lockUntilRef.current = until;
      }
      sessionStorage.removeItem("workDetailNavLockUntil");
    }

    if (!data?._id) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const enter = sessionStorage.getItem(STORAGE_ENTER);
    const targetId = sessionStorage.getItem(STORAGE_ENTER_TARGET_ID);
    const isSequentialEnter = enter === "1" && targetId === data._id;

    if (isSequentialEnter) {
      setEnterActive(true);
      setUseCrtEnter(false);
      const allowSandstorm =
        (Boolean(data?.thumbnailUrl) || hasMuxVideo) && !reduceMotion;
      setSandstormEnter(allowSandstorm);
      try {
        sessionStorage.removeItem(STORAGE_CRT_FROM_WORKS_LIST);
      } catch {
        /* ignore */
      }
      if (!allowSandstorm) {
        try {
          sessionStorage.removeItem(STORAGE_ENTER);
          sessionStorage.removeItem(STORAGE_ENTER_TARGET_ID);
        } catch {
          /* ignore */
        }
      }
    } else {
      setEnterActive(false);
      setSandstormEnter(false);
      const stored = sessionStorage.getItem(STORAGE_CRT_FROM_WORKS_LIST);
      const fromWorksList = stored === data._id;
      setUseCrtEnter(fromWorksList && !reduceMotion);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [data?._id, data?.thumbnailUrl, data?.category, hasMuxVideo]);

  useEffect(() => {
    if (!data?._id) return;
    const stored = sessionStorage.getItem(STORAGE_CRT_FROM_WORKS_LIST);
    if (stored !== data._id) return;
    queueMicrotask(() => {
      try {
        sessionStorage.removeItem(STORAGE_CRT_FROM_WORKS_LIST);
      } catch {
        /* ignore */
      }
    });
  }, [data?._id]);

  const transitionTo = useCallback(
    (targetId: string) => {
      if (exitingRef.current) return;
      if (!targetId || targetId === data?._id) return;
      if (Date.now() < lockUntilRef.current) return;

      if (transitionPushTimerRef.current) {
        clearTimeout(transitionPushTimerRef.current);
        transitionPushTimerRef.current = null;
      }

      exitingRef.current = true;
      const until = Date.now() + NAV_COOLDOWN_MS;
      lockUntilRef.current = until;
      try {
        sessionStorage.setItem("workDetailNavLockUntil", String(until));
        sessionStorage.setItem(STORAGE_ENTER, "1");
        sessionStorage.setItem(STORAGE_ENTER_TARGET_ID, targetId);
      } catch {
        /* ignore */
      }

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if ((data?.thumbnailUrl || hasMuxVideo) && !reduceMotion) {
        setSandstormExit(true);
      }
      setExiting(true);

      transitionPushTimerRef.current = window.setTimeout(() => {
        transitionPushTimerRef.current = null;
        router.push(`/works/${targetId}`);
      }, EXIT_MS);
    },
    [data?._id, data?.thumbnailUrl, hasMuxVideo, router],
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
    return () => {
      if (transitionPushTimerRef.current) {
        clearTimeout(transitionPushTimerRef.current);
        transitionPushTimerRef.current = null;
        exitingRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!data?._id) return;
    const n = data.nextId;
    const p = data.prevId;
    if (n && n !== data._id) router.prefetch(`/works/${n}`);
    if (p && p !== data._id) router.prefetch(`/works/${p}`);
  }, [data?._id, data?.nextId, data?.prevId, router]);

  useEffect(() => {
    if (!sandstormExit && !sandstormEnter) return;
    const v = sandstormVideoRef.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play().catch(() => {});
  }, [sandstormExit, sandstormEnter]);

  useEffect(() => {
    if (!sandstormEnter) return;
    const t = window.setTimeout(() => {
      setSandstormEnter(false);
      try {
        sessionStorage.removeItem(STORAGE_ENTER);
        sessionStorage.removeItem(STORAGE_ENTER_TARGET_ID);
      } catch {
        /* ignore */
      }
    }, SANDSTORM_ENTER_HOLD_MS);
    return () => window.clearTimeout(t);
  }, [sandstormEnter]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Backspace" || e.isComposing) return;
      const el = e.target as HTMLElement | null;
      if (!el) return;
      if (el.closest("input, textarea, select, [contenteditable='true']")) return;
      if (el.isContentEditable) return;
      e.preventDefault();
      router.back();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

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

  const showSandstorm =
    (Boolean(data?.thumbnailUrl) || hasMuxVideo) &&
    (sandstormExit || sandstormEnter);

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

  const imgAnim =
    exiting && sandstormExit
      ? ""
      : exiting
        ? "work-detail-exit"
        : enterActive && !useCrtEnter
          ? ""
          : "";

  const textAnim = exiting
    ? "work-detail-exit"
    : enterActive && sandstormEnter
      ? "opacity-0"
      : enterActive
        ? "work-detail-enter-text"
        : "";

  const creditsAnim = exiting
    ? "work-detail-exit"
    : enterActive && sandstormEnter
      ? "opacity-0"
      : enterActive
        ? "work-detail-enter-credits"
        : "";

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <section
        className="flex flex-col flex-1 md:grid overflow-hidden"
        style={{ gridTemplateRows: "1fr" }}
      >
        <div className="md:[grid-area:1/1] relative md:z-20 pointer-events-none self-start w-full">
          <Header />
        </div>

        <div className="mt-[var(--grid-row)] md:mt-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none">
          <div className="layout-grid md:items-start pointer-events-auto md:pointer-events-none">
            <div
              className={`col-span-9 md:col-span-8 md:[grid-row-start:7] md:[grid-row-end:9] md:pointer-events-auto ${textAnim}`}
            >
              <p>
                Works /{" "}
                {data?.category === "sound-effect" ? "Sound Effect" : "Music Video"} /
              </p>
              <h2 className="text-[26px] leading-tight md:text-[32px]">
                {data?.title ?? "Saiwai / Takeisme"}
              </h2>
              <h2 className="text-[26px] leading-tight md:text-[32px]">
                (Prod.{data?.producer ?? "theeluu"})
              </h2>
            </div>
          </div>
        </div>

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

        <div className="mt-[var(--grid-row)] md:mt-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none md:flex md:flex-col md:justify-end md:mb-[17px]">
          <div className="layout-grid pointer-events-auto md:pointer-events-none">
            <div className="col-span-3 md:col-span-2 flex flex-col gap-1 md:pointer-events-auto justify-end">
              {data?.videoUrl ? (
                <a
                  href={data.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link_co flex items-center gap-2 whitespace-nowrap"
                >
                  <ScrambleText text="YouTube" mode="lap" speedMs={40} durationMs={400} />
                  <Image src="/icon-hicard.svg" alt="" width={9} height={9} className="link_co-icon" />
                </a>
              ) : (
                <span
                  className="link_co flex items-center gap-2 whitespace-nowrap"
                  aria-disabled="true"
                >
                  <ScrambleText text="YouTube" mode="lap" speedMs={40} durationMs={400} />
                  <Image src="/icon-hicard.svg" alt="" width={9} height={9} className="link_co-icon" />
                </span>
              )}
              <span
                className="link_co flex items-center gap-2 whitespace-nowrap"
                aria-disabled="true"
              >
                <ScrambleText text="Sound Cloud" mode="lap" speedMs={40} durationMs={400} />
                <Image src="/icon-hicard.svg" alt="" width={9} height={9} className="link_co-icon" />
              </span>
              <span
                className="link_co flex items-center gap-2 whitespace-nowrap"
                aria-disabled="true"
              >
                <ScrambleText text="Instagram" mode="lap" speedMs={40} durationMs={400} />
                <Image src="/icon-hicard.svg" alt="" width={9} height={9} className="link_co-icon" />
              </span>
            </div>
            <div className="col-start-8 col-span-2 md:col-start-17 md:col-span-2 self-end flex flex-col items-start gap-[34px] md:pointer-events-auto">
              {sequentialNav && (
                <div className="flex flex-col items-start gap-1">
                  <button
                    type="button"
                    onClick={tryNavigatePrev}
                    className="flex items-center gap-2 text-left text-[14px] leading-[1.1] md:text-[15px] cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <Image
                      src="/arrow-down.svg"
                      alt=""
                      width={11}
                      height={11}
                      className="shrink-0 rotate-180"
                      aria-hidden
                    />
                    <ScrambleText text="Previous" mode="lap" speedMs={40} durationMs={400} />
                  </button>
                  <button
                    type="button"
                    onClick={tryNavigateNext}
                    className="flex items-center gap-2 text-left text-[14px] leading-[1.1] md:text-[15px] cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <Image
                      src="/arrow-down.svg"
                      alt=""
                      width={11}
                      height={11}
                      className="shrink-0"
                      aria-hidden
                    />
                    <ScrambleText text="Next" mode="lap" speedMs={40} durationMs={400} />
                  </button>
                </div>
              )}
              <SoundToggle
                audioSrc={
                  data?.category === "sound-effect" ? data.soundUrl ?? null : null
                }
                onSoundChange={hasMuxVideo ? handleMuxSoundChange : undefined}
              />
            </div>
          </div>
        </div>

        <div className="mt-[calc(2*var(--grid-row))] pb-[34px] md:mt-0 md:pb-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none">
          <div className="layout-grid md:items-start pointer-events-auto md:pointer-events-none">
            <div
              className={`col-start-3 col-span-7 md:col-span-5 md:col-start-14 md:[grid-row-start:8] grid [grid-template-columns:subgrid] gap-y-0 content-start md:pointer-events-auto ${creditsAnim}`}
            >
              {creditLines.map((line, i) => (
                <Fragment key={line._key ?? `${line.label}-${i}`}>
                  <p className="col-span-3 md:col-span-2">{line.label}</p>
                  <p className="col-span-4 md:col-span-3">{line.name}</p>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
