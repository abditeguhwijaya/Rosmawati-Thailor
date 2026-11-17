const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Format angka menjadi Rupiah tanpa desimal, aman untuk nilai tidak valid. */
export function formatIDR(value: number): string {
  return idrFormatter.format(Number.isFinite(value) ? value : 0);
}
