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
import { ASTROID_PATH_SLIM_LIGHT_100 } from "@/app/test-crt-flash/astroidPath";
import styles from "./AstroidRevealCell.module.css";

const SCALE_END = 220;
const DURATION_SEC = 8;
const POP_GROW_MS = 180;
const POP_SHRINK_MS = 90;
const POP_MS = POP_GROW_MS + POP_SHRINK_MS;
const POP_SCALE_START = 0.05;
const POP_SCALE_PEAK = 0.34;
const POP_SCALE_SHRINK = 0.02;
const POP_TO_MAIN_GAP_MS = 160;
const MAIN_MS = DURATION_SEC * 1000;
/** プチュン→間隔→穴拡大までの 1 セル分の長さ */
const TOTAL_CELL_MS = POP_MS + POP_TO_MAIN_GAP_MS + MAIN_MS;
/** 各セルの開始を 0〜この値 ms の範囲でランダムにずらす */
const STAGGER_MAX_MS = 1400;

const MASK_PAD = 20000;
const MASK_ORIGIN = 50 - MASK_PAD / 2;
const SCALE_START = 0.001;

function centerScaleTransform(s: number) {
  return `translate(50 50) scale(${s}) translate(-50 -50)`;
}

function setHoleScale(g: SVGGElement, s: number) {
  g.setAttribute("transform", centerScaleTransform(s));
}

export type AstroidFlashCellRefs = {
  popLayer: HTMLDivElement;
  mask: HTMLDivElement;
  popGroup: SVGGElement;
  holeGroup: SVGGElement;
};

type CellEntry = AstroidFlashCellRefs & {
  /** このセルだけアニメ開始を遅らせる（ms） */
  staggerMs: number;
};

type RegisterCell = (refs: AstroidFlashCellRefs) => () => void;

const AstroidFlashRegisterContext = createContext<RegisterCell | null>(null);

function applyCellForLocalT(c: CellEntry, localT: number) {
  const { mask, popLayer, holeGroup, popGroup } = c;

  if (localT >= TOTAL_CELL_MS) {
    mask.style.visibility = "hidden";
    mask.style.opacity = "0";
    setHoleScale(holeGroup, SCALE_END);
    popLayer.style.visibility = "hidden";
    popLayer.style.opacity = "0";
    return;
  }

  if (localT < 0) {
    mask.style.visibility = "visible";
    mask.style.opacity = "1";
    holeGroup.removeAttribute("style");
    setHoleScale(holeGroup, SCALE_START);
    popLayer.style.visibility = "hidden";
    popLayer.style.opacity = "0";
    popGroup.removeAttribute("style");
    setHoleScale(popGroup, POP_SCALE_START);
    return;
  }

  if (localT < POP_MS) {
    mask.style.visibility = "visible";
    mask.style.opacity = "1";
    holeGroup.removeAttribute("style");
    setHoleScale(holeGroup, SCALE_START);
    popLayer.style.visibility = "visible";
    popLayer.style.opacity = "1";

    let popScale: number;
    let popOpacity: string;
    if (localT < POP_GROW_MS) {
      const u = localT / POP_GROW_MS;
      const eased = 1 - (1 - u) ** 2;
      popScale =
        POP_SCALE_START + (POP_SCALE_PEAK - POP_SCALE_START) * eased;
      popOpacity = "1";
    } else {
      const u = (localT - POP_GROW_MS) / POP_SHRINK_MS;
      const easeIn = u * u * u;
      popScale =
        POP_SCALE_PEAK + (POP_SCALE_SHRINK - POP_SCALE_PEAK) * easeIn;
      popOpacity = String(1 - u);
    }
    setHoleScale(popGroup, popScale);
    popLayer.style.opacity = popOpacity;
    return;
  }

  const beforeMain = POP_MS + POP_TO_MAIN_GAP_MS;

  if (localT < beforeMain) {
    setHoleScale(popGroup, POP_SCALE_SHRINK);
    popLayer.style.visibility = "hidden";
    popLayer.style.opacity = "0";
    mask.style.visibility = "visible";
    mask.style.opacity = "1";
    holeGroup.removeAttribute("style");
    setHoleScale(holeGroup, SCALE_START);
    return;
  }

  const mainT = localT - beforeMain;
  const u = Math.min(1, mainT / MAIN_MS);
  const s = SCALE_START + (SCALE_END - SCALE_START) * u;

  setHoleScale(popGroup, POP_SCALE_SHRINK);
  popLayer.style.visibility = "hidden";
  popLayer.style.opacity = "0";
  mask.style.visibility = "visible";
  mask.style.opacity = "1";
  holeGroup.removeAttribute("style");
  setHoleScale(holeGroup, s);
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
  const popLayerRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const popGroupRef = useRef<SVGGElement>(null);
  const holeGroupRef = useRef<SVGGElement>(null);

  useLayoutEffect(() => {
    if (!register) return;
    const popLayer = popLayerRef.current;
    const mask = maskRef.current;
    const popGroup = popGroupRef.current;
    const holeGroup = holeGroupRef.current;
    if (!popLayer || !mask || !popGroup || !holeGroup) return;
    return register({ popLayer, mask, popGroup, holeGroup });
  }, [register]);

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

  if (!register) {
    return <>{children}</>;
  }

  return (
    <div className={styles.root}>
      <div className={styles.content}>{children}</div>
      <div ref={popLayerRef} className={styles.popLayer} aria-hidden>
        <svg
          className={styles.popSvg}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <g
            ref={popGroupRef}
            transform={centerScaleTransform(POP_SCALE_START)}
          >
            <path d={ASTROID_PATH_SLIM_LIGHT_100} fill="#ffffff" />
          </g>
        </svg>
      </div>
      <div ref={maskRef} className={styles.maskOverlay} aria-hidden>
        <svg
          className={styles.maskSvg}
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
  );
}
