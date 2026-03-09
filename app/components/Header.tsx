import Image from "next/image";
import Link from "next/link";

export const Header = () => {
  return (
    <header >
      <div className="layout-grid items-start md:[&>div]:[grid-row:span_6]">
        {/* ロゴ */}
        <div className="flex h-[17px] w-[46px] items-start">
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
        <div className="col-start-5 md:col-start-14 flex items-start">
          <div className="text-left whitespace-nowrap">
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
        <div className="col-start-8 md:col-start-18 flex items-start">
          <div className="text-left">
            <Link href="/contact" className="hover:opacity-70 transition-opacity">
              <p>Contact</p>
            </Link>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              <p>Instagram</p>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity whitespace-nowrap"
            >
              <p>Twitter (X)</p>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

