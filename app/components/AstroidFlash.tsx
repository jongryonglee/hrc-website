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
import styles from "./AstroidRevealCell.module.css";

const DURATION_SEC = 8;
/** 中央の光（パルス）の長さ: 出現→少し拡大→縮小→消滅 */
const CENTER_CORE_MS = 280;
/** 横線: 光の後を追う遅延 → 水平に伸びる → フェードアウト（縦方向の展開はしない） */
const LINE_FOLLOW_MS = 42;
const LINE_H_SWEEP_MS = 95;
const LINE_LINE_FADE_MS = 100;
const LINE_Y_MIN = 0.07;
/** フラッシュレイヤ全体（中央と横線の長い方まで） */
const FLASH_MS = Math.max(
  CENTER_CORE_MS,
  LINE_FOLLOW_MS + LINE_H_SWEEP_MS + LINE_LINE_FADE_MS + 80,
);
/** プチュン: 中央光のスケール（パルス用） */
const POP_SCALE_X_START = 0.08;
const POP_SCALE_Y_START = 0.012;
const POP_SCALE_PEAK_X = 1;
const POP_SCALE_PEAK = 0.4;
const POP_SCALE_SHRINK = 0.02;
const MAIN_MS = DURATION_SEC * 1000;
/**
 * フラッシュ後、マスクの縦スケールが 0→1 になるまでの時間（短く調整しやすい）
 * 開き終わってから TOTAL_CELL_MS までは穴は開いたまま
 */
const MASK_EXPAND_MS = 500;
/** プチュン〜マスクが開き切るまで */
const TOTAL_CELL_MS = MAIN_MS;
/** 各セルの開始を 0〜この値 ms の範囲でランダムにずらす */
const STAGGER_MAX_MS = 1400;

const MASK_PAD = 20000;
const MASK_ORIGIN = 50 - MASK_PAD / 2;
/** マスク穴の縦スケール 0 = 隙間なし（0.001 だと細いスリットが残る） */
const MASK_CLOSED_SY = 0;

function centerScaleTransform(sx: number, sy: number) {
  return `translate(50 50) scale(${sx} ${sy}) translate(-50 -50)`;
}

/** 横スリット: 水平 sx × 垂直 sy（縦は細い線から上下へ） */
function lineBeamTransform(sx: number, sy: number) {
  const x = Number.isFinite(sx) ? sx : 0;
  const y = Number.isFinite(sy) ? sy : LINE_Y_MIN;
  return `translate(50 50) scale(${x} ${y}) translate(-50 -50)`;
}

/** 中央の光: 出現 → 少し拡大 → 縮小 → 消滅 */
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

/** 横線: 光に遅れて水平のみ、その後フェード */
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

/** フラッシュ後のマスク穴: 幅は常に全幅、縦だけが開いて上下に広がる（sy は 0→1） */
function maskExpandScales(u: number): [number, number] {
  const t = clamp01(u);
  const syEase = 1 - (1 - t) ** 1.55;
  return [1, syEase];
}

export type AstroidFlashCellRefs = {
  popLayer: HTMLDivElement;
  mask: HTMLDivElement;
  popGroup: SVGGElement;
  popLineGroup: SVGGElement;
  holeGroup: SVGGElement;
};

type CellEntry = AstroidFlashCellRefs & {
  /** このセルだけアニメ開始を遅らせる（ms） */
  staggerMs: number;
};

type RegisterCell = (refs: AstroidFlashCellRefs) => () => void;

const AstroidFlashRegisterContext = createContext<RegisterCell | null>(null);

function applyCellForLocalT(c: CellEntry, localT: number) {
  const { mask, popLayer, holeGroup, popGroup, popLineGroup } = c;

  if (localT >= TOTAL_CELL_MS) {
    mask.style.visibility = "hidden";
    mask.style.opacity = "0";
    setHoleScale(holeGroup, 1, 1);
    popLayer.style.visibility = "hidden";
    popLayer.style.opacity = "0";
    popLayer.style.filter = "";
    popLineGroup.setAttribute("transform", lineBeamTransform(0, 0));
    popGroup.removeAttribute("opacity");
    popLineGroup.setAttribute("opacity", "0");
    return;
  }

  if (localT < 0) {
    mask.style.visibility = "visible";
    mask.style.opacity = "1";
    holeGroup.removeAttribute("style");
    setHoleScale(holeGroup, 1, MASK_CLOSED_SY);
    popLayer.style.visibility = "hidden";
    popLayer.style.opacity = "0";
    popLayer.style.filter = "";
    popGroup.removeAttribute("style");
    popLineGroup.removeAttribute("style");
    setHoleScale(popGroup, POP_SCALE_X_START, POP_SCALE_Y_START);
    popLineGroup.setAttribute("transform", lineBeamTransform(0, 0));
    popGroup.removeAttribute("opacity");
    popLineGroup.setAttribute("opacity", "0");
    return;
  }

  mask.style.visibility = "visible";
  mask.style.opacity = "1";
  holeGroup.removeAttribute("style");

  if (localT < FLASH_MS) {
    setHoleScale(holeGroup, 1, MASK_CLOSED_SY);
    popLayer.style.visibility = "visible";
    popLayer.style.opacity = "1";

    const center = centerLightState(localT);
    setHoleScale(popGroup, center.sx, center.sy);
    popGroup.setAttribute("opacity", String(center.opacity));

    const line = horizontalLineState(localT);
    popLineGroup.setAttribute(
      "transform",
      lineBeamTransform(line.sx, line.sy),
    );
    popLineGroup.setAttribute("opacity", String(line.opacity));

    const glow = Math.min(1, localT / 160);
    const br = 1.22 + 0.12 * glow;
    const bl = 0.56 + 0.14 * glow;
    popLayer.style.filter = `brightness(${br}) blur(${bl}px)`;
    return;
  }

  const uMask = clamp01((localT - FLASH_MS) / MASK_EXPAND_MS);
  const [hsx, hsy] = maskExpandScales(uMask);
  setHoleScale(holeGroup, hsx, hsy);

  setHoleScale(popGroup, POP_SCALE_SHRINK, POP_SCALE_SHRINK);
  popLineGroup.setAttribute("transform", lineBeamTransform(0, LINE_Y_MIN));
  popGroup.removeAttribute("opacity");
  popLineGroup.removeAttribute("opacity");
  popLayer.style.visibility = "hidden";
  popLayer.style.opacity = "0";
  popLayer.style.filter = "";
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
  const popLineGroupRef = useRef<SVGGElement>(null);
  const holeGroupRef = useRef<SVGGElement>(null);

  useLayoutEffect(() => {
    if (!register) return;
    const popLayer = popLayerRef.current;
    const mask = maskRef.current;
    const popGroup = popGroupRef.current;
    const popLineGroup = popLineGroupRef.current;
    const holeGroup = holeGroupRef.current;
    if (!popLayer || !mask || !popGroup || !popLineGroup || !holeGroup) return;
    return register({ popLayer, mask, popGroup, popLineGroup, holeGroup });
  }, [register]);

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
