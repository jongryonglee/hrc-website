"use client";

import MuxVideo from "@mux/mux-video-react";
import Image from "next/image";
import { type RefObject, useEffect, useRef } from "react";
import { nextImageUnoptimized } from "@/sanity/lib/image";
import {
  CrtFlashProvider,
  CrtRevealCell,
  useCrtFlashApi,
} from "./CrtFlash";

type Props = {
  playbackId: string;
  posterSrc: string;
  posterAlt: string;
  imageClassName: string;
  rounded: boolean;
  priority: boolean;
  /** true のとき /works-mask.svg を映像・ポスター常時上層に重ねる（ContentGrid の showMask と併用） */
  showWorksMask?: boolean;
};

function MuxHoverPointerBinder({
  containerRef,
  muxVideoRef,
  posterOpacityRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  muxVideoRef: RefObject<HTMLVideoElement | null>;
  posterOpacityRef: RefObject<HTMLDivElement | null>;
}) {
  const { replay, resetHard } = useCrtFlashApi();
  const genRef = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const setPosterVisible = (visible: boolean) => {
      const wrap = posterOpacityRef.current;
      if (!wrap) return;
      wrap.style.opacity = visible ? "1" : "0";
    };

    const playMux = () => {
      const v = muxVideoRef.current;
      if (!v) return;
      v.muted = true;
      void v.play().catch(() => {});
    };

    const pauseMux = () => {
      const v = muxVideoRef.current;
      if (!v) return;
      v.pause();
      try {
        v.currentTime = 0;
      } catch {
        /* ignore */
      }
    };

    const onEnter = () => {
      const gen = ++genRef.current;
      setPosterVisible(false);
      void (async () => {
        if (reduceMotion) {
          if (gen !== genRef.current) return;
          playMux();
          return;
        }
        await replay();
        if (gen !== genRef.current) return;
        playMux();
      })();
    };

    const onLeave = () => {
      genRef.current += 1;
      setPosterVisible(true);
      resetHard();
      pauseMux();
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      genRef.current += 1;
      setPosterVisible(true);
      resetHard();
      pauseMux();
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [containerRef, muxVideoRef, posterOpacityRef, replay, resetHard]);

  return null;
}

/**
 * グリッド用: 静止サムネの上でホバーすると CRT のあと Mux を再生し、離すとリセットする。
 */
export function GridMuxHoverMedia({
  playbackId,
  posterSrc,
  posterAlt,
  imageClassName,
  rounded,
  priority,
  showWorksMask = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const muxVideoRef = useRef<HTMLVideoElement | null>(null);
  const posterOpacityRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <CrtFlashProvider autoPlayOnMount={false} replayStaggerMaxMs={0}>
        <MuxHoverPointerBinder
          containerRef={containerRef}
          muxVideoRef={muxVideoRef}
          posterOpacityRef={posterOpacityRef}
        />
        <CrtRevealCell>
          <div className="absolute inset-0 overflow-hidden">
            <MuxVideo
              ref={muxVideoRef}
              playbackId={playbackId}
              autoPlay={false}
              muted
              loop
              playsInline
              className={`absolute inset-0 z-0 h-full w-full ${imageClassName}`}
            />
          </div>
        </CrtRevealCell>
      </CrtFlashProvider>
      <div
        ref={posterOpacityRef}
        className={`pointer-events-none absolute inset-0 z-[4] overflow-hidden${rounded ? " rounded-[12px]" : ""}`}
        style={{ opacity: 1 }}
      >
        <Image
          src={posterSrc}
          alt={posterAlt}
          fill
          className={imageClassName}
          sizes="(min-width: 1024px) 18vw, (min-width: 768px) 25vw, 45vw"
          priority={priority}
          unoptimized={nextImageUnoptimized(posterSrc)}
        />
      </div>
      {showWorksMask && (
        <Image
          src="/works-mask.svg"
          alt=""
          aria-hidden="true"
          fill
          className={`pointer-events-none select-none z-[8] object-cover object-center${rounded ? " rounded-[12px]" : ""}`}
          unoptimized
        />
      )}
    </div>
  );
}
