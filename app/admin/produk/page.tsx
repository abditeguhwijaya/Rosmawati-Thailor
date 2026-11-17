import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/session";
import { getCategories, getProducts } from "@/lib/products";
import ProductManager from "./ProductManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manajemen Produk",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminProductsPage() {
  const admin = await requireAdminPage("/admin/produk");
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <ProductManager
      adminEmail={admin.email}
      adminName={admin.name}
      initialProducts={products}
      initialCategories={categories}
    />
  );
}
