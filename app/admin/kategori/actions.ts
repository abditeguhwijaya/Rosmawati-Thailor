"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/action-result";
import { getActionAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getCategories, getProducts } from "@/lib/products";
import { slugify } from "@/lib/slug";
import {
  categoryFieldsSchema,
  categoryIdSchema,
  toFieldErrors,
} from "@/lib/validation";

const SESSION_EXPIRED_MESSAGE =
  "Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.";

/** Guard yang sama dengan aksi produk: session divalidasi ke database. */
async function requireActionAdmin(): Promise<ActionResult | null> {
  const admin = await getActionAdmin();
  if (admin) return null;

  return { ok: false, message: SESSION_EXPIRED_MESSAGE };
}

/** Snapshot terbaru dikirim balik ke client agar tabel diperbarui tanpa reload. */
async function adminSnapshot() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return { products, categories };
}

async function uniqueCategorySlug(
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(name) || `kategori-${Date.now()}`;
  let candidate = base;

  for (let attempt = 2; attempt < 100; attempt += 1) {
    const existing = await prisma.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${attempt}`;
  }

  return `${base}-${randomUUID().slice(0, 8)}`;
}

function readCategoryFields(formData: FormData) {
  return categoryFieldsSchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    sortOrder: formData.get("sortOrder") ?? 0,
  });
}

export async function createCategoryAction(
  formData: FormData,
): Promise<ActionResult> {
  const unauthorized = await requireActionAdmin();
  if (unauthorized) return unauthorized;

  const fields = readCategoryFields(formData);

  if (!fields.success) {
    return {
      ok: false,
      message: "Periksa kembali data kategori.",
      fieldErrors: toFieldErrors(fields.error),
    };
  }

  try {
    const nameTaken = await prisma.category.findUnique({
      where: { name: fields.data.name },
      select: { id: true },
    });

    if (nameTaken) {
      return {
        ok: false,
        message: "Kategori dengan nama itu sudah ada.",
        fieldErrors: { name: ["Kategori dengan nama itu sudah ada."] },
      };
    }

    const slug = await uniqueCategorySlug(fields.data.name);

    const category = await prisma.category.create({
      data: {
        name: fields.data.name,
        slug,
        description: fields.data.description || null,
        sortOrder: fields.data.sortOrder,
      },
    });

    revalidatePath("/", "layout");

    return {
      ok: true,
      message: "Kategori berhasil ditambahkan.",
      id: category.id,
      ...(await adminSnapshot()),
    };
  } catch (error) {
    console.error("createCategoryAction:", error);
    return {
      ok: false,
      message: "Kategori gagal disimpan. Silakan coba lagi.",
    };
  }
}

export async function updateCategoryAction(
  formData: FormData,
): Promise<ActionResult> {
  const unauthorized = await requireActionAdmin();
  if (unauthorized) return unauthorized;

  const id = categoryIdSchema.safeParse(formData.get("id"));
  if (!id.success) {
    return { ok: false, message: "ID kategori tidak valid." };
  }

  const fields = readCategoryFields(formData);

  if (!fields.success) {
    return {
      ok: false,
      message: "Periksa kembali data kategori.",
      fieldErrors: toFieldErrors(fields.error),
    };
  }

  try {
    const existing = await prisma.category.findUnique({
      where: { id: id.data },
      select: { id: true, name: true, slug: true },
    });

    if (!existing) {
      return { ok: false, message: "Kategori tidak ditemukan." };
    }

    if (fields.data.name !== existing.name) {
      const nameTaken = await prisma.category.findUnique({
        where: { name: fields.data.name },
        select: { id: true },
      });

      if (nameTaken && nameTaken.id !== existing.id) {
        return {
          ok: false,
          message: "Kategori dengan nama itu sudah ada.",
          fieldErrors: { name: ["Kategori dengan nama itu sudah ada."] },
        };
      }
    }

    // Slug diperbarui hanya bila nama berubah; relasi produk tetap aman
    // karena koneksi memakai id kategori, bukan slug.
    const slug =
      slugify(fields.data.name) === existing.slug
        ? existing.slug
        : await uniqueCategorySlug(fields.data.name, existing.id);

    await prisma.category.update({
      where: { id: existing.id },
      data: {
        name: fields.data.name,
        slug,
        description: fields.data.description || null,
        sortOrder: fields.data.sortOrder,
      },
    });

    revalidatePath("/", "layout");

    return {
      ok: true,
      message: "Kategori berhasil diperbarui.",
      ...(await adminSnapshot()),
    };
  } catch (error) {
    console.error("updateCategoryAction:", error);
    return {
      ok: false,
      message: "Perubahan kategori gagal disimpan. Silakan coba lagi.",
    };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const unauthorized = await requireActionAdmin();
  if (unauthorized) return unauthorized;

  const parsedId = categoryIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, message: "ID kategori tidak valid." };
  }

  try {
    const existing = await prisma.category.findUnique({
      where: { id: parsedId.data },
      include: { _count: { select: { products: true } } },
    });

    if (!existing) {
      return { ok: false, message: "Kategori tidak ditemukan." };
    }

    // Skema Prisma memakai onDelete: Restrict — jangan pernah membiarkan
    // kategori terpakai ikut terhapus dan merusak data produk.
    if (existing._count.products > 0) {
      return {
        ok: false,
        message: `Kategori masih digunakan oleh ${existing._count.products} produk. Pindahkan atau hapus produk terkait terlebih dahulu.`,
      };
    }

    await prisma.category.delete({ where: { id: existing.id } });

    revalidatePath("/", "layout");

    return {
      ok: true,
      message: "Kategori berhasil dihapus.",
      ...(await adminSnapshot()),
    };
  } catch (error) {
    console.error("deleteCategoryAction:", error);
    return { ok: false, message: "Kategori gagal dihapus." };
  }
}
