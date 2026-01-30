import { Header } from "../components/Header";
import { ContentGrid, type GridItem } from "../components/ContentGrid";
import { Footer } from "../components/Footer";
import { LayoutGrid } from "../components/LayoutGrid";

const officeRecItems: GridItem[] = [
  {
    image: "/images/office-rec-1.png",
    title: "Vol.1 - Reunited / takeisme",
  },
  {
    image: "/images/office-rec-2.png",
    title: "Vol.2 - Jet lag / takeisme",
  },
  {
    image: "/images/office-rec-3.png",
    title: "Vol.3 - Day by Day / KAKKY (0mSv RMX)",
  },
  {
    image: "/images/office-rec-4.png",
    title: "Vol.4 - Brain Have a Pen / Ridho Louis (prod. dhrma)",
  },
  {
    image: "/images/office-rec-5.png",
    title: "Vol.5 - KI-SE-KI / PONEY (prod.Dusty Sky)",
  },
  {
    image: "/images/office-rec-6.png",
    title: "Vol.6 - GOING UP / Young Eddie (prod.ENDRUN)",
  },
  {
    image: "/images/office-rec-7.png",
    title: "Vol.7 - KAKKY & takeisme (prod.SQUAL)",
  },
  {
    image: "/images/office-rec-8.png",
    title: "Vol.8 - 好き / SILENT KILLA JOINT (prod.GeminisAzul)",
  },
  {
    image: "/images/office-rec-9.png",
    title: "Vol.9 / minami (prod.jarryboy)",
  },
  {
    image: "/images/office-rec-10.png",
    title: "Vol.10 / Vela (prod.theeluu)",
  },
  {
    image: "/images/office-rec-11.png",
    title: "Vol.11 / OVERFALL - Session 1",
  },
  {
    image: "/images/office-rec-12.png",
    title: "Vol.11 / OVERFALL - Session 2",
  },
  {
    image: "/images/office-rec-13.png",
    title: "Vol.12 / FEL0's (prod.T Soul)",
  },
  {
    image: "/images/office-rec-14.png",
    title: "Vol.13 / asu (prod. NAGMATIC)",
  },
  {
    image: "/images/office-rec-15.png",
    title: "Vol.14 /Deey & Leo Iwamura",
  },
  {
    image: "/images/office-rec-16.png",
    title: "Vol.15 / ASA Wu (Prod.theeluu)",
  },
  {
    image: "/images/office-rec-17.png",
    title: "Vol.16 / B.e (Prod.ShinyAppLe)",
  },
  {
    image: "/images/office-rec-18.png",
    title: "Vol.16 Part2 / B.e (Prod.tinjao)",
  },
  {
    image: "/images/office-rec-19.png",
    title: "Vol.17 / Ginpari (Prod.IKE)",
  },
  {
    image: "/images/office-rec-20.png",
    title: "Vol.17 Part 2 / Ginpari (Prod.IKE)",
  },
];

export default function OfficeRecPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="flex min-h-screen w-full flex-col p-[17px] ">
        <Header />

        {/* Title & summary */}
        <section>
          <LayoutGrid>
            {/* (Office Rec): 上から2グリッド分 */}
            <div className="md:col-span-18 md:[grid-row:span_5]">
              <p className="text-[46px] leading-[1.1]">(Office Rec)</p>
            </div>
          </LayoutGrid>
        </section>

        <ContentGrid
          items={officeRecItems}
          rounded={true}
          imageClassName="object-cover"
        />
        <section>
          <LayoutGrid>
            <div className="md:col-span-18 md:[grid-row:span_10]" />
          </LayoutGrid>
        </section>
        <Footer />
      </main>
    </div>
  );
}
