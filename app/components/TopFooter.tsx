import Image from "next/image";
import Link from "next/link";

export const TopFooter = () => {
  return (
    <footer>
      <div className="layout-grid items-start whitespace-nowrap">
        {/* ロゴ */}
        <div className="col-start-1 flex h-[17px] w-[46px] items-start md:col-span-17 md:[grid-row:span_3]">
          <Link href="/" className="hover:opacity-70 transition-opacity">
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
            <Link href="/works" className="hover:opacity-70 transition-opacity">
              <p>Works</p>
            </Link>
            <Link href="/office_rec" className="hover:opacity-70 transition-opacity">
              <p>Office Rec</p>
            </Link>
            <Link href="/graphic_design" className="hover:opacity-70 transition-opacity">
              <p>Graphic Design</p>
            </Link>
            <Link href="/about" className="hover:opacity-70 transition-opacity">
              <p>About Us</p>
            </Link>
          </div>
        </div>

        {/* サブナビ */}
        <div className="col-start-8 md:col-span-1 flex items-start md:[grid-row:span_7]">
          <div className="text-left">
            <Link href="/contact" className="hover:opacity-70 transition-opacity">
              <p>Contact</p>
            </Link>
            <a
              href="https://www.instagram.com/hicard.record?igsh="
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              <p>Instagram</p>
            </a>
            <a
              href="https://x.com/hrc_hicard?s=21"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              <p className="whitespace-nowrap">Twitter (X)</p>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

