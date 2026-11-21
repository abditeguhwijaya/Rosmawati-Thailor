
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth/session";
import { sanitizeAdminNextPath } from "@/lib/auth/constants";
import { siteConfig } from "@/lib/site";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login Admin | Rosmawati Thailor",
  description: "Area masuk administrator Rosmawati Thailor.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

type SearchParams = Record<
  string,
  string | string[] | undefined
>;

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const nextPath = sanitizeAdminNextPath(
    firstParam(params.next),
  );

  let databaseUnavailable = false;

  try {
    const admin = await getCurrentAdmin();

    if (admin) {
      redirect(nextPath);
    }
  } catch (error) {
    // Redirect Next.js tidak boleh dianggap sebagai error database.
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("AdminLoginPage:", error);
    databaseUnavailable = true;
  }

  const notice = databaseUnavailable
    ? "Layanan login sedang tidak tersedia. Silakan coba beberapa saat lagi."
    : firstParam(params.logout)
      ? "Anda telah keluar dari Admin Studio."
      : firstParam(params.passwordChanged)
        ? "Password berhasil diubah. Silakan masuk dengan password baru."
        : firstParam(params.expired)
          ? "Sesi Anda telah berakhir. Silakan masuk kembali."
          : undefined;

  return (
    <main
      id="main-content"
      className="ad-login"
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "radial-gradient(ellipse at 50% 20%, #FAF6F3 0%, #F3ECE7 100%)",
      }}
    >
      <section
        aria-label="Login administrator"
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "#FFFFFF",
          border: "1px solid rgba(201, 166, 161, 0.4)",
          borderRadius: "22px",
          padding: "42px 38px 36px",
          boxShadow: "0 22px 65px -15px rgba(56, 39, 44, 0.12), 0 2px 8px rgba(56, 39, 44, 0.04)",
        }}
      >
        <header
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <Link
            href="/"
            aria-label={`${siteConfig.name} — Beranda`}
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              textDecoration: "none",
              color: "#3D2B30",
              gap: "10px",
            }}
          >
            <span
              style={{
                width: "56px",
                height: "56px",
                display: "grid",
                placeItems: "center",
                border: "1.5px solid #C9A6A1",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FCFAF9 0%, #F5ECE8 100%)",
                fontFamily: "Georgia, serif",
                fontSize: "28px",
                fontWeight: 600,
                color: "#8A4F5D",
                boxShadow: "0 4px 14px rgba(138, 79, 93, 0.12)",
              }}
            >
              R
            </span>

            <strong
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "18px",
                letterSpacing: "2.5px",
                fontWeight: 600,
                color: "#38272C",
              }}
            >
              {siteConfig.name.toUpperCase()}
            </strong>
          </Link>

          <div style={{ marginTop: "12px" }}>
            <span
              style={{
                display: "inline-block",
                padding: "3px 12px",
                borderRadius: "999px",
                background: "#F6EEF0",
                color: "#8A4F5D",
                fontSize: "10px",
                letterSpacing: "2px",
                fontWeight: 700,
              }}
            >
              ADMINISTRATOR ACCESS
            </span>
          </div>

          <h1
            style={{
              marginTop: "22px",
              marginBottom: "8px",
              color: "#38272C",
              fontFamily: "Georgia, serif",
              fontSize: "28px",
              fontWeight: 500,
            }}
          >
            Selamat Datang
          </h1>

          <p
            style={{
              margin: 0,
              color: "#7E6D72",
              fontSize: "13.5px",
              lineHeight: 1.6,
            }}
          >
            Masuk untuk mengelola butik dan katalog busana Anda.
          </p>
        </header>

        <LoginForm
          next={nextPath}
          notice={notice}
        />

        <div
          style={{
            marginTop: "28px",
            paddingTop: "22px",
            borderTop: "1px solid #F2EBE8",
            textAlign: "center",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#8A4F5D",
              textDecoration: "none",
              fontSize: "12.5px",
              fontWeight: 500,
              transition: "color 0.2s ease",
            }}
          >
            ← Kembali ke website
          </Link>

          <p
            style={{
              marginTop: "16px",
              marginBottom: 0,
              color: "#B2A3A0",
              fontSize: "10.5px",
              letterSpacing: "1.5px",
              fontWeight: 500,
            }}
          >
            MADE WITH CARE © {new Date().getFullYear()}
          </p>
        </div>
      </section>
    </main>
  );
}
