import AdminDashboard from "./AdminDashboard";
import { requireAdminPage } from "@/lib/auth/session";
import { getCategories, getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const admin = await requireAdminPage("/admin");
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <AdminDashboard
      adminEmail={admin.email}
      adminName={admin.name}
      initialProducts={products}
      initialCategories={categories}
    />
  );
}
