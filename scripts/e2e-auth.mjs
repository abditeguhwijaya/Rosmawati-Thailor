
/**
 * E2E keamanan admin Rosmawati Thailor.
 *
 * Pengujian:
 * 1. Redirect pengunjung tanpa login.
 * 2. Halaman login.
 * 3. Login dengan password salah.
 * 4. Login dengan password benar.
 * 5. Cookie session.
 * 6. API dengan session.
 * 7. Logout.
 * 8. API tanpa session.
 * 9. Session kedaluwarsa.
 * 10. Login tanpa penguncian setelah beberapa kali gagal.
 * 11. Halaman ganti password.
 *
 * Prasyarat:
 * - Database lokal aktif.
 * - Server berjalan di port 3100.
 * - ADMIN_EMAIL dan ADMIN_PASSWORD_HASH tersedia.
 * - ADMIN_PASSWORD diisi melalui environment terminal.
 *
 * Script hanya boleh dijalankan pada localhost.
 */

import { createHash, randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { chromium } from "playwright-core";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3100";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ?? "admin@rosmawatithailor.com"
).trim().toLowerCase();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const COOKIE_NAME = "rosmawati_admin_session";

const EDGE =
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const prisma = new PrismaClient();

let browser;
let passed = 0;
let failed = 0;
let expiredTokenHash = null;

function check(label, condition) {
  if (condition) {
    passed += 1;
    console.log(`  OK   ${label}`);
  } else {
    failed += 1;
    console.error(`  FAIL ${label}`);
  }
}

async function openLogin(page) {
  await page.goto(`${BASE}/admin/login`, {
    waitUntil: "networkidle",
  });

  await page
    .getByRole("heading", { name: "Masuk ke akun" })
    .waitFor();
}

