import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  MAX_IMAGE_BYTES,
  validateImageFile,
  type ImageValidation,
} from "@/lib/image-validation";

export { MAX_IMAGE_BYTES, validateImageFile };
export type { ImageValidation };

/**
 * Menyimpan foto ke public/uploads dengan nama acak. Mengembalikan URL publik.
 * Catatan: penyimpanan lokal cocok untuk VPS/development; untuk platform
 * serverless, ganti dengan object storage pada fase produksi.
 */
export async function saveProductImage(file: File): Promise<string> {
  const validation = await validateImageFile(file);

  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${randomUUID()}.${validation.ext}`;
  await writeFile(path.join(uploadDir, filename), validation.buffer);

  return `/uploads/${filename}`;
}

/** Menghapus file upload lokal. URL eksternal tidak disentuh. */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  if (!imageUrl.startsWith("/uploads/")) return;

  const filename = path.basename(imageUrl);
  if (!/^[A-Za-z0-9._-]+$/.test(filename)) return;

  try {
    await unlink(path.join(process.cwd(), "public", "uploads", filename));
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "";
    if (code !== "ENOENT") {
      console.error("Gagal menghapus foto upload:", error);
    }
  }
}
