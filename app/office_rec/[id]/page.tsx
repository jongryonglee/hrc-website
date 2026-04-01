import { client, hasProjectId } from "@/sanity/lib/client";
import { OFFICE_REC_ITEM_QUERY } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { OfficeRecDetailClient } from "./OfficeRecDetailClient";

type OfficeRecItem = {
  _id: string;
  title: string;
  artist: string;
  thumbnailUrl?: string | null;
  nextId?: string | null;
  prevId?: string | null;
};

export default async function OfficeRecDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const data: OfficeRecItem | null =
    hasProjectId && client
      ? ((await client.fetch(OFFICE_REC_ITEM_QUERY, { id })) as OfficeRecItem)
      : null;

  if (hasProjectId && client && !data) {
    notFound();
  }

  return <OfficeRecDetailClient data={data} />;
}
