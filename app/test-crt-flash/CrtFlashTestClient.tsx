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

const DURATION_SEC = 8;

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
const POP_SCALE_SHRINK = 0.02;

const MASK_PAD = 20000;
const MASK_ORIGIN = 50 - MASK_PAD / 2;

const MASK_CLOSED_SY = 0;
const MAIN_MS = DURATION_SEC * 1000;
/** マスク縦開き 0→1 にかける時間（ms）— ここだけで速度調整 */
const MASK_EXPAND_MS = 200;
/** プチュン〜マスクが開き切るまで */
const TOTAL_MS = MAIN_MS;

function centerScaleTransform(sx: number, sy: number) {
  return `translate(50 50) scale(${sx} ${sy}) translate(-50 -50)`;
}

function lineBeamTransform(sx: number, sy: number) {
  const x = Number.isFinite(sx) ? sx : 0;
  const y = Number.isFinite(sy) ? sy : LINE_Y_MIN;
  return `translate(50 50) scale(${x} ${y}) translate(-50 -50)`;
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

export function CrtFlashTestClient() {
  const holeMaskId = useId().replace(/:/g, "");
  const maskOverlayRef = useRef<HTMLDivElement>(null);
  const holeGroupRef = useRef<SVGGElement>(null);
  const popLayerRef = useRef<HTMLDivElement>(null);
  const popGroupRef = useRef<SVGGElement>(null);
  const popLineGroupRef = useRef<SVGGElement>(null);
  const rafRef = useRef<number | null>(null);

  const stopAnimation = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    const mask = maskOverlayRef.current;
    const hole = holeGroupRef.current;
    const pop = popLayerRef.current;
    const popG = popGroupRef.current;
    const lineG = popLineGroupRef.current;
    if (!mask || !hole || !pop || !popG || !lineG) return;

    stopAnimation();

    mask.style.visibility = "visible";
    mask.style.opacity = "1";
    hole.removeAttribute("style");
    setHoleScale(hole, 1, MASK_CLOSED_SY);

    pop.style.visibility = "visible";
    pop.style.opacity = "1";
    pop.style.filter = "brightness(1.24) blur(0.58px)";
    popG.removeAttribute("style");
    popG.removeAttribute("opacity");
    lineG.removeAttribute("style");
    lineG.setAttribute("opacity", "0");
    lineG.setAttribute("transform", lineBeamTransform(0, 0));
    setHoleScale(popG, POP_SCALE_X_START, POP_SCALE_Y_START);

    const startMs = performance.now();

    const tick = (now: number) => {
      const popEl = popLayerRef.current;
      const popGroup = popGroupRef.current;
      const lineG = popLineGroupRef.current;
      const holeEl = holeGroupRef.current;
      const maskEl = maskOverlayRef.current;
      if (!popEl || !popGroup || !lineG || !holeEl || !maskEl) {
        rafRef.current = null;
        return;
      }

      const elapsed = now - startMs;

      if (elapsed < FLASH_MS) {
        setHoleScale(holeEl, 1, MASK_CLOSED_SY);
        popEl.style.visibility = "visible";
        popEl.style.opacity = "1";

        const center = centerLightState(elapsed);
        setHoleScale(popGroup, center.sx, center.sy);
        popGroup.setAttribute("opacity", String(center.opacity));

        const line = horizontalLineState(elapsed);
        lineG.setAttribute("transform", lineBeamTransform(line.sx, line.sy));
        lineG.setAttribute("opacity", String(line.opacity));

        const glow = Math.min(1, elapsed / 160);
        const br = 1.22 + 0.12 * glow;
        const bl = 0.56 + 0.14 * glow;
        popEl.style.filter = `brightness(${br}) blur(${bl}px)`;
      } else {
        const uMask = clamp01((elapsed - FLASH_MS) / MASK_EXPAND_MS);
        const [hx, hy] = maskExpandScales(uMask);
        setHoleScale(holeEl, hx, hy);
        setHoleScale(popGroup, POP_SCALE_SHRINK, POP_SCALE_SHRINK);
        lineG.setAttribute("transform", lineBeamTransform(0, 0));
        popGroup.removeAttribute("opacity");
        lineG.setAttribute("opacity", "0");
        popEl.style.visibility = "hidden";
        popEl.style.opacity = "0";
        popEl.style.filter = "";
      }

      if (elapsed >= TOTAL_MS) {
        rafRef.current = null;
        setHoleScale(holeEl, 1, 1);
        maskEl.style.visibility = "hidden";
        maskEl.style.opacity = "0";
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [stopAnimation]);

  useLayoutEffect(() => {
    const hole = holeGroupRef.current;
    const popG = popGroupRef.current;
    const lineG = popLineGroupRef.current;
    if (hole) {
      hole.removeAttribute("style");
      setHoleScale(hole, 1, MASK_CLOSED_SY);
    }
    if (popG) {
      popG.removeAttribute("style");
      popG.removeAttribute("opacity");
      setHoleScale(popG, POP_SCALE_X_START, POP_SCALE_Y_START);
    }
    if (lineG) {
      lineG.removeAttribute("style");
      lineG.setAttribute("opacity", "0");
      lineG.setAttribute("transform", lineBeamTransform(0, 0));
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
        <div ref={popLayerRef} className={styles.popLayer} aria-hidden>
          <svg
            className={styles.popSvg}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <g ref={popLineGroupRef} opacity={0} transform={lineBeamTransform(0, 0)}>
              <rect
                x="1"
                y="49.35"
                width="98"
                height="0.85"
                fill="#ffffff"
                opacity={0.92}
                shapeRendering="crispEdges"
              />
            </g>
            <g
              ref={popGroupRef}
              transform={centerScaleTransform(
                POP_SCALE_X_START,
                POP_SCALE_Y_START,
              )}
            >
              <path d={ASTROID_PATH_SLIM_LIGHT_100} fill="#ffffff" />
            </g>
          </svg>
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
                  ref={holeGroupRef}
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
        マスク縦開きは <code>MASK_EXPAND_MS = {MASK_EXPAND_MS}</code> ms
        のみで管理。フラッシュ約 {FLASH_MS}ms のあと、その時間で sy が 0→1。
      </p>
    </div>
  );
}
