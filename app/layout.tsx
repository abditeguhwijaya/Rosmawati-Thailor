import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer, Header } from "@/components/Site";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.name} â€” ${siteConfig.tagline}`,
    template: `%s â€” ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  keywords: [
    "butik",
    "jahit custom",
    "kebaya",
    "dress",
    "gamis",
    "busana custom",
    "Rosmawati Thailor",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: siteConfig.name,
    title: `${siteConfig.name} â€” ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} â€” Butik & Jahit Custom`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} â€” ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf8f4",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Header />
        {children}
        <Footer />
    </body>
    </html>
  );
}


