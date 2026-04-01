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
import { ASTROID_PATH_SLIM_LIGHT_100 } from "./astroidPath";

const SAMPLE_SRC = "/favicon.png";

const SCALE_END = 220;

const DURATION_SEC = 8;

const POP_GROW_MS = 180;
const POP_SHRINK_MS = 90;
const POP_MS = POP_GROW_MS + POP_SHRINK_MS;
const POP_SCALE_START = 0.05;
const POP_SCALE_PEAK = 0.34;
const POP_SCALE_SHRINK = 0.02;

const POP_TO_MAIN_GAP_MS = 160;

const MASK_PAD = 20000;
const MASK_ORIGIN = 50 - MASK_PAD / 2;

const SCALE_START = 0.001;

function centerScaleTransform(s: number) {
  return `translate(50 50) scale(${s}) translate(-50 -50)`;
}

function setHoleScale(g: SVGGElement, s: number) {
  g.setAttribute("transform", centerScaleTransform(s));
}

export function CrtFlashTestClient() {
  const holeMaskId = useId().replace(/:/g, "");
  const maskOverlayRef = useRef<HTMLDivElement>(null);
  const holeGroupRef = useRef<SVGGElement>(null);
  const popLayerRef = useRef<HTMLDivElement>(null);
  const popGroupRef = useRef<SVGGElement>(null);
  const rafRef = useRef<number | null>(null);
  const popToMainGapRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPopToMainGap = useCallback(() => {
    if (popToMainGapRef.current != null) {
      clearTimeout(popToMainGapRef.current);
      popToMainGapRef.current = null;
    }
  }, []);

  const stopAnimation = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startMainExpand = useCallback(() => {
    const mask = maskOverlayRef.current;
    const hole = holeGroupRef.current;
    if (!mask || !hole) return;

    stopAnimation();

    mask.style.visibility = "visible";
    mask.style.opacity = "1";
    hole.removeAttribute("style");
    setHoleScale(hole, SCALE_START);

    const startMs = performance.now();
    const durationMs = DURATION_SEC * 1000;

    const tick = (now: number) => {
      const holeEl = holeGroupRef.current;
      const maskEl = maskOverlayRef.current;
      if (!holeEl || !maskEl) {
        rafRef.current = null;
        return;
      }

      const elapsed = now - startMs;
      const u = Math.min(1, elapsed / durationMs);
      const s = SCALE_START + (SCALE_END - SCALE_START) * u;
      setHoleScale(holeEl, s);

      if (u < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        setHoleScale(holeEl, SCALE_END);
        maskEl.style.visibility = "hidden";
        maskEl.style.opacity = "0";
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [stopAnimation]);

  const play = useCallback(() => {
    const mask = maskOverlayRef.current;
    const hole = holeGroupRef.current;
    const pop = popLayerRef.current;
    const popG = popGroupRef.current;
    if (!mask || !hole || !pop || !popG) return;

    clearPopToMainGap();
    stopAnimation();

    mask.style.visibility = "visible";
    mask.style.opacity = "1";
    hole.removeAttribute("style");
    setHoleScale(hole, SCALE_START);

    pop.style.visibility = "visible";
    pop.style.opacity = "1";
    popG.removeAttribute("style");
    setHoleScale(popG, POP_SCALE_START);

    const popStart = performance.now();

    const popTick = (now: number) => {
      const popEl = popLayerRef.current;
      const popGroup = popGroupRef.current;
      if (!popEl || !popGroup) {
        rafRef.current = null;
        return;
      }

      const elapsed = now - popStart;

      if (elapsed >= POP_MS) {
        rafRef.current = null;
        setHoleScale(popGroup, POP_SCALE_SHRINK);
        popEl.style.visibility = "hidden";
        popEl.style.opacity = "0";
        clearPopToMainGap();
        popToMainGapRef.current = setTimeout(() => {
          popToMainGapRef.current = null;
          startMainExpand();
        }, POP_TO_MAIN_GAP_MS);
        return;
      }

      if (elapsed < POP_GROW_MS) {
        const u = elapsed / POP_GROW_MS;
        const eased = 1 - (1 - u) ** 2;
        const s =
          POP_SCALE_START + (POP_SCALE_PEAK - POP_SCALE_START) * eased;
        setHoleScale(popGroup, s);
        popEl.style.opacity = "1";
      } else {
        const u = (elapsed - POP_GROW_MS) / POP_SHRINK_MS;
        const easeIn = u * u * u;
        const s =
          POP_SCALE_PEAK + (POP_SCALE_SHRINK - POP_SCALE_PEAK) * easeIn;
        setHoleScale(popGroup, s);
        popEl.style.opacity = String(1 - u);
      }

      rafRef.current = requestAnimationFrame(popTick);
    };

    rafRef.current = requestAnimationFrame(popTick);
  }, [clearPopToMainGap, startMainExpand, stopAnimation]);

  useLayoutEffect(() => {
    const hole = holeGroupRef.current;
    const popG = popGroupRef.current;
    if (hole) {
      hole.removeAttribute("style");
      setHoleScale(hole, SCALE_START);
    }
    if (popG) {
      popG.removeAttribute("style");
      setHoleScale(popG, POP_SCALE_START);
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPopToMainGap();
      stopAnimation();
    };
  }, [clearPopToMainGap, stopAnimation]);

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
            <g
              ref={popGroupRef}
              transform={centerScaleTransform(POP_SCALE_START)}
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
                  transform={centerScaleTransform(SCALE_START)}
                >
                  <path d={ASTROID_PATH_SLIM_LIGHT_100} fill="black" />
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
        流れ: ① プチュン計 {POP_MS}ms（成長 {POP_GROW_MS}ms → 縮小{" "}
        {POP_SHRINK_MS}ms）② {POP_TO_MAIN_GAP_MS}ms 間をあける ③ 約{" "}
        {DURATION_SEC} 秒のマスク穴拡大（0.001→{SCALE_END}）。初回描画で形がちら見えしないよう{" "}
        <code>g</code> に初期 <code>transform</code> を付与。
      </p>
    </div>
  );
}
