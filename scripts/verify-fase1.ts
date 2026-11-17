/**
 * Verifikasi Fase 1: database, validasi Zod, dan deteksi file gambar.
 * Jalankan dengan database lokal aktif:
 *   npx tsx scripts/verify-fase1.ts
 */
import { PrismaClient } from "@prisma/client";
import {
  legacyProductsSchema,
  productInputSchema,
} from "../lib/validation";
import { MAX_IMAGE_BYTES, validateImageFile } from "../lib/image-validation";

const prisma = new PrismaClient();
let failures = 0;
let checks = 0;

function check(name: string, condition: boolean, detail?: string) {
  checks += 1;
  if (condition) {
    console.log(`  OK   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function main() {
  console.log("1. Data seed");
  const products = await prisma.product.findMany({ include: { category: true } });
  const categories = await prisma.category.findMany();
  const boutique = await prisma.boutiqueInfo.findUnique({ where: { id: "main" } });

  check("minimal 6 produk seed", products.length >= 6, `ditemukan ${products.length}`);
  check("minimal 7 kategori seed", categories.length >= 7, `ditemukan ${categories.length}`);
  check(
    "semua produk memiliki kategori",
    products.every((product) => Boolean(product.category?.name)),
  );
  check("informasi butik tersedia", Boolean(boutique?.name));

  console.log("2. Validasi input produk");
  const category = categories[0];
  const baseInput = {
    name: "Produk Verifikasi",
    categoryId: category.id,
    price: 125000,
    description: "Deskripsi verifikasi.",
    image: "https://example.com/foto.jpg",
    featured: false,
    available: true,
  };

  check("input valid diterima", productInputSchema.safeParse(baseInput).success);
  check(
    "harga negatif ditolak",
    !productInputSchema.safeParse({ ...baseInput, price: -1 }).success,
  );
  check(
    "harga desimal ditolak",
    !productInputSchema.safeParse({ ...baseInput, price: 10.5 }).success,
  );
  check(
    "URL javascript ditolak",
    !productInputSchema.safeParse({
      ...baseInput,
      image: "javascript:alert(1)",
    }).success,
  );
  check(
    "path traversal ditolak",
    !productInputSchema.safeParse({
      ...baseInput,
      image: "/uploads/../rahasia.png",
    }).success,
  );
  check(
    "nama kosong ditolak",
    !productInputSchema.safeParse({ ...baseInput, name: " " }).success,
  );

  console.log("3. CRUD database");
  const slug = `verify-${Date.now()}`;
  const created = await prisma.product.create({
    data: {
      slug,
      name: "Produk Verifikasi",
      description: "Dibuat oleh skrip verifikasi.",
      price: 125000,
      image: "https://example.com/foto.jpg",
      status: "AVAILABLE",
      featured: false,
      categoryId: category.id,
    },
  });
  check("create produk", Boolean(created.id));

  const updated = await prisma.product.update({
    where: { id: created.id },
    data: { price: 234000, status: "UNAVAILABLE", featured: true },
  });
  check(
    "update produk",
    updated.price === 234000 &&
      updated.status === "UNAVAILABLE" &&
      updated.featured,
  );

  let duplicateRejected = false;
  try {
    await prisma.product.create({
      data: {
        slug,
        name: "Duplikat",
        description: "",
        price: 1,
        image: "https://example.com/x.jpg",
        categoryId: category.id,
      },
    });
  } catch {
    duplicateRejected = true;
  }
  check("slug duplikat ditolak database", duplicateRejected);

  await prisma.product.delete({ where: { id: created.id } });
  const deleted = await prisma.product.findUnique({ where: { id: created.id } });
  check("delete produk", deleted === null);

  console.log("4. Validasi file gambar");
  const jpeg = new File(
    [new Uint8Array([0xff, 0xd8, 0xff, 0xdb, 0, 0, 0, 0])],
    "foto.jpg",
    { type: "image/jpeg" },
  );
  const jpegResult = await validateImageFile(jpeg);
  check("JPEG asli diterima", jpegResult.ok);

  const fakePng = new File([new Uint8Array([0x3c, 0x73, 0x76, 0x67])], "palsu.png", {
    type: "image/png",
  });
  const fakeResult = await validateImageFile(fakePng);
  check("file non-gambar ditolak", !fakeResult.ok);

  const wrongMime = new File(
    [new Uint8Array([0xff, 0xd8, 0xff, 0xdb, 0, 0, 0, 0])],
    "foto.png",
    { type: "image/png" },
  );
  const wrongMimeResult = await validateImageFile(wrongMime);
  check("MIME tidak cocok ditolak", !wrongMimeResult.ok);

  const oversize = new File(
    [new Uint8Array(MAX_IMAGE_BYTES + 1)],
    "besar.jpg",
    { type: "image/jpeg" },
  );
  const oversizeResult = await validateImageFile(oversize);
  check("file melebihi 5 MB ditolak", !oversizeResult.ok);

  console.log("5. Payload impor localStorage");
  const legacyPayload = [
    {
      id: "legacy-verify",
      name: "Produk Lama",
      category: "Kebaya",
      price: 500000,
      description: "Data lama.",
      image: "https://example.com/lama.jpg",
      featured: false,
      available: true,
    },
  ];
  check(
    "payload lama valid diterima",
    legacyProductsSchema.safeParse(legacyPayload).success,
  );
  check(
    "payload lama rusak ditolak",
    !legacyProductsSchema.safeParse([{ ...legacyPayload[0], price: "abc" }])
      .success,
  );

  await prisma.product.deleteMany({ where: { slug: { startsWith: "verify-" } } });
  await prisma.product.deleteMany({ where: { slug: "legacy-verify" } });

  console.log(`\n${checks - failures}/${checks} pemeriksaan lulus.`);
  if (failures > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
