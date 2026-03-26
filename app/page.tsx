import { client, hasProjectId } from "@/sanity/lib/client";
import { TOP_GRID_QUERY } from "@/sanity/lib/queries";
import { TopFooter } from "./components/TopFooter";
import { TopGrid } from "./components/TopGrid";

type WorkItem = {
  _id: string;
  thumbnailUrl?: string | null;
};

export default async function Home() {
  let cmsItems: WorkItem[] = [];
  try {
    if (hasProjectId && client) {
      cmsItems = (await client.fetch(TOP_GRID_QUERY)) as WorkItem[];
    }
  } catch (_) {
    cmsItems = [];
  }

  return (
    <div className="flex flex-col overflow-x-visible overflow-y-hidden h-[calc(100dvh-30px)] md:h-[calc(100dvh-34px)]">
      <section className="flex-1 min-h-0 overflow-x-visible overflow-y-hidden flex flex-col justify-end">
        <TopGrid cmsItems={cmsItems} />
      </section>

      <div className="h-[var(--grid-row)]" />

      <TopFooter />
    </div>
  );
}
