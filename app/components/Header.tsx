import Image from "next/image";
import { LayoutGrid } from "./LayoutGrid";

export const Header = () => {
  return (
    <header className="mb-[8.5px]">
      <LayoutGrid className="items-start md:[&>div]:[grid-row:span_6]">
        {/* ロゴ */}
        <div className="w-[45px] md:col-span-13 flex items-start">
          <Image
            src="/logo-main.svg"
            alt="HRC logo"
            width={46}
            height={17}
            priority
          />
        </div>

        {/* メインナビ */}
        <div className="md:col-span-4 flex items-start">
          <div className="text-left">
            <p>Works</p>
            <p>Office Rec</p>
            <p>Graphic Design</p>
            <p>About Us</p>
          </div>
        </div>

        {/* サブナビ */}
        <div className="md:col-span-1 flex items-start">
          <div className="text-left">
            <p>Contact</p>
            <p>Instagram</p>
            <p>Twitter (X)</p>
          </div>
        </div>
      </LayoutGrid>
    </header>
  );
};

