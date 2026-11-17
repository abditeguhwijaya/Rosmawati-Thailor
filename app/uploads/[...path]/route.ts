import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

/**
 * Menyajikan foto upload dari public/uploads. Diperlukan karena Next.js
 * produksi tidak selalu menyajikan file public yang ditambahkan setelah build.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;

  if (parts.length !== 1) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filename = parts[0];

  if (!/^[A-Za-z0-9._-]+$/.test(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const extension = path.extname(filename).slice(1).toLowerCase();
  const contentType = CONTENT_TYPES[extension];

  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await readFile(
      path.join(process.cwd(), "public", "uploads", filename),
    );

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(file.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
