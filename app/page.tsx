import type { TopGridWorkItem } from "@/app/lib/cmsTypes";
import { fetchSanityOr } from "@/sanity/lib/fetch";
import { TOP_GRID_QUERY } from "@/sanity/lib/queries";
import { HomeBootShell } from "./components/HomeBootShell";

export default async function Home() {
  const cmsItems = await fetchSanityOr<TopGridWorkItem[]>(TOP_GRID_QUERY, []);

  return <HomeBootShell cmsItems={cmsItems} />;
}
