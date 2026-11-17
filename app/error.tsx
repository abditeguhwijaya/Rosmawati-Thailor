
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Rosmawati Thailor application error:", error);
  }, [error]);

  return (
    <main className="rt-error-page" id="main-content">
      <div className="rt-error-content">
        <div className="rt-error-symbol">
          <AlertCircle size={28} strokeWidth={1.3} />
        </div>

        <span className="rt-error-eyebrow">
          ROSMAWATI THAILOR · MADE WITH CARE
        </span>

        <h1>Maaf, terjadi kendala.</h1>

        <p className="rt-error-description">
          Sepertinya ada sesuatu yang tidak berjalan sebagaimana mestinya.
          Silakan coba kembali beberapa saat lagi.
        </p>

        {error.digest && (
          <span className="rt-error-reference">
            Referensi: {error.digest}
          </span>
        )}

        <div className="rt-error-actions">
          <button
            type="button"
            className="rt-error-primary"
            onClick={reset}
          >
            <RefreshCw size={16} />
            Coba lagi
          </button>

          <Link href="/" className="rt-error-secondary">
            <ArrowLeft size={16} />
            Kembali ke beranda
          </Link>
        </div>

        <div className="rt-error-footer">
          <span>Terima kasih atas pengertian Anda.</span>
          <span>Rosmawati Thailor</span>
        </div>
      </div>
    </main>
  );
}
