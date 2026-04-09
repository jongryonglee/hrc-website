import type { WorkDetailItem } from "@/app/lib/cmsTypes";
import { fetchSanityOr } from "@/sanity/lib/fetch";
import { WORK_ITEM_QUERY } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { WorkDetailClient } from "./WorkDetailClient";

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const data = await fetchSanityOr<WorkDetailItem | null>(
    WORK_ITEM_QUERY,
    null,
    { id },
  );

  return <WorkDetailClient key={id} data={data} />;
}
