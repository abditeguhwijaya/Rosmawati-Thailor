import type { MetadataRoute } from "next";
import { getAvailableProducts } from "@/lib/products";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.siteUrl}/katalog`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  try {
    const products = await getAvailableProducts();

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${siteConfig.siteUrl}/produk/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    // Sitemap tetap tersedia walau database sedang tidak bisa diakses.
    console.error("sitemap:", error);
    return staticRoutes;
  }
}
