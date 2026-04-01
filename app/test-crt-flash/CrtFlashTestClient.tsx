"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
} from "react";
import Image from "next/image";
import { ASTROID_PATH_SLIM_LIGHT_100 } from "@/app/lib/astroidPath";
import {
  FLASH_END_SY,
  FLASH_MS,
  MASK_CLOSED_SY,
  MASK_EXPAND_MS,
  MASK_ORIGIN,
  MASK_PAD,
  TOTAL_CELL_MS,
  centerScaleTransform,
  clamp01,
  maskExpandScales,
  mergedHoleFlash,
  setHoleScale,
} from "@/app/lib/astroidFlashCore";
import maskStyles from "../components/astroidFlashMask.module.css";
import styles from "./crt-flash.module.css";

const SAMPLE_SRC = "/favicon.png";

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

      if (elapsed >= TOTAL_CELL_MS) {
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
        <div ref={maskOverlayRef} className={maskStyles.maskOverlay} aria-hidden>
          <svg
            className={maskStyles.maskSvg}
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
        <code>MASK_EXPAND_MS = {MASK_EXPAND_MS}</code> ms。砂嵐のみの試験は{" "}
        <code>/test-sandstorm</code>。
      </p>
    </div>
  );
}
