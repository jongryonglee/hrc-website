"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
} from "react";
import Image from "next/image";
import styles from "./crt-flash.module.css";
import { ASTROID_PATH_SLIM_LIGHT_100 } from "@/app/lib/astroidPath";

const SAMPLE_SRC = "/favicon.png";

const DURATION_SEC = 0.5;

const CENTER_CORE_MS = 280;
const LINE_FOLLOW_MS = 42;
const LINE_H_SWEEP_MS = 95;
const LINE_LINE_FADE_MS = 100;
const LINE_Y_MIN = 0.07;
const FLASH_MS = Math.max(
  CENTER_CORE_MS,
  LINE_FOLLOW_MS + LINE_H_SWEEP_MS + LINE_LINE_FADE_MS + 80,
);
const POP_SCALE_X_START = 0.08;
const POP_SCALE_Y_START = 0.012;
const POP_SCALE_PEAK_X = 1;
const POP_SCALE_PEAK = 0.4;

const MASK_PAD = 20000;
const MASK_ORIGIN = 50 - MASK_PAD / 2;

const MASK_CLOSED_SY = 0;
const MAIN_MS = DURATION_SEC * 1000;
const MASK_EXPAND_MS = 200;
const TOTAL_MS = MAIN_MS;

function centerScaleTransform(sx: number, sy: number) {
  return `translate(50 50) scale(${sx} ${sy}) translate(-50 -50)`;
}

function centerLightState(localT: number): {
  sx: number;
  sy: number;
  opacity: number;
} {
  if (localT <= 0 || localT >= CENTER_CORE_MS) {
    return { sx: POP_SCALE_X_START, sy: POP_SCALE_Y_START, opacity: 0 };
  }
  const u = localT / CENTER_CORE_MS;
  let amp: number;
  if (u < 0.38) {
    const k = u / 0.38;
    amp = 1 - (1 - k) ** 2;
  } else if (u < 0.68) {
    const k = (u - 0.38) / 0.3;
    amp = 1 - 0.52 * k * k;
  } else {
    const k = (u - 0.68) / 0.32;
    amp = 0.48 * (1 - k) ** 2;
  }
  const sx =
    POP_SCALE_X_START + (POP_SCALE_PEAK_X - POP_SCALE_X_START) * amp;
  const sy =
    POP_SCALE_Y_START +
    (POP_SCALE_PEAK - POP_SCALE_Y_START) * amp ** 1.12;
  let opacity = 1;
  if (u > 0.62) {
    opacity = 1 - ((u - 0.62) / 0.38) ** 1.75;
  }
  return { sx, sy, opacity: opacity < 0.02 ? 0 : opacity };
}

function horizontalLineState(localT: number): {
  sx: number;
  sy: number;
  opacity: number;
} {
  if (localT < LINE_FOLLOW_MS) {
    return { sx: 0, sy: LINE_Y_MIN, opacity: 0 };
  }
  const afterFollow = localT - LINE_FOLLOW_MS;
  if (afterFollow < LINE_H_SWEEP_MS) {
    const h = afterFollow / LINE_H_SWEEP_MS;
    const sx = 1 - (1 - h) ** 3;
    return { sx, sy: LINE_Y_MIN, opacity: 0.9 };
  }
  const afterH = afterFollow - LINE_H_SWEEP_MS;
  const fadeT = clamp01(afterH / LINE_LINE_FADE_MS);
  const opacity = 0.92 * (1 - fadeT ** 2);
  return {
    sx: 1,
    sy: LINE_Y_MIN,
    opacity: opacity < 0.02 ? 0 : opacity,
  };
}

function setHoleScale(g: SVGGElement, sx: number, sy: number) {
  const x = Number.isFinite(sx) ? sx : 1;
  const y = Number.isFinite(sy) ? sy : MASK_CLOSED_SY;
  g.setAttribute("transform", centerScaleTransform(x, y));
}

function clamp01(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t;
}

function maskExpandScales(u: number): [number, number] {
  const t = clamp01(u);
  const syEase = 1 - (1 - t) ** 1.55;
  return [1, syEase];
}

function mergedHoleFlash(localT: number): { sx: number; sy: number } {
  const center = centerLightState(localT);
  const line = horizontalLineState(localT);
  const sxHole = Math.max(center.sx, line.sx);
  const syHole = Math.max(
    center.sy,
    line.opacity > 0.02 ? LINE_Y_MIN : 0,
  );
  return { sx: sxHole, sy: syHole };
}

const FLASH_END_SY = mergedHoleFlash(Math.max(0, FLASH_MS - 0.001)).sy;

