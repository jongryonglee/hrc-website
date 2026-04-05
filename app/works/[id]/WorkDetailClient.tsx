"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { WorkDetailItem } from "@/app/lib/cmsTypes";
import { getSandstormVideoSurfaceStyle } from "@/app/lib/workDetailSandstorm";
import {
  MASK_SRC_SMALL,
  TW_IMAGE_CLIP_LAYER,
  TW_IMAGE_FILL_UNDER_MASK,
  TW_MASK_LAYER_WORK_DETAIL,
  TW_SHELL_DETAIL_THUMB_WORK,
} from "@/app/lib/workThumbnailLayout";
import { usePrefersReducedMotion } from "@/app/hooks/usePrefersReducedMotion";
import { nextImageUnoptimized } from "@/sanity/lib/image";
import { AstroidFlashProvider, AstroidRevealCell } from "../../components/AstroidFlash";
import { Header } from "../../components/Header";
import { ScrambleText } from "../../components/ScrambleText";
import { SoundToggle } from "../../components/SoundToggle";

const STORAGE_ENTER = "workDetailEnterTransition";
/** transitionTo でセット。遷移先 id と一致するときだけ「内部入場」として CRT を抑止（先に effect が走ってフラグだけ消す事故を防ぐ） */
const STORAGE_ENTER_TARGET_ID = "workDetailEnterTargetId";
const STORAGE_LOCK = "workDetailNavLockUntil";
/** `/works` 一覧から行クリックで「遷移先の作品 id」をセット。CRT は値が現在の data._id と一致するときのみ */
const STORAGE_CRT_FROM_WORKS_LIST = "workDetailCrtFromWorksList";

const SANDSTORM_SRC = "/sandstorm.mp4";
/** 入場時：砂嵐を見せてからフェードアウト開始まで */
const SANDSTORM_ENTER_HOLD_MS = 380;
const SANDSTORM_ENTER_FADE_MS = 480;

/** 連続遷移防止：この時間はスクロール遷移を受け付けない */
const NAV_COOLDOWN_MS = 1400;
const EXIT_MS = 420;

function isWorkToWorkHref(href: string) {
  return /^\/works\/[^/]+$/.test(href);
}

/**
 * 「次へ」のホイール方向（逆方向は前へ）
 * - true: 上方向（deltaY < 0）= 次 / 下方向 = 前へ
 * - false: 下方向（deltaY > 0）= 次 / 上方向 = 前へ
 */
const WHEEL_NEXT_ON_SCROLL_UP = false;

type Props = {
  data: WorkDetailItem | null;
  credits: string[];
  creditNames: string[];
};

