import Image from "next/image";
import Link from "next/link";
import { LayoutGrid } from "./LayoutGrid";

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-white/10 text-[15px]">
      <LayoutGrid className="items-start">
        <div className="md:col-span-8 md:[grid-row:span_6] leading-[1.1]">
          <p>Music Label</p>
          <p>Based in Tokyo</p>
        </div>

        <div className="md:col-span-5 md:text-left leading-[1.1]">
          <p>
            201 Juno Hanegi Koen,6-9-17
            <br />
            Matsubara, Setagaya-ku,
            <br />
            Tokyo 156-0043
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=201+Juno+Hanegi+Koen,6-9-17+Matsubara,+Setagaya-ku,+Tokyo+156-0043"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-b border-white/80 pb-[1px] text-left hover:opacity-70 transition-opacity"
          >
            <span>Google Map</span>
            <Image
              src="/icon-map.svg"
              alt=""
              width={9}
              height={9}
              className="inline-block"
            />
          </a>
        </div>

        <div className="md:col-span-4 md:items-end">
          <div className="flex items-center gap-2">
            <span>Managed by hicard</span>
            <Image src="/icon-hicard.svg" alt="" width={9} height={9} />
          </div>
        </div>

        <div className="md:col-span-1 md:items-end">
        <p className="md:self-end">©︎ 2025</p>
        </div>
 
      </LayoutGrid>
    </footer>
  );
};

