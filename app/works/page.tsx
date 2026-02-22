import { Header } from "../components/Header";
import { ContentGrid, type GridItem } from "../components/ContentGrid";
import { Footer } from "../components/Footer";

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
    <>
      <Header />

      {/* Title & summary */}
      <section>
        <div className="layout-grid">
          {/* (Works): 上から5グリッド分 */}
          <div className="grid-full [grid-row:span_4] md:[grid-row:span_5]">
            <h1>(Works)</h1>
          </div>
          <div className="grid-full [grid-row:span_2]">
            <p>all8 / music video3 / sound effect12</p>
          </div>
        </div>
        <ContentGrid
          items={worksItems}
          showMask={true}
          imageClassName="object-cover scale-[1.05]"
        />
        <div className="layout-grid">
          <div className="grid-full [grid-row:span_5] md:[grid-row:span_10]" />
        </div>
      </section>

      <Footer />
    </>
  );
}
