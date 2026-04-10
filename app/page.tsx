import type { TopGridWorkItem } from "@/app/lib/cmsTypes";
import { getTopGridLcpImageUrl } from "@/app/lib/topGridSlots";
import { fetchSanityOr } from "@/sanity/lib/fetch";
import { TOP_GRID_QUERY } from "@/sanity/lib/queries";
import { HomeBootShell } from "./components/HomeBootShell";

export default async function Home() {
  const cmsItems = await fetchSanityOr<TopGridWorkItem[]>(TOP_GRID_QUERY, []);
  const lcpThumbUrl = getTopGridLcpImageUrl(cmsItems);

  return (
    <>
      {lcpThumbUrl ? (
        <link
          rel="preload"
          href={lcpThumbUrl}
          as="image"
          fetchPriority="high"
        />
      ) : null}
      <HomeBootShell cmsItems={cmsItems} lcpThumbUrl={lcpThumbUrl} />
    </>
  );
}
