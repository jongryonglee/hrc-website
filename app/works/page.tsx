import { Header } from "../components/Header";
import { ContentGrid, type GridItem } from "../components/ContentGrid";
import { Footer } from "../components/Footer";
import { LayoutGrid } from "../components/LayoutGrid";

const worksImages = [
  "/images/works-1.gif",
  "/images/works-2.png",
  "/images/works-3.png",
  "/images/works-4.png",
  "/images/works-5.png",
  "/images/works-6.png",
  "/images/works-7.png",
  "/images/works-8.png",
];

const worksItems: GridItem[] = Array.from({ length: 18 }).map((_, i) => ({
  image: worksImages[i % worksImages.length],
  title: "Saiwai / takeisme",
  subtitle: "03:24 - Prod.theeluu",
}));

export default function WorkPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="flex min-h-screen w-full flex-col p-[17px] ">
        <Header />

        {/* Title & summary */}
        <section>
          <LayoutGrid>
            {/* (Works): 上から2グリッド分 */}
            <div className="md:col-span-18 md:[grid-row:span_5]">
              <h1>(Works)</h1>
            </div>
            {/* all8...: 2グリッド分を使い、上に半グリッド／下に半グリッドのスペース */}
            <div className="md:col-span-18 md:[grid-row:span_2]">
              <p>all8 / music video3 / sound effect12</p>
            </div>
          </LayoutGrid>
        </section>

        <ContentGrid
          items={worksItems}
          showMask={true}
          imageClassName="object-cover scale-[1.05]"
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
