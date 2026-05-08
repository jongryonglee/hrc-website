import type { GraphicDesignListItem } from "@/app/lib/cmsTypes";
import { fetchSanityOr } from "@/sanity/lib/fetch";
import { GRAPHIC_DESIGN_ITEMS_QUERY } from "@/sanity/lib/queries";
import { Footer } from "../components/Footer";
import { GraphicDesignGrid } from "../components/GraphicDesignGrid";
import { Header } from "../components/Header";

export default async function GraphicDesignPage() {
  const sourceItems = await fetchSanityOr<GraphicDesignListItem[]>(
    GRAPHIC_DESIGN_ITEMS_QUERY,
    [],
  );
  const items = sourceItems.flatMap((item) => {
    if (!item.thumbnailUrl) return [];
    return [
      {
        image: item.thumbnailUrl,
        title: item.title,
        alt: item.title,
        category: item.category,
      },
    ];
  });

  const graphicDesignItems =
    items.length > 0
      ? items
      : [
          {
            image: "/images/graphic-302.webp",
            title: "mono-hi vol.12",
            alt: "mono-hi vol.12",
            category: "event-flier" as const,
          },
        ];

  return (
    <div className="flex min-h-full flex-col flex-1 px-[10px] py-[15px] md:p-[17px]">
      <Header />

      <div className="page-main-bottom-spacer">
      {/* Title & summary */}
      <section className="mt-[30px] md:mt-[0px]">
        <div className="layout-grid">
          {/* (Graphic Design): 上から2グリッド分 */}
          <div className="grid-full [grid-row:span_4] md:[grid-row:span_5]">
            <h1>(Graphic Design)</h1>
          </div>
          <div className="grid-full [grid-row:span_1]" />
        </div>
      </section>

      <GraphicDesignGrid items={graphicDesignItems} />
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
