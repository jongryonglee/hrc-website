"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { nextImageUnoptimized } from "@/sanity/lib/image";

export type GridItem = {
  _key: string;
  image: string;
  title: string;
  subtitle?: string;
  /** 設定時はカード全体クリックで遷移（next/navigation） */
  href?: string;
};

type ContentGridProps = {
  items: GridItem[];
  showMask?: boolean;
  imageClassName?: string;
  rounded?: boolean;
  /** カード遷移の直前に呼ばれるコールバック（CRT ストレージセットなどに使用） */
  onBeforeNavigate?: (href: string, key: string) => void;
};

export const ContentGrid = ({
  items,
  showMask = false,
  imageClassName = "object-cover object-center max-md:scale-[0.992] max-md:[transform-origin:center]",
  rounded = false,
  onBeforeNavigate,
}: ContentGridProps) => {
  const router = useRouter();

  return (
    <section className="mb-[0px]">
      {/* ここはGridのデザインの範囲外 */}
      <div className="grid grid-cols-2 gap-[17px] md:grid-cols-5 md:gap-[17px]">
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

          const inner = (
            <>
              <div
                className={`relative aspect-[268/204] w-full${rounded ? " rounded-[12px]" : ""}`}
              >
                <div
                  className={`absolute inset-0 overflow-hidden${rounded ? " rounded-[12px]" : ""}`}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className={imageClassName}
                    sizes="(min-width: 1024px) 18vw, (min-width: 768px) 25vw, 45vw"
                    priority={i < 4}
                    unoptimized={nextImageUnoptimized(item.image)}
                  />
                </div>
                {/* 黒い縁のマスクを上に重ねる（コンテナより少し大きくして画像のはみ出しを隠す） */}
                {showMask && (
                  <Image
                    src="/works-mask.svg"
                    alt=""
                    aria-hidden="true"
                    fill
                    className="pointer-events-none select-none"
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
            <div key={item._key} className="flex w-full flex-col">
              {item.href ? (
                <div
                  role="link"
                  tabIndex={0}
                  className="block cursor-pointer transition-opacity hover:opacity-80 outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-[2px]"
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
