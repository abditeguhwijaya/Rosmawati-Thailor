
import type { Category, Product } from "@/lib/catalog";

/**
 * Perhitungan insight dashboard admin.
 * Semua angka berasal dari data database nyata.
 */

export type GrowthPoint = {
  key: string;
  label: string;
  added: number;
  total: number;
};

export type AdminNotification = {
  id: string;
  tone: "info" | "warning" | "success";
  title: string;
  message: string;
};

const MAX_SERIES_MONTHS = 120;

const monthLabelFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(
    date.getUTCMonth() + 1
  ).padStart(2, "0")}`;
}

/**
 * Grafik pertumbuhan produk berdasarkan createdAt.
 * Rentang grafik ditentukan dari bulan pertama hingga bulan
 * terakhir produk tercatat agar hasil server dan browser konsisten.
 */
export function buildGrowthSeries(products: Product[]): GrowthPoint[] {
  if (products.length === 0) return [];

  const addedPerMonth = new Map<string, number>();

  let firstKey: string | null = null;
  let lastKey: string | null = null;

  for (const product of products) {
    const date = new Date(product.createdAt);

    if (Number.isNaN(date.getTime())) continue;

    const key = monthKey(date);

    addedPerMonth.set(
      key,
      (addedPerMonth.get(key) ?? 0) + 1
    );

    if (firstKey === null || key < firstKey) {
      firstKey = key;
    }

    if (lastKey === null || key > lastKey) {
      lastKey = key;
    }
  }

  if (firstKey === null || lastKey === null) {
    return [];
  }

  const points: GrowthPoint[] = [];
  let total = 0;

  let year = Number(firstKey.slice(0, 4));
  let month = Number(firstKey.slice(5, 7));

  for (
    let iteration = 0;
    iteration < MAX_SERIES_MONTHS;
    iteration += 1
  ) {
    const key = `${String(year).padStart(4, "0")}-${String(
      month
    ).padStart(2, "0")}`;

    const added = addedPerMonth.get(key) ?? 0;

    total += added;

    points.push({
      key,
      label: monthLabelFormatter.format(
        new Date(Date.UTC(year, month - 1, 15))
      ),
      added,
      total,
    });

    if (key === lastKey) break;

    month += 1;

    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return points;
}

/**
 * Notifikasi berdasarkan kondisi data produk dan kategori.
 */
export function buildAdminNotifications(
  products: Product[],
  categories: Category[]
): AdminNotification[] {
  const items: AdminNotification[] = [];

  const unavailableCount = products.filter(
    (product) => !product.available
  ).length;

  if (unavailableCount > 0) {
    items.push({
      id: "unavailable-products",
      tone: "warning",
      title: "Produk tidak tersedia",
      message: `${unavailableCount} produk disembunyikan dari katalog publik.`,
    });
  }

  const emptyCategories = categories.filter(
    (category) => category.productCount === 0
  );

  if (emptyCategories.length > 0) {
    const names = emptyCategories
      .slice(0, 3)
      .map((category) => category.name)
      .join(", ");

    const suffix =
      emptyCategories.length > 3
        ? `, dan ${emptyCategories.length - 3} lainnya`
        : "";

    items.push({
      id: "empty-categories",
      tone: "info",
      title: "Kategori kosong",
      message: `${emptyCategories.length} kategori belum memiliki produk: ${names}${suffix}.`,
    });
  }

  const hasFeatured = products.some(
    (product) => product.featured && product.available
  );

  if (products.length > 0 && !hasFeatured) {
    items.push({
      id: "no-featured",
      tone: "info",
      title: "Belum ada produk unggulan",
      message:
        "Tandai produk unggulan agar tampil di beranda website.",
    });
  }

  if (items.length === 0) {
    items.push({
      id: "all-clear",
      tone: "success",
      title: "Semua beres",
      message:
        "Katalog dalam kondisi baik dan tidak perlu perhatian khusus.",
    });
  }

  return items;
}
