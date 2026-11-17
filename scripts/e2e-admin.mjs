/**
 * E2E admin: CRUD produk, upload gambar, toggle status, dan impor localStorage.
 * Memakai Edge/Chrome yang sudah terpasang (tanpa download browser).
 *
 * Prasyarat: `npm run db:start` dan server produksi di port 3100.
 * Jalankan: node scripts/e2e-admin.mjs
 */
import { existsSync } from "node:fs";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3100";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@rosmawatithailor.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const EDGE =
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const prisma = new PrismaClient();
const name = `Produk E2E ${Date.now()}`;
const legacyName = `Produk Lama E2E ${Date.now()}`;
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nGQAAAAASUVORK5CYII=",
  "base64",
);

let browser;
let passed = 0;
let failed = 0;

function check(label, condition) {
  if (condition) {
    passed += 1;
    console.log(`  OK   ${label}`);
  } else {
    failed += 1;
    console.error(`  FAIL ${label}`);
  }
}

async function login(page) {
  if (!ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_PASSWORD wajib diisi untuk E2E, mis. ADMIN_PASSWORD='...' npm run test:e2e",
    );
  }

  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Email admin").fill(ADMIN_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /Masuk ke studio/ }).click();
  await page.waitForURL(`${BASE}/admin`, { timeout: 20000 });
  await page.getByRole("heading", { name: /Selamat datang/i }).waitFor();
}

