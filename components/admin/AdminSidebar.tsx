
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LayoutDashboard,
  Package,
  Tags,
  KeyRound,
  LogOut,
  X,
  Sparkles,
  PanelsTopLeft,
} from "lucide-react";

import { logoutAction } from "@/app/admin/logout-action";
import { siteConfig } from "@/lib/site";

type AdminSidebarProps = {
  drawerOpen: boolean;
  onDrawerClose: () => void;
  adminEmail: string;
  adminName: string | null;
};

const NAVIGATION = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Pengaturan Beranda",
    href: "/admin/pengaturan-beranda",
    icon: PanelsTopLeft,
  },
  {
    label: "Manajemen Produk",
    href: "/admin/produk",
    icon: Package,
  },
  {
    label: "Kategori Produk",
    href: "/admin/kategori",
    icon: Tags,
  },
  {
    label: "Akun & Keamanan",
    href: "/admin/akun",
    icon: KeyRound,
  },
];

export default function AdminSidebar({
  drawerOpen,
  onDrawerClose,
  adminEmail,
  adminName,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const displayName =
    adminName?.trim() ||
    adminEmail.split("@")[0] ||
    "Administrator";

  const avatarInitial = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* Overlay untuk tampilan mobile */}
      {drawerOpen && (
        <button
          type="button"
          className="ad-drawer-overlay"
          onClick={onDrawerClose}
          aria-label="Tutup menu navigasi"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 55,
            border: 0,
            background: "rgba(15, 12, 20, 0.55)",
            cursor: "pointer",
          }}
        />
      )}

      <aside
        className={`ad-sidebar ${drawerOpen ? "ad-sidebar--open" : ""}`}
        aria-label="Navigasi administrator"
      >
        {/* Brand */}
        <div className="ad-brand">
          <Link
            href="/"
            className="ad-brand-link"
            aria-label={`${siteConfig.name} — Beranda`}
          >
            <span className="ad-brand-mono">R</span>

            <span className="ad-brand-text">
              <strong>ROSMawati</strong>
              <small>THAILOR · ADMIN STUDIO</small>
            </span>
          </Link>

          <button
            type="button"
            className="ad-sidebar-close"
            onClick={onDrawerClose}
            aria-label="Tutup sidebar"
          >
            <X size={19} />
          </button>
        </div>

        {/* Workspace label */}
        <div className="ad-side-label">
          <span>WORKSPACE</span>
          <Sparkles size={13} />
        </div>

        {/* Navigation */}
        <nav className="ad-sidenav" aria-label="Menu utama">
          {NAVIGATION.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onDrawerClose}
                className={`ad-sidelink ${
                  active ? "ad-sidelink--active" : ""
                }`}
                aria-current={active ? "page" : undefined}
                title={item.label}
              >
                <Icon size={19} strokeWidth={1.8} />

                <span>{item.label}</span>

                {active && (
                  <span className="ad-sidelink-indicator" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="ad-sidefoot">
          <div className="ad-side-profile">
            <span className="ad-side-avatar">
              {avatarInitial || "A"}
            </span>

            <span className="ad-side-profile-text">
              <strong>{displayName}</strong>
              <small>{adminEmail}</small>
            </span>
          </div>

          <Link
            href="/"
            className="ad-side-view"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={17} />
            <span>Lihat Website</span>
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="ad-sidelogout"
            >
              <LogOut size={17} />
              <span>Keluar dari Admin</span>
            </button>
          </form>

          <div className="ad-sidebar-copyright">
            <span>ROSMawati THAILOR</span>
            <small>Made with Care © {new Date().getFullYear()}</small>
          </div>
        </div>
      </aside>
    </>
  );
}
