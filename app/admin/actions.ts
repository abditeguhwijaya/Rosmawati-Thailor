"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { ActionResult, AdminSnapshot } from "@/lib/action-result";
import { getActionAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getCategories, getProducts } from "@/lib/products";
import { slugify } from "@/lib/slug";
import { deleteProductImage, saveProductImage, validateImageFile } from "@/lib/upload";
import {
  imageValueSchema,
  legacyProductsSchema,
  productFieldsSchema,
  productIdSchema,
  toFieldErrors,
} from "@/lib/validation";

const SESSION_EXPIRED_MESSAGE =
  "Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.";

/**
 * Semua server action mutasi wajib melewati guard ini. Memeriksa cookie saja
 * tidak cukup; session divalidasi ke database.
 */
async function requireActionAdmin(): Promise<ActionResult | null> {
  const admin = await getActionAdmin();
  if (admin) return null;

  return { ok: false, message: SESSION_EXPIRED_MESSAGE };
}

function revalidateCatalog() {
  revalidatePath("/", "layout");
}

/**
 * Mengambil data admin terbaru setelah mutasi. Hasilnya dikirim balik ke
 * client agar tabel diperbarui langsung tanpa bergantung pada router.refresh().
 */
async function adminSnapshot(): Promise<AdminSnapshot> {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return { products, categories };
}

