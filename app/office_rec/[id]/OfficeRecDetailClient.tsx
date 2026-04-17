"use client";

import type { OfficeRecDetailItem } from "@/app/lib/cmsTypes";
import { DetailLayout } from "../../components/DetailLayout";

const STORAGE_KEYS = {
  enter: "officeRecDetailEnterTransition",
  enterTargetId: "officeRecDetailEnterTargetId",
  crtFromList: "officeRecDetailCrtFromOfficeRecList",
  lock: "officeRecDetailNavLockUntil",
} as const;

type Props = {
  data: OfficeRecDetailItem | null;
};

export function OfficeRecDetailClient({ data }: Props) {
  return (
    <DetailLayout
      data={data}
      basePath="/office_rec"
      storageKeys={STORAGE_KEYS}
      links={[
        { label: "YouTube", url: data?.videoUrl },
        { label: "Sound Cloud", url: null },
        { label: "Instagram", url: null },
      ]}
      showCenterScrollHint
      renderInfo={(textAnim) => (
        <div
          className={`col-span-9 md:col-span-8 md:[grid-row-start:7] md:[grid-row-end:9] ${textAnim}`}
        >
          <p>(Office Rec) /</p>
          <h2 className="text-[26px] leading-tight md:text-[32px] mt-[17px]">
            {data?.title ?? "Vol.1 - Reunited"}
          </h2>
          <h2 className="text-[26px] leading-tight md:text-[32px]">
            {data?.artist ?? "takeisme"}
          </h2>
        </div>
      )}
    />
  );
}
