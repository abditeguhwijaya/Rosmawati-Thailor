import { WhatsAppIcon } from "./Icons";

export default function WhatsAppFloat() {
  const whatsappNumber = "6283835311747";

  const message = encodeURIComponent(
    "Halo Rosmawati Thailor, saya ingin bertanya mengenai layanan jahit dan koleksi busana."
  );

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="rt-whatsapp-float"
      aria-label="Hubungi Rosmawati Thailor melalui WhatsApp"
      title="Hubungi kami melalui WhatsApp"
    >
      <WhatsAppIcon size={28} />

      <span className="rt-whatsapp-tooltip">
        Hubungi Kami
      </span>
    </a>
  );
}
