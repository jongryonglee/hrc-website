import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { Header } from "../../components/Header";
import { client, hasProjectId } from "@/sanity/lib/client";
import { WORK_ITEM_QUERY } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { ScrambleText } from "../../components/ScrambleText";
import { SoundToggle } from "../../components/SoundToggle";

type WorkItem = {
  _id: string;
  title: string;
  artist: string;
  producer?: string | null;
  category: "music-video" | "sound-effect";
  videoUrl: string;
  thumbnailUrl?: string | null;
  nextId?: string | null;
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

  return (
    <div className="flex min-h-full flex-col flex-1">
      {/*
        CSS Grid の grid-area: 1/1 を使って
        ヘッダー・画像・テキストを同一セルに重ねる
      */}
      <section className="grid flex-1" style={{ gridTemplateRows: "1fr" }}>

        {/* 画像レイヤー（最背面） */}
        <div
          aria-hidden="true"
          className="[grid-area:1/1] flex items-center justify-center"
        >
          <div className="relative h-[80vh] aspect-[360/274] overflow-hidden">
            {data?.thumbnailUrl ? (
              <>
                <img
                  src={data.thumbnailUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <img
                  src="/works-mask.svg"
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                />
              </>
            ) : (
              <div className="absolute inset-0 rounded-[16px] bg-white/10" />
            )}
          </div>
        </div>

        {/* ヘッダーレイヤー（最前面） */}
        <div className="[grid-area:1/1] relative z-20 pointer-events-none self-start">
          <div className="pointer-events-auto">
            <Header />
          </div>
        </div>

        {/* テキストレイヤー（前面） */}
        <div className="[grid-area:1/1] relative z-10 pointer-events-none">
          <div className="layout-grid items-start pointer-events-auto">
            {/* タイトル・カテゴリ */}
            <div className="col-span-6 md:col-span-8 [grid-row-start:7] [grid-row-end:9]">
              <p>Works / Music Video /</p>
              <h2 className="text-[26px] leading-tight md:text-[32px]">
                {data?.title ?? "Saiwai / Takeisme"}
              </h2>
              <h2 className="text-[26px] leading-tight md:text-[32px]">
                (Prod.{data?.producer ?? "theeluu"})
              </h2>
            </div>

            {/* クレジットブロック */}
            <div className="col-span-9 md:col-start-14 md:col-span-5 [grid-row-start:8] grid [grid-template-columns:subgrid] gap-y-0 content-start">
              {credits.map((label, i) => (
                <Fragment key={label}>
                  <p className="col-span-2">{label}</p>
                  <p className="col-span-3">{creditNames[i]}</p>
                </Fragment>
              ))}
            </div>

            {/* next リンク */}
            <div
              className="col-span-3 md:col-start-16 md:col-span-3"
              style={{ gridRowStart: 8 + credits.length + 15 }}
            >
              <Link href={data?.nextId ? `/works/${data.nextId}` : "/works"} className="hover:opacity-70 transition-opacity inline-flex items-center gap-2">
                <Image src="/arrow-down.svg" alt="" width={9} height={9} />
                next
              </Link>
            </div>

          </div>
        </div>

        {/* YouTube / SoundCloud / Instagram（下寄せ） */}
        <div className="[grid-area:1/1] relative z-10 pointer-events-none flex flex-col justify-end pb-[34px]">
          <div className="layout-grid pointer-events-auto">
            <div className="col-span-6 md:col-span-4 flex flex-col gap-1">

              <a
                href={data?.videoUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="link_co flex items-center gap-2 whitespace-nowrap"
              >
                <ScrambleText text="YouTube" mode="lap" speedMs={40} durationMs={400} />
                <Image src="/icon-hicard.svg" alt="" width={9} height={9} className="link_co-icon" />
              </a>
              <Link href="/404" className="link_co flex items-center gap-2 whitespace-nowrap">
                <ScrambleText text="Sound Cloud" mode="lap" speedMs={40} durationMs={400} />
                <Image src="/icon-hicard.svg" alt="" width={9} height={9} className="link_co-icon" />
              </Link>
              <Link href="/404" className="link_co flex items-center gap-2 whitespace-nowrap">
                <ScrambleText text="Instagram" mode="lap" speedMs={40} durationMs={400} />
                <Image src="/icon-hicard.svg" alt="" width={9} height={9} className="link_co-icon" />
              </Link>
            </div>
            <div className="col-start-8 md:col-start-17 md:col-span-2 self-end">
              <SoundToggle />
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}
