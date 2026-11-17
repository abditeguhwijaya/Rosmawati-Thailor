"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import type { Category, Product } from "@/lib/catalog";
import type { ActionResult } from "@/lib/action-result";
import { buildAdminNotifications } from "@/lib/admin-insights";
import AdminShell from "@/components/admin/AdminShell";
import CategoryFormModal from "@/components/admin/CategoryFormModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { ToastStack, useToasts } from "@/components/admin/Toast";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "./actions";

/**
 * Halaman manajemen kategori: daftar kategori beserta jumlah produknya,
 * modal tambah/edit, dan konfirmasi hapus yang menolak kategori terpakai.
 */
export default function CategoryManager({
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();
  const { toasts, push, dismiss } = useToasts();

  const notifications = useMemo(
    () => buildAdminNotifications(products, categories),
    [products, categories],
  );

  const applySnapshot = useCallback((result: ActionResult) => {
    if (result.ok) {
      if (result.products) setProducts(result.products);
      if (result.categories) setCategories(result.categories);
    }
  }, []);

  function openAddForm() {
    setEditingCategory(null);
    setFormError("");
    setFieldErrors({});
    setFormOpen(true);
  }

  function openEditForm(category: Category) {
    setEditingCategory(category);
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

  function submitCategory(formData: FormData) {
    setFormError("");
    setFieldErrors({});

    startTransition(async () => {
      const result = editingCategory
        ? await updateCategoryAction(formData)
        : await createCategoryAction(formData);

      if (!result.ok) {
        setFormError(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      applySnapshot(result);
      push("success", result.message);
      setFormOpen(false);
      setEditingCategory(null);
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteCategoryAction(deleteTarget.id);

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

  const deleteInUse = Boolean(
    deleteTarget && deleteTarget.productCount > 0,
  );

  return (
    <AdminShell
      adminEmail={adminEmail}
      adminName={adminName}
      notifications={notifications}
    >
      <div className="ad-page-head">
        <div>
          <h2>Kategori</h2>
          <p>
            Kelompok koleksi yang mengatur produk di katalog publik dan
            dashboard.
          </p>
        </div>
        <div className="ad-page-actions">
          <button
            type="button"
            className="ad-btn"
            onClick={openAddForm}
            disabled={isPending}
          >
            <Plus size={16} aria-hidden="true" />
            Tambah kategori
          </button>
        </div>
      </div>

      <section className="ad-card ad-table-card">
        <div className="ad-card-head">
          <div className="ad-card-head-text">
            <div className="ad-card-title">
              <span aria-hidden="true">
                <Tags size={17} />
              </span>
              <h3>Daftar Kategori</h3>
            </div>
            <p>
              {categories.length} kategori terdaftar, diurutkan sesuai urutan
              tampil.
            </p>
          </div>
        </div>

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th scope="col">Kategori</th>
                <th scope="col">Deskripsi</th>
                <th scope="col">Urutan</th>
                <th scope="col">Produk</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="ad-empty">
                      <span className="ad-empty-icon" aria-hidden="true">
                        <Tags size={22} />
                      </span>
                      <b>Belum ada kategori</b>
                      <p>
                        Produk butuh kategori sebelum bisa ditambahkan ke
                        koleksi butik.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div className="ad-cell-product-text">
                        <b title={category.name}>{category.name}</b>
                        <small title={category.slug}>/{category.slug}</small>
                      </div>
                    </td>
                    <td>
                      {category.description ? (
                        <span
                          className="ad-cat-desc"
                          title={category.description}
                        >
                          {category.description}
                        </span>
                      ) : (
                        <span className="ad-cat-desc ad-cat-desc--empty">
                          —
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="ad-chip">{category.sortOrder}</span>
                    </td>
                    <td>
                      <span
                        className={`ad-cat-count${
                          category.productCount === 0
                            ? " ad-cat-count--empty"
                            : ""
                        }`}
                        title={
                          category.productCount === 0
                            ? "Belum ada produk di kategori ini"
                            : `${category.productCount} produk memakai kategori ini`
                        }
                      >
                        {category.productCount} produk
                      </span>
                    </td>
                    <td className="ad-col-actions">
                      <span className="ad-actions">
                        <button
                          type="button"
                          className="ad-iconbtn"
                          onClick={() => openEditForm(category)}
                          disabled={isPending}
                          aria-label={`Edit kategori ${category.name}`}
                          title="Edit kategori"
                        >
                          <Pencil size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="ad-iconbtn ad-iconbtn--danger"
                          onClick={() => setDeleteTarget(category)}
                          disabled={isPending}
                          aria-label={`Hapus kategori ${category.name}`}
                          title="Hapus kategori"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {categories.length > 0 && (
          <div className="ad-card-foot">
            <small>
              Menampilkan {categories.length} kategori ·{" "}
              {categories.reduce(
                (total, category) => total + category.productCount,
                0,
              )}{" "}
              produk terkelompok
            </small>
            <Link className="ad-link" href="/admin/produk">
              Kelola produk
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>

      <CategoryFormModal
        open={formOpen}
        category={editingCategory}
        busy={isPending}
        error={formError}
        fieldErrors={fieldErrors}
        onClose={closeForm}
        onSubmit={submitCategory}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus kategori"
        message={
          deleteTarget
            ? deleteTarget.productCount > 0
              ? `Kategori "${deleteTarget.name}" masih digunakan oleh ${deleteTarget.productCount} produk. Pindahkan atau hapus produk terkait terlebih dahulu.`
              : `Hapus kategori "${deleteTarget.name}"? Tindakan ini tidak bisa dibatalkan.`
            : ""
        }
        busy={isPending}
        confirmDisabled={deleteInUse}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </AdminShell>
  );
}
