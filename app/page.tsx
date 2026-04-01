import { client, hasProjectId } from "@/sanity/lib/client";
import { TOP_GRID_QUERY } from "@/sanity/lib/queries";
import { HomeBootShell } from "./components/HomeBootShell";

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

  return <HomeBootShell cmsItems={cmsItems} />;
}
