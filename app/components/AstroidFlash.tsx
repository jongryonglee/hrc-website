"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
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
import maskStyles from "./astroidFlashMask.module.css";
import styles from "./AstroidRevealCell.module.css";

/** 各セルの開始を 0〜この値 ms の範囲でランダムにずらす */
const STAGGER_MAX_MS = 1400;

export type AstroidFlashCellRefs = {
  mask: HTMLDivElement;
  /** フラッシュ中のみ。アストロイド形の抜き */
  holeGroupAstroid: SVGGElement;
  /** 展開フェーズ。従来どおり全面矩形の抜き */
  holeGroupRect: SVGGElement;
};

type CellEntry = AstroidFlashCellRefs & {
  /** このセルだけアニメ開始を遅らせる（ms） */
  staggerMs: number;
};

type RegisterCell = (refs: AstroidFlashCellRefs) => () => void;

const AstroidFlashRegisterContext = createContext<RegisterCell | null>(null);

function applyCellForLocalT(c: CellEntry, localT: number) {
  const { mask, holeGroupAstroid, holeGroupRect } = c;

  if (localT >= TOTAL_CELL_MS) {
    mask.style.visibility = "hidden";
    mask.style.opacity = "0";
    setHoleScale(holeGroupAstroid, 1, MASK_CLOSED_SY);
    setHoleScale(holeGroupRect, 1, 1);
    return;
  }

  if (localT < 0) {
    mask.style.visibility = "visible";
    mask.style.opacity = "1";
    holeGroupAstroid.removeAttribute("style");
    holeGroupRect.removeAttribute("style");
    setHoleScale(holeGroupAstroid, 1, MASK_CLOSED_SY);
    setHoleScale(holeGroupRect, 1, MASK_CLOSED_SY);
    return;
  }

  mask.style.visibility = "visible";
  mask.style.opacity = "1";
  holeGroupAstroid.removeAttribute("style");
  holeGroupRect.removeAttribute("style");

  if (localT < FLASH_MS) {
    const { sx, sy } = mergedHoleFlash(localT);
    setHoleScale(holeGroupAstroid, sx, sy);
    setHoleScale(holeGroupRect, 1, MASK_CLOSED_SY);
    return;
  }

  const uMask = clamp01((localT - FLASH_MS) / MASK_EXPAND_MS);
  const [, syEase] = maskExpandScales(uMask);
  const sy =
    FLASH_END_SY + (1 - FLASH_END_SY) * syEase;
  setHoleScale(holeGroupAstroid, 1, MASK_CLOSED_SY);
  setHoleScale(holeGroupRect, 1, sy);
}

export function AstroidFlashProvider({ children }: { children: React.ReactNode }) {
  const cellsRef = useRef(new Set<CellEntry>());
  const rafRef = useRef<number | null>(null);

  const register = useCallback((refs: AstroidFlashCellRefs) => {
    const staggerMs = Math.floor(Math.random() * STAGGER_MAX_MS);
    const entry: CellEntry = { ...refs, staggerMs };
    cellsRef.current.add(entry);
    return () => {
      cellsRef.current.delete(entry);
    };
  }, []);

  const stopAnimation = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    stopAnimation();

    const startMs = performance.now();

    const tick = (now: number) => {
      const globalElapsed = now - startMs;

      let maxStagger = 0;
      for (const c of cellsRef.current) {
        if (c.staggerMs > maxStagger) maxStagger = c.staggerMs;
      }
      const runUntil = maxStagger + TOTAL_CELL_MS;

      for (const c of cellsRef.current) {
        applyCellForLocalT(c, globalElapsed - c.staggerMs);
      }

      if (globalElapsed < runUntil) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        for (const c of cellsRef.current) {
          applyCellForLocalT(c, TOTAL_CELL_MS + 1);
        }
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [stopAnimation]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      play();
    });
    return () => {
      cancelAnimationFrame(id);
      stopAnimation();
    };
  }, [play, stopAnimation]);

  const value = useMemo(() => register, [register]);

  return (
    <AstroidFlashRegisterContext.Provider value={value}>
      {children}
    </AstroidFlashRegisterContext.Provider>
  );
}

export function AstroidRevealCell({ children }: { children: React.ReactNode }) {
  const register = useContext(AstroidFlashRegisterContext);
  const holeMaskId = useId().replace(/:/g, "");
  const maskRef = useRef<HTMLDivElement>(null);
  const holeGroupAstroidRef = useRef<SVGGElement>(null);
  const holeGroupRectRef = useRef<SVGGElement>(null);

  useLayoutEffect(() => {
    if (!register) return;
    const mask = maskRef.current;
    const holeGroupAstroid = holeGroupAstroidRef.current;
    const holeGroupRect = holeGroupRectRef.current;
    if (!mask || !holeGroupAstroid || !holeGroupRect) return;
    return register({ mask, holeGroupAstroid, holeGroupRect });
  }, [register]);

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

  if (!register) {
    return <>{children}</>;
  }

  return (
    <div className={styles.root}>
      <div className={styles.content}>{children}</div>
      <div ref={maskRef} className={maskStyles.maskOverlay} aria-hidden>
        <svg
          className={maskStyles.maskSvg}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
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
  );
}
