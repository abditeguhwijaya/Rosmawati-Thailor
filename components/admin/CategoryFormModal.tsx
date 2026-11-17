"use client";

import { useEffect, useState } from "react";
import { TriangleAlert, X } from "lucide-react";
import type { Category } from "@/lib/catalog";
import { useModalA11y } from "./useModalA11y";

type CategoryFormModalProps = {
  open: boolean;
  /** Kategori yang diedit; null berarti menambah kategori baru. */
  category: Category | null;
  busy: boolean;
  error: string;
  fieldErrors: Record<string, string[]>;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
};

type FormValues = {
  name: string;
  description: string;
  sortOrder: string;
};

function initialValues(category: Category | null): FormValues {
  return {
    name: category?.name ?? "",
    description: category?.description ?? "",
    sortOrder: category ? String(category.sortOrder) : "0",
  };
}

function firstError(
  fieldErrors: Record<string, string[]>,
  field: string,
): string | undefined {
  return fieldErrors[field]?.[0];
}

/**
 * Modal tambah/edit kategori: nama, deskripsi singkat, dan urutan tampil
 * di katalog publik. Validasi per field dikirim balik oleh server action.
 */
export default function CategoryFormModal({
  open,
  category,
  busy,
  error,
  fieldErrors,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const [values, setValues] = useState<FormValues>(() =>
    initialValues(category),
  );

  // Setiap modal dibuka, form diisi ulang dari kategori (atau kosong).
  useEffect(() => {
    if (!open) return;
    setValues(initialValues(category));
  }, [open, category]);

  const dialogRef = useModalA11y<HTMLFormElement>(open, onClose, { busy });

  if (!open) return null;

  const nameError = firstError(fieldErrors, "name");
  const descriptionError = firstError(fieldErrors, "description");
  const sortOrderError = firstError(fieldErrors, "sortOrder");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData();
    if (category) formData.set("id", category.id);
    formData.set("name", values.name);
    formData.set("description", values.description);
    formData.set("sortOrder", values.sortOrder || "0");

    onSubmit(formData);
  }

  return (
    <div className="ad-modal-overlay">
      <form
        ref={dialogRef}
        className="ad-modal"
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-title"
      >
        <div className="ad-modal-head">
          <div className="ad-modal-head-text">
            <h2 id="category-form-title">
              {category ? "Edit kategori" : "Tambah kategori"}
            </h2>
            <p>
              {category
                ? "Perubahan langsung tersimpan dan tercermin di katalog."
                : "Kelompok baru untuk mengatur koleksi produk butik."}
            </p>
          </div>
          <button
            type="button"
            className="ad-modal-close"
            onClick={onClose}
            disabled={busy}
            aria-label="Tutup dialog"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="ad-modal-body">
          {error && (
            <p className="ad-form-alert" role="alert">
              <TriangleAlert size={15} aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}

          <div className="ad-form">
            <label className="ad-field">
              <span>Nama kategori</span>
              <input
                className="ad-input"
                required
                maxLength={80}
                autoComplete="off"
                value={values.name}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                aria-invalid={Boolean(nameError)}
              />
              {nameError && (
                <small className="ad-field-error">{nameError}</small>
              )}
            </label>

            <label className="ad-field">
              <span>Deskripsi</span>
              <textarea
                className="ad-input"
                rows={3}
                maxLength={300}
                value={values.description}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                aria-invalid={Boolean(descriptionError)}
              />
              {descriptionError && (
                <small className="ad-field-error">{descriptionError}</small>
              )}
              <small className="ad-field-hint">
                Opsional. Tampil sebagai keterangan singkat di katalog.
              </small>
            </label>

            <label className="ad-field">
              <span>Urutan tampil</span>
              <input
                className="ad-input"
                type="number"
                min={0}
                max={999}
                step={1}
                inputMode="numeric"
                required
                value={values.sortOrder}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    sortOrder: event.target.value,
                  }))
                }
                aria-invalid={Boolean(sortOrderError)}
              />
              {sortOrderError && (
                <small className="ad-field-error">{sortOrderError}</small>
              )}
              <small className="ad-field-hint">
                Angka kecil tampil lebih dulu di katalog publik.
              </small>
            </label>
          </div>
        </div>

        <div className="ad-modal-foot">
          <button
            type="button"
            className="ad-btn ad-btn--ghost"
            onClick={onClose}
            disabled={busy}
          >
            Batal
          </button>
          <button type="submit" className="ad-btn" disabled={busy}>
            {busy ? "Menyimpan..." : "Simpan kategori"}
          </button>
        </div>
      </form>
    </div>
  );
}