export function WorkDetailClient({ data, credits, creditNames }: Props) {
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [exiting, setExiting] = useState(false);
  const [enterActive, setEnterActive] = useState(false);
  /** 作品→作品の exit 中、マスク内で砂嵐を重ねる */
  const [sandstormExit, setSandstormExit] = useState(false);
  /** 作品→作品の入場直後、マスク内で砂嵐を重ねてからフェードアウト */
  const [sandstormEnter, setSandstormEnter] = useState(false);
  const [sandstormEnterFading, setSandstormEnterFading] = useState(false);
  /** CRT: `/works` 一覧からの遷移時のみ。直 URL・ホーム等・作品間 next は false */
  const [useCrtEnter, setUseCrtEnter] = useState(false);
  /** sessionStorage 判定までサムネを隠し、CRT と内部入場のどちらかに揃える */
  const [bootReady, setBootReady] = useState(false);
  const exitingRef = useRef(false);
  const lockUntilRef = useRef(0);
  /** transitionTo の router.push を遅延させるタイマー。アンマウント後に発火すると別ページへ誤遷移するので必ず解除 */
  const transitionPushTimerRef = useRef<number | null>(null);
  const sandstormVideoRef = useRef<HTMLVideoElement | null>(null);
  /** 前後遷移ジェスチャーはサムネ枠内のみ（window だと横スクロール・ピンチも拾う） */
  const thumbnailGestureRef = useRef<HTMLDivElement | null>(null);

  /** クライアント遷移で同一インスタンスが再利用されると transitionTo の exiting が残るためリセット */
  useEffect(() => {
    exitingRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 作品 id 変更時に exiting をリセット（同一クライアントインスタンス再利用対策）
    setExiting(false);
  }, [data?._id]);

  useLayoutEffect(() => {
    const lockStr = sessionStorage.getItem(STORAGE_LOCK);
    if (lockStr) {
      const until = parseInt(lockStr, 10);
      if (!Number.isNaN(until) && Date.now() < until) {
        lockUntilRef.current = until;
      }
      sessionStorage.removeItem(STORAGE_LOCK);
    }

    if (!data?._id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- CMS 未取得時はサムネ待ちをスキップ
      setBootReady(true);
      return;
    }

    const enter = sessionStorage.getItem(STORAGE_ENTER);
    const targetId = sessionStorage.getItem(STORAGE_ENTER_TARGET_ID);
    const isSequentialEnter = enter === "1" && targetId === data._id;

    if (isSequentialEnter) {
      sessionStorage.removeItem(STORAGE_ENTER);
      sessionStorage.removeItem(STORAGE_ENTER_TARGET_ID);
      sessionStorage.removeItem(STORAGE_CRT_FROM_WORKS_LIST);
      // next / prev / transitionTo からの遷移: CRT は再生しない（CSS 入場のみ）
      setEnterActive(true);
      setUseCrtEnter(false);
      const allowSandstorm =
        Boolean(data?.thumbnailUrl) &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setSandstormEnter(allowSandstorm);
    } else {
      setEnterActive(false);
      setSandstormEnter(false);
      const stored = sessionStorage.getItem(STORAGE_CRT_FROM_WORKS_LIST);
      const fromWorksList = stored === data._id;
      const allowCrt =
        fromWorksList &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setUseCrtEnter(allowCrt);
    }
    setBootReady(true);
  }, [data?._id]);

  /** layout では sessionStorage を消さない（Strict Mode の二重マウントでフラグが先に消えて CRT が死ぬ）。次フレームで消す */
  useEffect(() => {
    if (!data?._id) return;
    const stored = sessionStorage.getItem(STORAGE_CRT_FROM_WORKS_LIST);
    if (stored !== data._id) return;
    const id = window.setTimeout(() => {
      try {
        sessionStorage.removeItem(STORAGE_CRT_FROM_WORKS_LIST);
      } catch {
        /* ignore */
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [data?._id]);

  const transitionTo = useCallback(
    (href: string) => {
      if (exitingRef.current) return;
      if (Date.now() < lockUntilRef.current) return;

      if (transitionPushTimerRef.current) {
        clearTimeout(transitionPushTimerRef.current);
        transitionPushTimerRef.current = null;
      }

      exitingRef.current = true;
      const until = Date.now() + NAV_COOLDOWN_MS;
      lockUntilRef.current = until;
      sessionStorage.setItem(STORAGE_LOCK, String(until));
      sessionStorage.setItem(STORAGE_ENTER, "1");
      const nextId = href.match(/\/works\/([^/?#]+)/)?.[1];
      if (nextId) {
        sessionStorage.setItem(STORAGE_ENTER_TARGET_ID, nextId);
      }
      if (
        data?.thumbnailUrl &&
        isWorkToWorkHref(href) &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setSandstormExit(true);
      }
      setExiting(true);

      transitionPushTimerRef.current = window.setTimeout(() => {
        transitionPushTimerRef.current = null;
        router.push(href);
      }, EXIT_MS);
    },
    [router, data?.thumbnailUrl]
  );

  useEffect(() => {
    return () => {
      if (transitionPushTimerRef.current) {
        clearTimeout(transitionPushTimerRef.current);
        transitionPushTimerRef.current = null;
        exitingRef.current = false;
      }
    };
  }, []);

  /** 砂嵐ビデオの再生（exit / 入場どちらも currentTime 0 から） */
  useEffect(() => {
    if (!sandstormExit && !sandstormEnter) return;
    const v = sandstormVideoRef.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play().catch(() => {});
  }, [sandstormExit, sandstormEnter]);

  /** 入場：しばらく見せてからフェードアウトしレイヤー解除 */
  useEffect(() => {
    if (!sandstormEnter) {
      setSandstormEnterFading(false);
      return;
    }
    const startFade = window.setTimeout(() => {
      setSandstormEnterFading(true);
    }, SANDSTORM_ENTER_HOLD_MS);
    const remove = window.setTimeout(() => {
      setSandstormEnter(false);
      setSandstormEnterFading(false);
    }, SANDSTORM_ENTER_HOLD_MS + SANDSTORM_ENTER_FADE_MS + 50);
    return () => {
      clearTimeout(startFade);
      clearTimeout(remove);
    };
  }, [sandstormEnter]);

  /** 複数件あるときだけ前後へ遷移（1件のみのときは nextId / prevId が自分自身になる） */
  const sequentialNav = Boolean(data?.nextId && data.nextId !== data._id);

  const tryNavigateNext = useCallback(() => {
    const nextId = data?.nextId;
    if (!nextId || nextId === data?._id) return;
    transitionTo(`/works/${nextId}`);
  }, [data?._id, data?.nextId, transitionTo]);

  const tryNavigatePrev = useCallback(() => {
    const prevId = data?.prevId;
    if (!prevId || prevId === data?._id) return;
    transitionTo(`/works/${prevId}`);
  }, [data?._id, data?.prevId, transitionTo]);

  const tryNavigateNextRef = useRef(tryNavigateNext);
  const tryNavigatePrevRef = useRef(tryNavigatePrev);

  useLayoutEffect(() => {
    tryNavigateNextRef.current = tryNavigateNext;
    tryNavigatePrevRef.current = tryNavigatePrev;
  }, [tryNavigateNext, tryNavigatePrev]);

  /**
   * 入力・IME 以外で Backspace → 履歴バック（Chrome 向け補助）。
   * 前後作品があるときはホイール／タッチで遷移するため登録しない（Backspace と縦スライドの意図がぶつかる）。
   */
  useEffect(() => {
    if (sequentialNav) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Backspace" || e.isComposing) return;
      const el = e.target as HTMLElement | null;
      if (!el) return;
      if (el.closest("input, textarea, select, [contenteditable='true']")) return;
      if (el.isContentEditable) return;
      e.preventDefault();
      router.back();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, sequentialNav]);

  useEffect(() => {
    if (!sequentialNav) return;
    const el = thumbnailGestureRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // ピンチズーム（Chrome は ctrlKey）・横スクロール主体は無視
      if (e.ctrlKey || e.metaKey) return;
      const dy = e.deltaY;
      const dx = e.deltaX;
      if (dy === 0) return;
      if (Math.abs(dx) >= Math.abs(dy)) return;
      const isScrollUp = dy < 0;
      const wantsNext = WHEEL_NEXT_ON_SCROLL_UP ? isScrollUp : !isScrollUp;
      if (wantsNext) tryNavigateNextRef.current();
      else tryNavigatePrevRef.current();
    };

    el.addEventListener("wheel", onWheel, { passive: true });
    return () => el.removeEventListener("wheel", onWheel);
  }, [sequentialNav]);

  useEffect(() => {
    if (!sequentialNav) return;
    const el = thumbnailGestureRef.current;
    if (!el) return;

    let startY = 0;
    let startX = 0;
    /** 2 本指以上で始まったジェスチャーはピンチ等とみなして無視 */
    let multiTouchGesture = false;
    const threshold = 48;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        multiTouchGesture = true;
        return;
      }
      multiTouchGesture = false;
      startY = e.touches[0]?.clientY ?? 0;
      startX = e.touches[0]?.clientX ?? 0;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length > 0) return;
      if (multiTouchGesture) {
        multiTouchGesture = false;
        return;
      }
      const t = e.changedTouches[0];
      if (!t) return;
      const endY = t.clientY;
      const endX = t.clientX;
      const deltaY = endY - startY;
      const deltaX = endX - startX;
      // 横スワイプ主体は無視（縦のみ前後へ）
      if (Math.abs(deltaX) >= Math.abs(deltaY)) return;
      if (deltaY > threshold) tryNavigateNextRef.current();
      else if (-deltaY > threshold) tryNavigatePrevRef.current();
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [sequentialNav]);

  const showSandstorm =
    Boolean(data?.thumbnailUrl) &&
    (sandstormExit || sandstormEnter) &&
    !prefersReducedMotion;

  const thumbnailContent = data?.thumbnailUrl ? (
    <>
      <div className={TW_IMAGE_CLIP_LAYER}>
        <Image
          src={data.thumbnailUrl}
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 60vw, 95vw"
          className={TW_IMAGE_FILL_UNDER_MASK}
          unoptimized={nextImageUnoptimized(data.thumbnailUrl)}
        />
        {showSandstorm && (
          <video
            ref={sandstormVideoRef}
            src={SANDSTORM_SRC}
            className={`work-detail-sandstorm-video ${TW_IMAGE_FILL_UNDER_MASK} ${sandstormEnterFading ? "work-detail-sandstorm-enter-fade" : ""}`}
            style={getSandstormVideoSurfaceStyle()}
            loop={sandstormExit}
            muted
            playsInline
            preload="auto"
            aria-hidden
          />
        )}
      </div>
      <img
        src={MASK_SRC_SMALL}
        alt=""
        aria-hidden="true"
        className={TW_MASK_LAYER_WORK_DETAIL}
      />
    </>
  ) : (
    <div className="absolute inset-0 rounded-[16px] bg-white/10" />
  );

  /** 作品間：画像のフェード出し入れはせず、マスク内の砂嵐で挟む（テキスト等は従来の exit/enter） */
  const imgAnim =
    exiting && sandstormExit
      ? ""
      : exiting
        ? "work-detail-exit"
        : enterActive && !useCrtEnter
          ? ""
          : "";

  const textAnim = exiting
    ? "work-detail-exit"
    : enterActive
      ? "work-detail-enter-text"
      : "";

  const creditsAnim = exiting
    ? "work-detail-exit"
    : enterActive
      ? "work-detail-enter-credits"
      : "";

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <section
        className="flex flex-col flex-1 md:grid overflow-hidden"
        style={{ gridTemplateRows: "1fr" }}
      >
        <div className="md:[grid-area:1/1] relative md:z-20 pointer-events-none self-start w-full">
          <div className="pointer-events-auto">
            <Header />
          </div>
        </div>

        <div className="mt-[var(--grid-row)] md:mt-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none">
          <div className="layout-grid md:items-start pointer-events-auto">
            <div
              className={`col-span-9 md:col-span-8 md:[grid-row-start:7] md:[grid-row-end:9] ${textAnim}`}
            >
              <p>Works / Music Video /</p>
              <h2 className="text-[26px] leading-tight md:text-[32px] mt-[17px]">
                {data?.title ?? "Saiwai / Takeisme"}
              </h2>
              <h2 className="text-[26px] leading-tight md:text-[32px]">
                (Prod.{data?.producer ?? "theeluu"})
              </h2>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="md:[grid-area:1/1] md:z-0 md:flex md:items-center md:justify-center"
        >
          <div
            ref={thumbnailGestureRef}
            className={`${TW_SHELL_DETAIL_THUMB_WORK} ${imgAnim} ${!bootReady ? "opacity-0" : ""}`}
          >
            {bootReady && useCrtEnter ? (
              <AstroidFlashProvider>
                <AstroidRevealCell>{thumbnailContent}</AstroidRevealCell>
              </AstroidFlashProvider>
            ) : (
              thumbnailContent
            )}
          </div>
        </div>

        <div className="mt-[var(--grid-row)] md:mt-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none md:flex md:flex-col md:justify-end md:pb-[34px]">
          <div className="layout-grid pointer-events-auto">
            <div className="col-span-6 md:col-span-4 flex flex-col gap-1">
              <a
                href={data?.videoUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="link_co flex items-center gap-2 whitespace-nowrap"
              >
                <ScrambleText text="YouTube" mode="lap" speedMs={40} durationMs={400} />
                <Image src="/icon-hicard.svg" alt="" width={9} height={9} className="link_co-icon" />
              </a>
              <span
                className="link_co flex items-center gap-2 whitespace-nowrap"
                aria-disabled="true"
              >
                <ScrambleText text="Sound Cloud" mode="lap" speedMs={40} durationMs={400} />
                <Image src="/icon-hicard.svg" alt="" width={9} height={9} className="link_co-icon" />
              </span>
              <span
                className="link_co flex items-center gap-2 whitespace-nowrap"
                aria-disabled="true"
              >
                <ScrambleText text="Instagram" mode="lap" speedMs={40} durationMs={400} />
                <Image src="/icon-hicard.svg" alt="" width={9} height={9} className="link_co-icon" />
              </span>
            </div>
            <div className="col-start-8 col-span-2 md:col-start-17 md:col-span-2 self-end">
              <SoundToggle />
            </div>
          </div>
        </div>

        <div className="mt-[calc(2*var(--grid-row))] pb-[34px] md:mt-0 md:pb-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none">
          <div className="layout-grid md:items-start pointer-events-none">
            <div
              className={`col-start-3 col-span-7 md:col-span-5 md:col-start-14 md:[grid-row-start:8] grid [grid-template-columns:subgrid] gap-y-0 content-start ${creditsAnim}`}
            >
              {credits.map((label, i) => (
                <Fragment key={label}>
                  <p className="col-span-3 md:col-span-2">{label}</p>
                  <p className="col-span-4 md:col-span-3">{creditNames[i]}</p>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
