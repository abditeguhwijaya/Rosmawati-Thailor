
const whatsappNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"
).replace(/\/+$/, "");

export const siteConfig = {
  name: "Rosmawati Thailor",
  tagline: "Made with Care",
  description:
    "Butik pakaian, jasa jahit, dan busana custom dengan sentuhan personal. Dibuat dengan teliti untuk setiap momen Anda.",
  siteUrl,
  whatsappNumber,
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || null,
  address:
    process.env.NEXT_PUBLIC_BOUTIQUE_ADDRESS?.trim() || null,
  openingHours:
    process.env.NEXT_PUBLIC_OPENING_HOURS?.trim() || null,
};

/**
 * Membuat tautan WhatsApp.
 * Mengembalikan null jika nomor belum dikonfigurasi.
 */
export function getWhatsAppUrl(message?: string): string | null {
  if (!siteConfig.whatsappNumber) return null;

  const base = `https://wa.me/${siteConfig.whatsappNumber}`;

  return message
    ? `${base}?text=${encodeURIComponent(message)}`
    : base;
}
