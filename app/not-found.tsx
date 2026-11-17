import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="page notfound" id="main-content">
      <small className="eyebrow">404</small>
      <h1>Halaman tidak ditemukan.</h1>
      <p>
        Tautan yang Anda buka mungkin sudah berubah atau tidak lagi tersedia.
        Mari kembali menjelajahi koleksi kami.
      </p>
      <div className="actions center">
        <Link className="btn" href="/katalog">
          Lihat koleksi
        </Link>
        <Link className="underlink" href="/">
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
