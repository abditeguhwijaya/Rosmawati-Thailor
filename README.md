# Rosmawati Thailor

Website butik pakaian, jasa jahit, dan busana custom. Dibangun dengan Next.js App Router, TypeScript, React, PostgreSQL, dan CSS yang sudah ada.

Karakter visual: elegan, minimalis, feminin, modern, premium, dan nyaman digunakan.

## Status proyek

**Fase 2 selesai** — autentikasi admin dengan bcrypt, session database, cookie HttpOnly, proteksi `/admin` dan server action, rate limit login, serta halaman ganti password.

Sudah aktif:

- Login admin di `/admin/login` dengan email + password.
- Session database dengan masa berlaku (default 8 jam) dan logout.
- Proteksi halaman `/admin`, `/admin/akun`, API `/api/admin/*`, dan seluruh server action produk.
- Satu akun administrator yang dibuat dari `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH`.
- Ganti password dari `/admin/akun`; semua session lama diakhiri.
- Batas percobaan login (5 kali per akun, 10 kali per IP dalam 15 menit).

Yang masih dalam roadmap:

- Manajemen kategori dan informasi butik dari UI — **Fase 3**.
- Pencarian/pengurutan lanjutan di katalog — **Fase 4**.
- Pemulihan password mandiri via email — belum tersedia (sengaja, karena hanya satu admin).

> Dashboard `/admin` sekarang **wajib login**. Jangan bagikan kredensial admin dan selalu gunakan tombol **Keluar** pada perangkat bersama.

## Fitur saat ini

- Beranda editorial: hero, produk unggulan dari database, filosofi butik, kutipan.
- Katalog dengan filter kategori, harga, dan status ketersediaan.
- Detail produk dengan metadata dinamis, status ketersediaan, produk terkait, dan CTA WhatsApp.
- Login admin elegan dengan validasi, tampil/sembunyikan password, dan pesan error generik.
- Session admin: cookie HttpOnly, SameSite=Lax, Secure di production, masa berlaku, dan logout.
- Dashboard admin: statistik, tambah/edit/hapus produk, upload/URL gambar, toggle unggulan & ketersediaan.
- Ganti password admin dengan verifikasi password lama dan rotasi session.
- Rate limit login per akun dan per IP; detail error database tidak ditampilkan ke pengunjung.
- Impor sekali jalan dari data `localStorage` lama ke database.
- Validasi server-side dengan Zod dan validasi isi biner file gambar (magic bytes).
- Metadata per halaman, Open Graph, favicon, `robots.txt`, dan `sitemap.xml` dinamis.
- Header/footer responsif dengan navigasi yang accessible.
- Security headers dasar dan `X-Powered-By` dimatikan.
- Halaman error, loading, dan 404 yang sesuai.

## Menjalankan

1. Install Node.js LTS (disarankan >= 20.9).
2. Buka folder proyek ini di terminal.
3. Jalankan:

```bash
npm install
```

4. Salin `.env.example` menjadi `.env`, lalu sesuaikan bila perlu.
5. Buat hash password admin, lalu isi `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` di `.env`:

```bash
npm run admin:hash
```

6. Nyalakan database lokal (lihat bagian **Database lokal**).
7. Jalankan migrasi dan seed:

```bash
npm run db:deploy
npm run db:seed
```

8. Jalankan development server:

```bash
npm run dev
```

9. Buka `http://localhost:3000`, lalu login di `http://localhost:3000/admin/login`.

> Akun admin awal hanya dibuat sekali saat login pertama, ketika tabel `AdminUser` masih kosong. Setelah password diubah dari UI, nilai `ADMIN_PASSWORD_HASH` di `.env` tidak lagi dipakai untuk menimpa password database.

### Database lokal

Development memakai PostgreSQL 17 asli dari paket `embedded-postgres` (tanpa instalasi global/admin):

