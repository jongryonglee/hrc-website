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

  const thumbnailContent = data?.thumbnailUrl ? (
    <>
      <Image
        src={data.thumbnailUrl}
        alt=""
        fill
        priority
        sizes="(min-width: 768px) 60vw, 95vw"
        className="object-cover"
      />
      <img
        src="/works-mask.svg"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </>
  ) : (
    <div className="absolute inset-0 rounded-[16px] bg-white/10" />
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <section className="flex flex-col flex-1 md:grid overflow-hidden" style={{ gridTemplateRows: "1fr" }}>

        {/* ヘッダー */}
        <div className="md:[grid-area:1/1] relative md:z-20 pointer-events-none self-start w-full">
          <div className="pointer-events-auto">
            <Header />
          </div>
        </div>

        {/* タイトル：モバイル=ヘッダー下1グリッド後フロー / デスクトップ=row7オーバーレイ */}
        <div className="mt-[var(--grid-row)] md:mt-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none">
          <div className="layout-grid md:items-start pointer-events-auto">
            <div className="col-span-9 md:col-span-8 md:[grid-row-start:7] md:[grid-row-end:9]">
              <p>Works / Music Video /</p>
              <h2 className="text-[26px] leading-tight md:text-[32px]">
                {data?.title ?? "Saiwai / Takeisme"}
              </h2>
              <h2 className="text-[26px] leading-tight md:text-[32px]">
                (Prod.{data?.producer ?? "theeluu"})
              </h2>
            </div>
          </div>
        </div>

        {/* 画像：モバイル=95vwフロー / デスクトップ=80vh中央背景 */}
        <div
          aria-hidden="true"
          className="md:[grid-area:1/1] md:z-0 md:flex md:items-center md:justify-center"
        >
          <div className="relative aspect-[360/274] overflow-hidden w-[95vw] mx-auto md:w-auto md:mx-0 md:h-[80vh]">
            {thumbnailContent}
          </div>
        </div>

        {/* リンク＋Sound 切替：モバイル=画像下1グリッド後フロー / デスクトップ=下寄せオーバーレイ */}
        <div className="mt-[var(--grid-row)] md:mt-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none md:flex md:flex-col md:justify-end md:pb-[34px]">
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
              <span
                className="link_co flex items-center gap-2 whitespace-nowrap"
                aria-disabled="true"
              >
                <ScrambleText text="Sound Cloud" mode="lap" speedMs={40} durationMs={400} />
                <Image src="/icon-hicard.svg" alt="" width={9} height={9} className="link_co-icon" />
              </span>
              <span
                className="link_co flex items-center gap-2 whitespace-nowrap"
                aria-disabled="true"
              >
                <ScrambleText text="Instagram" mode="lap" speedMs={40} durationMs={400} />
                <Image src="/icon-hicard.svg" alt="" width={9} height={9} className="link_co-icon" />
              </span>
            </div>
            <div className="col-start-8 col-span-2 md:col-start-17 md:col-span-2 self-end">
              <SoundToggle />
            </div>
          </div>
        </div>

        {/* クレジット：モバイル=2グリッド後 col3スタート / デスクトップ=row8 col14オーバーレイ */}
        <div className="mt-[calc(2*var(--grid-row))] pb-[34px] md:mt-0 md:pb-0 md:[grid-area:1/1] relative md:z-10 md:pointer-events-none">
          <div className="layout-grid md:items-start pointer-events-none">

            {/* subgridコンテナ：モバイル=col3から5列 / デスクトップ=col14から5列 row8 */}
            <div className="col-start-3 col-span-7 md:col-span-5 md:col-start-14 md:[grid-row-start:8] grid [grid-template-columns:subgrid] gap-y-0 content-start">
              {credits.map((label, i) => (
                <Fragment key={label}>
                  <p className="col-span-3 md:col-span-2">{label}</p>
                  <p className="col-span-4 md:col-span-3">{creditNames[i]}</p>
                </Fragment>
              ))}
            </div>

            {/* next リンク */}
            <div className="col-start-3 col-span-5 mt-[var(--grid-row)] md:mt-0 md:col-start-16 md:col-span-3 md:[grid-row-start:24] pointer-events-auto">
              <Link
                href={data?.nextId ? `/works/${data.nextId}` : "/works"}
                className="hover:opacity-70 transition-opacity inline-flex items-center gap-2"
              >
                <Image src="/arrow-down.svg" alt="" width={9} height={9} />
                next
              </Link>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