async function uniqueProductSlug(
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(name) || `produk-${Date.now()}`;
  let candidate = base;

  for (let attempt = 2; attempt < 100; attempt += 1) {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${attempt}`;
  }

  return `${base}-${randomUUID().slice(0, 8)}`;
}

async function categoryForName(name: string) {
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return existing;

  const base = slugify(name) || `kategori-${Date.now()}`;
  let slug = base;

  for (let attempt = 2; attempt < 100; attempt += 1) {
    const found = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!found) break;
    slug = `${base}-${attempt}`;
  }

  return prisma.category.create({ data: { name, slug } });
}

function readProductFields(formData: FormData) {
  return productFieldsSchema.safeParse({
    name: formData.get("name") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    price: formData.get("price") ?? "",
    description: formData.get("description") ?? "",
    featured: formData.get("featured") === "on",
    available: formData.get("available") === "on",
  });
}

/**
 * Menentukan gambar dari file upload atau URL. File baru langsung divalidasi
 * isi binernya; penyimpanan dilakukan setelah field lain lolos validasi.
 */
async function resolveImage(formData: FormData, currentImage?: string) {
  const file = formData.get("imageFile");
  const hasFile = file instanceof File && file.size > 0;

  if (hasFile) {
    const validation = await validateImageFile(file);
    if (!validation.ok) {
      return {
        ok: false as const,
        message: validation.message,
        fieldErrors: { image: [validation.message] },
      };
    }

    return { ok: true as const, file, image: currentImage ?? "" };
  }

  const rawImage = String(formData.get("image") ?? "").trim();
  const parsed = imageValueSchema.safeParse(rawImage || currentImage || "");

  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Foto produk wajib diisi dengan URL atau file upload.",
      fieldErrors: { image: [parsed.error.issues[0]?.message ?? "Foto tidak valid."] },
    };
  }

  return { ok: true as const, file: null, image: parsed.data };
}

export async function createProductAction(
  formData: FormData,
): Promise<ActionResult> {
  const unauthorized = await requireActionAdmin();
  if (unauthorized) return unauthorized;

  const fields = readProductFields(formData);

  if (!fields.success) {
    return {
      ok: false,
      message: "Periksa kembali data produk.",
      fieldErrors: toFieldErrors(fields.error),
    };
  }

  const image = await resolveImage(formData);
  if (!image.ok) {
    return {
      ok: false,
      message: image.message,
      fieldErrors: image.fieldErrors,
    };
  }

  let savedImage: string | null = null;

  try {
    const category = await prisma.category.findUnique({
      where: { id: fields.data.categoryId },
      select: { id: true },
    });

    if (!category) {
      return {
        ok: false,
        message: "Kategori tidak ditemukan.",
        fieldErrors: { categoryId: ["Pilih kategori yang tersedia."] },
      };
    }

    const imageUrl = image.file
      ? await saveProductImage(image.file)
      : image.image;
    if (image.file) savedImage = imageUrl;

    const slug = await uniqueProductSlug(fields.data.name);

    const product = await prisma.product.create({
      data: {
        slug,
        name: fields.data.name,
        categoryId: fields.data.categoryId,
        price: fields.data.price,
        description: fields.data.description,
        image: imageUrl,
        featured: fields.data.featured,
        status: fields.data.available ? "AVAILABLE" : "UNAVAILABLE",
      },
    });

    revalidateCatalog();
    return {
      ok: true,
      message: "Produk berhasil ditambahkan.",
      id: product.id,
      ...(await adminSnapshot()),
    };
  } catch (error) {
    if (savedImage) await deleteProductImage(savedImage);
    console.error("createProductAction:", error);
    return {
      ok: false,
      message: "Produk gagal disimpan. Silakan coba lagi.",
    };
  }
}

export async function updateProductAction(
  formData: FormData,
): Promise<ActionResult> {
  const unauthorized = await requireActionAdmin();
  if (unauthorized) return unauthorized;

  const id = productIdSchema.safeParse(formData.get("id"));
  if (!id.success) {
    return { ok: false, message: "ID produk tidak valid." };
  }

  const fields = readProductFields(formData);
  if (!fields.success) {
    return {
      ok: false,
      message: "Periksa kembali data produk.",
      fieldErrors: toFieldErrors(fields.error),
    };
  }

  const existing = await prisma.product.findUnique({
    where: { id: id.data },
    select: { id: true, image: true },
  });

  if (!existing) {
    return { ok: false, message: "Produk tidak ditemukan." };
  }

  const image = await resolveImage(formData, existing.image);
  if (!image.ok) {
    return {
      ok: false,
      message: image.message,
      fieldErrors: image.fieldErrors,
    };
  }

  let savedImage: string | null = null;

  try {
    const category = await prisma.category.findUnique({
      where: { id: fields.data.categoryId },
      select: { id: true },
    });

    if (!category) {
      return {
        ok: false,
        message: "Kategori tidak ditemukan.",
        fieldErrors: { categoryId: ["Pilih kategori yang tersedia."] },
      };
    }

    const imageUrl = image.file
      ? await saveProductImage(image.file)
      : image.image;
    if (image.file) savedImage = imageUrl;

    await prisma.product.update({
      where: { id: existing.id },
      data: {
        name: fields.data.name,
        categoryId: fields.data.categoryId,
        price: fields.data.price,
        description: fields.data.description,
        image: imageUrl,
        featured: fields.data.featured,
        status: fields.data.available ? "AVAILABLE" : "UNAVAILABLE",
      },
    });

    if (savedImage && existing.image !== savedImage) {
      await deleteProductImage(existing.image);
    }

    revalidateCatalog();
    return {
      ok: true,
      message: "Produk berhasil diperbarui.",
      ...(await adminSnapshot()),
    };
  } catch (error) {
    if (savedImage) await deleteProductImage(savedImage);
    console.error("updateProductAction:", error);
    return {
      ok: false,
      message: "Perubahan gagal disimpan. Silakan coba lagi.",
    };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const unauthorized = await requireActionAdmin();
  if (unauthorized) return unauthorized;

  const parsedId = productIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, message: "ID produk tidak valid." };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: parsedId.data },
      select: { id: true, image: true },
    });

    if (!product) {
      return { ok: false, message: "Produk tidak ditemukan." };
    }

    await prisma.product.delete({ where: { id: product.id } });
    await deleteProductImage(product.image);

    revalidateCatalog();
    return {
      ok: true,
      message: "Produk berhasil dihapus.",
      ...(await adminSnapshot()),
    };
  } catch (error) {
    console.error("deleteProductAction:", error);
    return { ok: false, message: "Produk gagal dihapus." };
  }
}

export async function setProductAvailabilityAction(
  id: string,
  available: boolean,
): Promise<ActionResult> {
  const unauthorized = await requireActionAdmin();
  if (unauthorized) return unauthorized;

  const parsedId = productIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, message: "ID produk tidak valid." };
  }

  try {
    await prisma.product.update({
      where: { id: parsedId.data },
      data: { status: available ? "AVAILABLE" : "UNAVAILABLE" },
    });

    revalidateCatalog();
    return {
      ok: true,
      message: available
        ? "Produk ditandai tersedia."
        : "Produk ditandai tidak tersedia.",
      ...(await adminSnapshot()),
    };
  } catch (error) {
    console.error("setProductAvailabilityAction:", error);
    return { ok: false, message: "Status produk gagal diubah." };
  }
}

export async function setProductFeaturedAction(
  id: string,
  featured: boolean,
): Promise<ActionResult> {
  const unauthorized = await requireActionAdmin();
  if (unauthorized) return unauthorized;

  const parsedId = productIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, message: "ID produk tidak valid." };
  }

  try {
    await prisma.product.update({
      where: { id: parsedId.data },
      data: { featured },
    });

    revalidateCatalog();
    return {
      ok: true,
      message: featured
        ? "Produk ditandai unggulan."
        : "Produk tidak lagi unggulan.",
      ...(await adminSnapshot()),
    };
  } catch (error) {
    console.error("setProductFeaturedAction:", error);
    return { ok: false, message: "Status unggulan gagal diubah." };
  }
}

/**
 * Impor satu kali dari localStorage lama. Data divalidasi ulang di server;
 * kategori yang belum ada akan dibuat otomatis.
 */
export async function importLegacyProductsAction(
  payload: unknown,
): Promise<ActionResult> {
  const unauthorized = await requireActionAdmin();
  if (unauthorized) return unauthorized;

  const parsed = legacyProductsSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Data lama tidak valid dan tidak dapat diimpor.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  try {
    let imported = 0;

    for (const item of parsed.data) {
      const category = await categoryForName(item.category);
      const slug = slugify(item.id) || slugify(item.name) || `produk-${Date.now()}`;

      await prisma.product.upsert({
        where: { slug },
        update: {
          name: item.name,
          categoryId: category.id,
          price: item.price,
          description: item.description,
          image: item.image,
          featured: item.featured,
          status: item.available ? "AVAILABLE" : "UNAVAILABLE",
        },
        create: {
          slug,
          name: item.name,
          categoryId: category.id,
          price: item.price,
          description: item.description,
          image: item.image,
          featured: item.featured,
          status: item.available ? "AVAILABLE" : "UNAVAILABLE",
        },
      });

      imported += 1;
    }

    revalidateCatalog();
    return {
      ok: true,
      message: `${imported} produk lama berhasil diimpor ke database.`,
      ...(await adminSnapshot()),
    };
  } catch (error) {
    console.error("importLegacyProductsAction:", error);
    return {
      ok: false,
      message: "Impor gagal. Periksa data lama lalu coba lagi.",
    };
  }
}
