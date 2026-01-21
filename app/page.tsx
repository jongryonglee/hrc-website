import { Header } from "./components/Header";
import { WorksGrid } from "./components/WorksGrid";
import { Footer } from "./components/Footer";
import { LayoutGrid } from "./components/LayoutGrid";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="flex min-h-screen w-full flex-col p-[17px] ">
        <Header />

        {/* Title & summary */}
        <section>
          <LayoutGrid>
            {/* (Works): 上から2グリッド分 */}
            <div className="md:col-span-18 md:[grid-row:span_5]">
              <p className="text-[46px] leading-[1.1]">(Works)</p>
            </div>
            {/* all8...: 2グリッド分を使い、上に半グリッド／下に半グリッドのスペース */}
            <div className="md:col-span-18 md:[grid-row:span_2]">
              <p className="text-[15px] leading-[1.1]">
                all8 / music video3 / sound effect12
              </p>
            </div>
          </LayoutGrid>
        </section>

        <WorksGrid />
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
