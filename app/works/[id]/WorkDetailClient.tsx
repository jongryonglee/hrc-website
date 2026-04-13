"use client";

import { Fragment } from "react";
import type { WorkCreditLine, WorkDetailItem } from "@/app/lib/cmsTypes";
import { DetailLayout } from "../../components/DetailLayout";

const FALLBACK_CREDITS: WorkCreditLine[] = [
  { label: "Prod.", name: "theeluu" },
  { label: "Directer", name: "Hikaru Jamie Masamiya" },
  { label: "Camera", name: "Shintaro Teramoto" },
  { label: "Camera assistant", name: "Kosei Yamazaki" },
  { label: "Color", name: "Hikaru Jamie Masamiya" },
  { label: "Flower Design", name: "ai" },
  { label: "Still Photography", name: "Fumiya Kawasaki" },
  { label: "Act", name: "Fumiya Kawasaki, Gino" },
  { label: "Styling", name: "Daichi Inamura (Intro)" },
  { label: "Make-up artist", name: "Rei" },
  { label: "Assistant", name: "Ikuya Sada" },
  { label: "Special Thanks", name: "KAKKY" },
  { label: "Lyric", name: "takeisme" },
  { label: "Beat", name: "theeluu" },
  { label: "Mix", name: "theeluu" },
  { label: "Mastering", name: "theeluu" },
];

const STORAGE_KEYS = {
  enter: "workDetailEnterTransition",
  enterTargetId: "workDetailEnterTargetId",
  crtFromList: "workDetailCrtFromWorksList",
  lock: "workDetailNavLockUntil",
} as const;

type Props = {
  data: WorkDetailItem | null;
};

export function WorkDetailClient({ data }: Props) {
  const creditLines =
    data?.credits && data.credits.length > 0 ? data.credits : FALLBACK_CREDITS;

  return (
    <DetailLayout
      data={data}
      basePath="/works"
      storageKeys={STORAGE_KEYS}
      sandstormEnterHoldMs={600}
      enableBackspaceNav
      showCenterScrollHint
      links={[
        { label: "YouTube", url: data?.videoUrl },
        { label: "Sound Cloud", url: data?.soundCloudUrl },
        { label: "Instagram", url: data?.instagramUrl },
      ]}
      soundToggleAudioSrc={
        data?.category === "sound-effect" ? data.soundUrl ?? null : null
      }
      renderInfo={(textAnim) => (
        <div
          className={`col-span-9 md:col-span-8 md:[grid-row-start:7] md:[grid-row-end:9] md:pointer-events-auto ${textAnim}`}
        >
          <p>
            Works /{" "}
            {data?.category === "sound-effect"
              ? "Sound Effect"
              : "Music Video"}{" "}
            /
          </p>
          <h2 className="text-[26px] leading-tight md:text-[32px]">
            {data?.title ?? "Saiwai / Takeisme"}
          </h2>
          <h2 className="text-[26px] leading-tight md:text-[32px]">
            (Prod.{data?.producer ?? "theeluu"})
          </h2>
        </div>
      )}
      renderCredits={(creditsAnim) => (
        <div
          className={`col-start-3 col-span-7 md:col-span-5 md:col-start-14 md:[grid-row-start:8] grid [grid-template-columns:subgrid] gap-y-0 content-start md:pointer-events-auto ${creditsAnim}`}
        >
          {creditLines.map((line, i) => (
            <Fragment key={line._key ?? `${line.label}-${i}`}>
              <p className="col-span-3 md:col-span-2">{line.label}</p>
              <p className="col-span-4 md:col-span-3">{line.name}</p>
            </Fragment>
          ))}
        </div>
      )}
    />
  );
}
