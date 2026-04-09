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
  useState,
} from "react";
import {
  ASTROID_PATH_SLIM_LIGHT_100,
  CRT_EXPAND_MS,
  CRT_SEQUENCE_MS,
  CRT_SHRINK_MS,
  CRT_SPARK_POLYGON_POINTS,
  DEFAULT_FLASH_CELL_MODE,
  FLASH_END_SY,
  FLASH_MS,
  MASK_CLOSED_SY,
  MASK_EXPAND_MS,
  MASK_ORIGIN,
  MASK_PAD,
  TOTAL_CELL_MS,
  centerScaleTransform,
  clamp01,
  crtCenterScaleOpacity,
  crtLineState,
  maskExpandScales,
  mergedHoleFlash,
  setHoleScale,
  type FlashCellMode,
} from "@/app/lib/flashAnimation";
import styles from "./flashAnimation.module.css";

/** 各セルの開始を 0〜この値 ms の範囲でランダムにずらす */
const STAGGER_MAX_MS = 1400;

export type AstroidFlashCellRefs = {
  mask: HTMLDivElement;
  /** フラッシュ中のみ。astroid はアストロイド抜き、crt は全面矩形抜き（同一 transform） */
  holeGroupAstroid: SVGGElement;
  /** 展開フェーズ。全面矩形の抜き */
  holeGroupRect: SVGGElement;
  /** crt モードのみ。白い中央光 */
  crtCenter?: HTMLDivElement | null;
  /** crt モードのみ。水平スリット */
  crtLine?: HTMLDivElement | null;
};

type CellEntry = AstroidFlashCellRefs & {
  /** このセルだけアニメ開始を遅らせる（ms） */
  staggerMs: number;
  /** `localT >= TOTAL_CELL_MS` の最終状態を一度適用済みなら以降の tick をスキップ */
  flashSettled?: boolean;
};

/** TopGrid と同じ 767px 以下で RAF を間引き、モバイル負荷を抑える */
const NARROW_VIEWPORT_QUERY = "(max-width: 767px)";

type RegisterCell = (refs: AstroidFlashCellRefs) => () => void;

const AstroidFlashRegisterContext = createContext<RegisterCell | null>(null);
const FlashCellModeContext = createContext<FlashCellMode>(
  DEFAULT_FLASH_CELL_MODE,
);

const FlashReplayContext = createContext<(() => void) | null>(null);

export function useFlashReplay(): (() => void) | null {
  return useContext(FlashReplayContext);
}

function applyCrtWhiteLayers(c: CellEntry, localT: number) {
  const { crtCenter, crtLine } = c;
  if (!crtCenter || !crtLine) return;

  if (localT < 0 || localT >= TOTAL_CELL_MS) {
    crtCenter.style.opacity = "0";
    crtCenter.style.filter = "";
    crtLine.style.opacity = "0";
    crtCenter.style.visibility = "hidden";
    crtLine.style.visibility = "hidden";
    return;
  }

  if (localT < CRT_SEQUENCE_MS) {
    const center = crtCenterScaleOpacity(localT);
    const line = crtLineState(localT);
    crtCenter.style.visibility = "visible";
    crtCenter.style.left = "50%";
    crtCenter.style.top = "50%";
    crtCenter.style.transform = `translate(-50%, -50%) scale(${Math.max(0.02, center.scale)})`;
    crtCenter.style.opacity = String(center.opacity);
    crtCenter.style.filter = "";
    const lineScale =
      line.scale <= 0 ? 0 : Math.max(0.015, line.scale);
    crtLine.style.visibility =
      localT < CRT_EXPAND_MS ? "hidden" : "visible";
    crtLine.style.opacity = String(line.opacity);
    crtLine.style.transform = `translateY(-50%) scaleX(${lineScale})`;
    return;
  }

  crtCenter.style.opacity = "0";
  crtCenter.style.filter = "";
  crtLine.style.opacity = "0";
  crtCenter.style.visibility = "hidden";
  crtLine.style.visibility = "hidden";
}

function applyCellForLocalT(c: CellEntry, localT: number) {
  const { mask, holeGroupAstroid, holeGroupRect } = c;
  const isCrt = Boolean(c.crtCenter && c.crtLine);

  try {
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

    if (isCrt) {
      if (localT < CRT_SEQUENCE_MS) {
        setHoleScale(holeGroupAstroid, 1, MASK_CLOSED_SY);
        setHoleScale(holeGroupRect, 1, MASK_CLOSED_SY);
        return;
      }
      const crtMaskEnd = CRT_SEQUENCE_MS + MASK_EXPAND_MS;
      if (localT < crtMaskEnd) {
        const uMask = clamp01((localT - CRT_SEQUENCE_MS) / MASK_EXPAND_MS);
        const [, syEase] = maskExpandScales(uMask);
        setHoleScale(holeGroupAstroid, 1, MASK_CLOSED_SY);
        setHoleScale(holeGroupRect, 1, syEase);
        return;
      }
      setHoleScale(holeGroupAstroid, 1, MASK_CLOSED_SY);
      setHoleScale(holeGroupRect, 1, 1);
      return;
    }

    if (localT < FLASH_MS) {
      const { sx, sy } = mergedHoleFlash(localT);
      setHoleScale(holeGroupAstroid, sx, sy);
      setHoleScale(holeGroupRect, 1, MASK_CLOSED_SY);
      return;
    }

    const uMask = clamp01((localT - FLASH_MS) / MASK_EXPAND_MS);
    const [, syEase] = maskExpandScales(uMask);
    const sy = FLASH_END_SY + (1 - FLASH_END_SY) * syEase;
    setHoleScale(holeGroupAstroid, 1, MASK_CLOSED_SY);
    setHoleScale(holeGroupRect, 1, sy);
  } finally {
    applyCrtWhiteLayers(c, localT);
  }
}

