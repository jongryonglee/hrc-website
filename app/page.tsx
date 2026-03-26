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
    <div className="flex min-w-0 flex-col overflow-x-hidden overflow-y-hidden h-[calc(100dvh-30px)] md:h-[calc(100dvh-34px)]">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col justify-end">
        <TopGrid cmsItems={cmsItems} />
      </section>

      <div className="h-[var(--grid-row)]" />

      <TopFooter />
    </div>
  );
}
