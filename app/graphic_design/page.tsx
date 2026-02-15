import { Header } from "../components/Header";
import { GraphicDesignGrid } from "../components/GraphicDesignGrid";
import { Footer } from "../components/Footer";
import { LayoutGrid } from "../components/LayoutGrid";

export default function GraphicDesignPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="flex min-h-screen w-full flex-col p-[17px] ">
        <Header />

        {/* Title & summary */}
        <section>
          <LayoutGrid>
            {/* (Graphic Design): 上から2グリッド分 */}
            <div className="md:col-span-18 md:[grid-row:span_5]">
              <h1>(Graphic Design)</h1>
            </div>
            {/* all8...: 2グリッド分を使い、上に半グリッド／下に半グリッドのスペース */}
            <div className="md:col-span-18 md:[grid-row:span_2]">
              <p>all8 / event flier12 / cover art3 / gino goods2</p>
            </div>
          </LayoutGrid>
        </section>

        <GraphicDesignGrid />
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
