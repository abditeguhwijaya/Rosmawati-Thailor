"use client";

import { useEffect, useRef } from "react";
import { TriangleAlert } from "lucide-react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  /** Nonaktifkan tombol konfirmasi, mis. kategori masih dipakai produk. */
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Dialog konfirmasi penghapusan — pengganti window.confirm agar konsisten
 * dengan desain, dengan focus trap sederhana dan dukungan Escape.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Ya, hapus",
  busy = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
        onCancel();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const confirmButton =
      dialogRef.current?.querySelector<HTMLButtonElement>(
        ".ad-btn--danger",
      );
    confirmButton?.focus();

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="ad-modal-overlay">
      <div
        className="ad-modal ad-confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ad-confirm-title"
        ref={dialogRef}
      >
        <div className="ad-confirm-body">
          <span className="ad-confirm-icon" aria-hidden="true">
            <TriangleAlert size={22} />
          </span>
          <div>
            <h2 id="ad-confirm-title">{title}</h2>
            <p>{message}</p>
          </div>
        </div>
        <div className="ad-modal-foot">
          <button
            type="button"
            className="ad-btn ad-btn--ghost"
            onClick={onCancel}
            disabled={busy}
          >
            Batal
          </button>
          <button
            type="button"
            className="ad-btn ad-btn--danger"
            onClick={onConfirm}
            disabled={busy || confirmDisabled}
            title={confirmDisabled ? "Kategori masih digunakan produk." : undefined}
          >
            {busy ? "Menghapus..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
