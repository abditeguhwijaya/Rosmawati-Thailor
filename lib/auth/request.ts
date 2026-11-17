import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Metadata request untuk audit session dan rate limit. IP disimpan sebagai
 * hash agar tidak menyimpan alamat IP mentah di database.
 */
export async function getRequestMeta(): Promise<{
  ipHash: string;
  userAgent: string | null;
}> {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const ip =
    forwardedFor ||
    requestHeaders.get("x-real-ip")?.trim() ||
    requestHeaders.get("cf-connecting-ip")?.trim() ||
    "unknown";

  return {
    ipHash: sha256(`ip:${ip}`),
    userAgent: requestHeaders.get("user-agent")?.slice(0, 500) ?? null,
  };
}
