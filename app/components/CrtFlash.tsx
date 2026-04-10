"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import s from "./crtFlash.module.css";

/* ── Timing ── */
const DURATION_MS = 575;
const CRT_EXPAND_MS = 115;
const CRT_SEQUENCE_MS = 230;
const MASK_EXPAND_MS = 230;
const STAGGER_MAX_MS = 1400;
const CRT_SCALE_MIN = 0.16;

/* ── Easing (cubic-bezier approximations) ── */
const EASE_OUT_CUBIC = "cubic-bezier(0.215, 0.61, 0.355, 1)";
const EASE_IN_CUBIC = "cubic-bezier(0.55, 0.055, 0.675, 0.19)";
const EASE_MASK_OPEN = "cubic-bezier(0.33, 0.75, 0.58, 1)";

function buildSparkPolygon(cx: number, cy: number): string {
  const parts: string[] = [];
  const spikes = 32;
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i * Math.PI) / spikes - Math.PI / 2;
    const outer = i % 2 === 0;
    const ro = outer
      ? 42 +
        0.55 * Math.sin(i * 0.62) +
        0.28 * Math.cos(i * 0.24) +
        0.2 * Math.sin(i * 1.1)
      : 20 +
        0.65 * Math.sin(i * 0.51) +
        0.32 * Math.cos(i * 0.37) +
        0.18 * Math.cos(i * 0.88);
    parts.push(
      `${(cx + ro * Math.cos(a)).toFixed(2)},${(cy + ro * Math.sin(a)).toFixed(2)}`,
    );
  }
  return parts.join(" ");
}

const SPARK_POINTS = buildSparkPolygon(50, 50);

type CellRefs = {
  content: HTMLDivElement;
  spark: HTMLDivElement;
  line: HTMLDivElement;
};

type CellEntry = CellRefs & {
  staggerMs: number;
  animations: Animation[];
};

type RegisterFn = (refs: CellRefs) => () => void;

const RegisterCtx = createContext<RegisterFn | null>(null);
const ReplayCtx = createContext<(() => void) | null>(null);

export function useCrtFlashReplay() {
  return useContext(ReplayCtx);
}

function launchCellAnimations(entry: CellEntry) {
  for (const a of entry.animations) a.cancel();
  entry.animations = [];

  const { content, spark, line, staggerMs: delay } = entry;
  const dur = DURATION_MS;

  const t1 = CRT_EXPAND_MS / dur;
  const t2 = CRT_SEQUENCE_MS / dur;
  const t3 = (CRT_SEQUENCE_MS + MASK_EXPAND_MS) / dur;
  const sparkFadeT = t1 + 0.48 * (t2 - t1);
  const lineFadeT = t1 + 0.52 * (t2 - t1);

  content.style.clipPath = "inset(50% 0%)";
  const scMin = CRT_SCALE_MIN;

  const a1 = content.animate(
    [
      { clipPath: "inset(50% 0%)", offset: 0 },
      { clipPath: "inset(50% 0%)", offset: t2, easing: EASE_MASK_OPEN },
      { clipPath: "inset(0% 0%)", offset: t3 },
      { clipPath: "inset(0% 0%)", offset: 1 },
    ],
    { duration: dur, delay, fill: "forwards" },
  );

  const a2 = spark.animate(
    [
      {
        transform: `translate(-50%,-50%) scale(${scMin})`,
        offset: 0,
        easing: EASE_OUT_CUBIC,
      },
      {
        transform: "translate(-50%,-50%) scale(1)",
        offset: t1,
        easing: EASE_IN_CUBIC,
      },
      {
        transform: `translate(-50%,-50%) scale(${scMin})`,
        offset: t2,
      },
      {
        transform: `translate(-50%,-50%) scale(${scMin})`,
        offset: 1,
      },
    ],
    { duration: dur, delay, fill: "forwards" },
  );

  const a3 = spark.animate(
    [
      { opacity: 1, offset: 0 },
      { opacity: 1, offset: sparkFadeT, easing: EASE_IN_CUBIC },
      { opacity: 0, offset: t2 },
      { opacity: 0, offset: 1 },
    ],
    { duration: dur, delay, fill: "forwards" },
  );

  const a4 = line.animate(
    [
      { transform: "translateY(-50%) scaleX(0.015)", offset: 0 },
      {
        transform: "translateY(-50%) scaleX(0.015)",
        offset: t1,
        easing: EASE_IN_CUBIC,
      },
      { transform: "translateY(-50%) scaleX(1)", offset: t2 },
      { transform: "translateY(-50%) scaleX(1)", offset: 1 },
    ],
    { duration: dur, delay, fill: "forwards" },
  );

  const a5 = line.animate(
    [
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: t1 },
      { opacity: 1, offset: t1 + 0.001 },
      { opacity: 1, offset: lineFadeT, easing: EASE_IN_CUBIC },
      { opacity: 0, offset: t2 },
      { opacity: 0, offset: 1 },
    ],
    { duration: dur, delay, fill: "forwards" },
  );

  const anims = [a1, a2, a3, a4, a5];
  entry.animations = anims;

  Promise.all(anims.map((a) => a.finished))
    .then(() => {
      content.style.removeProperty("clip-path");
      for (const a of anims) a.cancel();
      entry.animations = [];
    })
    .catch(() => {});
}

export function CrtFlashProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cellsRef = useRef(new Set<CellEntry>());
  const [replayToken, setReplayToken] = useState(0);

  const register = useCallback((refs: CellRefs) => {
    const entry: CellEntry = {
      ...refs,
      staggerMs: Math.floor(Math.random() * STAGGER_MAX_MS),
      animations: [],
    };
    cellsRef.current.add(entry);
    return () => {
      for (const a of entry.animations) a.cancel();
      cellsRef.current.delete(entry);
    };
  }, []);

  const replay = useCallback(() => {
    for (const c of cellsRef.current) {
      // eslint-disable-next-line react-hooks/immutability -- replay で登録済みセルのみ stagger を振り直す
      c.staggerMs = Math.floor(Math.random() * STAGGER_MAX_MS);
    }
    setReplayToken((n) => n + 1);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      for (const c of cellsRef.current) {
        launchCellAnimations(c);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [replayToken]);

  const registerVal = useMemo(() => register, [register]);
  const replayVal = useMemo(() => replay, [replay]);

  return (
    <ReplayCtx.Provider value={replayVal}>
      <RegisterCtx.Provider value={registerVal}>
        {children}
      </RegisterCtx.Provider>
    </ReplayCtx.Provider>
  );
}

export function CrtRevealCell({
  children,
}: {
  children: React.ReactNode;
}) {
  const register = useContext(RegisterCtx);
  const contentRef = useRef<HTMLDivElement>(null);
  const sparkRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!register) return;
    const content = contentRef.current;
    const spark = sparkRef.current;
    const line = lineRef.current;
    if (!content || !spark || !line) return;
    return register({ content, spark, line });
  }, [register]);

  if (!register) return <>{children}</>;

  return (
    <div className={s.root}>
      <div
        ref={contentRef}
        className={s.content}
        style={{ clipPath: "inset(50% 0%)" }}
      >
        {children}
      </div>
      <div className={s.crtStack} aria-hidden>
        <div ref={sparkRef} className={s.spark}>
          <div className={s.sparkGlow} />
          <svg className={s.sparkSvg} viewBox="0 0 100 100">
            <polygon points={SPARK_POINTS} fill="#ffffff" stroke="none" />
          </svg>
        </div>
        <div ref={lineRef} className={s.lineWrap}>
          <div className={s.line} />
        </div>
      </div>
    </div>
  );
}
