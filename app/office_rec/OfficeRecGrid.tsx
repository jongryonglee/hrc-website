"use client";

import { useCallback } from "react";
import { ContentGrid, type GridItem } from "../components/ContentGrid";

const STORAGE_CRT_FROM_OFFICE_REC_LIST = "officeRecDetailCrtFromOfficeRecList";

export function OfficeRecGrid({ items }: { items: GridItem[] }) {
  const handleBeforeNavigate = useCallback((_href: string, key: string) => {
    try {
      sessionStorage.setItem(STORAGE_CRT_FROM_OFFICE_REC_LIST, key);
    } catch {
      /* private mode 等 */
    }
  }, []);

  return (
    <ContentGrid
      items={items}
      showMask
      rounded
      muxHoverCrt
      dimOtherItemsOnHover
      onBeforeNavigate={handleBeforeNavigate}
    />
  );
}
