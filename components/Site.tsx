
"use client";

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
            <span className="monogram" aria-hidden="true">R</span>
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

  return (
    <footer className="footer rt-footer" id="contact">
      <div className="rt-footer-grid">
        <div className="rt-footer-brand">
          <Link href="/" className="brand rt-brand">
            <span className="monogram" aria-hidden="true">R</span>
            <span className="rt-brand-copy">
              <b>{siteConfig.name}</b>
              <small>{siteConfig.tagline.toUpperCase()}</small>
            </span>
          </Link>

          <p>
            Setiap jahitan memiliki cerita. Busana personal yang dibuat
            dengan sepenuh hati dan perhatian pada setiap detail.
          </p>

          <span className="rt-footer-motto">
            Elegance is in every stitch.
          </span>
        </div>

        <div className="rt-footer-column">
          <b>Jelajahi</b>
          <Link href="/">Beranda</Link>
          <Link href="/katalog">Koleksi</Link>
          <Link href="/#about">Tentang Kami</Link>
          <Link href="/#contact">Hubungi Kami</Link>
        </div>

        <div className="rt-footer-column">
          <b>Hubungi Kami</b>

          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} />
              WhatsApp
              <ArrowUpRight size={13} />
            </a>
          ) : (
            <span className="footer-muted">WhatsApp belum diatur</span>
          )}

          {siteConfig.instagramUrl && (
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={16} />
              Instagram
              <ArrowUpRight size={13} />
            </a>
          )}

          {siteConfig.address && <span>{siteConfig.address}</span>}
          {siteConfig.openingHours && <span>{siteConfig.openingHours}</span>}
        </div>
      </div>

      <div className="rt-footer-bottom">
        <span>
          © {new Date().getFullYear()} {siteConfig.name}
        </span>
        <span>Made with care, crafted with love.</span>
      </div>
    </footer>
  );
}
