import { client, hasProjectId } from "@/sanity/lib/client";
import { WORK_ITEM_QUERY } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { WorkDetailClient } from "./WorkDetailClient";

type WorkItem = {
  _id: string;
  title: string;
  artist: string;
  producer?: string | null;
  category: "music-video" | "sound-effect";
  videoUrl: string;
  thumbnailUrl?: string | null;
  nextId?: string | null;
  prevId?: string | null;
};

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

  const data: WorkItem | null =
    hasProjectId && client
      ? ((await client.fetch(WORK_ITEM_QUERY, { id })) as WorkItem)
      : null;

  return <WorkDetailClient data={data} credits={credits} creditNames={creditNames} />;
}
