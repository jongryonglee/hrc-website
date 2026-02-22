import { Header } from "../components/Header";
import { GraphicDesignGrid } from "../components/GraphicDesignGrid";
import { Footer } from "../components/Footer";

export default function GraphicDesignPage() {
  return (
    <>
      <Header />

        {/* Title & summary */}
        <section>
          <div className="layout-grid">
            {/* (Graphic Design): 上から2グリッド分 */}
            <div className="grid-full [grid-row:span_4] md:[grid-row:span_5]">
              <h1>(Graphic Design)</h1>
            </div>
            {/* all8...: 2グリッド分を使い、上に半グリッド／下に半グリッドのスペース */}
            <div className="grid-full [grid-row:span_2]">
              <p>all8 / event flier12 / cover art3 / gino goods2</p>
            </div>
          </div>
        </section>

        <GraphicDesignGrid />
        <section>
          <div className="layout-grid">
            <div className="grid-full [grid-row:span_5] md:[grid-row:span_10]" />
          </div>
        </section>
      <Footer />
    </>
  );
}
