import { Header } from "./components/Header";
import { WorksGrid } from "./components/WorksGrid";
import { Footer } from "./components/Footer";
import { LayoutGrid } from "./components/LayoutGrid";
import { TopFooter } from "./components/TopFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="flex min-h-screen w-full flex-col p-[17px] ">

        {/* Title & summary */}
       <TopFooter />
      </main>
    </div>
  );
}
