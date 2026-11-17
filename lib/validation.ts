import { z } from "zod";

/**
 * Foto boleh berupa URL http(s) atau hasil upload lokal (/uploads/...).
 * Path traversal dan skema lain ditolak.
 */
export const imageValueSchema = z
  .string()
  .trim()
  .min(1, "Foto produk wajib diisi.")
  .max(2048, "Path foto terlalu panjang.")
  .refine((value) => {
    if (value.startsWith("/uploads/")) {
      return !value.includes("..") && /^\/uploads\/[A-Za-z0-9._-]+$/.test(value);
    }

    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Foto harus berupa URL http(s) atau file upload yang valid.");

export const productFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama produk minimal 2 karakter.")
    .max(120, "Nama produk maksimal 120 karakter."),
  categoryId: z
    .string()
    .trim()
    .min(1, "Kategori wajib dipilih.")
    .max(64, "Kategori tidak valid."),
  price: z.coerce
    .number()
    .int("Harga harus bilangan bulat.")
    .min(0, "Harga tidak boleh negatif.")
    .max(1_000_000_000, "Harga terlalu besar."),
  description: z
    .string()
    .trim()
    .max(2000, "Deskripsi maksimal 2000 karakter."),
  featured: z.boolean(),
  available: z.boolean(),
});

export const productInputSchema = productFieldsSchema.extend({
  image: imageValueSchema,
});

export type ProductInput = z.infer<typeof productInputSchema>;

export const productIdSchema = z
  .string()
  .trim()
  .min(1, "ID produk wajib diisi.")
  .max(64, "ID produk tidak valid.");

export const categoryFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama kategori minimal 2 karakter.")
    .max(80, "Nama kategori maksimal 80 karakter."),
  description: z
    .string()
    .trim()
    .max(300, "Deskripsi kategori maksimal 300 karakter."),
  sortOrder: z.coerce
    .number()
    .int("Urutan harus bilangan bulat.")
    .min(0, "Urutan tidak boleh negatif.")
    .max(999, "Urutan maksimal 999."),
});

export const categoryIdSchema = z
  .string()
  .trim()
  .min(1, "ID kategori wajib diisi.")
  .max(64, "ID kategori tidak valid.");

export const legacyProductSchema = z.object({
  id: z.string().trim().min(1).max(64),
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(1).max(80),
  price: z.coerce.number().int().min(0).max(1_000_000_000),
  description: z.string().trim().max(2000).default(""),
  image: imageValueSchema,
  featured: z.boolean(),
  available: z.boolean(),
});

export const legacyProductsSchema = z
  .array(legacyProductSchema)
  .min(1, "Tidak ada produk untuk diimpor.")
  .max(500, "Maksimal 500 produk sekali impor.");

export function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "form";
    fields[key] = [...(fields[key] ?? []), issue.message];
  }

  return fields;
}
