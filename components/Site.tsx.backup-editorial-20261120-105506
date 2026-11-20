
"use client";
import Image from "next/image";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Instagram,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";
import { getWhatsAppUrl, siteConfig } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  const isHome = pathname === "/";
  const isCollection =
    pathname === "/katalog" || pathname.startsWith("/produk/");

  const whatsappUrl = getWhatsAppUrl(
    `Halo ${siteConfig.name}, saya ingin berkonsultasi mengenai layanan butik.`
  );

  const links = [
    { label: "Beranda", href: "/", active: isHome },
    { label: "Koleksi", href: "/katalog", active: isCollection },
    { label: "Tentang Kami", href: "/#about", active: false },
    { label: "Hubungi Kami", href: "/#contact", active: false },
  ];

  return (
    <>
      <a className="skip-link" href="#main-content">
        Lewati ke konten
      </a>

      <header className="header rt-header">
        <div className="rt-header-inner">
          <Link href="/" className="brand rt-brand" aria-label="Rosmawati Thailor Beranda">
            <Image
              src="/images/logo-rosmawati.png"
              alt="Logo Rosmawati Thailor"
              width={100}
              height={100}
              priority
              className="rt-brand-logo"
/>
            <span className="rt-brand-copy">
              <b>{siteConfig.name}</b>
              <small>{siteConfig.tagline.toUpperCase()}</small>
            </span>
          </Link>

          <nav
            id="primary-nav"
            className={open ? "nav show rt-nav" : "nav rt-nav"}
            aria-label="Navigasi utama"
          >
            {links.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={item.active ? "rt-nav-link active" : "rt-nav-link"}
                aria-current={item.active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="rt-header-actions">
            {siteConfig.instagramUrl && (
              <a
                className="rt-social-link"
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Rosmawati Thailor"
              >
                <Instagram size={18} />
              </a>
            )}

            {whatsappUrl && (
              <a
                className="rt-social-link"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Rosmawati Thailor"
              >
                <MessageCircle size={18} />
              </a>
            )}

            <a
              className="rt-consult-button"
              href={whatsappUrl || "/#contact"}
              target={whatsappUrl ? "_blank" : undefined}
              rel={whatsappUrl ? "noopener noreferrer" : undefined}
            >
              Konsultasi Sekarang
              <ArrowUpRight size={15} />
            </a>
          </div>

          <button
            type="button"
            className="menubtn rt-menu-button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="primary-nav"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
    </>
  );
}

export function Footer() {
  const pathname = usePathname();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  const whatsappUrl = getWhatsAppUrl(
    `Halo ${siteConfig.name}, saya ingin bertanya tentang layanan butik.`
  );

  const mapsUrl =
    "https://www.google.com/maps?q=-8.6064763,116.5559239&z=17&hl=id";

  return (
    <footer className="footer rt-footer rt-editorial-footer" id="contact">
      <div className="rt-editorial-footer-grid">

        {/* BRAND */}
        <div className="rt-editorial-brand">
          <Link href="/" className="rt-editorial-brand-link">
            <Image
              src="/images/logo-rosmawati.png"
              alt="Rosmawati Thailor"
              width={70}
              height={70}
              className="rt-editorial-logo"
            />
            <span className="rt-editorial-brand-text">
              <strong>{siteConfig.name}</strong>
              <small>MADE WITH CARE</small>
            </span>
          </Link>

          <p className="rt-editorial-description">
            Busana personal yang dibuat dengan sepenuh hati,
            menghadirkan keindahan dalam setiap detail.
          </p>

          <p className="rt-editorial-motto">
            Elegance is in every stitch.
          </p>

          <div className="rt-editorial-social">
            {siteConfig.instagramUrl && (
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Rosmawati Thailor"
              >
                <Instagram size={17} />
              </a>
            )}

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Rosmawati Thailor"
              >
                <MessageCircle size={17} />
              </a>
            )}
          </div>
        </div>

        {/* EXPLORE */}
        <div className="rt-editorial-column">
          <h3>Jelajahi</h3>
          <Link href="/">Beranda</Link>
          <Link href="/katalog">Koleksi</Link>
          <Link href="/#about">Tentang Kami</Link>
          <Link href="/#contact">Hubungi Kami</Link>
        </div>

        {/* ATELIER */}
        <div className="rt-editorial-column">
          <h3>Atelier</h3>

          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={15} />
              WhatsApp
              <ArrowUpRight size={12} />
            </a>
          )}

          {siteConfig.instagramUrl && (
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={15} />
              Instagram
              <ArrowUpRight size={12} />
            </a>
          )}

          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            <span className="rt-editorial-pin">⌖</span>
            Lokasi Atelier
            <ArrowUpRight size={12} />
          </a>

          <p className="rt-editorial-address">
            Dasan Lendang, Desa Lenek Baru,
            Kecamatan Lenek, Lombok Timur
          </p>
        </div>

        {/* NEWSLETTER / STAY IN TOUCH */}
        <div className="rt-editorial-newsletter">
          <h3>Stay in touch</h3>

          <p>
            Cerita, inspirasi, dan kreasi busana yang dibuat
            dengan perhatian pada setiap detail.
          </p>

          <span className="rt-editorial-newsletter-label">
            Temukan gaya yang mencerminkan diri Anda.
          </span>

          {whatsappUrl && (
            <a
              className="rt-editorial-newsletter-link"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Konsultasikan busana Anda
              <ArrowUpRight size={14} />
            </a>
          )}
        </div>

      </div>

      {/* BOTTOM */}
      <div className="rt-editorial-footer-bottom">
        <span>
          © {new Date().getFullYear()} {siteConfig.name}
        </span>

        <span className="rt-editorial-bottom-motto">
          Made with care, crafted with love.
        </span>
      </div>
    </footer>
  );
}
