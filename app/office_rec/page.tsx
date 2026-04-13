import type { OfficeRecListItem } from "@/app/lib/cmsTypes";
import { fetchSanityOr } from "@/sanity/lib/fetch";
import { OFFICE_REC_ITEMS_QUERY } from "@/sanity/lib/queries";
import type { GridItem } from "../components/ContentGrid";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { OfficeRecGrid } from "./OfficeRecGrid";

export default async function OfficeRecPage() {
  const sourceItems = await fetchSanityOr<OfficeRecListItem[]>(
    OFFICE_REC_ITEMS_QUERY,
    [],
  );

  const fallbackThumb = "/images/office-rec-1.webp";

  const items: GridItem[] = sourceItems.map((item) => ({
    _key: item._id,
    image: item.thumbnailUrl ?? fallbackThumb,
    title: `${item.title} / ${item.artist}`,
    href: `/office_rec/${item._id}`,
  }));

  const officeRecItems: GridItem[] =
    items.length > 0
      ? items
      : [
          {
            _key: "office-rec-placeholder",
            image: "/images/office-rec-1.webp",
            title: "Vol.1 - Reunited / takeisme",
          },
        ];

  return (
    <div className="flex min-h-full flex-col flex-1 px-[10px] py-[15px] md:p-[17px]">
      <Header />

      {/* Title & summary */}
      <section className="mt-[30px] md:mt-[0px]">
        <div className="layout-grid">
          {/* (Office Rec): 上から2グリッド分 */}
          <div className="grid-full [grid-row:span_6] md:[grid-row:span_5]">
            <h1>(Office Rec)</h1>
          </div>
        </div>
      </section>

      <OfficeRecGrid items={officeRecItems} />
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
