
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ImagePlus,
  TriangleAlert,
  X,
  Trash2,
} from "lucide-react";
import type { Category, Product } from "@/lib/catalog";
import { useModalA11y } from "./useModalA11y";

type ProductFormModalProps = {
  open: boolean;
  product: Product | null;
  categories: Category[];
  busy: boolean;
  error: string;
  fieldErrors: Record<string, string[]>;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
};

type FormValues = {
  name: string;
  categoryId: string;
  price: string;
  description: string;
  image: string;
  featured: boolean;
  available: boolean;
  imageFile: File | null;
};

function initialValues(
  product: Product | null,
  categories: Category[],
): FormValues {
  return {
    name: product?.name ?? "",
    categoryId: product?.categoryId ?? categories[0]?.id ?? "",
    price: product ? String(product.price) : "",
    description: product?.description ?? "",
    image: product?.image ?? "",
    featured: product?.featured ?? false,
    available: product?.available ?? true,
    imageFile: null,
  };
}

function firstError(
  fieldErrors: Record<string, string[]>,
  field: string,
): string | undefined {
  return fieldErrors[field]?.[0];
}

export default function ProductFormModal({
  open,
  product,
  categories,
  busy,
  error,
  fieldErrors,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const [values, setValues] = useState<FormValues>(() =>
    initialValues(product, categories),
  );

  const [filePreview, setFilePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form setiap modal dibuka.
  useEffect(() => {
    if (!open) return;

    setValues(initialValues(product, categories));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open, product, categories]);

  // Membuat dan membersihkan URL preview file lokal.
  useEffect(() => {
    if (!values.imageFile) {
      setFilePreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(values.imageFile);
    setFilePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [values.imageFile]);

  const dialogRef = useModalA11y<HTMLFormElement>(open, onClose, {
    busy,
  });

  if (!open) return null;

  const nameError = firstError(fieldErrors, "name");
  const categoryError = firstError(fieldErrors, "categoryId");
  const priceError = firstError(fieldErrors, "price");
  const imageError = firstError(fieldErrors, "image");
  const descriptionError = firstError(fieldErrors, "description");

  const previewSrc = filePreview || values.image.trim();

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;

    setValues((current) => ({
      ...current,
      imageFile: file,
    }));
  }

  function handleRemoveFile() {
    setValues((current) => ({
      ...current,
      imageFile: null,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData();

    if (product) formData.set("id", product.id);

    formData.set("name", values.name);
    formData.set("categoryId", values.categoryId);
    formData.set("price", values.price || "0");
    formData.set("description", values.description);
    formData.set("image", values.image);

    if (values.featured) formData.set("featured", "on");
    if (values.available) formData.set("available", "on");

    if (values.imageFile) {
      formData.set("imageFile", values.imageFile);
    }

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
        aria-labelledby="product-form-title"
      >
        <div className="ad-modal-head">
          <div className="ad-modal-head-text">
            <h2 id="product-form-title">
              {product ? "Edit produk" : "Tambah produk"}
            </h2>

            <p>
              {product
                ? "Perbarui informasi produk dan perubahan langsung tersimpan."
                : "Lengkapi detail produk baru untuk koleksi butik."}
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
              <span>Nama produk</span>
              <input
                className="ad-input"
                required
                maxLength={120}
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

            <div className="ad-form-row">
              <label className="ad-field">
                <span>Kategori</span>
                <select
                  className="ad-input"
                  value={values.categoryId}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      categoryId: event.target.value,
                    }))
                  }
                  disabled={categories.length === 0}
                  aria-invalid={Boolean(categoryError)}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {categories.length === 0 && (
                  <small className="ad-field-hint">
                    Belum ada kategori — buat dulu di halaman Kategori.
                  </small>
                )}

                {categoryError && (
                  <small className="ad-field-error">
                    {categoryError}
                  </small>
                )}
              </label>

              <label className="ad-field">
                <span>Harga (Rp)</span>
                <input
                  className="ad-input"
                  type="number"
                  min={0}
                  step={1000}
                  required
                  inputMode="numeric"
                  value={values.price}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(priceError)}
                />

                {priceError && (
                  <small className="ad-field-error">{priceError}</small>
                )}
              </label>
            </div>

            {/* Upload dan preview foto */}
            <div className="ad-field">
              <span>Foto produk</span>

              {previewSrc ? (
                <div className="ad-image-preview">
                  <div className="ad-image-preview-frame">
                    <Image
                      src={previewSrc}
                      alt="Preview foto produk"
                      width={480}
                      height={600}
                      unoptimized
                      className="ad-image-preview-img"
                    />
                  </div>

                  <div className="ad-image-preview-info">
                    <div>
                      <b>
                        {values.imageFile
                          ? values.imageFile.name
                          : "Foto produk saat ini"}
                      </b>
                      <small>
                        {values.imageFile
                          ? "Foto baru siap diunggah."
                          : "Foto yang tersimpan pada produk."}
                      </small>
                    </div>

                    {values.imageFile && (
                      <button
                        type="button"
                        className="ad-image-remove"
                        onClick={handleRemoveFile}
                        disabled={busy}
                      >
                        <Trash2 size={15} />
                        Hapus pilihan
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="ad-image-empty">
                  <ImagePlus size={30} />
                  <b>Belum ada foto produk</b>
                  <small>Pilih foto dari perangkat Anda.</small>
                </div>
              )}

              <label className="ad-upload">
                <ImagePlus size={22} aria-hidden="true" />

                <b>
                  {values.imageFile
                    ? "Pilih foto lain"
                    : previewSrc
                      ? "Ganti foto"
                      : "Upload foto"}
                </b>

                <small>
                  Maksimal 5 MB. JPG, PNG, WebP, atau AVIF.
                  {product
                    ? " Jika tidak mengganti foto, foto saat ini tetap digunakan."
                    : ""}
                </small>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleFileChange}
                  disabled={busy}
                />
              </label>

              {imageError && (
                <small className="ad-field-error">{imageError}</small>
              )}
            </div>

            <label className="ad-field">
              <span>Atau URL foto</span>
              <input
                className="ad-input"
                type="text"
                inputMode="url"
                autoComplete="off"
                placeholder="https://... atau /uploads/..."
                value={values.image}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    image: event.target.value,
                  }))
                }
              />

              <small className="ad-field-hint">
                Digunakan jika tidak memilih file upload. Harus URL
                http(s) atau path /uploads/ yang valid.
              </small>
            </label>

            <label className="ad-field">
              <span>Deskripsi</span>
              <textarea
                className="ad-input"
                rows={4}
                maxLength={2000}
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
                <small className="ad-field-error">
                  {descriptionError}
                </small>
              )}
            </label>

            <div className="ad-form-row">
              <label className="ad-switch">
                <span className="ad-switch-text">
                  <b>Tampilkan di beranda</b>
                  <small>
                    Produk unggulan tampil di bagian utama website.
                  </small>
                </span>

                <input
                  type="checkbox"
                  checked={values.featured}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      featured: event.target.checked,
                    }))
                  }
                />

                <span className="ad-switch-track" aria-hidden="true" />
              </label>

              <label className="ad-switch">
                <span className="ad-switch-text">
                  <b>Produk tersedia</b>
                  <small>
                    Produk bisa dilihat dan dipesan pelanggan.
                  </small>
                </span>

                <input
                  type="checkbox"
                  checked={values.available}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      available: event.target.checked,
                    }))
                  }
                />

                <span className="ad-switch-track" aria-hidden="true" />
              </label>
            </div>
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
            {busy ? "Menyimpan..." : "Simpan produk"}
          </button>
        </div>
      </form>
    </div>
  );
}
