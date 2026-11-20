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
      <svg
        viewBox="0 0 32 32"
        width="30"
        height="30"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M16.02 3C8.86 3 3.04 8.79 3.04 15.91c0 2.28.6 4.49 1.74 6.43L3 29l6.85-1.78a13.02 13.02 0 0 0 6.17 1.57h.01c7.15 0 12.97-5.8 12.97-12.91C29 8.79 23.18 3 16.02 3Zm0 23.61h-.01a10.8 10.8 0 0 1-5.49-1.5l-.39-.23-4.07 1.06 1.09-3.96-.26-.41a10.7 10.7 0 0 1-1.65-5.66c0-5.94 4.86-10.77 10.83-10.77s10.83 4.83 10.83 10.77-4.86 10.77-10.83 10.77Zm5.94-8.06c-.33-.17-1.95-.96-2.25-1.07-.3-.11-.52-.17-.74.17-.22.33-.85 1.07-1.04 1.29-.19.22-.39.25-.72.08-.33-.17-1.4-.51-2.66-1.6-.98-.84-1.64-1.87-1.83-2.2-.19-.33-.02-.51.15-.68.15-.17.33-.39.5-.58.17-.19.22-.33.33-.55.11-.22-.05-.41-.13-.58-.51-.17-1.29-.63-1.76-.85-.47-.22-.8-.19-1.09-.19-.3 0-.63.11-.96.44-.33.33-1.26 1.23-1.26 3 0 1.76 1.29 3.46 1.48 3.69.18.22 2.53 3.86 6.16 5.25.86.33 1.53.53 2.05.68.86.27 1.64.23 2.25.14.69-.1 1.95-.8 2.22-1.57.28-.77.28-1.43.2-1.57-.08-.14-.3-.22-.63-.39Z" />
      </svg>

      <span className="rt-whatsapp-tooltip">
        Hubungi Kami
      </span>
    </a>
  );
}
