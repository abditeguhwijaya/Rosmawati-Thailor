"use client";

import Link from "next/link";

export default function LocationSection() {
  const mapsUrl = "https://www.google.com/maps?q=-8.6064763,116.5559239&z=17&hl=id";

  return (
    <section className="rt-location-section" id="location">
      <div className="rt-location-inner">

        {/* KOLOM 1 */}
        <div className="rt-location-brand">
          <span className="rt-location-eyebrow">ROSMAWATI THAILOR</span>

          <h2>
            Made with care,
            <br />
            crafted with love.
          </h2>

          <p>
            Setiap jahitan memiliki cerita. Kami menghadirkan busana personal
            dengan perhatian pada detail, kualitas, dan keindahan.
          </p>

          <span className="rt-location-slogan">
            Elegance is in every stitch.
          </span>
        </div>

        {/* KOLOM 2 */}
        <div className="rt-location-links">
          <h3>Jelajahi</h3>

          <Link href="/">Beranda</Link>
          <Link href="/#collection">Koleksi</Link>
          <Link href="/#about">Tentang Kami</Link>
          <Link href="/#contact">Hubungi Kami</Link>
        </div>

        {/* KOLOM 3 */}
        <div className="rt-location-contact">
          <h3>Hubungi Kami</h3>

          <a
            href="https://wa.me/6283835311747"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp ↗
          </a>

          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram ↗
          </a>

          <div className="rt-location-address">
            <span className="rt-location-icon">⌖</span>

            <div>
              <strong>Lokasi Atelier</strong>
              <p>
                Dasan Lendang, Desa Lenek Baru,
                Kecamatan Lenek, Lombok Timur
              </p>

              <a
                className="rt-location-map-link"
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Lihat Lokasi di Google Maps ↗
              </a>
            </div>
          </div>
        </div>

        {/* KOLOM 4 */}
        <div className="rt-location-info">
          <h3>Layanan Kami</h3>

          <span>Busana Custom</span>
          <span>Jahit &amp; Permak</span>
          <span>Konsultasi Model</span>
          <span>Personal Styling</span>

          <div className="rt-location-note">
            <span>✦</span>
            <p>
              Temukan keanggunan dalam setiap detail busana yang dirancang
              khusus untuk Anda.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
