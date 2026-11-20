
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Ruler,
  Sparkles,
  Scissors,
  MessageCircle,
  Instagram,
  CheckCircle2,
} from "lucide-react";

import LoadingScreen from "@/components/LoadingScreen";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts } from "@/lib/products";
import { getWhatsAppUrl, siteConfig } from "@/lib/site";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function FeaturedCollection() {
  const featured = await getFeaturedProducts(4);

  if (featured.length === 0) {
    return (
      <div className="empty-state">
        <p>Belum ada koleksi unggulan saat ini.</p>
        <Link className="btn" href="/katalog">
          Lihat semua koleksi
        </Link>
      </div>
    );
  }

  return (
    <div className="grid rt-home-products">
      {featured.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

const processSteps = [
  {
    number: "01",
    title: "Konsultasi",
    description:
      "Ceritakan model, kebutuhan, dan busana yang ingin Anda wujudkan.",
  },
  {
    number: "02",
    title: "Pengukuran",
    description:
      "Diskusikan ukuran dan detail yang dibutuhkan untuk busana Anda.",
  },
  {
    number: "03",
    title: "Pemilihan Bahan",
    description:
      "Tentukan bahan, warna, dan detail sesuai konsep yang diinginkan.",
  },
  {
    number: "04",
    title: "Proses Jahit",
    description:
      "Busana dikerjakan dengan perhatian pada detail dan kerapian.",
  },
  {
    number: "05",
    title: "Penyelesaian",
    description:
      "Lakukan pemeriksaan akhir dan koordinasikan pengambilan pesanan.",
  },
];

export default async function Home() {
  // Mengambil pengaturan Hero dan About dari database.
  const settings = await prisma.homePageSettings.findUnique({
    where: {
      id: "main",
    },
  });

  const whatsappUrl = getWhatsAppUrl(
    `Halo ${siteConfig.name}, saya ingin berkonsultasi tentang jasa jahit custom.`,
  );

  // Nilai default jika pengaturan belum tersedia.
  const heroEyebrow =
    settings?.heroEyebrow ?? "THE ART OF PERSONAL STYLE";

  const heroTitle =
    settings?.heroTitle ?? "Elegance is in every stitch.";

  const heroDescription =
    settings?.heroDescription ??
    "Busana yang dibuat dengan ketelitian, sentuhan personal, dan perhatian pada setiap detail. Karena gaya terbaik adalah yang terasa seperti diri Anda.";

  const heroImage =
    settings?.heroImage ??
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=90";

  const heroImagePosition =
    settings?.heroImagePosition ?? "center 35%";

  const heroImageHeight =
    settings?.heroImageHeight ?? 680;

  const heroPrimaryText =
    settings?.heroPrimaryText ?? "Jelajahi Koleksi";

  const heroPrimaryLink =
    settings?.heroPrimaryLink ?? "/katalog";

  const heroSecondaryText =
    settings?.heroSecondaryText ?? "Cerita kami";

  const heroSecondaryLink =
    settings?.heroSecondaryLink ?? "#about";

  const heroStampTop =
    settings?.heroStampTop ?? "MADE";

  const heroStampMiddle =
    settings?.heroStampMiddle ?? "WITH";

  const heroStampBottom =
    settings?.heroStampBottom ?? "LOVE";

  const aboutEyebrow =
    settings?.aboutEyebrow ?? "OUR STORY & PHILOSOPHY";

  const aboutTitle =
    settings?.aboutTitle ?? "Lebih dari sekadar pakaian.";

  const aboutDescription =
    settings?.aboutDescription ??
    "Rosmawati Thailor menghadirkan layanan butik dan jahit custom dengan sentuhan personal. Kami percaya bahwa busana yang indah bukan hanya tentang penampilan, tetapi juga kenyamanan dan karakter pemakainya.";

  const aboutImage =
    settings?.aboutImage ??
    "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1000&q=85";

  const aboutImageNote =
    settings?.aboutImageNote ?? "Crafted with care";

  const aboutButtonText =
    settings?.aboutButtonText ?? "Temukan koleksi kami";

  const aboutButtonLink =
    settings?.aboutButtonLink ?? "/katalog";

  return (
    <main id="main-content" className="rt-home">
      {/* HERO */}
      <section className="rt-hero">
        <div className="rt-hero-content">
          <span className="rt-eyebrow">
            <span className="rt-eyebrow-line" />
            {heroEyebrow}
          </span>

          <h1>{heroTitle}</h1>

          <p className="rt-hero-description">
            {heroDescription}
          </p>

          <div className="rt-hero-actions">
            <Link
              href={heroPrimaryLink}
              className="rt-button-primary"
            >
              {heroPrimaryText}
              <ArrowRight size={17} />
            </Link>

            <Link
              href={heroSecondaryLink}
              className="rt-text-link"
            >
              {heroSecondaryText}
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="rt-hero-signature">
            <span>✳</span>
            Thoughtfully tailored · Made just for you
          </div>
        </div>

        <div className="rt-hero-visual">
          <div
            className="rt-hero-image"
            style={{
              height: `${heroImageHeight}px`,
            }}
          >
            <Image
              key={heroImage}
              src={heroImage}
              alt="Inspirasi busana elegan Rosmawati Thailor"
              fill
              priority
              quality={90}
              sizes="(max-width: 760px) 100vw, 52vw"
              style={{
                objectPosition: heroImagePosition,
              }}
            />
          </div>

          <div className="rt-hero-stamp">
            <span>{heroStampTop}</span>
            <span>{heroStampMiddle}</span>
            <em>{heroStampBottom}</em>
          </div>

          <div className="rt-hero-caption">
            <span>COLLECTION Nº 01</span>
            <span>TIMELESS FORM</span>
          </div>

          <div className="rt-hero-side-note">
            {siteConfig.tagline}
          </div>
        </div>
      </section>

      {/* BRAND TICKER */}
      <div className="rt-ticker" aria-label="Nilai butik">
        <span>✳ Detail yang diperhatikan</span>
        <span>✳ Dibuat dengan teliti</span>
        <span>✳ Sentuhan personal</span>
        <span>✳ Pesan dengan mudah</span>
      </div>

      {/* COLLECTION */}
      <section
        className="rt-section rt-collection"
        id="collection"
      >
        <div className="rt-section-heading">
          <div>
            <span className="rt-eyebrow">CURATED FOR YOU</span>

            <h2>
              Koleksi <em>pilihan</em>
            </h2>

            <p>
              Temukan inspirasi busana dan karya pilihan dari
              Rosmawati Thailor.
            </p>
          </div>

          <Link href="/katalog" className="rt-text-link">
            Lihat semua koleksi
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <Suspense
          fallback={<LoadingScreen label="Memuat koleksi..." />}
        >
          <FeaturedCollection />
        </Suspense>
      </section>

      
      {/* ABOUT - FULL WIDTH EDITORIAL BANNER */}
      <section className="rt-about" id="about">
        <div className="rt-about-background">
          <Image
            key={aboutImage}
            src={aboutImage}
            alt="Butik dan karya busana Rosmawati Thailor"
            fill
            loading="lazy"
            quality={90}
            sizes="100vw"
            className="rt-about-background-image"
          />
          <div className="rt-about-overlay" />
        </div>

        <div className="rt-about-inner">
          <div className="rt-about-content">
            <span className="rt-eyebrow">
              <span className="rt-eyebrow-line" />
              {aboutEyebrow}
            </span>

            <h2>{aboutTitle}</h2>

            <p className="rt-about-description">
              {aboutDescription}
            </p>

            <div className="rt-values">
              <div className="rt-value-item">
                <span className="rt-value-icon">
                  <Sparkles size={21} />
                </span>
                <div>
                  <b>
                    {settings?.aboutValue1Title ?? "Detail Matters"}
                  </b>
                  <p>
                    {settings?.aboutValue1Desc ??
                      "Perhatian pada detail dan kerapian pengerjaan."}
                  </p>
                </div>
              </div>

              <div className="rt-value-item">
                <span className="rt-value-icon">
                  <Ruler size={21} />
                </span>
                <div>
                  <b>
                    {settings?.aboutValue2Title ?? "Made Personal"}
                  </b>
                  <p>
                    {settings?.aboutValue2Desc ??
                      "Busana dapat dikonsultasikan sesuai kebutuhan."}
                  </p>
                </div>
              </div>

              <div className="rt-value-item">
                <span className="rt-value-icon">
                  <Heart size={21} />
                </span>
                <div>
                  <b>
                    {settings?.aboutValue3Title ?? "Made with Care"}
                  </b>
                  <p>
                    {settings?.aboutValue3Desc ??
                      "Setiap proses dikerjakan dengan penuh perhatian."}
                  </p>
                </div>
              </div>
            </div>

            <Link href={aboutButtonLink} className="rt-text-link">
              {aboutButtonText}
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="rt-about-image-note">
            <Scissors size={19} />
            <span>{aboutImageNote}</span>
          </div>

          <div className="rt-about-side-note">
            MADE WITH CARE
          </div>
        </div>
      </section>


      {/* CRAFTSMANSHIP */}
      <section className="rt-craft">
        <div className="rt-section-heading rt-craft-heading">
          <div>
            <span className="rt-eyebrow">
              THE CRAFT OF TAILORING
            </span>

            <h2>
              Dibuat dengan <em>perhatian.</em>
            </h2>

            <p>
              Setiap pesanan dimulai dari percakapan dan
              diselesaikan dengan perhatian pada kebutuhan Anda.
            </p>
          </div>
        </div>

        <div className="rt-craft-grid">
          <div className="rt-craft-card">
            <span>01</span>
            <Sparkles size={24} />

            <h3>Detail yang diperhatikan</h3>

            <p>
              Memperhatikan detail model dan kebutuhan busana
              yang Anda inginkan.
            </p>
          </div>

          <div className="rt-craft-card">
            <span>02</span>
            <Ruler size={24} />

            <h3>Ukuran personal</h3>

            <p>
              Konsultasi ukuran agar busana dapat disesuaikan
              dengan kebutuhan pemakainya.
            </p>
          </div>

          <div className="rt-craft-card">
            <span>03</span>
            <Heart size={24} />

            <h3>Sentuhan personal</h3>

            <p>
              Memberikan ruang bagi pelanggan untuk menyampaikan
              ide dan preferensi desain.
            </p>
          </div>
        </div>
      </section>

      {/* ORDER PROCESS */}
      <section className="rt-process" id="order">
        <div className="rt-section-heading rt-process-heading">
          <div>
            <span className="rt-eyebrow">HOW TO ORDER</span>

            <h2>
              Dari ide menjadi <em>nyata.</em>
            </h2>

            <p>
              Proses konsultasi dan pemesanan yang mudah melalui
              komunikasi langsung dengan butik.
            </p>
          </div>
        </div>

        <div className="rt-process-grid">
          {processSteps.map((step, index) => (
            <div className="rt-process-step" key={step.number}>
              <div className="rt-process-number">
                {step.number}

                {index !== processSteps.length - 1 && (
                  <span className="rt-process-line" />
                )}
              </div>

              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>

        <div className="rt-process-note">
          <CheckCircle2 size={17} />

          <span>
            Detail harga, bahan, waktu pengerjaan, dan kesepakatan
            pesanan dikonfirmasi langsung melalui WhatsApp.
          </span>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="rt-contact-cta">
        <div className="rt-contact-decoration">R</div>

        <div className="rt-contact-content">
          <span className="rt-eyebrow">
            LET&apos;S CREATE SOMETHING BEAUTIFUL
          </span>

          <h2>
            Punya desain <em>impian?</em>
          </h2>

          <p>
            Ceritakan kebutuhan busana Anda. Mari mulai konsultasi
            bersama Rosmawati Thailor.
          </p>

          <div className="rt-contact-actions">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rt-button-primary"
              >
                <MessageCircle size={17} />
                Konsultasi via WhatsApp
                <ArrowUpRight size={15} />
              </a>
            ) : (
              <a
                href="#contact"
                className="rt-button-primary"
              >
                Hubungi Kami
                <ArrowRight size={16} />
              </a>
            )}

            {siteConfig.instagramUrl && (
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rt-button-outline"
              >
                <Instagram size={17} />
                Kunjungi Instagram
                <ArrowUpRight size={15} />
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
