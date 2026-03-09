import Image from "next/image";
import { ScrambleText } from "./ScrambleText";

export const Footer = () => {
  return (
    <footer >
      <div className="layout-grid items-start whitespace-nowrap md:[&>div]:[grid-row:span_6]">
        <div className="md:col-span-8">
          <p>Music Label</p>
          <p>Based in Tokyo</p>
        </div>

        <div className="col-start-5 [grid-row:span_5] md:col-span-5 md:text-left">
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
            className="inline-flex items-center gap-2 whitespace-nowrap text-left"
          >
            <ScrambleText text="Google Map" mode="lap" speedMs={40} durationMs={400} />
            <Image
              src="/icon-map.svg"
              alt=""
              width={9}
              height={9}
              className="inline-block"
            />
          </a>
        </div>

        <div className="col-start-5 [grid-row:span_3] md:col-span-4 md:items-end">
          <a
            href="https://hicard.studio/ja"
            target="_blank"
            rel="noopener noreferrer"
            className="link_co flex items-center gap-2 whitespace-nowrap"
          >
            <ScrambleText
              text="Managed by hicard"
              mode="lap"
              speedMs={40}
              durationMs={400}
            />
            <Image
              src="/icon-hicard.svg"
              alt=""
              width={9}
              height={9}
              className="link_co-icon"
            />
          </a>
        </div>

        <div className="col-start-5 [grid-row:span_2] md:col-span-1 md:items-end">
          <p className="md:self-end">©︎ 2025</p>
        </div>
 
      </div>
    </footer>
  );
};

