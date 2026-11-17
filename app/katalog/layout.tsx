import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Katalog Koleksi",
  description:
    "Jelajahi koleksi kebaya, dress, setelan, blouse, gamis, dan rok buatan Rosmawati Thailor. Setiap potongan dikerjakan dengan teliti.",
  alternates: {
    canonical: "/katalog",
  },
  openGraph: {
    title: `Katalog Koleksi — ${siteConfig.name}`,
    description:
      "Jelajahi koleksi kebaya, dress, setelan, blouse, gamis, dan rok buatan Rosmawati Thailor.",
    url: "/katalog",
  },
};

export default function KatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
