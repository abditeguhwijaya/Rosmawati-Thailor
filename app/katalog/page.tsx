
import CatalogClient from "@/components/CatalogClient";
import { getAvailableProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Katalog() {
  const products = await getAvailableProducts();

  return (
    <main className="rt-catalog-page" id="main-content">
      <section className="rt-catalog-intro">
        <span className="rt-catalog-eyebrow">
          ROSMAWATI THAILOR — THE COLLECTION
        </span>

        <h1>
          Temukan Gaya <i>Istimewa</i> Anda
        </h1>

        <p>
          Setiap potongan memiliki cerita. Temukan koleksi busana
          yang dirancang dengan ketelitian, keanggunan, dan sentuhan personal.
        </p>

        <div className="rt-catalog-divider">
          <span />
          <span className="rt-catalog-divider-symbol">·</span>
          <span />
        </div>

        <small>
          MADE WITH CARE · CRAFTED FOR YOU
        </small>
      </section>

      <section className="rt-catalog-content" aria-label="Daftar koleksi">
        <div className="rt-catalog-heading">
          <div>
            <span>OUR SELECTION</span>
            <h2>Koleksi Pilihan</h2>
          </div>

          <p>
            {products.length} koleksi tersedia
          </p>
        </div>

        <CatalogClient products={products} />
      </section>
    </main>
  );
}
