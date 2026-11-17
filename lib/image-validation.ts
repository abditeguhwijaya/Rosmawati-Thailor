export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type ImageKind = {
  mime: string;
  ext: string;
  matches: (buffer: Buffer) => boolean;
};

const IMAGE_KINDS: ImageKind[] = [
  {
    mime: "image/jpeg",
    ext: "jpg",
    matches: (buffer) =>
      buffer.length > 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff,
  },
  {
    mime: "image/png",
    ext: "png",
    matches: (buffer) =>
      buffer.length > 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ),
  },
  {
    mime: "image/webp",
    ext: "webp",
    matches: (buffer) =>
      buffer.length > 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP",
  },
  {
    mime: "image/avif",
    ext: "avif",
    matches: (buffer) => {
      if (buffer.length < 12) return false;
      const box = buffer.subarray(4, 8).toString("ascii");
      const brand = buffer.subarray(8, 12).toString("ascii");
      return box === "ftyp" && (brand === "avif" || brand === "avis");
    },
  },
];

export type ImageValidation =
  | { ok: true; ext: string; buffer: Buffer }
  | { ok: false; message: string };

/**
 * Memvalidasi tipe file dari isi biner (bukan hanya MIME yang dikirim browser),
 * sehingga file berbahaya dengan ekstensi gambar tetap ditolak.
 */
export async function validateImageFile(file: File): Promise<ImageValidation> {
  if (!file || file.size === 0) {
    return { ok: false, message: "File foto kosong." };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      message: `Ukuran foto maksimal ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`,
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = IMAGE_KINDS.find((item) => item.matches(buffer));

  if (!kind) {
    return {
      ok: false,
      message: "Format foto harus JPG, PNG, WebP, atau AVIF.",
    };
  }

  if (file.type && file.type !== kind.mime) {
    return {
      ok: false,
      message: "Tipe file tidak cocok dengan isi gambar.",
    };
  }

  return { ok: true, ext: kind.ext, buffer };
}
