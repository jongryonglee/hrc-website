"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { useCanHover } from "@/app/hooks/useCanHover";
import { nextImageUnoptimized } from "@/sanity/lib/image";
import { GridMuxHoverMedia } from "./GridMuxHoverMedia";

export type GridItem = {
  _key: string;
  image: string;
  title: string;
  subtitle?: string;
  /** 設定時はカード全体クリックで遷移（next/navigation） */
  href?: string;
  /** Office Rec 一覧など: 設定時かつ muxHoverCrt でホバー CRT → Mux */
  muxPlaybackId?: string | null;
};

type ContentGridProps = {
  items: GridItem[];
  showMask?: boolean;
  imageClassName?: string;
  rounded?: boolean;
  /** カード遷移の直前に呼ばれるコールバック（CRT ストレージセットなどに使用） */
  onBeforeNavigate?: (href: string, key: string) => void;
  /** true かつ各 item に muxPlaybackId があるセルでホバー CRT → Mux */
  muxHoverCrt?: boolean;
  /** true のとき、いずれかのカードにホバー中は他カードを暗くする */
  dimOtherItemsOnHover?: boolean;
};

export const ContentGrid = ({
  items,
  showMask = false,
  imageClassName = "object-cover object-center max-md:scale-[0.992] max-md:[transform-origin:center]",
  rounded = false,
  onBeforeNavigate,
  muxHoverCrt = false,
  dimOtherItemsOnHover = false,
}: ContentGridProps) => {
  const router = useRouter();
  const canHover = useCanHover();
  const useMuxHover = muxHoverCrt && canHover;
  const useDimSiblings = dimOtherItemsOnHover && canHover;

  const gridClassName = [
    "grid grid-cols-2 gap-[17px] md:grid-cols-5 md:gap-[17px]",
    useDimSiblings ? "content-grid--dim-siblings" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="mb-[0px]">
      {/* ここはGridのデザインの範囲外 */}
      <div className={gridClassName}>
        {items.map((item, i) => {
          const go = () => {
            if (!item.href) return;
            onBeforeNavigate?.(item.href, item._key);
            router.push(item.href);
          };

          const onKeyDown = (e: KeyboardEvent) => {
            if (!item.href) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              go();
            }
          };

          const muxCell = !!(useMuxHover && item.muxPlaybackId);

          const inner = (
            <>
              <div
                className={`relative aspect-[268/204] w-full${rounded ? " rounded-[12px]" : ""}`}
              >
                <div
                  className={`absolute inset-0 z-0 overflow-hidden${rounded ? " rounded-[12px]" : ""}`}
                >
                  {muxCell ? (
                    <GridMuxHoverMedia
                      playbackId={item.muxPlaybackId!}
                      posterSrc={item.image}
                      posterAlt={item.title}
                      imageClassName={imageClassName}
                      rounded={rounded}
                      priority={i < 4}
                      showWorksMask={showMask}
                    />
                  ) : (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className={imageClassName}
                      sizes="(min-width: 1024px) 18vw, (min-width: 768px) 25vw, 45vw"
                      priority={i < 4}
                      unoptimized={nextImageUnoptimized(item.image)}
                    />
                  )}
                </div>
                {/* 黒い縁のマスクを上に重ねる（コンテナより少し大きくして画像のはみ出しを隠す） */}
                {showMask && !muxCell && (
                  <Image
                    src="/works-mask.svg"
                    alt=""
                    aria-hidden="true"
                    fill
                    className="pointer-events-none select-none z-[1] object-cover object-center"
                    unoptimized
                  />
                )}
              </div>
              <div className={`space-y-0.5 ${rounded ? "mt-1" : ""}`}>
                <p>{item.title}</p>
                {item.subtitle && (
                  <p className="text-[13px]">{item.subtitle}</p>
                )}
              </div>
            </>
          );

          return (
            <div
              key={item._key}
              className={
                useDimSiblings
                  ? "content-grid-cell flex w-full flex-col"
                  : "flex w-full flex-col"
              }
            >
              {item.href ? (
                <div
                  role="link"
                  tabIndex={0}
                  className={`block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-[2px] ${
                    useDimSiblings
                      ? ""
                      : canHover
                        ? "transition-opacity hover:opacity-80"
                        : ""
                  }`}
                  onClick={go}
                  onKeyDown={onKeyDown}
                >
                  {inner}
                </div>
              ) : (
                inner
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
