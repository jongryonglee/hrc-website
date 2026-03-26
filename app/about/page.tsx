import { client, hasProjectId } from "@/sanity/lib/client";
import { PRODUCED_WORK_ITEMS_QUERY } from "@/sanity/lib/queries";
import { AboutPageClient, type ProducedWorkItem } from "./AboutPageClient";

const PLACEHOLDER_PRODUCED_WORKS: ProducedWorkItem[] = [
  {
    _id: "produced-work-placeholder-1",
    title: "Unpaused / Vela",
    label: "ABCDEF Label",
    artist: "theeluu",
    role: "Mix, Mastering",
    date: "2025/10/17",
  },
];

export default async function AboutPage() {
  let producedWorks: ProducedWorkItem[];

  if (!hasProjectId || !client) {
    producedWorks = PLACEHOLDER_PRODUCED_WORKS;
  } else {
    try {
      producedWorks = (await client.fetch(
        PRODUCED_WORK_ITEMS_QUERY
      )) as ProducedWorkItem[];
    } catch {
      producedWorks = [];
    }
  }

  return <AboutPageClient initialProducedWorks={producedWorks} />;
}