async function fillLogin(page, password) {
  const emailField = page.getByLabel("Email admin");

  const passwordField = page.getByLabel("Password", {
    exact: true,
  });

  if ((await emailField.inputValue()) === "") {
    await emailField.fill(ADMIN_EMAIL);
  }

  await passwordField.fill(password);

  await page
    .getByRole("button", { name: /Masuk ke studio/ })
    .click();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function login(page, password = ADMIN_PASSWORD) {
  await openLogin(page);
  await fillLogin(page, password);

  await page.waitForURL(`${BASE}/admin`, {
    timeout: 20000,
  });

  await page
    .getByRole("heading", { name: /Selamat datang/i })
    .waitFor();
}

async function logout(page) {
  await page
    .getByRole("button", { name: "Keluar" })
    .click();

  await page.waitForURL(/\/admin\/login/, {
    timeout: 15000,
  });
}

async function main() {
  if (!ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_PASSWORD wajib diisi melalui environment terminal.",
    );
  }

  const baseUrl = new URL(BASE);

  if (
    !["localhost", "127.0.0.1", "::1"].includes(
      baseUrl.hostname,
    )
  ) {
    throw new Error(
      "E2E auth hanya boleh dijalankan pada localhost.",
    );
  }

  const executablePath = [EDGE, CHROME].find((candidate) =>
    existsSync(candidate),
  );

  if (!executablePath) {
    throw new Error(
      "Microsoft Edge atau Google Chrome tidak ditemukan.",
    );
  }

  browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  const page = await browser.newPage();

  const pageErrors = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  // ==================================================
  // 1. PENGUNJUNG TANPA LOGIN
  // ==================================================

  console.log("\n1. Pengunjung membuka /admin tanpa login");

  const initialAdmin = await page.request.get(
    `${BASE}/admin`,
    { maxRedirects: 0 },
  );

  check(
    "request /admin dialihkan",
    [302, 303, 307, 308].includes(initialAdmin.status()),
  );

  check(
    "redirect mengarah ke /admin/login",
    (initialAdmin.headers().location ?? "").includes(
      "/admin/login",
    ),
  );

  // ==================================================
  // 2. HALAMAN LOGIN
  // ==================================================

  console.log("\n2. Halaman login dapat diakses");

  await openLogin(page);

  check(
    "form login tampil",
    (await page.getByLabel("Email admin").count()) === 1,
  );

  check(
    "tombol tampil/sembunyikan password tersedia",
    (
      await page
        .getByRole("button", {
          name: "Tampilkan password",
        })
        .count()
    ) === 1,
  );

  // ==================================================
  // 3. LOGIN PASSWORD SALAH
  // ==================================================

  console.log("\n3. Login dengan password salah");

  await fillLogin(page, "password-yang-pasti-salah");

  await page
    .getByText("Email atau password salah.")
    .waitFor();

  check("pesan error generik tampil", true);

  check(
    "tetap di halaman login",
    page.url().includes("/admin/login"),
  );

  // ==================================================
  // 4. LOGIN PASSWORD BENAR
  // ==================================================

  console.log("\n4. Login dengan kredensial benar");

  await page
    .getByLabel("Password", { exact: true })
    .fill(ADMIN_PASSWORD);

  await page
    .getByRole("button", { name: /Masuk ke studio/ })
    .click();

  await page.waitForURL(`${BASE}/admin`, {
    timeout: 20000,
  });

  await page
    .getByRole("heading", { name: /Selamat datang/i })
    .waitFor();

  check("redirect ke /admin berhasil", true);

  // ==================================================
  // 5. COOKIE SESSION
  // ==================================================

  console.log("\n5. Pemeriksaan cookie session");

  const cookies = await page.context().cookies();

  const sessionCookie = cookies.find(
    (cookie) => cookie.name === COOKIE_NAME,
  );

  check("cookie session dibuat", Boolean(sessionCookie));

  check(
    "cookie HttpOnly",
    sessionCookie?.httpOnly === true,
  );

  check(
    "cookie SameSite=Lax",
    String(sessionCookie?.sameSite).toLowerCase() === "lax",
  );

  check(
    "cookie path /",
    sessionCookie?.path === "/",
  );

  check(
    "cookie memiliki masa berlaku",
    typeof sessionCookie?.expires === "number" &&
      sessionCookie.expires > Date.now() / 1000,
  );

  check(
    "cookie Secure mengikuti environment",
    baseUrl.protocol === "https:"
      ? sessionCookie?.secure === true
      : sessionCookie?.secure === false,
  );

  // ==================================================
  // 6. API DENGAN SESSION
  // ==================================================

  console.log("\n6. API admin dengan session");

  const apiWithSession = await page.request.get(
    `${BASE}/api/admin/session`,
  );

  const apiSessionBody = await apiWithSession.json();

  check(
    "API session mengembalikan 200",
    apiWithSession.status() === 200,
  );

  check(
    "API session terautentikasi",
    apiSessionBody.authenticated === true,
  );

  // ==================================================
  // 7. LOGOUT
  // ==================================================

  console.log("\n7. Logout");

  await logout(page);

  await page
    .getByText("Anda telah keluar dari Admin Studio.")
    .waitFor();

  check("redirect ke login setelah logout", true);

  check(
    "cookie session dihapus",
    !(await page.context().cookies()).some(
      (cookie) => cookie.name === COOKIE_NAME,
    ),
  );

  // ==================================================
  // 8. API TANPA SESSION
  // ==================================================

  console.log("\n8. Akses API admin tanpa session");

  const apiWithoutSession = await page.request.get(
    `${BASE}/api/admin/session`,
  );

  check(
    "API tanpa session mengembalikan 401",
    apiWithoutSession.status() === 401,
  );

  const adminAfterLogout = await page.request.get(
    `${BASE}/admin`,
    { maxRedirects: 0 },
  );

  check(
    "/admin kembali dialihkan setelah logout",
    [302, 303, 307, 308].includes(
      adminAfterLogout.status(),
    ),
  );

  // ==================================================
  // 9. SESSION KEDALUWARSA
  // ==================================================

  console.log("\n9. Session kedaluwarsa");

  const admin = await prisma.adminUser.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (!admin) {
    throw new Error(
      "Akun admin tidak ditemukan. Periksa ADMIN_EMAIL.",
    );
  }

  const expiredToken = randomBytes(32).toString("base64url");

  expiredTokenHash = createHash("sha256")
    .update(`session:${expiredToken}`)
    .digest("hex");

  await prisma.adminSession.create({
    data: {
      tokenHash: expiredTokenHash,
      adminId: admin.id,
      expiresAt: new Date(Date.now() - 60_000),
    },
  });

  await page.context().addCookies([
    {
      name: COOKIE_NAME,
      value: expiredToken,
      url: BASE,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  const expiredAdmin = await page.request.get(
    `${BASE}/admin`,
    { maxRedirects: 0 },
  );

  check(
    "session kedaluwarsa dialihkan ke login",
    [302, 303, 307, 308].includes(
      expiredAdmin.status(),
    ) &&
      (expiredAdmin.headers().location ?? "").includes(
        "/admin/login",
      ),
  );

  check(
    "redirect menandai session berakhir",
    (expiredAdmin.headers().location ?? "").includes(
      "expired=1",
    ),
  );

  const expiredApi = await page.request.get(
    `${BASE}/api/admin/session`,
  );

  check(
    "API menolak session kedaluwarsa",
    expiredApi.status() === 401,
  );

  // Hapus hanya session kedaluwarsa buatan pengujian ini.
  await prisma.adminSession.deleteMany({
    where: { tokenHash: expiredTokenHash },
  });

  expiredTokenHash = null;

  await page.context().clearCookies();

  // ==================================================
  // 10. LOGIN TANPA LOCKOUT
  // ==================================================

  console.log("\n10. Login tanpa penguncian");

  await openLogin(page);

  // Lima kali password salah.
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    await fillLogin(page, "password-yang-pasti-salah");

    await page
      .getByText("Email atau password salah.")
      .waitFor();

    check(
      `percobaan salah ke-${attempt} ditolak`,
      page.url().includes("/admin/login"),
    );
  }

  // Password benar harus tetap bisa digunakan.
  await page
    .getByLabel("Password", { exact: true })
    .fill(ADMIN_PASSWORD);

  await page
    .getByRole("button", { name: /Masuk ke studio/ })
    .click();

  await page.waitForURL(`${BASE}/admin`, {
    timeout: 20000,
  });

  await page
    .getByRole("heading", { name: /Selamat datang/i })
    .waitFor();

  check(
    "password benar berhasil setelah 5 percobaan gagal",
    page.url().includes("/admin"),
  );

  // ==================================================
  // 11. HALAMAN GANTI PASSWORD
  // ==================================================

  console.log("\n11. Halaman ganti password");

  await page.goto(`${BASE}/admin/akun`, {
    waitUntil: "networkidle",
  });

  await page
    .getByRole("heading", { name: /Akun admin/i })
    .waitFor();

  check(
    "form ganti password tersedia",
    (await page.getByLabel("Password saat ini").count()) === 1 &&
      (await page.getByLabel("Password baru", {
        exact: true,
      }).count()) === 1 &&
      (await page.getByLabel("Ulangi password baru").count()) === 1,
  );

  await logout(page);

  // ==================================================
  // 12. ERROR JAVASCRIPT
  // ==================================================

  console.log("\n12. Pemeriksaan error JavaScript");

  check(
    "tidak ada error JavaScript di halaman",
    pageErrors.length === 0,
  );

  if (pageErrors.length > 0) {
    console.error(pageErrors);
  }

  console.log(
    `\n${passed}/${passed + failed} pemeriksaan E2E auth lulus.`,
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}

// ==================================================
// EKSEKUSI DAN PEMBERSIHAN AMAN
// ==================================================

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) {
      await browser.close();
    }

    // Hanya menghapus session kedaluwarsa yang dibuat
    // khusus oleh script pengujian ini.
    if (expiredTokenHash) {
      await prisma.adminSession.deleteMany({
        where: {
          tokenHash: expiredTokenHash,
        },
      });
    }

    // Tidak menghapus session admin lain.
    // Tidak menghapus seluruh riwayat login.
    // Tidak mengubah status akun admin secara massal.

    await prisma.$disconnect();
  });
