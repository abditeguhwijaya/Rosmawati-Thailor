import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/session";
import { getCategories, getProducts } from "@/lib/products";
import CategoryManager from "./CategoryManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kategori",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminCategoriesPage() {
  const admin = await requireAdminPage("/admin/kategori");
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <CategoryManager
      adminEmail={admin.email}
      adminName={admin.name}
      initialProducts={products}
      initialCategories={categories}
    />
  );
}
