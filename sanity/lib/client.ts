import { createClient } from "next-sanity";

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-02-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const hasProjectId = Boolean(projectId);

export const client = hasProjectId
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    })
  : null;
