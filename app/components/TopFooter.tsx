import Image from "next/image";
import { LayoutGrid } from "./LayoutGrid";

export const TopFooter = () => {
  return (
    <header className="mb-[8.5px]">
      <LayoutGrid className="items-start">
        {/* ロゴ */}
        <div className="w-[45px] md:col-span-17 md:[grid-row:span_3] flex items-start">
          <Image
            src="/logo-main.svg"
            alt="HRC logo"
            width={46}
            height={17}
            priority
          />
        </div>
        <div className="w-[45px] md:col-span-1 md:[grid-row:span_3] flex items-start">

        <Image
            src="/icon-switch-on.svg"
            alt=""
            width={24}
            height={24}
            className="ml-auto"
            aria-hidden="true"
          />
          </div>

        <div className="md:col-span-13 md:[grid-row:span_7] leading-[1.1]">
          <p>Music Label</p>
          <p>Based in Tokyo</p>
        </div>

        {/* メインナビ */}
        <div className="md:col-span-4 flex items-start">
          <div className="text-left leading-[1.1]">
            <p>Works</p>
            <p>Office Rec</p>
            <p>Graphic Design</p>
            <p>About Us</p>
          </div>
        </div>

        {/* サブナビ */}
        <div className="md:col-span-1 flex items-start">
          <div className="text-left leading-[1.1]">
            <p>Contact</p>
            <p>Instagram</p>
            <p className="whitespace-nowrap">Twitter (X)</p>
          </div>
        </div>
      </LayoutGrid>
    </header>
  );
};

