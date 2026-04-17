import type { ProducedWorkItem } from "@/app/lib/cmsTypes";
import { hasProjectId } from "@/sanity/lib/client";
import { fetchSanityOr } from "@/sanity/lib/fetch";
import { PRODUCED_WORK_ITEMS_QUERY } from "@/sanity/lib/queries";
import { AboutPageClient } from "./AboutPageClient";

const PLACEHOLDER_PRODUCED_WORKS: ProducedWorkItem[] = [
  {
    _id: "produced-work-placeholder-1",
    title: "Unpaused / Vela",
    label: "ABCDEF Label",
    artist: "theeluu",
    role: "Mix Mastering",
    date: "2025/10/17",
    link: "https://example.com",
  },
];

export default async function AboutPage() {
  let producedWorks: ProducedWorkItem[];

  if (!hasProjectId) {
    producedWorks = PLACEHOLDER_PRODUCED_WORKS;
  } else {
    producedWorks = await fetchSanityOr<ProducedWorkItem[]>(
      PRODUCED_WORK_ITEMS_QUERY,
      [],
    );
  }

  return <AboutPageClient initialProducedWorks={producedWorks} />;
}
