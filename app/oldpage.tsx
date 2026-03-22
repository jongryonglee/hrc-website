import { WorksGridHorizontal } from "./components/WorksGridHorizontal";
import { TopFooter } from "./components/TopFooter";

export default function Home() {
  return (
    <>
      <div className="min-h-full w-full overflow-hidden md:block">
        {/* Works Grid - 横スクロール */}
        <WorksGridHorizontal />
          <TopFooter />
      </div>
    </>
  );
}