export function CrtFlashTestClient() {
  const holeMaskId = useId().replace(/:/g, "");
  const maskOverlayRef = useRef<HTMLDivElement>(null);
  const holeGroupAstroidRef = useRef<SVGGElement>(null);
  const holeGroupRectRef = useRef<SVGGElement>(null);
  const rafRef = useRef<number | null>(null);

  const stopAnimation = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    const mask = maskOverlayRef.current;
    const holeA = holeGroupAstroidRef.current;
    const holeR = holeGroupRectRef.current;
    if (!mask || !holeA || !holeR) return;

    stopAnimation();

    mask.style.visibility = "visible";
    mask.style.opacity = "1";
    holeA.removeAttribute("style");
    holeR.removeAttribute("style");
    setHoleScale(holeA, 1, MASK_CLOSED_SY);
    setHoleScale(holeR, 1, MASK_CLOSED_SY);

    const startMs = performance.now();

    const tick = (now: number) => {
      const holeAst = holeGroupAstroidRef.current;
      const holeRect = holeGroupRectRef.current;
      const maskEl = maskOverlayRef.current;
      if (!holeAst || !holeRect || !maskEl) {
        rafRef.current = null;
        return;
      }

      const elapsed = now - startMs;

      if (elapsed < FLASH_MS) {
        const { sx, sy } = mergedHoleFlash(elapsed);
        setHoleScale(holeAst, sx, sy);
        setHoleScale(holeRect, 1, MASK_CLOSED_SY);
      } else {
        const uMask = clamp01((elapsed - FLASH_MS) / MASK_EXPAND_MS);
        const [, syEase] = maskExpandScales(uMask);
        const sy =
          FLASH_END_SY + (1 - FLASH_END_SY) * syEase;
        setHoleScale(holeAst, 1, MASK_CLOSED_SY);
        setHoleScale(holeRect, 1, sy);
      }

      if (elapsed >= TOTAL_MS) {
        rafRef.current = null;
        setHoleScale(holeAst, 1, MASK_CLOSED_SY);
        setHoleScale(holeRect, 1, 1);
        maskEl.style.visibility = "hidden";
        maskEl.style.opacity = "0";
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [stopAnimation]);

  useLayoutEffect(() => {
    const a = holeGroupAstroidRef.current;
    const r = holeGroupRectRef.current;
    if (a) {
      a.removeAttribute("style");
      setHoleScale(a, 1, MASK_CLOSED_SY);
    }
    if (r) {
      r.removeAttribute("style");
      setHoleScale(r, 1, MASK_CLOSED_SY);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  return (
    <div>
      <div className={styles.wrapper}>
        <div className={styles.imageWrap}>
          <Image
            className={styles.image}
            src={SAMPLE_SRC}
            alt=""
            fill
            priority
            sizes="(max-width: 520px) 90vw, 520px"
          />
        </div>
        <div ref={maskOverlayRef} className={styles.maskOverlay} aria-hidden>
          <svg
            className={styles.maskSvg}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <mask
                id={holeMaskId}
                maskUnits="userSpaceOnUse"
                maskContentUnits="userSpaceOnUse"
                x={MASK_ORIGIN}
                y={MASK_ORIGIN}
                width={MASK_PAD}
                height={MASK_PAD}
              >
                <rect
                  x={MASK_ORIGIN}
                  y={MASK_ORIGIN}
                  width={MASK_PAD}
                  height={MASK_PAD}
                  fill="white"
                />
                <g
                  ref={holeGroupAstroidRef}
                  transform={centerScaleTransform(1, MASK_CLOSED_SY)}
                >
                  <path d={ASTROID_PATH_SLIM_LIGHT_100} fill="black" />
                </g>
                <g
                  ref={holeGroupRectRef}
                  transform={centerScaleTransform(1, MASK_CLOSED_SY)}
                >
                  <rect x="0" y="0" width="100" height="100" fill="black" />
                </g>
              </mask>
            </defs>
            <rect
              width="100"
              height="100"
              fill="#000000"
              mask={`url(#${holeMaskId})`}
            />
          </svg>
        </div>
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.button} onClick={play}>
          フラッシュを再生
        </button>
      </div>

      <p className={styles.note}>
        フラッシュはアストロイド抜き、展開は従来どおり全面矩形抜き（
        <code>sx = 1</code> のまま <code>sy</code> のみ）。展開{" "}
        <code>MASK_EXPAND_MS = {MASK_EXPAND_MS}</code> ms。
      </p>
    </div>
  );
}
