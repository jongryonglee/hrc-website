import { Header } from "./components/Header";
import { WorksGridHorizontal } from "./components/WorksGridHorizontal";
import { Footer } from "./components/Footer";
import { LayoutGrid } from "./components/LayoutGrid";
import { TopFooter } from "./components/TopFooter";

export default function Home() {
  return (
    <div className="h-screen bg-black text-white overflow-hidden">
      <main className="flex h-full w-full flex-col p-[17px]">
        {/* Works Grid - 横スクロール */}
        <WorksGridHorizontal />
        <TopFooter />
      </main>
    </div>
  );
}
