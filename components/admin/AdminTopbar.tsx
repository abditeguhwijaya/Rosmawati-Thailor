
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock,
  Info,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  TriangleAlert,
} from "lucide-react";

import type { AdminNotification } from "@/lib/admin-insights";

const PAGE_TITLES: Array<{
  match: (pathname: string) => boolean;
  title: string;
  subtitle: string;
}> = [
  {
    match: (pathname) => pathname === "/admin",
    title: "Dashboard",
    subtitle: "Ringkasan aktivitas dan kondisi butik",
  },
  {
    match: (pathname) => pathname.startsWith("/admin/produk"),
    title: "Manajemen Produk",
    subtitle: "Kelola koleksi, foto, harga, dan ketersediaan",
  },
  {
    match: (pathname) => pathname.startsWith("/admin/kategori"),
    title: "Kategori",
    subtitle: "Kelompokkan koleksi produk butik",
  },
  {
    match: (pathname) => pathname.startsWith("/admin/akun"),
    title: "Akun & Password",
    subtitle: "Pengaturan administrator dan keamanan",
  },
];

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email.split("@")[0] || "A";
  const words = source.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function NotificationIcon({
  tone,
}: {
  tone: AdminNotification["tone"];
}) {
  if (tone === "warning") {
    return <TriangleAlert size={16} aria-hidden="true" />;
  }

  if (tone === "success") {
    return <CheckCircle2 size={16} aria-hidden="true" />;
  }

  return <Info size={16} aria-hidden="true" />;
}

type TopbarProps = {
  adminEmail: string;
  adminName: string | null;
  notifications: AdminNotification[];
  collapsed: boolean;
  onToggleSidebar: () => void;
  onOpenDrawer: () => void;
};

export default function AdminTopbar({
  adminEmail,
  adminName,
  notifications,
  collapsed,
  onToggleSidebar,
  onOpenDrawer,
}: TopbarProps) {
  const pathname = usePathname();

  const [now, setNow] = useState<Date | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);

  // Jam dan tanggal real-time
  useEffect(() => {
    setNow(new Date());

    const id = setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => clearInterval(id);
  }, []);

  // Menutup notifikasi saat klik di luar atau menekan Escape
  useEffect(() => {
    if (!notifOpen) return;

    function handlePointer(event: MouseEvent) {
      if (!notifRef.current?.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotifOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [notifOpen]);

  // Judul halaman otomatis
  const page = useMemo(
    () => PAGE_TITLES.find((entry) => entry.match(pathname)),
    [pathname],
  );

  // Jumlah notifikasi yang membutuhkan perhatian
  const actionableCount = useMemo(
    () =>
      notifications.filter((item) => item.tone !== "success").length,
    [notifications],
  );

  const displayName =
    adminName?.trim() ||
    adminEmail.split("@")[0] ||
    "Administrator";

  return (
    <header className="ad-topbar">
      {/* Tombol navigasi mobile */}
      <button
        type="button"
        className="ad-topbar-toggle ad-topbar-toggle--mobile"
        onClick={onOpenDrawer}
        aria-label="Buka menu navigasi"
      >
        <Menu size={19} aria-hidden="true" />
      </button>

      {/* Tombol sidebar desktop */}
      <button
        type="button"
        className="ad-topbar-toggle ad-topbar-toggle--desktop"
        onClick={onToggleSidebar}
        aria-label={
          collapsed ? "Perbesar sidebar" : "Perkecil sidebar"
        }
        title={
          collapsed ? "Perbesar sidebar" : "Perkecil sidebar"
        }
      >
        {collapsed ? (
          <PanelLeftOpen size={19} aria-hidden="true" />
        ) : (
          <PanelLeftClose size={19} aria-hidden="true" />
        )}
      </button>

      {/* Informasi halaman */}
      <div className="ad-topbar-title">
        <h1>{page?.title ?? "Admin"}</h1>
        <small>
          {page?.subtitle ?? "Panel administrasi Rosmawati Thailor"}
        </small>
      </div>

      {/* Informasi sisi kanan */}
      <div className="ad-topbar-right">
        {/* Jam dan tanggal */}
        <div className="ad-topbar-clock" aria-live="off">
          <Clock size={15} aria-hidden="true" />

          <span>
            {now
              ? `${dateFormatter.format(now)} · ${timeFormatter.format(now)}`
              : "\u00a0"}
          </span>
        </div>

        {/* Notifikasi */}
        <div className="ad-bell-wrap" ref={notifRef}>
          <button
            type="button"
            className="ad-bell"
            onClick={() => setNotifOpen((open) => !open)}
            aria-expanded={notifOpen}
            aria-haspopup="dialog"
            aria-label={`Notifikasi${
              actionableCount > 0
                ? ` (${actionableCount} perlu perhatian)`
                : ""
            }`}
          >
            <Bell size={18} aria-hidden="true" />

            {actionableCount > 0 && (
              <span className="ad-bell-badge">
                {actionableCount > 99 ? "99+" : actionableCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="ad-bell-pop"
              role="dialog"
              aria-label="Notifikasi admin"
            >
              <div className="ad-bell-pop-head">
                <b>Notifikasi</b>
                <small>Berdasarkan kondisi katalog</small>
              </div>

              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <div
                    className="ad-bell-pop-item"
                    key={item.id}
                  >
                    <span
                      className={`ad-bell-icon ad-bell-icon--${item.tone}`}
                    >
                      <NotificationIcon tone={item.tone} />
                    </span>

                    <div>
                      <b>{item.title}</b>
                      <p>{item.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="ad-bell-empty">
                  <CheckCircle2 size={22} />
                  <b>Semua terlihat baik!</b>
                  <p>
                    Tidak ada notifikasi yang perlu diperhatikan.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <span
          className="ad-topbar-divider"
          aria-hidden="true"
        />

        {/* Profil administrator */}
        <Link
          className="ad-adminchip"
          href="/admin/akun"
          title="Buka pengaturan akun"
        >
          <span
            className="ad-adminchip-avatar"
            aria-hidden="true"
          >
            {initials(adminName, adminEmail)}
          </span>

          <span className="ad-adminchip-text">
            <b>{displayName}</b>
            <small>{adminEmail}</small>
          </span>

          <ChevronDown size={14} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
