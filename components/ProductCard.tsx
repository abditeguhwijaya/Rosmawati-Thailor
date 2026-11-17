
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { formatIDR } from "@/lib/format";

function getSafeImageSrc(image: string): string | null {
  if (!image || typeof image !== "string") return null;

  const value = image.trim();

  // Gambar lokal dari folder uploads.
  if (/^\/uploads\/[A-Za-z0-9._-]+$/.test(value)) {
    return value;
  }

  // Validasi URL gambar eksternal.
  try {
    const url = new URL(value);

    if (url.protocol !== "https:") return null;

    const allowedHosts = [
      "images.unsplash.com",
      "images.tokopedia.net",
      "down-id.img.susercontent.com",
    ];

    if (!allowedHosts.includes(url.hostname)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const detailUrl = `/produk/${product.slug}`;
  const imageSrc = getSafeImageSrc(product.image);

  return (
    <article className="rt-product-card">
      <Link
        href={detailUrl}
        className="rt-product-photo"
        aria-label={`Lihat detail ${product.name}`}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            width={600}
            height={750}
            loading="lazy"
            sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
            className="rt-product-image"
          />
        ) : (
          <div
            className="rt-product-placeholder"
            role="img"
            aria-label={`Foto ${product.name} belum tersedia`}
          >
            <ImageIcon size={34} strokeWidth={1.2} />
            <span>Foto produk belum tersedia</span>
          </div>
        )}

        <span className="rt-product-curated">
          CURATED SELECTION
        </span>

        <span className="rt-product-overlay">
          Lihat detail
          <ArrowUpRight size={16} />
        </span>
      </Link>

      <div className="rt-product-info">
        <span className="rt-product-category">
          {product.category}
        </span>

        <div className="rt-product-bottom">
          <h3>
            <Link href={detailUrl}>
              {product.name}
            </Link>
          </h3>

          <span className="rt-product-price">
            {formatIDR(product.price)}
          </span>
        </div>

        <Link
          href={detailUrl}
          className="rt-product-detail-link"
          aria-label={`Lihat informasi ${product.name}`}
        >
          Lihat Produk
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}
