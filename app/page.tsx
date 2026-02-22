import { WorksGridHorizontal } from "./components/WorksGridHorizontal";
import { TopFooter } from "./components/TopFooter";

export default function Home() {
  return (
    <>
      <div className="h-full w-full overflow-hidden">
        {/* Works Grid - 横スクロール */}
        <WorksGridHorizontal />
        <TopFooter />
      </div>
    </>
  );
}
