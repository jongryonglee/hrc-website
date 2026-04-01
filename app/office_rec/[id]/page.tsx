import type { OfficeRecDetailItem } from "@/app/lib/cmsTypes";
import { client, hasProjectId } from "@/sanity/lib/client";
import { fetchSanityOr } from "@/sanity/lib/fetch";
import { OFFICE_REC_ITEM_QUERY } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { OfficeRecDetailClient } from "./OfficeRecDetailClient";

export default async function OfficeRecDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const data = await fetchSanityOr<OfficeRecDetailItem | null>(
    OFFICE_REC_ITEM_QUERY,
    null,
    { id },
  );

  if (hasProjectId && client && !data) {
    notFound();
  }

  return <OfficeRecDetailClient data={data} />;
}
