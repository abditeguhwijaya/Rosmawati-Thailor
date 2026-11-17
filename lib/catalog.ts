export type ProductStatus = "AVAILABLE" | "UNAVAILABLE";

/** Bentuk produk yang aman dikirim ke komponen client (tanpa tipe Prisma). */
export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  image: string;
  featured: boolean;
  available: boolean;
  categoryId: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  productCount: number;
};

export type ProductInput = {
  name: string;
  categoryId: string;
  price: number;
  description: string;
  image: string;
  featured: boolean;
  available: boolean;
};
