
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  LogOut,
  X,
} from "lucide-react";

import { logoutAction } from "@/app/admin/logout-action";
import { siteConfig } from "@/lib/site";

type AdminSidebarProps = {
  drawerOpen: boolean;
  onDrawerClose: () => void;
  adminEmail: string;
  adminName: string | null;
};

export default function AdminSidebar({
  drawerOpen,
  onDrawerClose,
  adminEmail,
  adminName,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isDashboard =
    pathname === "/admin" || pathname === "/admin/";

  const isAccount = pathname.startsWith("/admin/akun");

  const displayName = adminName?.trim() || "Administrator";

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <>
      {drawerOpen && (
        <button
          type="button"
          className="ad-drawer-overlay"
          aria-label="Tutup menu navigasi"
          onClick={onDrawerClose}
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
            padding: 0,
            cursor: "pointer",
          }}
        />
      )}

      <aside
        className="ad-sidebar"
        id="admin-sidebar"
        aria-label="Navigasi admin"
      >
        <div className="ad-brand">
          <span className="ad-brand-mono" aria-hidden="true">
            R
          </span>

          <span className="ad-brand-text">
            <b>{siteConfig.name}</b>
            <small>ADMIN STUDIO</small>
          </span>

          {drawerOpen && (
            <button
              type="button"
              className="ad-iconbtn"
              aria-label="Tutup menu"
              onClick={onDrawerClose}
              style={{ marginLeft: "auto", color: "#ffffff" }}
            >
              <X size={19} />
            </button>
          )}
        </div>

        <div>
          <small className="ad-side-label">WORKSPACE</small>

          <nav className="ad-sidenav">
            <Link
              href="/admin"
              onClick={onDrawerClose}
              className={
                isDashboard
                  ? "ad-sidelink ad-sidelink--active"
                  : "ad-sidelink"
              }
              aria-current={isDashboard ? "page" : undefined}
              title="Dashboard"
            >
              <LayoutDashboard size={18} aria-hidden="true" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/akun"
              onClick={onDrawerClose}
              className={
                isAccount
                  ? "ad-sidelink ad-sidelink--active"
                  : "ad-sidelink"
              }
              aria-current={isAccount ? "page" : undefined}
              title="Akun dan password"
            >
              <KeyRound size={18} aria-hidden="true" />
              <span>Akun &amp; Password</span>
            </Link>
          </nav>
        </div>

        <div className="ad-sidefoot">
          <div className="ad-side-profile">
            <span className="ad-side-avatar" aria-hidden="true">
              {initials || "AD"}
            </span>

            <span className="ad-side-profile-text">
              <b>{displayName}</b>
              <small title={adminEmail}>{adminEmail}</small>
            </span>
          </div>

          <Link
            href="/"
            className="ad-side-view"
            title="Lihat website publik"
          >
            <ExternalLink size={17} aria-hidden="true" />
            <span>Lihat Website</span>
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="ad-sidelogout"
              title="Keluar dari dashboard"
            >
              <LogOut size={17} aria-hidden="true" />
              <span>Keluar dari Admin</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