type AstroidFlashProviderProps = {
  children: React.ReactNode;
  /** 既定は従来のアストロイド抜き */
  mode?: FlashCellMode;
};

export function AstroidFlashProvider({
  children,
  mode = DEFAULT_FLASH_CELL_MODE,
}: AstroidFlashProviderProps) {
  const cellsRef = useRef(new Set<CellEntry>());
  const rafRef = useRef<number | null>(null);
  const narrowViewportRef = useRef(false);
  const rafThrottleFrameCountRef = useRef(0);
  const [replayToken, setReplayToken] = useState(0);

  useLayoutEffect(() => {
    const mq = window.matchMedia(NARROW_VIEWPORT_QUERY);
    const update = () => {
      narrowViewportRef.current = mq.matches;
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const register = useCallback((refs: AstroidFlashCellRefs) => {
    const staggerMs = Math.floor(Math.random() * STAGGER_MAX_MS);
    const entry: CellEntry = { ...refs, staggerMs, flashSettled: false };
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

  const replay = useCallback(() => {
    setReplayToken((n) => n + 1);
  }, []);

  const play = useCallback(() => {
    stopAnimation();

    const startMs = performance.now();
    rafThrottleFrameCountRef.current = 0;
    for (const c of cellsRef.current) {
      c.flashSettled = false;
    }

    const tick = (now: number) => {
      const globalElapsed = now - startMs;

      let maxStagger = 0;
      for (const c of cellsRef.current) {
        if (c.staggerMs > maxStagger) maxStagger = c.staggerMs;
      }
      const runUntil = maxStagger + TOTAL_CELL_MS;

      if (narrowViewportRef.current && globalElapsed < runUntil) {
        rafThrottleFrameCountRef.current += 1;
        /* 2 フレームに 1 回だけ描画（先頭フレームは必ず実行） */
        if (rafThrottleFrameCountRef.current % 2 === 0) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
      }

      for (const c of cellsRef.current) {
        if (c.flashSettled) continue;
        const localT = globalElapsed - c.staggerMs;
        if (localT >= TOTAL_CELL_MS) {
          applyCellForLocalT(c, TOTAL_CELL_MS + 1);
          c.flashSettled = true;
        } else {
          applyCellForLocalT(c, localT);
        }
      }

      if (globalElapsed < runUntil) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        for (const c of cellsRef.current) {
          applyCellForLocalT(c, TOTAL_CELL_MS + 1);
          c.flashSettled = true;
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
  }, [play, stopAnimation, replayToken]);

  const registerValue = useMemo(() => register, [register]);
  const modeValue = useMemo(() => mode, [mode]);
  const replayValue = useMemo(() => replay, [replay]);

  return (
    <FlashCellModeContext.Provider value={modeValue}>
      <FlashReplayContext.Provider value={replayValue}>
        <AstroidFlashRegisterContext.Provider value={registerValue}>
          {children}
        </AstroidFlashRegisterContext.Provider>
      </FlashReplayContext.Provider>
    </FlashCellModeContext.Provider>
  );
}

export function AstroidRevealCell({ children }: { children: React.ReactNode }) {
  const register = useContext(AstroidFlashRegisterContext);
  const mode = useContext(FlashCellModeContext);
  const holeMaskId = useId().replace(/:/g, "");
  const maskRef = useRef<HTMLDivElement>(null);
  const holeGroupAstroidRef = useRef<SVGGElement>(null);
  const holeGroupRectRef = useRef<SVGGElement>(null);
  const crtCenterRef = useRef<HTMLDivElement>(null);
  const crtLineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!register) return;
    const mask = maskRef.current;
    const holeGroupAstroid = holeGroupAstroidRef.current;
    const holeGroupRect = holeGroupRectRef.current;
    if (!mask || !holeGroupAstroid || !holeGroupRect) return;
    const isCrt = mode === "crt";
    return register({
      mask,
      holeGroupAstroid,
      holeGroupRect,
      crtCenter: isCrt ? crtCenterRef.current : null,
      crtLine: isCrt ? crtLineRef.current : null,
    });
  }, [register, mode]);

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
      {mode === "crt" ? (
        <div className={styles.crtStack} aria-hidden>
          <div ref={crtCenterRef} className={styles.crtCenter}>
            <div className={styles.crtGlowHalo} aria-hidden />
            <svg
              className={styles.crtSparkSvg}
              viewBox="0 0 100 100"
              aria-hidden
            >
              <polygon
                points={CRT_SPARK_POLYGON_POINTS}
                fill="#ffffff"
                stroke="none"
              />
            </svg>
          </div>
          <div ref={crtLineRef} className={styles.crtLineWrap}>
            <div className={styles.crtLine} />
          </div>
        </div>
      ) : null}
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
                ref={holeGroupAstroidRef}
                transform={centerScaleTransform(1, MASK_CLOSED_SY)}
              >
                {mode === "crt" ? (
                  <rect x="0" y="0" width="100" height="100" fill="black" />
                ) : (
                  <path d={ASTROID_PATH_SLIM_LIGHT_100} fill="black" />
                )}
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
