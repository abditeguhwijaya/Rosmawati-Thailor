
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  ImageIcon,
  Pencil,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import type { Category, Product } from "@/lib/catalog";
import { formatIDR } from "@/lib/format";

const PAGE_SIZE = 10;

/**
 * Format tanggal menggunakan zona waktu tetap
 * agar hasil server dan browser konsisten.
 */
const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

/**
 * Memvalidasi URL gambar sebelum diberikan ke next/image.
 * URL Google Ads dan URL yang tidak dikenal akan ditolak.
 */
function getSafeImageSrc(image: string): string | null {
  if (!image || typeof image !== "string") {
    return null;
  }

  const value = image.trim();

  // Gambar lokal dari folder public/uploads.
  if (/^\/uploads\/[A-Za-z0-9._-]+$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:") {
      return null;
    }

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

type ProductTableProps = {
  products: Product[];
  categories: Category[];
  busy: boolean;
  onToggleFeatured: (product: Product) => void;
  onToggleAvailability: (product: Product) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

type StatusFilter = "all" | "available" | "unavailable";

/**
 * Tabel produk admin:
 * pencarian, filter kategori dan status, pagination,
 * serta aksi unggulan, ketersediaan, detail, edit, dan hapus.
 */
export default function ProductTable({
  products,
  categories,
  busy,
  onToggleFeatured,
  onToggleAvailability,
  onView,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  // Filter atau pencarian berubah, kembali ke halaman pertama.
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter]);

  // Pencarian dan filter produk.
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products.filter((product) => {
      if (
        categoryFilter !== "all" &&
        product.categoryId !== categoryFilter
      ) {
        return false;
      }

      if (
        statusFilter !== "all" &&
        ((statusFilter === "available") !== product.available)
      ) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return (
        product.name.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword)
      );
    });
  }, [products, search, categoryFilter, statusFilter]);

  // Pagination.
  const pageCount = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, pageCount);

  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const from =
    filtered.length === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const to = Math.min(
    currentPage * PAGE_SIZE,
    filtered.length,
  );

  const pageNumbers = useMemo(() => {
    const windowStart = Math.max(1, currentPage - 2);
    const windowEnd = Math.min(pageCount, windowStart + 4);

    return Array.from(
      { length: windowEnd - windowStart + 1 },
      (_, index) => windowStart + index,
    );
  }, [currentPage, pageCount]);

  return (
    <section className="ad-card ad-table-card">
      <div className="ad-table-toolbar">
        <div className="ad-table-tools">
          {/* Pencarian produk */}
          <div className="ad-search">
            <Search size={15} aria-hidden="true" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari produk..."
              aria-label="Cari produk"
            />
          </div>

          {/* Filter kategori */}
          <label className="ad-select">
            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              aria-label="Filter kategori"
            >
              <option value="all">Semua kategori</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <ChevronDown size={14} aria-hidden="true" />
          </label>

          {/* Filter status */}
          <label className="ad-select">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as StatusFilter,
                )
              }
              aria-label="Filter status"
            >
              <option value="all">Semua status</option>
              <option value="available">Tersedia</option>
              <option value="unavailable">Disembunyikan</option>
            </select>

            <ChevronDown size={14} aria-hidden="true" />
          </label>
        </div>

        <small className="ad-table-count">
          {filtered.length} dari {products.length} produk
        </small>
      </div>

      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr>
              <th scope="col">Foto</th>
              <th scope="col">Nama</th>
              <th scope="col">Kategori</th>
              <th scope="col">Harga</th>
              <th scope="col">Status</th>
              <th scope="col">Unggulan</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="ad-empty">
                    <span
                      className="ad-empty-icon"
                      aria-hidden="true"
                    >
                      <Search size={22} />
                    </span>

                    <b>Belum ada produk</b>

                    <p>
                      Mulai dengan menambahkan karya pertama ke
                      koleksi butik.
                    </p>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="ad-empty">
                    <span
                      className="ad-empty-icon"
                      aria-hidden="true"
                    >
                      <Search size={22} />
                    </span>

                    <b>Tidak ada produk yang cocok</b>

                    <p>
                      Coba ubah kata kunci pencarian atau reset
                      filter kategori dan status.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              pageItems.map((product) => {
                const imageSrc = getSafeImageSrc(product.image);

                return (
                  <tr key={product.id}>
                    {/* Foto produk */}
                    <td>
                      {imageSrc ? (
                        <Image
                          className="ad-thumb"
                          src={imageSrc}
                          alt={product.name}
                          width={46}
                          height={54}
                          loading="lazy"
                          unoptimized={imageSrc.startsWith("/uploads/")}
                        />
                      ) : (
                        <div
                          className="ad-thumb ad-thumb--placeholder"
                          role="img"
                          aria-label={`Foto ${product.name} belum tersedia`}
                        >
                          <ImageIcon
                            size={20}
                            strokeWidth={1.4}
                            aria-hidden="true"
                          />
                        </div>
                      )}
                    </td>

                    {/* Nama produk */}
                    <td>
                      <div className="ad-cell-product">
                        <div className="ad-cell-product-text">
                          <b title={product.name}>
                            {product.name}
                          </b>

                          <small>
                            Ditambahkan{" "}
                            {dateFormatter.format(
                              new Date(product.createdAt),
                            )}
                          </small>
                        </div>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td>
                      <span
                        className="ad-chip"
                        title={product.category}
                      >
                        {product.category}
                      </span>
                    </td>

                    {/* Harga */}
                    <td className="ad-price">
                      {formatIDR(product.price)}
                    </td>

                    {/* Status ketersediaan */}
                    <td>
                      <button
                        type="button"
                        className={`ad-badge ${
                          product.available
                            ? "ad-badge--available"
                            : "ad-badge--unavailable"
                        }`}
                        onClick={() =>
                          onToggleAvailability(product)
                        }
                        disabled={busy}
                        aria-label={
                          product.available
                            ? `Sembunyikan ${product.name} dari katalog`
                            : `Tampilkan ${product.name} di katalog`
                        }
                        title={
                          product.available
                            ? "Sembunyikan dari katalog"
                            : "Tampilkan di katalog"
                        }
                      >
                        {product.available
                          ? "Tersedia"
                          : "Disembunyikan"}
                      </button>
                    </td>

                    {/* Produk unggulan */}
                    <td>
                      <button
                        type="button"
                        className={`ad-starbtn${
                          product.featured
                            ? " ad-starbtn--on"
                            : ""
                        }`}
                        onClick={() =>
                          onToggleFeatured(product)
                        }
                        disabled={busy}
                        aria-label={
                          product.featured
                            ? `Hapus ${product.name} dari unggulan`
                            : `Jadikan ${product.name} unggulan`
                        }
                        title={
                          product.featured
                            ? "Hapus dari unggulan"
                            : "Jadikan unggulan"
                        }
                      >
                        <Star
                          size={17}
                          fill={
                            product.featured
                              ? "currentColor"
                              : "none"
                          }
                          aria-hidden="true"
                        />
                      </button>
                    </td>

                    {/* Aksi produk */}
                    <td className="ad-col-actions">
                      <span className="ad-actions">
                        <button
                          type="button"
                          className="ad-iconbtn"
                          onClick={() => onView(product)}
                          disabled={busy}
                          aria-label={`Lihat detail ${product.name}`}
                          title="Lihat detail"
                        >
                          <Eye size={16} aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          className="ad-iconbtn"
                          onClick={() => onEdit(product)}
                          disabled={busy}
                          aria-label={`Edit ${product.name}`}
                          title="Edit produk"
                        >
                          <Pencil
                            size={16}
                            aria-hidden="true"
                          />
                        </button>

                        <button
                          type="button"
                          className="ad-iconbtn ad-iconbtn--danger"
                          onClick={() => onDelete(product)}
                          disabled={busy}
                          aria-label={`Hapus ${product.name}`}
                          title="Hapus produk"
                        >
                          <Trash2
                            size={16}
                            aria-hidden="true"
                          />
                        </button>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Navigasi halaman */}
      {filtered.length > 0 && (
        <div className="ad-table-foot">
          <small>
            Menampilkan {from}–{to} dari {filtered.length} produk
          </small>

          {pageCount > 1 && (
            <nav
              className="ad-pager"
              aria-label="Navigasi halaman tabel"
            >
              <button
                type="button"
                className="ad-pagebtn"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft size={15} aria-hidden="true" />
              </button>

              {pageNumbers.map((number) => (
                <button
                  key={number}
                  type="button"
                  className={`ad-pagebtn${
                    number === currentPage
                      ? " ad-pagebtn--active"
                      : ""
                  }`}
                  onClick={() => setPage(number)}
                  aria-current={
                    number === currentPage ? "page" : undefined
                  }
                >
                  {number}
                </button>
              ))}

              <button
                type="button"
                className="ad-pagebtn"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= pageCount}
                aria-label="Halaman berikutnya"
              >
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            </nav>
          )}
        </div>
      )}
    </section>
  );
}
