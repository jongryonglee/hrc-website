import { client, hasProjectId } from "@/sanity/lib/client";
import { WORKS_ITEMS_QUERY } from "@/sanity/lib/queries";
import { WorksPageClient, type WorkItem } from "./WorksPageClient";

export default async function WorkPage() {
  const sourceItems: WorkItem[] =
    hasProjectId && client
      ? ((await client.fetch(WORKS_ITEMS_QUERY)) as WorkItem[])
      : [];

  return <WorksPageClient initialItems={sourceItems} />;
}