```bash
npm run db:start   # membuat cluster .pgdata bila belum ada, lalu menjalankan port 55432
npm run db:stop    # menghentikan cluster dengan bersih
```

Database default:

```text
postgresql://postgres:postgres@localhost:55432/rosmawati?schema=public
```

Data tersimpan di `.pgdata` (diabaikan git). Untuk produksi, gunakan PostgreSQL hosting dan set `DATABASE_URL`.

### Upload gambar

- Disimpan di `public/uploads` dengan nama acak.
- Maksimal 5 MB; format JPG, PNG, WebP, atau AVIF.
- Tipe file divalidasi dari isi biner, bukan hanya MIME dari browser.
- Route `/uploads/[...path]` menyajikan file pada production.
- Penyimpanan lokal cocok untuk development/VPS. Untuk platform serverless (Vercel, dsb.) gunakan object storage pada fase produksi.

## Variabel lingkungan

| Variabel | Wajib | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Produksi | URL publik tanpa slash di akhir. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Ya | Nomor WhatsApp format internasional. Bila kosong, CTA WhatsApp dinonaktifkan. |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Tidak | URL profil Instagram. |
| `NEXT_PUBLIC_BOUTIQUE_ADDRESS` | Tidak | Alamat butik. |
| `NEXT_PUBLIC_OPENING_HOURS` | Tidak | Jam operasional. |
| `DATABASE_URL` | Ya | Koneksi PostgreSQL. Jangan commit nilai asli. |
| `ADMIN_EMAIL` | Ya (login pertama) | Email administrator awal, mis. `admin@rosmawatithailor.com`. |
| `ADMIN_PASSWORD_HASH` | Ya (login pertama) | Hash bcrypt dari `npm run admin:hash`. Jangan isi password plaintext. |
| `ADMIN_SESSION_TTL_HOURS` | Tidak | Masa berlaku session admin dalam jam. Default `8`. |

Semua variabel `NEXT_PUBLIC_*` bersifat publik di browser. **Jangan** menaruh password, token, atau secret di sana. `.env` sudah diabaikan Git; `.env.example` hanya berisi placeholder.

## Script

```bash
npm run dev          # development
npm run build        # production build
npm run start        # menjalankan hasil build
npm run lint         # ESLint
npm run typecheck    # TypeScript tanpa emit

npm run db:start     # PostgreSQL lokal (port 55432)
npm run db:stop      # hentikan PostgreSQL lokal
npm run db:generate  # generate Prisma Client
npm run db:migrate   # buat migrasi baru (development)
npm run db:deploy    # terapkan migrasi (produksi/CI)
npm run db:seed      # seed kategori, produk, info butik
npm run db:studio    # Prisma Studio

npm run admin:hash   # buat hash bcrypt untuk ADMIN_PASSWORD_HASH
npm run verify:fase1 # cek DB, validasi Zod, validasi gambar
npm run test:e2e     # E2E admin CRUD (butuh DB + server di port 3100)
npm run test:e2e:auth # E2E login, session, logout, rate limit
```

### Menjalankan E2E

```bash
npm run db:start
npm run build
npx next start -p 3100
# di terminal lain (password plaintext hanya untuk pengujian lokal):
ADMIN_PASSWORD="password-admin-anda" npm run test:e2e
ADMIN_PASSWORD="password-admin-anda" npm run test:e2e:auth
```

E2E admin menguji login, create, upload, edit, toggle unggulan/ketersediaan, refleksi katalog, impor `localStorage`, dan hapus. E2E auth hanya mau berjalan ke `localhost`/`127.0.0.1` karena membersihkan state rate limit lokal.

## URL halaman

- `/` — beranda publik
- `/katalog` — katalog produk
- `/produk/p1` — detail produk
- `/admin/login` — login administrator
- `/admin` — dashboard admin (wajib login)
- `/admin/akun` — ganti password admin (wajib login)
- `/api/admin/session` — status session (401 tanpa session)

