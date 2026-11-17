"use client";

import { useEffect, useRef } from "react";

type ModalA11yOptions = {
  /** Modal tidak boleh ditutup saat submit masih berjalan. */
  busy?: boolean;
};

/**
 * Perilaku dasar modal admin: Escape untuk menutup, focus trap sederhana,
 * kunci scroll body, dan fokus awal ke kontrol pertama yang relevan.
 * Generic memungkinkan ref dipasang ke <form>, <div>, atau elemen lain.
 */
export function useModalA11y<T extends HTMLElement = HTMLDivElement>(
  open: boolean,
  onClose: () => void,
  options: ModalA11yOptions = {},
) {
  const dialogRef = useRef<T>(null);
  const busy = options.busy ?? false;

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!busy) onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
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

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTarget =
      dialogRef.current?.querySelector<HTMLElement>(
        'input:not([type="checkbox"]):not([type="file"]), select, textarea',
      ) ?? dialogRef.current?.querySelector<HTMLElement>("button");
    focusTarget?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, busy, onClose]);

  return dialogRef;
}
