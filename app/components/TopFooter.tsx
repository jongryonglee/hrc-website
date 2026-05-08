"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrambleText } from "./ScrambleText";

type TopFooterProps = {
  /** トップの起動シーケンス完了後は true。未指定は常に ON 表示（他ページ用） */
  bootComplete?: boolean;
  /**
   * スイッチ OFF の点滅アニメーション終了時（CSS animationend）。
   * HomeBootShell がグリッド表示と同期させるために渡す。
   */
  onBootSequenceEnd?: () => void;
};

function isSwitchOffBlinkAnimation(name: string) {
  return name === "switch-off-blink" || name.endsWith("switch-off-blink");
}

export const TopFooter = ({
  bootComplete = true,
  onBootSequenceEnd,
}: TopFooterProps) => {
  const pathname = usePathname() ?? "";

  return (
    <footer>
      <div className="layout-grid items-start whitespace-nowrap">
        <div className="grid-full flex justify-end">
          <div className="relative h-[17px] w-[17px] shrink-0">
            <Image
              src="/icon/icon-switch-off.svg"
              alt=""
              width={17}
              height={17}
              className={`absolute inset-0 h-full w-full object-contain ${
                bootComplete
                  ? "opacity-0"
                  : "opacity-100 switch-off-blink"
              }`}
              aria-hidden="true"
              onAnimationEnd={(e) => {
                if (bootComplete) return;
                if (!onBootSequenceEnd) return;
                if (!isSwitchOffBlinkAnimation(e.animationName)) return;
                onBootSequenceEnd();
              }}
            />
            <Image
              src="/icon/icon-switch-on.svg"
              alt=""
              width={17}
              height={17}
              className={`absolute inset-0 h-full w-full object-contain ${
                bootComplete ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* スイッチとナビのあいだ: モバイル 1 トラック / md+ は 2 トラック */}
        <div
          className="grid-full min-h-[var(--grid-row)] pointer-events-none"
          aria-hidden
        />
        <div
          className="grid-full hidden min-h-[var(--grid-row)] pointer-events-none md:block"
          aria-hidden
        />

        {/* Header と同一の列・構成（モバイル row 3 / md+ row 4） */}
        <div className="flex h-[46px] w-[46px] items-start row-start-3 md:row-start-4 md:row-span-4">
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <Image
              src="/icon/hrc_logo.svg"
              alt="HRC logo"
              width={46}
              height={46}
              priority
              className="h-full w-full object-contain"
            />
          </Link>
        </div>

        <div className="col-start-5 md:col-start-14 flex items-start row-start-3 md:row-start-4 md:row-span-4">
          <div className="text-left whitespace-nowrap">
            <Link href="/works">
              <p className={pathname.startsWith("/works") ? "line-through" : ""}>
                <ScrambleText text="Works" mode="lap" speedMs={40} durationMs={400} />
              </p>
            </Link>
            <Link href="/office_rec">
              <p className={pathname.startsWith("/office_rec") ? "line-through" : ""}>
                <ScrambleText
                  text="Office Rec"
                  mode="lap"
                  speedMs={40}
                  durationMs={400}
                />
              </p>
            </Link>
            <Link href="/graphic_design">
              <p className={pathname.startsWith("/graphic_design") ? "line-through" : ""}>
                <ScrambleText
                  text="Graphic Design"
                  mode="lap"
                  speedMs={40}
                  durationMs={400}
                />
              </p>
            </Link>
            <Link href="/about">
              <p
                className={`inline-flex items-center gap-1${
                  pathname.startsWith("/about") ? " line-through" : ""
                }`}
              >
                <ScrambleText
                  text="About"
                  mode="lap"
                  speedMs={40}
                  durationMs={400}
                />
              </p>
            </Link>
          </div>
        </div>

        <div className="col-start-8 md:col-start-18 flex items-start row-start-3 md:row-start-4 md:row-span-4">
          <div className="text-left">
            <Link href="/contact">
              <p className={pathname.startsWith("/contact") ? "line-through" : ""}>
                <ScrambleText text="Contact" mode="lap" speedMs={40} durationMs={400} />
              </p>
            </Link>
            <a
              href="https://www.instagram.com/hicard.record?igsh="
              target="_blank"
              rel="noopener noreferrer"
            >
              <p>
                <ScrambleText
                  text="Instagram"
                  mode="lap"
                  speedMs={40}
                  durationMs={400}
                />
              </p>
            </a>
            <a
              href="https://x.com/hrc_hicard?s=21"
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap"
            >
              <p>
                <ScrambleText
                  text="Twitter (X)"
                  mode="lap"
                  speedMs={40}
                  durationMs={400}
                />
              </p>
            </a>
          </div>
        </div>

        {/* 下に 4 トラックぶん（モバイル・デスクトップ共通） */}
        <div
          className="grid-full min-h-[calc(3*var(--grid-row))] pointer-events-none"
          aria-hidden
        />
      </div>
    </footer>
  );
};
