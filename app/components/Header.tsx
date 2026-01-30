import Image from "next/image";
import Link from "next/link";
import { LayoutGrid } from "./LayoutGrid";

export const Header = () => {
  return (
    <header className="mb-[8.5px]">
      <LayoutGrid className="items-start md:[&>div]:[grid-row:span_6]">
        {/* ロゴ */}
        <div className="w-[45px] md:col-span-13 flex items-start">
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <Image
              src="/logo-main.svg"
              alt="HRC logo"
              width={46}
              height={17}
              priority
            />
          </Link>
        </div>

        {/* メインナビ */}
        <div className="md:col-span-4 flex items-start">
          <div className="text-left leading-[1.1]">
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
        <div className="md:col-span-1 flex items-start">
          <div className="text-left leading-[1.1]">
            <Link href="mailto:contact@hrc.com" className="hover:opacity-70 transition-opacity">
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
              className="hover:opacity-70 transition-opacity"
            >
              <p className="whitespace-nowrap">Twitter (X)</p>
            </a>
          </div>
        </div>
      </LayoutGrid>
    </header>
  );
};

