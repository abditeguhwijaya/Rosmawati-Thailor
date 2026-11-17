"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import type { Category, Product } from "@/lib/catalog";
import type { ActionResult } from "@/lib/action-result";
import {
  isLegacyProduct,
  LEGACY_STORAGE_KEYS,
  type LegacyProduct,
} from "@/lib/legacy";
import { buildAdminNotifications } from "@/lib/admin-insights";
import AdminShell from "@/components/admin/AdminShell";
import ProductTable from "@/components/admin/ProductTable";
import ProductFormModal from "@/components/admin/ProductFormModal";
import ProductDetailModal from "@/components/admin/ProductDetailModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { ToastStack, useToasts } from "@/components/admin/Toast";
import {
  createProductAction,
  deleteProductAction,
  importLegacyProductsAction,
  setProductAvailabilityAction,
  setProductFeaturedAction,
  updateProductAction,
} from "../actions";

function readLegacyProducts(): LegacyProduct[] {
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;

      const valid = parsed.filter(isLegacyProduct);
      if (valid.length > 0) return valid;
    }
  } catch {
    // Data lama yang rusak diabaikan; pengguna tetap memakai database.
  }

  return [];
}

/**
 * Halaman manajemen produk: tabel lengkap dengan pencarian, filter,
 * pagination, CRUD, impor data lama, dan konfirmasi penghapusan.
 */
export default function ProductManager({
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
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [legacyCount, setLegacyCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const { toasts, push, dismiss } = useToasts();

  const notifications = useMemo(
    () => buildAdminNotifications(products, categories),
    [products, categories],
  );

  // Deteksi data lama di localStorage setelah mount (hanya ada di browser).
  useEffect(() => {
    setLegacyCount(readLegacyProducts().length);
  }, []);

  const applySnapshot = useCallback((result: ActionResult) => {
    if (result.ok) {
      if (result.products) setProducts(result.products);
      if (result.categories) setCategories(result.categories);
    }
  }, []);

  function openAddForm() {
    setEditingProduct(null);
    setFormError("");
    setFieldErrors({});
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setDetailProduct(null);
    setEditingProduct(product);
    setFormError("");
    setFieldErrors({});
    setFormOpen(true);
  }

  const closeForm = useCallback(() => {
    if (isPending) return;
    setFormOpen(false);
    setFormError("");
    setFieldErrors({});
  }, [isPending]);

  function submitProduct(formData: FormData) {
    setFormError("");
    setFieldErrors({});

    startTransition(async () => {
      const result = editingProduct
        ? await updateProductAction(formData)
        : await createProductAction(formData);

      if (!result.ok) {
        setFormError(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      applySnapshot(result);
      push("success", result.message);
      setFormOpen(false);
      setEditingProduct(null);
    });
  }

  function toggleFeatured(product: Product) {
    startTransition(async () => {
      const result = await setProductFeaturedAction(
        product.id,
        !product.featured,
      );

      if (!result.ok) {
        push("error", result.message);
        return;
      }

      applySnapshot(result);
      push("success", result.message);
    });
  }

  function toggleAvailability(product: Product) {
    startTransition(async () => {
      const result = await setProductAvailabilityAction(
        product.id,
        !product.available,
      );

      if (!result.ok) {
        push("error", result.message);
        return;
      }

      applySnapshot(result);
      push("success", result.message);
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteProductAction(deleteTarget.id);

      if (!result.ok) {
        setDeleteTarget(null);
        push("error", result.message);
        return;
      }

      applySnapshot(result);
      setDeleteTarget(null);
      push("success", result.message);
    });
  }

  function importLegacy() {
    const items = readLegacyProducts();

    if (items.length === 0) {
      setLegacyCount(0);
      push("info", "Tidak ada data lama yang bisa diimpor.");
      return;
    }

    startTransition(async () => {
      const result = await importLegacyProductsAction(items);

      if (!result.ok) {
        push("error", result.message);
        return;
      }

      for (const key of LEGACY_STORAGE_KEYS) {
        localStorage.removeItem(key);
      }

      setLegacyCount(0);
      applySnapshot(result);
      push("success", result.message);
    });
  }

  const addDisabled = isPending || categories.length === 0;

  return (
    <AdminShell
      adminEmail={adminEmail}
      adminName={adminName}
      notifications={notifications}
    >
      <div className="ad-page-head">
        <div>
          <h2>Koleksi Produk</h2>
          <p>
            Tambah, ubah, dan atur harga, foto, serta ketersediaan karya
            butik.
          </p>
        </div>
        <div className="ad-page-actions">
          {legacyCount > 0 && (
            <button
              type="button"
              className="ad-btn ad-btn--soft"
              onClick={importLegacy}
              disabled={isPending}
            >
              <Upload size={15} aria-hidden="true" />
              Impor {legacyCount} data lama
            </button>
          )}
          <button
            type="button"
            className="ad-btn"
            onClick={openAddForm}
            disabled={addDisabled}
            title={
              categories.length === 0
                ? "Buat kategori terlebih dahulu."
                : undefined
            }
          >
            <Plus size={16} aria-hidden="true" />
            Tambah produk
          </button>
        </div>
      </div>

      {categories.length === 0 && (
        <p className="ad-notice">
          Belum ada kategori. Produk butuh kategori sebelum bisa ditambahkan —
          buat dulu di{" "}
          <Link className="ad-link" href="/admin/kategori">
            halaman Kategori
          </Link>
          .
        </p>
      )}

      <ProductTable
        products={products}
        categories={categories}
        busy={isPending}
        onToggleFeatured={toggleFeatured}
        onToggleAvailability={toggleAvailability}
        onView={setDetailProduct}
        onEdit={openEditForm}
        onDelete={setDeleteTarget}
      />

      <ProductFormModal
        open={formOpen}
        product={editingProduct}
        categories={categories}
        busy={isPending}
        error={formError}
        fieldErrors={fieldErrors}
        onClose={closeForm}
        onSubmit={submitProduct}
      />

      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onEdit={openEditForm}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus produk"
        message={
          deleteTarget
            ? `Hapus produk "${deleteTarget.name}"? Foto dari server juga ikut terhapus dan tindakan ini tidak bisa dibatalkan.`
            : ""
        }
        busy={isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </AdminShell>
  );
}
