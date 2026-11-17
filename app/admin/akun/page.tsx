import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/session";
import { getCategories, getProducts } from "@/lib/products";
import AccountView from "./AccountView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Akun Admin",
  robots: { index: false, follow: false, nocache: true },
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminAccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminPage("/admin/akun");
  const params = await searchParams;
  const passwordChanged = Boolean(firstParam(params.changed));
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <AccountView
      adminEmail={admin.email}
      adminName={admin.name}
      lastLoginAt={admin.lastLoginAt ? admin.lastLoginAt.toISOString() : null}
      passwordChangedAt={
        admin.passwordChangedAt ? admin.passwordChangedAt.toISOString() : null
      }
      passwordChanged={passwordChanged}
      initialProducts={products}
      initialCategories={categories}
    />
  );
}
