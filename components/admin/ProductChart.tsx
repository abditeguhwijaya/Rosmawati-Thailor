"use client";

import { useMemo, useState } from "react";
import { ChartColumn, Info, PackageOpen } from "lucide-react";
import type { GrowthPoint } from "@/lib/admin-insights";

type RangeKey = "6" | "12" | "all";

const RANGE_OPTIONS: Array<{ key: RangeKey; label: string; months: number }> = [
  { key: "6", label: "6 bulan", months: 6 },
  { key: "12", label: "12 bulan", months: 12 },
  { key: "all", label: "Semua", months: Number.POSITIVE_INFINITY },
];

const WIDTH = 720;
const HEIGHT = 252;
const PAD = { top: 22, right: 18, bottom: 34, left: 44 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

function defaultRange(months: number): RangeKey {
  if (months > 12) return "12";
  if (months > 6) return "6";
  return "all";
}

/**
 * Grafik perkembangan koleksi: batang = produk baru per bulan,
 * garis = total produk kumulatif. Semua angka diturunkan dari createdAt
 * produk di database — tidak ada tren atau proyeksi buatan.
 */
export default function ProductChart({ series }: { series: GrowthPoint[] }) {
  const [range, setRange] = useState<RangeKey>(defaultRange(series.length));

  const months = series.length;
  const selected = RANGE_OPTIONS.find((option) => option.key === range);
  const sliceMonths = Math.min(selected?.months ?? months, months);
  const points = useMemo(
    () => series.slice(Math.max(0, months - sliceMonths)),
    [series, months, sliceMonths],
  );

  const maxTotal = Math.max(1, ...points.map((point) => point.total));
  const maxAdded = Math.max(1, ...points.map((point) => point.added));
  const activeMonths = points.filter((point) => point.added > 0).length;
  const showFilters = months > 6;
  const limitedHistory = months > 0 && (months <= 3 || activeMonths <= 1);

  const slot = points.length > 0 ? PLOT_W / points.length : PLOT_W;
  const barWidth = Math.min(30, slot * 0.52);
  const labelStep = Math.max(1, Math.ceil(points.length / 9));

  function xAt(index: number): number {
    return PAD.left + slot * index + slot / 2;
  }

  function yTotal(value: number): number {
    return PAD.top + PLOT_H * (1 - value / maxTotal);
  }

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${xAt(index).toFixed(1)},${yTotal(point.total).toFixed(1)}`,
    )
    .join(" ");

  const areaPath =
    points.length > 1
      ? `${linePath} L${xAt(points.length - 1).toFixed(1)},${(PAD.top + PLOT_H).toFixed(1)} L${xAt(0).toFixed(1)},${(PAD.top + PLOT_H).toFixed(1)} Z`
      : "";

  const lastTotal = points[points.length - 1]?.total ?? 0;
  const firstLabel = series[0]?.label ?? "";

  return (
    <section className="ad-card">
      <div className="ad-card-head">
        <div className="ad-card-head-text">
          <div className="ad-card-title">
            <span aria-hidden="true">
              <ChartColumn size={17} />
            </span>
            <h3>Perkembangan Koleksi</h3>
          </div>
          <p>
            Batang: produk baru per bulan · Garis: total kumulatif. Berdasarkan
            tanggal produk tercatat.
          </p>
        </div>
        <div className="ad-chart-head-tools">
          <span className="ad-chart-total">
            Total kini: <b>{lastTotal}</b> produk
          </span>
          {showFilters && (
            <div className="ad-chart-filters" role="group" aria-label="Rentang grafik">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`ad-chart-filter${range === option.key ? " ad-chart-filter--active" : ""}`}
                  onClick={() => setRange(option.key)}
                  aria-pressed={range === option.key}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="ad-card-body">
        {points.length === 0 ? (
          <div className="ad-chart-empty">
            <span aria-hidden="true">
              <PackageOpen size={22} />
            </span>
            <b>Belum ada data grafik</b>
            <p>
              Grafik akan muncul otomatis setelah produk pertama ditambahkan ke
              database.
            </p>
          </div>
        ) : (
          <>
            <svg
              className="ad-chart-svg"
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              role="img"
              aria-label={`Grafik pertumbuhan produk: ${lastTotal} produk tercatat sejak ${firstLabel}.`}
            >
              <defs>
                <linearGradient id="ad-chart-bar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8a4f5d" />
                  <stop offset="100%" stopColor="#6d3f4b" stopOpacity="0.75" />
                </linearGradient>
                <linearGradient id="ad-chart-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c99ba5" stopOpacity="0.34" />
                  <stop offset="100%" stopColor="#c99ba5" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {[0, 1 / 3, 2 / 3, 1].map((fraction) => {
                const y = PAD.top + PLOT_H * (1 - fraction);

                return (
                  <g key={fraction}>
                    <line
                      x1={PAD.left}
                      x2={WIDTH - PAD.right}
                      y1={y}
                      y2={y}
                      stroke="#f3ecea"
                      strokeWidth={1}
                    />
                    <text
                      x={PAD.left - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      fontSize={10}
                      fill="#a49aa0"
                    >
                      {Math.round(maxTotal * fraction)}
                    </text>
                  </g>
                );
              })}

              {areaPath && <path d={areaPath} fill="url(#ad-chart-area)" />}
              {points.map((point, index) => {
                const barHeight = (point.added / maxAdded) * PLOT_H;

                if (point.added === 0) return null;

                return (
                  <rect
                    key={point.key}
                    x={xAt(index) - barWidth / 2}
                    y={PAD.top + PLOT_H - barHeight}
                    width={barWidth}
                    height={Math.max(barHeight, 2)}
                    rx={3}
                    fill="url(#ad-chart-bar)"
                  >
                    <title>
                      {point.label}: {point.added} produk baru
                    </title>
                  </rect>
                );
              })}

              {points.map((point, index) =>
                points.length <= 16 && point.added > 0 ? (
                  <text
                    key={`label-${point.key}`}
                    x={xAt(index)}
                    y={PAD.top + PLOT_H - (point.added / maxAdded) * PLOT_H - 6}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={600}
                    fill="#7c7178"
                  >
                    {point.added}
                  </text>
                ) : null,
              )}

              {points.length > 1 && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#b08d68"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {points.map((point, index) => (
                <circle
                  key={`dot-${point.key}`}
                  cx={xAt(index)}
                  cy={yTotal(point.total)}
                  r={3.4}
                  fill="#ffffff"
                  stroke="#b08d68"
                  strokeWidth={2}
                >
                  <title>
                    {point.label}: total {point.total} produk
                  </title>
                </circle>
              ))}

              {points.map((point, index) =>
                index % labelStep === 0 || index === points.length - 1 ? (
                  <text
                    key={`x-${point.key}`}
                    x={xAt(index)}
                    y={HEIGHT - 12}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#a49aa0"
                  >
                    {point.label}
                  </text>
                ) : null,
              )}
            </svg>

            {limitedHistory && (
              <p className="ad-chart-note">
                <Info size={14} aria-hidden="true" />
                <span>
                  Grafik ini hanya memakai tanggal produk yang benar-benar
                  tercatat di database — tanpa proyeksi. Riwayat dimulai{" "}
                  {firstLabel}, jadi pola jangka panjang belum dapat
                  ditampilkan.
                </span>
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
