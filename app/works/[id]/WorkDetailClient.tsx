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

/** 連続遷移防止：この時間は前後ボタン遷移を受け付けない */
const NAV_COOLDOWN_MS = 1400;
const EXIT_MS = 420;

function isWorkToWorkHref(href: string) {
  return /^\/works\/[^/]+$/.test(href);
}

/** 各種 YouTube URL から動画 ID を取り出す（埋め込み用）。 */
function getYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const u = new URL(trimmed);

    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }

    if (u.hostname.endsWith("youtube.com") || u.hostname.endsWith("youtube-nocookie.com")) {
      if (u.pathname.startsWith("/embed/")) {
        const id = u.pathname.slice("/embed/".length).split("/")[0];
        return id || null;
      }
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.slice("/shorts/".length).split("/")[0];
        return id || null;
      }
      const v = u.searchParams.get("v");
      if (v) return v;
    }
  } catch {
    /* 相対 URL 等は下のフォールバック */
  }

  const short = trimmed.match(/youtu\.be\/([^/?&#]+)/i);
  if (short?.[1]) return short[1];

  const embed = trimmed.match(/youtube\.com\/embed\/([^/?&#]+)/i);
  if (embed?.[1]) return embed[1];

  const shorts = trimmed.match(/youtube\.com\/shorts\/([^/?&#]+)/i);
  if (shorts?.[1]) return shorts[1];

  const watch = trimmed.match(/[?&]v=([^&?#]+)/i);
  if (watch?.[1]) return watch[1];

  return null;
}

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

  const youtubeEmbedId =
    data?.category === "music-video" && data?.videoUrl
      ? getYouTubeVideoId(data.videoUrl)
      : null;
  const showYouTubePlayer = Boolean(youtubeEmbedId);

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
        (Boolean(data?.thumbnailUrl) || showYouTubePlayer) &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setSandstormEnter(allowSandstorm);
    } else {
      setEnterActive(false);
      setSandstormEnter(false);
      const stored = sessionStorage.getItem(STORAGE_CRT_FROM_WORKS_LIST);
      const fromWorksList = stored === data._id;
      const allowCrt =
        fromWorksList &&
        !showYouTubePlayer &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setUseCrtEnter(allowCrt);
    }
    setBootReady(true);
  }, [data?._id, data?.thumbnailUrl, data?.category, data?.videoUrl, showYouTubePlayer]);

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
        (data?.thumbnailUrl || showYouTubePlayer) &&
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
    [router, data?.thumbnailUrl, showYouTubePlayer],
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

  /**
   * 入力・IME 以外で Backspace → 履歴バック（Chrome 向け補助）。
   */
  useEffect(() => {
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
  }, [router]);

  const showSandstorm =
    (Boolean(data?.thumbnailUrl) || showYouTubePlayer) &&
    (sandstormExit || sandstormEnter) &&
    !prefersReducedMotion;

  const thumbnailContent = youtubeEmbedId ? (
    <>
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          title={data?.title ? `${data.title} — YouTube` : "YouTube video"}
          className="absolute inset-0 z-0 h-full w-full scale-[0.983] border-0"
          src={`https://www.youtube.com/embed/${youtubeEmbedId}?rel=0&modestbranding=0&controls=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        {showSandstorm && (
          <video
            ref={sandstormVideoRef}
            src={SANDSTORM_SRC}
            className={`work-detail-sandstorm-video max-md:scale-[0.992] max-md:[transform-origin:center] ${sandstormEnterFading ? "work-detail-sandstorm-enter-fade" : ""}`}
            loop={sandstormExit}
            muted
            playsInline
            preload="auto"
            aria-hidden
          />
        )}
      </div>
      <img
        src="/works-mask.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full object-cover object-center select-none"
      />
    </>
  ) : data?.thumbnailUrl ? (
    <>
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={data.thumbnailUrl}
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 60vw, 95vw"
          className="object-cover object-center max-md:scale-[0.992] max-md:[transform-origin:center]"
          unoptimized={nextImageUnoptimized(data.thumbnailUrl)}
        />
        {showSandstorm && (
          <video
            ref={sandstormVideoRef}
            src={SANDSTORM_SRC}
            className={`work-detail-sandstorm-video max-md:scale-[0.992] max-md:[transform-origin:center] ${sandstormEnterFading ? "work-detail-sandstorm-enter-fade" : ""}`}
            loop={sandstormExit}
            muted
            playsInline
            preload="auto"
            aria-hidden
          />
        )}
      </div>
      <img
        src="/works-mask.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full object-cover object-center select-none"
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
          <Header />
        </div>

        <div className="mt-[var(--grid-row)] md:mt-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none">
          {/* md: グリッド全体に pointer-events-auto があると全画面がヒット領域になり中央の動画を覆う */}
          <div className="layout-grid md:items-start pointer-events-auto md:pointer-events-none">
            <div
              className={`col-span-9 md:col-span-8 md:[grid-row-start:7] md:[grid-row-end:9] md:pointer-events-auto ${textAnim}`}
            >
              <p>
                Works /{" "}
                {data?.category === "sound-effect" ? "Sound Effect" : "Music Video"} /
              </p>
              <h2 className="text-[26px] leading-tight md:text-[32px]">
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
            className={`relative aspect-[268/204] touch-pan-y w-[95vw] mx-auto md:h-[80vh] md:w-auto md:max-w-none md:shrink-0 md:mx-0 touch-auto ${imgAnim} ${!bootReady ? "opacity-0" : ""}`}
          >
            {bootReady && useCrtEnter && !showYouTubePlayer ? (
              <AstroidFlashProvider>
                <AstroidRevealCell>{thumbnailContent}</AstroidRevealCell>
              </AstroidFlashProvider>
            ) : (
              thumbnailContent
            )}
          </div>
        </div>

        <div className="mt-[var(--grid-row)] md:mt-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none md:flex md:flex-col md:justify-end md:mb-[17px]">
          <div className="layout-grid pointer-events-auto md:pointer-events-none">
            <div className="col-span-3 md:col-span-2 flex flex-col gap-1 md:pointer-events-auto justify-end">
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
            <div className="col-start-8 col-span-2 md:col-start-17 md:col-span-2 self-end flex flex-col items-start gap-[34px] md:pointer-events-auto">
              {sequentialNav && (
                <div className="flex flex-col items-start gap-1">
                  <button
                    type="button"
                    onClick={tryNavigatePrev}
                    className="flex items-center gap-2 text-left text-[14px] leading-[1.1] md:text-[15px] cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <Image
                      src="/arrow-down.svg"
                      alt=""
                      width={11}
                      height={11}
                      className="shrink-0 rotate-180"
                      aria-hidden
                    />
                    <ScrambleText text="Previous" mode="lap" speedMs={40} durationMs={400} />
                  </button>
                  <button
                    type="button"
                    onClick={tryNavigateNext}
                    className="flex items-center gap-2 text-left text-[14px] leading-[1.1] md:text-[15px] cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <Image
                      src="/arrow-down.svg"
                      alt=""
                      width={11}
                      height={11}
                      className="shrink-0"
                      aria-hidden
                    />
                    <ScrambleText text="Next" mode="lap" speedMs={40} durationMs={400} />
                  </button>
                </div>
              )}
              <SoundToggle />
            </div>
          </div>
        </div>

        <div className="mt-[calc(2*var(--grid-row))] pb-[34px] md:mt-0 md:pb-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none">
          <div className="layout-grid md:items-start pointer-events-auto md:pointer-events-none">
            <div
              className={`col-start-3 col-span-7 md:col-span-5 md:col-start-14 md:[grid-row-start:8] grid [grid-template-columns:subgrid] gap-y-0 content-start md:pointer-events-auto ${creditsAnim}`}
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
