
import type { Metadata } from "next";

import { requireAdminPage } from "@/lib/auth/session";
import { getProducts, getCategories } from "@/lib/products";
import { prisma } from "@/lib/db";
import { buildAdminNotifications } from "@/lib/admin-insights";
import AdminShell from "@/components/admin/AdminShell";
import HomePageSettingsForm from "./HomePageSettingsForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pengaturan Beranda | Rosmawati Thailor Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function HomePageSettingsPage() {
  const admin = await requireAdminPage(
    "/admin/pengaturan-beranda",
  );

  const [settings, products, categories] = await Promise.all([
    prisma.homePageSettings.findUnique({
      where: {
        id: "main",
      },
    }),
    getProducts(),
    getCategories(),
  ]);

  const notifications = buildAdminNotifications(
    products,
    categories,
  );

  return (
    <AdminShell
      adminEmail={admin.email}
      adminName={admin.name}
      notifications={notifications}
    >
      <HomePageSettingsForm initialSettings={settings} />
    </AdminShell>
  );
}
