import { Header } from "../components/Header";
import { ContentGrid, type GridItem } from "../components/ContentGrid";
import { Footer } from "../components/Footer";
import { client, hasProjectId } from "@/sanity/lib/client";
import { WORKS_ITEMS_QUERY } from "@/sanity/lib/queries";

type WorkItem = {
  _id: string;
  title: string;
  artist: string;
  duration: string;
  producer?: string | null;
  category: "music-video" | "sound-effect";
  videoUrl: string;
  thumbnailUrl?: string | null;
};

export default async function WorkPage() {
  const sourceItems =
    hasProjectId && client
      ? ((await client.fetch(WORKS_ITEMS_QUERY)) as WorkItem[])
      : [];
  const counts = sourceItems.reduce(
    (acc, item) => {
      acc.all += 1;
      if (item.category === "music-video") acc.musicVideo += 1;
      if (item.category === "sound-effect") acc.soundEffect += 1;
      return acc;
    },
    { all: 0, musicVideo: 0, soundEffect: 0 }
  );
  const summaryText =
    counts.all > 0
      ? `all${counts.all} / music video${counts.musicVideo} / sound effect${counts.soundEffect}`
      : "all1 / music video1 / sound effect0";

  const items = sourceItems.flatMap((item) => {
    if (!item.thumbnailUrl) return [];

    const subtitleParts = [item.duration, item.producer && `Prod.${item.producer}`]
      .filter(Boolean)
      .join(" - ");

    return [
      {
        _key: item._id,
        image: item.thumbnailUrl,
        title: `${item.title} / ${item.artist}`,
        subtitle: subtitleParts || undefined,
      },
    ];
  });

  const worksItems: GridItem[] =
    items.length > 0
      ? items
      : [
          {
            _key: "placeholder",
            image: "/images/works-1.gif",
            title: "Saiwai / takeisme",
            subtitle: "03:24 - Prod.theeluu",
          },
        ];
  return (
    <div className="flex min-h-full flex-col flex-1">
      <Header />

      {/* Title & summary */}
      <section>
        <div className="layout-grid">
          {/* (Works): 上から5グリッド分 */}
          <div className="grid-full [grid-row:span_4] md:[grid-row:span_5]">
            <h1>(Works)</h1>
          </div>
          <div className="grid-full [grid-row:span_2]">
            <p className="whitespace-nowrap">{summaryText}</p>
          </div>
        </div>
        <ContentGrid
          items={worksItems}
          showMask={true}
          imageClassName="object-cover scale-[1.05]"
        />
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
