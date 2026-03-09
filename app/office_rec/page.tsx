import { Header } from "../components/Header";
import { ContentGrid, type GridItem } from "../components/ContentGrid";
import { Footer } from "../components/Footer";
import { client } from "@/sanity/lib/client";
import { OFFICE_REC_ITEMS_QUERY } from "@/sanity/lib/queries";

type OfficeRecItem = {
  _id: string;
  title: string;
  artist: string;
  thumbnailUrl?: string | null;
};

export default async function OfficeRecPage() {
  const hasProject = Boolean(client.config().projectId);
  const sourceItems = hasProject
    ? ((await client.fetch(OFFICE_REC_ITEMS_QUERY)) as OfficeRecItem[])
    : [];

  const items = sourceItems.flatMap((item) => {
    if (!item.thumbnailUrl) return [];
    return [
      {
        _key: item._id,
        image: item.thumbnailUrl,
        title: `${item.title} / ${item.artist}`,
      },
    ];
  });

  const officeRecItems: GridItem[] =
    items.length > 0
      ? items
      : [
          {
            _key: "office-rec-placeholder",
            image: "/images/office-rec-1.png",
            title: "Vol.1 - Reunited / takeisme",
          },
        ];

  return (
    <div className="flex min-h-full flex-col flex-1">
      <Header />

        {/* Title & summary */}
        <section>
          <div className="layout-grid">
            {/* (Office Rec): 上から2グリッド分 */}
            <div className="grid-full [grid-row:span_6] md:[grid-row:span_5]">
              <h1>(Office Rec)</h1>
            </div>
          </div>
        </section>

        <ContentGrid
          items={officeRecItems}
          rounded={true}
          imageClassName="object-cover"
        />
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
