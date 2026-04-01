import type { WorkDetailItem } from "@/app/lib/cmsTypes";
import { fetchSanityOr } from "@/sanity/lib/fetch";
import { WORK_ITEM_QUERY } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { WorkDetailClient } from "./WorkDetailClient";

const credits = [
  "Prod.",
  "Directer",
  "Camera",
  "Camera assistant",
  "Color",
  "Flower Design",
  "Still Photography",
  "Act",
  "Styling",
  "Make-up artist",
  "Assistant",
  "Special Thanks",
  "Lyric",
  "Beat",
  "Mix",
  "Mastering",
];

const creditNames = [
  "theeluu",
  "Hikaru Jamie Masamiya",
  "Shintaro Teramoto",
  "Kosei Yamazaki",
  "Hikaru Jamie Masamiya",
  "ai",
  "Fumiya Kawasaki",
  "Fumiya Kawasaki, Gino",
  "Daichi Inamura (Intro)",
  "Rei",
  "Ikuya Sada",
  "KAKKY",
  "takeisme",
  "theeluu",
  "theeluu",
  "theeluu",
];

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

  return (
    <WorkDetailClient
      key={id}
      data={data}
      credits={credits}
      creditNames={creditNames}
    />
  );
}
