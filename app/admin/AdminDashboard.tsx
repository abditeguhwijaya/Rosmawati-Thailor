
"use client";

import Image from "next/image";
import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  EyeOff,
  Gem,
  Package,
  Tags,
} from "lucide-react";
import type { Category, Product } from "@/lib/catalog";
import {
  buildAdminNotifications,
  buildGrowthSeries,
} from "@/lib/admin-insights";
import { formatIDR } from "@/lib/format";
import AdminShell from "@/components/admin/AdminShell";
import StatCard from "@/components/admin/StatCard";
import ProductChart from "@/components/admin/ProductChart";
import CategoryChart from "@/components/admin/CategoryChart";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Memvalidasi URL gambar produk agar URL tidak valid
 * tidak menyebabkan Runtime Error pada Next.js.
 */
function getSafeImageSrc(image: string): string | null {
  if (!image || typeof image !== "string") return null;

  const value = image.trim();

  // Gambar lokal dari folder uploads.
  if (/^\/uploads\/[A-Za-z0-9._-]+$/.test(value)) {
    return value;
  }

  // Hanya menerima URL HTTPS dari domain yang diizinkan.
  try {
    const url = new URL(value);

    if (url.protocol !== "https:") return null;

    const allowedHosts = [
      "images.unsplash.com",
      "images.tokopedia.net",
      "down-id.img.susercontent.com",
    ];

    if (!allowedHosts.includes(url.hostname)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

/** Ilustrasi dekoratif banner dashboard admin. */
function BannerArt() {
  return (
    <svg
      className="ad-banner-art-svg"
      viewBox="0 0 260 260"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="ad-banner-gown"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor="#c99ba5" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#c99ba5" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      <circle
        cx="130"
        cy="130"
        r="104"
        stroke="rgba(201,155,165,0.3)"
        strokeWidth="1.2"
        strokeDasharray="3 7"
      />

      <path
        d="M130 34 L112 62 C110 70 116 78 124 80 L98 196 C96 206 104 214 114 210 L130 202 L146 210 C156 214 164 206 162 196 L136 80 C144 78 150 70 148 62 L130 34 Z"
        fill="url(#ad-banner-gown)"
        stroke="rgba(201,155,165,0.6)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      <path
        d="M62 170 C70 206 98 230 132 230 C166 230 192 208 200 176"
        stroke="rgba(247,242,239,0.5)"
        strokeWidth="2"
        strokeDasharray="10 6"
        strokeLinecap="round"
      />

      <path
        d="M178 78 L206 50"
        stroke="rgba(247,242,239,0.65)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      <circle
        cx="178"
        cy="78"
        r="4"
        fill="rgba(247,242,239,0.65)"
      />

      <path
        d="M62 74 L66 84 L76 88 L66 92 L62 102 L58 92 L48 88 L58 84 Z"
        fill="rgba(201,155,165,0.55)"
      />

      <path
        d="M204 128 L207 135 L214 138 L207 141 L204 148 L201 141 L194 138 L201 135 Z"
        fill="rgba(201,155,165,0.4)"
      />
    </svg>
  );
}

/**
 * Halaman dashboard admin:
 * sambutan, statistik katalog, grafik perkembangan,
 * komposisi kategori, dan produk terbaru.
 */
export default function AdminDashboard({
  adminEmail,
  adminName,
  initialProducts,
  initialCategories,
}: {
  adminEmail: string;
  adminName: string | null;
  initialProducts: Product[];
  initialCategories: Category[];
}) {
  const products = initialProducts;
  const categories = initialCategories;

  const notifications = useMemo(
    () => buildAdminNotifications(products, categories),
    [products, categories]
  );

  const growthSeries = useMemo(
    () => buildGrowthSeries(products),
    [products]
  );

  const stats = useMemo(() => {
    const available = products.filter((product) => product.available);

    const catalogValue = available.reduce(
      (total, product) => total + product.price,
      0
    );

    return {
      total: products.length,
      available: available.length,
      unavailable: products.length - available.length,
      categories: categories.length,
      catalogValue,
    };
  }, [products, categories]);

  const recentProducts = useMemo(
    () =>
      [...products]
        .sort((first, second) =>
          second.createdAt.localeCompare(first.createdAt)
        )
        .slice(0, 6),
    [products]
  );

  return (
    <AdminShell
      adminEmail={adminEmail}
      adminName={adminName}
      notifications={notifications}
    >
      <section className="ad-banner">
        <div className="ad-banner-text">
          <small className="ad-banner-eyebrow">
            SELAMAT DATANG DI STUDIO
          </small>

          <h2>
            Selamat Datang, Rosmawati{" "}
            <span aria-hidden="true"></span>
          </h2>

          <p>
            Kelola koleksi, kategori, dan informasi butik
            Rosmawati Thailor di sini.
          </p>

          <div className="ad-banner-actions">
            <Link
              className="ad-btn ad-btn--onbanner"
              href="/admin/produk"
            >
              Kelola koleksi
              <ArrowRight size={15} aria-hidden="true" />
            </Link>

            <Link
              className="ad-btn ad-btn--bannerghost"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Lihat website
            </Link>
          </div>
        </div>

        <div className="ad-banner-art">
          <BannerArt />
        </div>
      </section>

      <div className="ad-stats">
        <StatCard
          icon={Package}
          label="Total Produk"
          value={String(stats.total)}
          caption="Seluruh koleksi terdaftar di katalog"
          tone="burgundy"
        />

        <StatCard
          icon={CheckCircle2}
          label="Produk Tersedia"
          value={String(stats.available)}
          caption="Tampil dan bisa dipesan pelanggan"
          tone="success"
        />

        <StatCard
          icon={EyeOff}
          label="Tidak Tersedia"
          value={String(stats.unavailable)}
          caption="Disembunyikan dari katalog publik"
          tone="danger"
        />

        <StatCard
          icon={Tags}
          label="Jumlah Kategori"
          value={String(stats.categories)}
          caption="Kelompok koleksi butik"
          tone="plum"
        />

        <StatCard
          icon={Gem}
          label="Nilai Katalog"
          value={formatIDR(stats.catalogValue)}
          caption="Akumulasi harga produk aktif"
          tone="rose"
        />
      </div>

      <div className="ad-charts">
        <ProductChart series={growthSeries} />
        <CategoryChart categories={categories} />
      </div>

      <section className="ad-card ad-table-card">
        <div className="ad-card-head">
          <div className="ad-card-head-text">
            <div className="ad-card-title">
              <span aria-hidden="true">
                <Package size={17} />
              </span>
              <h3>Produk Terbaru</h3>
            </div>

            <p>
              Enam koleksi yang paling baru ditambahkan.
            </p>
          </div>

          <Link className="ad-link" href="/admin/produk">
            Kelola semua produk
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th scope="col">Produk</th>
                <th scope="col">Kategori</th>
                <th scope="col">Harga</th>
                <th scope="col">Status</th>
                <th scope="col">Ditambahkan</th>
              </tr>
            </thead>

            <tbody>
              {recentProducts.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="ad-empty">
                      <span
                        className="ad-empty-icon"
                        aria-hidden="true"
                      >
                        <Package size={22} />
                      </span>

                      <b>Belum ada produk</b>

                      <p>
                        Koleksi pertama akan tampil di sini
                        setelah ditambahkan ke database.
                      </p>

                      <Link
                        className="ad-btn ad-btn--sm"
                        href="/admin/produk"
                      >
                        <ArrowRight size={14} aria-hidden="true" />
                        Tambah produk pertama
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                recentProducts.map((product) => {
                  const imageSrc = getSafeImageSrc(product.image);

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="ad-cell-product">
                          {imageSrc ? (
                            <Image
                              src={imageSrc}
                              alt={product.name}
                              width={44}
                              height={52}
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className="ad-product-image-placeholder"
                              role="img"
                              aria-label={`Gambar ${product.name} tidak tersedia`}
                            >
                              <Package size={20} />
                            </div>
                          )}

                          <div className="ad-cell-product-text">
                            <b title={product.name}>
                              {product.name}
                            </b>
                            <small title={product.slug}>
                              /{product.slug}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className="ad-chip"
                          title={product.category}
                        >
                          {product.category}
                        </span>
                      </td>

                      <td className="ad-price">
                        {formatIDR(product.price)}
                      </td>

                      <td>
                        <span
                          className={`ad-badge ${
                            product.available
                              ? "ad-badge--available"
                              : "ad-badge--unavailable"
                          }`}
                        >
                          {product.available
                            ? "Tersedia"
                            : "Disembunyikan"}
                        </span>
                      </td>

                      <td>
                        {dateFormatter.format(
                          new Date(product.createdAt)
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="ad-card-foot">
          <small>
            Menampilkan {recentProducts.length} dari{" "}
            {products.length} produk terbaru
          </small>

          <Link className="ad-link" href="/admin/produk">
            Buka manajemen produk
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </AdminShell>
  );
}
