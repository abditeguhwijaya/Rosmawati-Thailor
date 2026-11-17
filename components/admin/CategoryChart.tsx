
import { ChartPie, PackageOpen } from "lucide-react";
import type { Category } from "@/lib/catalog";

/**
 * Palet warna premium Rosmawati Thailor.
 */
const DONUT_COLORS = [
  "#8a4f5d",
  "#b08d68",
  "#c99ba5",
  "#5f7464",
  "#38272c",
  "#9a7ba4",
  "#d8a48f",
  "#7d8fa1",
];

const EMPTY_COLOR = "#cfc4c9";

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 70;
const STROKE_WIDTH = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Slice = {
  category: Category;
  color: string;
  value: number;
  percentage: number;
};

/**
 * Donut chart komposisi produk berdasarkan kategori.
 * Seluruh data diambil dari database.
 */
export default function CategoryChart({
  categories,
}: {
  categories: Category[];
}) {
  const sorted = [...categories].sort(
    (first, second) => second.productCount - first.productCount,
  );

  const totalProducts = sorted.reduce(
    (total, category) => total + category.productCount,
    0,
  );

  const slices: Slice[] = sorted.map((category, index) => ({
    category,
    color:
      category.productCount > 0
        ? DONUT_COLORS[index % DONUT_COLORS.length]
        : EMPTY_COLOR,
    value: category.productCount,
    percentage:
      totalProducts > 0
        ? Math.round((category.productCount / totalProducts) * 100)
        : 0,
  }));

  const activeSlices = slices.filter((slice) => slice.value > 0);

  let accumulated = 0;

  return (
    <section className="ad-card">
      {/* Header */}
      <div className="ad-card-head">
        <div className="ad-card-head-text">
          <div className="ad-card-title">
            <span aria-hidden="true">
              <ChartPie size={17} />
            </span>
            <h3>Komposisi Kategori</h3>
          </div>

          <p>
            Sebaran produk berdasarkan kelompok koleksi butik.
          </p>
        </div>
      </div>

      {/* Chart content */}
      <div className="ad-card-body">
        {totalProducts === 0 ? (
          <div className="ad-chart-empty">
            <span aria-hidden="true">
              <PackageOpen size={22} />
            </span>

            <b>Belum ada produk</b>

            <p>
              Komposisi kategori akan terhitung otomatis setelah
              produk ditambahkan.
            </p>
          </div>
        ) : (
          <div className="ad-donut-wrap">
            {/* Donut chart */}
            <div className="ad-donut">
              <svg
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                role="img"
                aria-label={`Komposisi ${totalProducts} produk berdasarkan kategori.`}
              >
                <circle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke="#f3ecea"
                  strokeWidth={STROKE_WIDTH}
                />

                <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
                  {activeSlices.map((slice) => {
                    const length =
                      (slice.value / totalProducts) * CIRCUMFERENCE;

                    const offset = accumulated;
                    accumulated += length;

                    return (
                      <circle
                        key={slice.category.id}
                        cx={CENTER}
                        cy={CENTER}
                        r={RADIUS}
                        fill="none"
                        stroke={slice.color}
                        strokeWidth={STROKE_WIDTH}
                        strokeDasharray={`${Math.max(length - 2, 0.5)} ${CIRCUMFERENCE}`}
                        strokeDashoffset={-offset - 1}
                        strokeLinecap="butt"
                      >
                        <title>
                          {slice.category.name}: {slice.value} produk
                          ({slice.percentage}%)
                        </title>
                      </circle>
                    );
                  })}
                </g>

                {/* Total di tengah donut */}
                <text
                  x={CENTER}
                  y={CENTER - 4}
                  textAnchor="middle"
                  fontSize={30}
                  fontWeight={800}
                  fill="#29252a"
                >
                  {totalProducts}
                </text>

                <text
                  x={CENTER}
                  y={CENTER + 18}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="#a49aa0"
                >
                  produk total
                </text>
              </svg>
            </div>

            {/* Category legend */}
            <div className="ad-legend">
              {slices.map((slice) => (
                <div
                  className="ad-legend-item"
                  key={slice.category.id}
                >
                  <span
                    className="ad-legend-swatch"
                    style={{ backgroundColor: slice.color }}
                    aria-hidden="true"
                  />

                  <span
                    className="ad-legend-name"
                    title={slice.category.name}
                  >
                    {slice.category.name}
                  </span>

                  <span className="ad-legend-count">
                    {slice.value} produk
                  </span>

                  <span className="ad-legend-pct">
                    {slice.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
