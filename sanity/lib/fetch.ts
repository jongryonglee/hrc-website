import { client, hasProjectId } from "./client";

/**
 * Sanity 取得を一本化（未設定・失敗時は fallback）
 */
export async function fetchSanityOr<T>(
  query: string,
  fallback: T,
  params?: Record<string, unknown>,
): Promise<T> {
  if (!hasProjectId || !client) return fallback;
  try {
    return (await client.fetch(query, params ?? {})) as T;
  } catch {
    return fallback;
  }
}
