import Image from "next/image";
import Link from "next/link";
import { ScrambleText } from "./ScrambleText";

export const Header = () => {
  return (
    <header className="pointer-events-none">
      {/* md: グリッド全面がヒット領域になると中央のレイヤー（例: Works 詳細の動画）を覆う */}
      <div className="layout-grid items-start md:[&>div]:[grid-row:span_6] pointer-events-auto md:pointer-events-none">
        {/* ロゴ */}
        <div className="flex h-[17px] w-[46px] items-start md:pointer-events-auto">
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <Image
              src="/logo-main.svg"
              alt="HRC logo"
              width={46}
              height={17}
              priority
              className="h-full w-full object-contain"
            />
          </Link>
        </div>

        {/* メインナビ */}
        <div className="col-start-5 md:col-start-14 flex items-start md:pointer-events-auto">
          <div className="text-left whitespace-nowrap">
          <Link href="/works">
            <p>
              <ScrambleText text="Works" mode="lap" speedMs={40} durationMs={400} />
            </p>
          </Link>
          <Link href="/office_rec">
            <p>
              <ScrambleText
                text="Office Rec"
                mode="lap"
                speedMs={40}
                durationMs={400}
              />
            </p>
          </Link>
          <Link href="/graphic_design">
            <p>
              <ScrambleText
                text="Graphic Design"
                mode="lap"
                speedMs={40}
                durationMs={400}
              />
            </p>
          </Link>
          <Link href="/about">
            <p className="inline-flex items-center gap-1">
              <ScrambleText
                text="About"
                mode="lap"
                speedMs={40}
                durationMs={400}
              />
              <ScrambleText
                text="Us"
                mode="lap"
                speedMs={40}
                durationMs={400}
              />
            </p>
          </Link>
          </div>
        </div>

        {/* サブナビ */}
        <div className="col-start-8 md:col-start-18 flex items-start md:pointer-events-auto">
          <div className="text-left">
          <Link href="/contact">
            <p>
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
      </div>
    </header>
  );
};

