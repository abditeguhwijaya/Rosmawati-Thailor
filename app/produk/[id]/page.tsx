
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Ruler,
  Sparkles,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/Icons";

import ProductCard from "@/components/ProductCard";
import { formatIDR } from "@/lib/format";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products";
import {
  getWhatsAppUrl,
  siteConfig,
} from "@/lib/site";

export const dynamic = "force-dynamic";

type DetailProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: DetailProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductBySlug(id);

  if (!product) {
    notFound();
  }

  const description = product.description.slice(0, 160);

  return {
    title: product.name,
    description,
    alternates: {
      canonical: `/produk/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} — ${siteConfig.name}`,
      description,
      url: `/produk/${product.slug}`,
      images: [
        {
          url: product.image,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function Detail({ params }: DetailProps) {
  const { id } = await params;
  const product = await getProductBySlug(id);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product, 3);
  const price = formatIDR(product.price);

  const whatsappUrl = product.available
    ? getWhatsAppUrl(
        `Halo ${siteConfig.name}, saya tertarik dengan ${product.name} (${price}). Boleh saya bertanya lebih lanjut?`,
      )
    : null;

  return (
    <main className="rt-detail-page" id="main-content">
      <div className="rt-detail-container">
        <Link href="/katalog" className="rt-detail-back">
          <ArrowLeft size={15} />
          Kembali ke koleksi
        </Link>

        <div className="rt-detail-grid">
          <div className="rt-detail-visual">
            <div className="rt-detail-image">
              <Image
                src={product.image}
                alt={product.name}
                width={900}
                height={1200}
                priority
                sizes="(max-width: 768px) 100vw, 55vw"
              />

              <span className="rt-detail-image-label">
                ROSMAWATI THAILOR
              </span>
            </div>

            <div className="rt-detail-image-caption">
              <Sparkles size={14} />
              <span>Made with Care, Crafted for You</span>
            </div>
          </div>

          <div className="rt-detail-information">
            <span className="rt-detail-eyebrow">
              THE COLLECTION / {product.category}
            </span>

            <h1>{product.name}</h1>

            <div className="rt-detail-price">
              {price}
            </div>

            <div className="rt-detail-separator" />

            <span className="rt-detail-description-label">
              ABOUT THIS PIECE
            </span>

            <p className="rt-detail-description">
              {product.description}
            </p>

            <div className="rt-detail-availability">
              <span className="rt-detail-availability-icon">
                {product.available ? (
                  <Check size={15} />
                ) : (
                  <Ruler size={15} />
                )}
              </span>

              <div>
                <strong>
                  {product.available
                    ? "Tersedia untuk dipesan"
                    : "Belum tersedia"}
                </strong>

                <small>
                  {product.available
                    ? "Hubungi butik untuk konsultasi dan pemesanan."
                    : "Hubungi butik untuk informasi ketersediaan."}
                </small>
              </div>
            </div>

            {product.available && whatsappUrl ? (
              <a
                className="rt-detail-order-button"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon size={18} />
                Pesan melalui WhatsApp
                <ArrowUpRight size={17} />
              </a>
            ) : (
              <span
                className="rt-detail-order-button disabled"
                aria-disabled="true"
              >
                <WhatsAppIcon size={18} />
                {product.available
                  ? "WhatsApp belum dikonfigurasi"
                  : "Produk belum tersedia"}
              </span>
            )}

            <p className="rt-detail-note">
              Harga dan detail produk dapat dikonfirmasi
              terlebih dahulu sebelum pemesanan.
            </p>

            <div className="rt-detail-benefits">
              <div>
                <Sparkles size={17} />
                <span>Made with Care</span>
              </div>

              <div>
                <Ruler size={17} />
                <span>Personal Touch</span>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="rt-related-section">
            <div className="rt-related-heading">
              <div>
                <span>DISCOVER MORE</span>
                <h2>
                  Pilihan <i>lainnya</i>
                </h2>
              </div>

              <Link href="/katalog">
                Lihat semua koleksi
                <ArrowUpRight size={15} />
              </Link>
            </div>

            <div className="rt-catalog-grid">
              {related.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