async function main() {
  await prisma.product.deleteMany({
    where: { name: { startsWith: "Produk E2E" } },
  });
  await prisma.product.deleteMany({
    where: { name: { startsWith: "Produk Lama E2E" } },
  });

  const executablePath = [EDGE, CHROME].find((candidate) =>
    existsSync(candidate),
  );

  browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("dialog", (dialog) => dialog.accept());

  console.log("0. Login administrator");
  await login(page);
  check("login berhasil", page.url().endsWith("/admin"));

  console.log("1. Buka dashboard admin");
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Selamat datang/i }).waitFor();
  check("dashboard tampil", true);
  check(
    "produk seed tampil",
    await page.getByRole("cell", { name: /Kebaya Amara/ }).count() > 0,
  );

  console.log("2. Tambah produk + upload gambar");
  await page.getByRole("button", { name: "Tambah produk" }).first().click();
  await page.getByLabel("Nama produk").fill(name);
  await page.getByLabel("Kategori").selectOption({ label: "Dress" });
  await page.getByLabel("Harga (Rp)").fill("777000");
  await page
    .getByLabel("Upload foto")
    .setInputFiles({ name: "e2e.png", mimeType: "image/png", buffer: png });
  await page.getByLabel("Deskripsi").fill("Produk untuk pengujian E2E.");
  await page.getByRole("button", { name: "Simpan produk" }).click();

  await page.getByText("Produk berhasil ditambahkan.").waitFor();
  check("notifikasi tambah tampil", true);
  const row = page.getByRole("row", { name: new RegExp(name) });
  await row.waitFor();
  check("produk baru muncul di tabel", (await row.count()) > 0);
  check("harga tampil", (await row.innerText()).includes("777.000"));

  const imageSrc = await row.locator("img").getAttribute("src");
  check("foto memakai /uploads/", Boolean(imageSrc?.startsWith("/uploads/")));
  const imageResponse = imageSrc
    ? await page.request.get(`${BASE}${imageSrc}`)
    : null;
  check("foto upload dapat diakses", imageResponse?.status() === 200);
  check(
    "content-type foto benar",
    Boolean(imageResponse?.headers()["content-type"]?.includes("image/png")),
  );

  console.log("3. Edit produk");
  await page.getByRole("button", { name: `Edit ${name}` }).click();
  await page.getByLabel("Harga (Rp)").fill("888000");
  await page.getByRole("button", { name: "Simpan produk" }).click();
  await page.getByText("Produk berhasil diperbarui.").waitFor();
  await page
    .getByRole("row", { name: new RegExp(name) })
    .filter({ hasText: "888.000" })
    .waitFor();
  check(
    "harga berubah setelah edit",
    (await page.getByRole("row", { name: new RegExp(name) }).innerText()).includes(
      "888.000",
    ),
  );

  console.log("4. Toggle unggulan & ketersediaan");
  await page.getByRole("button", { name: `Jadikan ${name} unggulan` }).click();
  await page.getByText("Produk ditandai unggulan.").waitFor();
  check("produk menjadi unggulan", true);

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  check(
    "produk unggulan muncul di beranda",
    (await page.getByText(name).count()) > 0,
  );
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });

  await page.getByRole("button", { name: `Sembunyikan ${name} dari katalog` }).click();
  await page.getByText("Produk ditandai tidak tersedia.").waitFor();
  await page
    .getByRole("row", { name: new RegExp(name) })
    .filter({ hasText: "Disembunyikan" })
    .waitFor();
  check(
    "status berubah menjadi disembunyikan",
    (await page.getByRole("row", { name: new RegExp(name) }).innerText()).includes(
      "Disembunyikan",
    ),
  );

  console.log("5. Refleksi langsung ke katalog");
  await page.goto(`${BASE}/katalog`, { waitUntil: "networkidle" });
  check(
    "produk tersembunyi tidak muncul di katalog",
    (await page.getByText(name).count()) === 0,
  );
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: `Tampilkan ${name} di katalog` }).click();
  await page.getByText("Produk ditandai tersedia.").waitFor();
  await page.goto(`${BASE}/katalog`, { waitUntil: "networkidle" });
  check(
    "produk tersedia muncul di katalog",
    (await page.getByText(name).count()) > 0,
  );

  console.log("6. Impor data localStorage");
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, value),
    {
      key: "rosmawati-products",
      value: JSON.stringify([
        {
          id: `legacy-e2e-${Date.now()}`,
          name: legacyName,
          category: "Kebaya",
          price: 321000,
          description: "Data lama untuk pengujian impor.",
          image: "https://example.com/lama.jpg",
          featured: false,
          available: true,
        },
      ]),
    },
  );
  await page.reload({ waitUntil: "networkidle" });
  const importButton = page.getByRole("button", { name: /Impor 1 data lama/ });
  await importButton.waitFor();
  check("tombol impor mendeteksi data lama", (await importButton.count()) === 1);
  await importButton.click();
  await page.getByText("1 produk lama berhasil diimpor ke database.").waitFor();
  const legacyRow = page.getByRole("row", { name: new RegExp(legacyName) });
  await legacyRow.waitFor();
  check("produk lama masuk database", (await legacyRow.count()) > 0);
  await page
    .getByRole("button", { name: /Impor 1 data lama/ })
    .waitFor({ state: "detached" });

  console.log("7. Hapus produk uji");
  await page
    .getByRole("button", { name: `Hapus ${name}`, exact: true })
    .click();
  await page.getByText("Produk berhasil dihapus.").waitFor();
  await row.waitFor({ state: "detached" });
  check(
    "produk uji terhapus dari tabel",
    (await page.getByRole("row", { name: new RegExp(name) }).count()) === 0,
  );
  const imageAfterDelete = imageSrc
    ? await page.request.get(`${BASE}${imageSrc}`)
    : null;
  check("foto upload ikut terhapus", imageAfterDelete?.status() === 404);

  await page
    .getByRole("button", { name: `Hapus ${legacyName}`, exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: `Hapus ${legacyName}`, exact: true })
    .click();
  await page.getByText("Produk berhasil dihapus.").waitFor();
  await legacyRow.waitFor({ state: "detached" });

  check("tidak ada error JavaScript di halaman", pageErrors.length === 0);
  if (pageErrors.length > 0) console.error(pageErrors);

  console.log(`\n${passed}/${passed + failed} pemeriksaan E2E lulus.`);
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) await browser.close();

    // Bersihkan produk uji yang tersisa beserta file upload-nya, supaya
    // kegagalan di tengah jalan tidak meninggalkan data/file yatim.
    const where = {
      OR: [
        { name: { startsWith: "Produk E2E" } },
        { name: { startsWith: "Produk Lama E2E" } },
      ],
    };
    const leftovers = await prisma.product.findMany({
      where,
      select: { image: true },
    });

    await prisma.product.deleteMany({ where });

    for (const product of leftovers) {
      if (!product.image.startsWith("/uploads/")) continue;

      try {
        await unlink(
          path.join(
            process.cwd(),
            "public",
            "uploads",
            path.basename(product.image),
          ),
        );
      } catch {
        // File mungkin sudah terhapus; abaikan.
      }
    }

    await prisma.$disconnect();
  });
