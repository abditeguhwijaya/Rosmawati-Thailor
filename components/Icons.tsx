import React from "react";

export interface IconProps {
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Authentic official WhatsApp icon (phone handset inside speech bubble).
 */
export function WhatsAppIcon({
  size = 20,
  className = "",
  style,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.69C7.02 10.9 7.9 12.06 8.02 12.23C8.14 12.39 9.73 14.85 12.18 15.91C12.76 16.16 13.22 16.31 13.57 16.42C14.15 16.61 14.68 16.58 15.1 16.52C15.57 16.45 16.55 15.93 16.76 15.35C16.96 14.76 16.96 14.27 16.9 14.16C16.84 14.05 16.69 13.99 16.46 13.88C16.24 13.77 15.13 13.22 14.93 13.14C14.72 13.06 14.57 13.02 14.42 13.25C14.27 13.47 13.84 13.99 13.71 14.14C13.58 14.29 13.45 14.31 13.23 14.2C13 14.09 12.27 13.85 11.4 13.08C10.73 12.48 10.27 11.74 10.14 11.52C10.01 11.29 10.13 11.17 10.24 11.06C10.35 10.95 10.48 10.77 10.6 10.63C10.72 10.5 10.76 10.39 10.84 10.23C10.92 10.06 10.88 9.92 10.82 9.81C10.76 9.69 10.27 8.5 10.07 8C9.87 7.53 9.66 7.59 9.5 7.58C9.36 7.58 9.19 7.57 9.02 7.57C8.86 7.57 8.69 7.57 8.53 7.33Z" />
    </svg>
  );
}

/**
 * Authentic official Instagram icon (rounded camera glyph).
 */
export function InstagramIcon({
  size = 20,
  className = "",
  style,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" strokeWidth="2.5" />
    </svg>
  );
}

/**
 * Location Pin / Map Pin icon.
 */
export function LocationPinIcon({
  size = 20,
  className = "",
  style,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/**
 * Beranda / Home boutique icon.
 */
export function HomeIcon({
  size = 20,
  className = "",
  style,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
    </svg>
  );
}

/**
 * Koleksi / Tailor Mannequin Dress Form icon.
 */
export function DressIcon({
  size = 20,
  className = "",
  style,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <circle cx="12" cy="3.5" r="1.5" />
      <path d="M9 5h6l1.5 3.5c.2.6-.1 1.3-.7 1.6l-1.8.7v4.2l2.2 4H7.8l2.2-4v-4.2l-1.8-.7c-.6-.3-.9-1-.7-1.6L9 5z" />
      <path d="M12 19v3" />
      <path d="M9 22h6" />
    </svg>
  );
}

/**
 * Tentang Kami / Team & Atelier Story icon.
 */
export function AboutUsersIcon({
  size = 20,
  className = "",
  style,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

/**
 * Hubungi Kami / Telephone Contact icon.
 */
export function PhoneContactIcon({
  size = 20,
  className = "",
  style,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
