
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react";

import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/catalog";

const ALL_CATEGORIES = "Semua";

export default function CatalogClient({
  products,
}: {
  products: Product[];
}) {
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () => [
      ALL_CATEGORIES,
      ...Array.from(
        new Set(products.map((product) => product.category)),
      ),
    ],
    [products],
  );

  const activeCategory = categories.includes(category)
    ? category
    : ALL_CATEGORIES;

  const visibleProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === ALL_CATEGORIES ||
        product.category === activeCategory;

      const matchesSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  const resetFilters = () => {
    setSearch("");
    setCategory(ALL_CATEGORIES);
  };

  return (
    <div className="rt-catalog-browser">
      <div className="rt-catalog-toolbar">
        <div className="rt-catalog-search">
          <Search size={18} strokeWidth={1.7} />

          <input
            type="search"
            placeholder="Cari nama atau kategori produk..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Cari produk"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Hapus pencarian"
              className="rt-search-clear"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="rt-catalog-result" aria-live="polite">
          <SlidersHorizontal size={15} />
          <span>
            Menampilkan <strong>{visibleProducts.length}</strong> dari{" "}
            <strong>{products.length}</strong> produk
          </span>
        </div>
      </div>

      <div className="rt-category-section">
        <span className="rt-category-label">
          PILIH KATEGORI
        </span>

        <div
          className="rt-category-list"
          aria-label="Filter kategori produk"
        >
          {categories.map((item) => (
            <button
              type="button"
              className={
                activeCategory === item
                  ? "rt-category-button active"
                  : "rt-category-button"
              }
              key={item}
              onClick={() => setCategory(item)}
              aria-pressed={activeCategory === item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="rt-catalog-grid">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="rt-catalog-empty">
          <div className="rt-empty-icon">
            <Search size={25} strokeWidth={1.3} />
          </div>

          <span className="rt-empty-eyebrow">
            COLLECTION NOT FOUND
          </span>

          <h3>
            Belum Menemukan <i>Produk</i>
          </h3>

          <p>
            {products.length === 0
              ? "Saat ini belum ada produk yang tersedia. Silakan kunjungi kembali untuk melihat koleksi terbaru kami."
              : search
                ? `Tidak ditemukan produk dengan kata kunci "${search}". Coba gunakan kata kunci lain.`
                : "Belum ada produk dalam kategori ini. Silakan lihat kategori lainnya."}
          </p>

          <button
            type="button"
            className="rt-reset-filter"
            onClick={resetFilters}
          >
            Lihat Semua Koleksi
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
