"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import type { AdminNotification } from "@/lib/admin-insights";

const COLLAPSE_STORAGE_KEY = "rosmawati-admin-sidebar-collapsed";

type AdminShellProps = {
  adminEmail: string;
  adminName: string | null;
  notifications: AdminNotification[];
  children: React.ReactNode;
};

/**
 * Kerangka antarmuka admin: sidebar (dapat diperkecil, drawer di ponsel)
 * plus topbar. Semua halaman admin di dalam area ini.
 */
export default function AdminShell({
  adminEmail,
  adminName,
  notifications,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Muat preferensi ringkas dari localStorage setelah mount agar tidak
  // menimpa markup server (hindari hydration mismatch).
  useEffect(() => {
    try {
      setCollapsed(
        localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1",
      );
    } catch {
      // localStorage bisa tidak tersedia; abaikan saja.
    }
  }, []);

  // Drawer selalu tertutup saat berpindah halaman.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Escape menutup drawer + kunci scroll saat drawer terbuka.
  useEffect(() => {
    if (!drawerOpen) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }

    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;

      try {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Preferensi tersimpan best-effort saja.
      }

      return next;
    });
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);

  const rootClass = [
    "ad-root",
    collapsed ? "ad-collapsed" : "",
    drawerOpen ? "ad-drawer-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <AdminSidebar
        drawerOpen={drawerOpen}
        onDrawerClose={closeDrawer}
        adminEmail={adminEmail}
        adminName={adminName}
      />

      <div className="ad-body">
        <AdminTopbar
          adminEmail={adminEmail}
          adminName={adminName}
          notifications={notifications}
          collapsed={collapsed}
          onToggleSidebar={toggleCollapsed}
          onOpenDrawer={openDrawer}
        />
        <main className="ad-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
