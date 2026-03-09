import Image from "next/image";
import Link from "next/link";
import { ScrambleText } from "./ScrambleText";

export const TopFooter = () => {
  return (
    <footer>
      <div className="layout-grid items-start whitespace-nowrap">
        {/* ロゴ */}
        <div className="col-start-1 flex h-[17px] w-[46px] items-start md:col-span-17 md:[grid-row:span_3]">
          <Link href="/">
            <Image
              src="/logo-main.svg"
              alt="HRC logo"
              width={46}
              height={17}
              className="h-full w-full object-contain"
              priority
            />
          </Link>
        </div>
        <div className="col-start-9 flex h-[24px] w-[24px] items-start justify-self-end md:col-span-1 md:[grid-row:span_3]">

        <Image
            src="/icon-switch-on.svg"
            alt=""
            width={24}
            height={24}
            className="ml-auto h-full w-full object-contain"
            aria-hidden="true"
          />
          </div>

        <div className="col-start-1 md:col-span-13 md:[grid-row:span_7]">
          <p>Music Label</p>
          <p>Based in Tokyo</p>
        </div>

        {/* メインナビ */}
        <div className="col-start-5 md:col-span-4 flex items-start md:[grid-row:span_7]">
          <div className="text-left">
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
        <div className="col-start-8 md:col-span-1 flex items-start md:[grid-row:span_7]">
          <div className="text-left">
            <Link href="/contact">
              <p>
                <ScrambleText
                  text="Contact"
                  mode="lap"
                  speedMs={40}
                  durationMs={400}
                />
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
            >
              <p className="whitespace-nowrap">
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
    </footer>
  );
};

