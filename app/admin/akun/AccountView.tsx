"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import type { Category, Product } from "@/lib/catalog";
import { buildAdminNotifications } from "@/lib/admin-insights";
import AdminShell from "@/components/admin/AdminShell";
import ChangePasswordForm from "./ChangePasswordForm";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
});

function formatDate(value: string | null): string {
  return value ? dateFormatter.format(new Date(value)) : "Belum pernah";
}

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email.split("@")[0] || "A";
  const words = source.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

const SECURITY_NOTES = [
  {
    title: "Password disimpan sebagai hash bcrypt",
    text: "Password tidak pernah tersimpan sebagai teks biasa, dan tidak ditampilkan di halaman ini.",
  },
  {
    title: "Session berakhir otomatis",
    text: "Setelah password diubah, semua session lama — termasuk di perangkat lain — otomatis diakhiri.",
  },
  {
    title: "Minimal 10 karakter",
    text: "Password baru harus minimal 10 karakter dan belum pernah dipakai sebelumnya.",
  },
];

/**
 * Halaman akun admin: ringkasan profil administrator dan form ganti password
 * dengan mekanisme server action + bcrypt yang sudah ada.
 */
export default function AccountView({
  adminEmail,
  adminName,
  lastLoginAt,
  passwordChangedAt,
  passwordChanged,
  initialProducts,
  initialCategories,
}: {
  adminEmail: string;
  adminName: string | null;
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
  passwordChanged: boolean;
  initialProducts: Product[];
  initialCategories: Category[];
}) {
  const notifications = useMemo(
    () => buildAdminNotifications(initialProducts, initialCategories),
    [initialProducts, initialCategories],
  );

  return (
    <AdminShell
      adminEmail={adminEmail}
      adminName={adminName}
      notifications={notifications}
    >
      <div className="ad-page-head">
        <div>
          <h2>Akun admin</h2>
          <p>
            Kelola kredensial dan keamanan akses Admin Studio Rosmawati
            Thailor.
          </p>
        </div>
        <div className="ad-page-actions">
          <Link className="ad-btn ad-btn--soft" href="/admin">
            <ArrowLeft size={15} aria-hidden="true" />
            Kembali ke dashboard
          </Link>
        </div>
      </div>

      {passwordChanged && (
        <p className="ad-notice" role="status">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>
            Password berhasil diubah. Sesi di perangkat lain sudah diakhiri.
          </span>
        </p>
      )}

      <div className="ad-account">
        <section className="ad-card ad-account-profile">
          <div className="ad-account-hero">
            <span className="ad-account-avatar" aria-hidden="true">
              {initials(adminName, adminEmail)}
            </span>
            <div>
              <b>{adminName?.trim() || "Administrator"}</b>
              <small>{adminEmail}</small>
            </div>
          </div>

          <div className="ad-account-meta">
            <div className="ad-account-meta-row">
              <span>Email administrator</span>
              <b>{adminEmail}</b>
            </div>
            <div className="ad-account-meta-row">
              <span>Login terakhir</span>
              <b>{formatDate(lastLoginAt)}</b>
            </div>
            <div className="ad-account-meta-row">
              <span>Password terakhir diubah</span>
              <b>{formatDate(passwordChangedAt)}</b>
            </div>
          </div>

          <div className="ad-account-actions">
            <ul className="ad-security-list">
              {SECURITY_NOTES.map((note) => (
                <li key={note.title}>
                  <ShieldCheck size={17} aria-hidden="true" />
                  <div>
                    <b>{note.title}</b>
                    <small>{note.text}</small>
                  </div>
                </li>
              ))}
            </ul>

            <Link className="ad-btn ad-btn--soft" href="/" target="_blank">
              <ExternalLink size={15} aria-hidden="true" />
              Lihat website
            </Link>
          </div>
        </section>

        <section className="ad-card">
          <ChangePasswordForm />
        </section>
      </div>
    </AdminShell>
  );
}