## Struktur utama

```text
app/
  layout.tsx              metadata global, header/footer
  page.tsx                beranda (server component)
  katalog/                katalog + metadata + loading
  produk/[id]/            detail produk + metadata dinamis
  admin/
    login/                halaman + form + server action login
    akun/                 halaman + form + server action ganti password
    page.tsx              dashboard (wajib login)
    actions.ts            CRUD produk (setiap action divalidasi session)
    logout-action.ts      logout + hapus session
  api/admin/session/      status session (401 tanpa login)
  uploads/[...path]/      route penyaji file upload
  error.tsx               error boundary
  not-found.tsx           halaman 404
  robots.ts               aturan crawler
  sitemap.ts              sitemap dinamis dari database
middleware.ts             redirect awal /admin tanpa cookie session
components/
  Site.tsx                header + footer
  AdminSidebar.tsx        navigasi admin + tombol keluar
  CatalogClient.tsx       filter kategori (client)
  ProductCard.tsx         kartu produk
  LoadingScreen.tsx       loading state
  Store.tsx               @deprecated pembaca localStorage lama
lib/
  auth/
    admin.ts              bootstrap akun, login, lockout, ganti password
    session.ts            session DB + cookie HttpOnly + guard halaman/action
    password.ts           bcrypt hash/verify
    validation.ts         skema Zod login & ganti password
    constants.ts          nama cookie + sanitasi redirect
    request.ts            hash IP + metadata request
    action-types.ts       tipe state form
  db.ts                   Prisma client singleton
  products.ts             query produk/kategori
  catalog.ts              tipe data katalog
  validation.ts           skema Zod produk
  upload.ts               simpan/hapus file upload
  image-validation.ts     validasi magic bytes gambar
  legacy.ts               tipe data localStorage lama
  action-result.ts        tipe hasil server action + snapshot admin
  slug.ts                 pembuat slug
  site.ts                 konfigurasi brand + WhatsApp
  format.ts               format Rupiah
prisma/
  schema.prisma           model Product, Category, BoutiqueInfo, AdminUser, AdminSession, AdminLoginAttempt
  seed.ts                 seed idempoten (tidak menimpa akun admin)
  migrations/             riwayat migrasi additive
scripts/
  dev-db.mjs              PostgreSQL lokal
  db-stop.mjs             hentikan PostgreSQL
  hash-admin-password.mjs pembuat hash bcrypt
  verify-fase1.ts         verifikasi data & validasi
  e2e-admin.mjs           E2E admin CRUD
  e2e-auth.mjs            E2E autentikasi & keamanan session
```

## Roadmap

1. **Fase 1 — Database & data layer:** PostgreSQL + Prisma, validasi Zod, server actions, upload gambar, migrasi data localStorage. ✅
2. **Fase 2 — Autentikasi & keamanan:** bcrypt, session database, cookie HttpOnly, middleware, proteksi server action, rate limit. ✅
3. **Fase 3 — Admin lengkap:** pencarian/filter/pagination, kategori, informasi butik, toast, dialog accessible.
4. **Fase 4 — Frontend publik:** section kategori/testimoni, pencarian/sort, `next/image`, `next/font`, SEO lanjutan.
5. **Fase 5 — Pengujian & rilis:** unit test, audit keamanan, backup, dokumentasi deployment.

## Catatan

- Foto produk seed masih memakai URL Unsplash sebagai placeholder. Ganti dengan foto asli sebelum produksi.
- Font Google dimuat melalui CSS. Pada Fase 4 akan dipindahkan ke `next/font` agar tidak render-blocking.
- `next/image` belum dipakai; peringatan ESLint `<img>` memang disengaja sampai Fase 4.
- `npm audit` masih melaporkan kerentanan dari dependency; jangan jalankan `npm audit fix --force` tanpa persetujuan karena berpotensi breaking change.
