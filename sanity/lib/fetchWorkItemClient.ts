import type { WorkDetailItem } from "@/app/lib/cmsTypes";
import { client, hasProjectId } from "./client";
import { WORK_ITEM_QUERY } from "./queries";

/** ブラウザから呼ぶ（Prev/Next で RSC 遷移を避けるため） */
export async function fetchWorkItemByIdClient(
  id: string,
): Promise<WorkDetailItem | null> {
  if (!hasProjectId || !client) return null;
  try {
    return (await client.fetch(WORK_ITEM_QUERY, { id })) as WorkDetailItem | null;
  } catch {
    return null;
  }
}
