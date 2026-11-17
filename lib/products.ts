import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { Category, Product } from "@/lib/catalog";

const productInclude = {
  category: { select: { id: true, name: true } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    image: row.image,
    featured: row.featured,
    available: row.status === "AVAILABLE",
    categoryId: row.category.id,
    category: row.category.name,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    include: productInclude,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return rows.map(toProduct);
}

export async function getAvailableProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { status: "AVAILABLE" },
    include: productInclude,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return rows.map(toProduct);
}

export async function getFeaturedProducts(limit = 3): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { status: "AVAILABLE", featured: true },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });

  return row ? toProduct(row) : null;
}

export async function getRelatedProducts(
  product: Product,
  limit = 3,
): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: {
      status: "AVAILABLE",
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map(toProduct);
}

export async function getCategories(): Promise<Category[]> {
  const rows = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: row.sortOrder,
    productCount: row._count.products,
  }));
}

export async function getBoutiqueInfo() {
  return prisma.boutiqueInfo.findUnique({ where: { id: "main" } });
}
