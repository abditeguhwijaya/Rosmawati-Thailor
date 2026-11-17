"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

export type ToastTone = "success" | "error" | "info";

export type ToastItem = {
  id: number;
  tone: ToastTone;
  message: string;
};

const AUTO_DISMISS_MS = 4500;

/**
 * Notifikasi ringan untuk hasil aksi admin (sukses/gagal), dengan
 * penutupan otomatis dan tombol tutup manual.
 */
export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));

    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId.current;
      nextId.current += 1;

      setToasts((current) => [
        ...current.slice(-3),
        { id, tone, message },
      ]);

      const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const activeTimers = timers.current;

    return () => {
      for (const timer of activeTimers.values()) {
        clearTimeout(timer);
      }
      activeTimers.clear();
    };
  }, []);

  return { toasts, push, dismiss };
}

function ToastIcon({ tone }: { tone: ToastTone }) {
  if (tone === "success") {
    return <CheckCircle2 size={17} className="ad-toast-icon" aria-hidden="true" />;
  }
  if (tone === "error") {
    return <XCircle size={17} className="ad-toast-icon" aria-hidden="true" />;
  }
  return <Info size={17} className="ad-toast-icon" aria-hidden="true" />;
}

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="ad-toasts" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`ad-toast ad-toast--${toast.tone}`}>
          <ToastIcon tone={toast.tone} />
          <p>{toast.message}</p>
          <button
            type="button"
            className="ad-toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Tutup notifikasi"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
