
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
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        background: "#FBF8F4",
      }}
    >
      <section
        aria-label="Login administrator"
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#FFFFFF",
          border: "1px solid #EAE0DC",
          borderRadius: "18px",
          padding: "36px",
          boxShadow: "0 18px 55px rgba(65, 40, 43, 0.09)",
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
              color: "#80565B",
              gap: "10px",
            }}
          >
            <span
              style={{
                width: "54px",
                height: "54px",
                display: "grid",
                placeItems: "center",
                border: "1px solid #C9A6A1",
                borderRadius: "50%",
                fontFamily: "Georgia, serif",
                fontSize: "30px",
              }}
            >
              R
            </span>

            <strong
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "19px",
                letterSpacing: "2px",
                fontWeight: 500,
              }}
            >
              {siteConfig.name.toUpperCase()}
            </strong>
          </Link>

          <p
            style={{
              marginTop: "12px",
              marginBottom: "0",
              color: "#9A8581",
              fontSize: "10px",
              letterSpacing: "2.5px",
              fontWeight: 600,
            }}
          >
            ADMINISTRATOR ACCESS
          </p>

          <h1
            style={{
              marginTop: "25px",
              marginBottom: "8px",
              color: "#493638",
              fontFamily: "Georgia, serif",
              fontSize: "29px",
              fontWeight: 400,
            }}
          >
            Selamat Datang
          </h1>

          <p
            style={{
              margin: 0,
              color: "#8B7774",
              fontSize: "13px",
              lineHeight: 1.7,
            }}
          >
            Masuk untuk mengelola website butik Anda.
          </p>
        </header>

        <LoginForm
          next={nextPath}
          notice={notice}
        />

        <div
          style={{
            marginTop: "25px",
            paddingTop: "20px",
            borderTop: "1px solid #F0E9E5",
            textAlign: "center",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#80565B",
              textDecoration: "none",
              fontSize: "12px",
            }}
          >
            ← Kembali ke website
          </Link>

          <p
            style={{
              marginTop: "15px",
              marginBottom: 0,
              color: "#B0A19C",
              fontSize: "10px",
              letterSpacing: "1px",
            }}
          >
            MADE WITH CARE © {new Date().getFullYear()}
          </p>
        </div>
      </section>
    </main>
  );
}
