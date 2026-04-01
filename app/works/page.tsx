import type { WorkListItem } from "@/app/lib/cmsTypes";
import { fetchSanityOr } from "@/sanity/lib/fetch";
import { WORKS_ITEMS_QUERY } from "@/sanity/lib/queries";
import { WorksPageClient } from "./WorksPageClient";

export default async function WorkPage() {
  const sourceItems = await fetchSanityOr<WorkListItem[]>(
    WORKS_ITEMS_QUERY,
    [],
  );

  return <WorksPageClient initialItems={sourceItems} />;
}
