import { Header } from "../components/Header";
import { GraphicDesignGrid } from "../components/GraphicDesignGrid";
import { Footer } from "../components/Footer";
import { client, hasProjectId } from "@/sanity/lib/client";
import { GRAPHIC_DESIGN_ITEMS_QUERY } from "@/sanity/lib/queries";

type GraphicDesignItem = {
  _id: string;
  title: string;
  category: "event-flier" | "cover-art" | "gino-goods";
  thumbnailUrl?: string | null;
};

export default async function GraphicDesignPage() {
  const sourceItems =
    hasProjectId && client
      ? ((await client.fetch(GRAPHIC_DESIGN_ITEMS_QUERY)) as GraphicDesignItem[])
      : [];
  const counts = sourceItems.reduce(
    (acc, item) => {
      acc.all += 1;
      if (item.category === "event-flier") acc.eventFlier += 1;
      if (item.category === "cover-art") acc.coverArt += 1;
      if (item.category === "gino-goods") acc.ginoGoods += 1;
      return acc;
    },
    { all: 0, eventFlier: 0, coverArt: 0, ginoGoods: 0 }
  );
  const summaryText =
    counts.all > 0
      ? `all${counts.all} / event flier${counts.eventFlier} / cover art${counts.coverArt} / gino goods${counts.ginoGoods}`
      : "all8 / event flier12 / cover art3 / gino goods2";

  const items = sourceItems.flatMap((item) => {
    if (!item.thumbnailUrl) return [];
    return [
      {
        image: item.thumbnailUrl,
        title: item.title,
        alt: item.title,
      },
    ];
  });

  const graphicDesignItems =
    items.length > 0
      ? items
      : [
          {
            image: "/images/graphic-302.png",
            title: "mono-hi vol.12",
            alt: "mono-hi vol.12",
          },
        ];

  return (
    <div className="flex min-h-full flex-col flex-1">
      <Header />

        {/* Title & summary */}
        <section>
          <div className="layout-grid">
            {/* (Graphic Design): 上から2グリッド分 */}
            <div className="grid-full [grid-row:span_4] md:[grid-row:span_5]">
              <h1>(Graphic Design)</h1>
            </div>
            {/* all8...: 2グリッド分を使い、上に半グリッド／下に半グリッドのスペース */}
            <div className="grid-full [grid-row:span_2]">
              <p className="whitespace-nowrap">{summaryText}</p>
            </div>
          </div>
        </section>

        <GraphicDesignGrid items={graphicDesignItems} />
        <section>
          <div className="layout-grid">
            <div className="grid-full [grid-row:span_5] md:[grid-row:span_10]" />
          </div>
        </section>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
