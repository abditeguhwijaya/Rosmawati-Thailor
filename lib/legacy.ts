/**
 * Data produk lama yang tersimpan di localStorage browser.
 * Dipakai hanya untuk fitur impor sekali jalan ke database.
 */
export type LegacyProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  featured: boolean;
  available: boolean;
};

export const LEGACY_STORAGE_KEYS = [
  "rosmawati-products",
  "maison-products",
] as const;

export function isLegacyProduct(value: unknown): value is LegacyProduct {
  if (!value || typeof value !== "object") return false;

  const product = value as Record<string, unknown>;

  return (
    typeof product.id === "string" &&
    product.id.length > 0 &&
    typeof product.name === "string" &&
    product.name.length > 0 &&
    typeof product.category === "string" &&
    product.category.length > 0 &&
    typeof product.price === "number" &&
    Number.isFinite(product.price) &&
    product.price >= 0 &&
    typeof product.description === "string" &&
    typeof product.image === "string" &&
    product.image.length > 0 &&
    typeof product.featured === "boolean" &&
    typeof product.available === "boolean"
  );
}
