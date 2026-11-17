
"use client";

import Image from "next/image";
import { Pencil, Star, X } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { formatIDR } from "@/lib/format";
import { useModalA11y } from "./useModalA11y";

type ProductDetailModalProps = {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
};

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
});

/**
 * Modal baca-saja untuk melihat detail lengkap satu produk sebelum mengedit.
 */
export default function ProductDetailModal({
  product,
  onClose,
  onEdit,
}: ProductDetailModalProps) {
  const dialogRef = useModalA11y(Boolean(product), onClose);

  if (!product) return null;

  return (
    <div className="ad-modal-overlay">
      <div
        ref={dialogRef}
        className="ad-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
      >
        <div className="ad-modal-head">
          <div className="ad-modal-head-text">
            <h2 id="product-detail-title">{product.name}</h2>
            <p>Detail produk dari database Rosmawati Thailor.</p>
          </div>
          <button
            type="button"
            className="ad-modal-close"
            onClick={onClose}
            aria-label="Tutup dialog"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="ad-modal-body">
          <div className="ad-detail">
            <Image
              className="ad-detail-img"
              src={product.image}
              alt={product.name}
              width={600}
              height={750}
              sizes="(max-width: 768px) 100vw, 400px"
            />

            <div className="ad-detail-chips">
              <span className="ad-chip">{product.category}</span>
              <span
                className={`ad-badge ${
                  product.available
                    ? "ad-badge--available"
                    : "ad-badge--unavailable"
                }`}
              >
                {product.available ? "Tersedia" : "Disembunyikan"}
              </span>
              {product.featured && (
                <span className="ad-badge ad-badge--featured">
                  <Star size={12} aria-hidden="true" /> Unggulan
                </span>
              )}
            </div>

            <strong className="ad-detail-price">
              {formatIDR(product.price)}
            </strong>

            {product.description && (
              <p className="ad-detail-desc">{product.description}</p>
            )}

            <div className="ad-detail-meta">
              <div className="ad-detail-meta-row">
                <span>Slug katalog</span>
                <b>/{product.slug}</b>
              </div>
              <div className="ad-detail-meta-row">
                <span>Ditambahkan</span>
                <b>{dateTimeFormatter.format(new Date(product.createdAt))}</b>
              </div>
              <div className="ad-detail-meta-row">
                <span>Terakhir diperbarui</span>
                <b>{dateTimeFormatter.format(new Date(product.updatedAt))}</b>
              </div>
            </div>
          </div>
        </div>

        <div className="ad-modal-foot">
          <button
            type="button"
            className="ad-btn ad-btn--ghost"
            onClick={onClose}
          >
            Tutup
          </button>
          <button
            type="button"
            className="ad-btn"
            onClick={() => onEdit(product)}
          >
            <Pencil size={15} aria-hidden="true" />
            Edit produk
          </button>
        </div>
      </div>
    </div>
  );
}
