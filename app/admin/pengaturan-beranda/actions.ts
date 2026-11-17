
"use server";

import { revalidatePath } from "next/cache";
import { getActionAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import {
  deleteProductImage,
  saveProductImage,
  validateImageFile,
} from "@/lib/upload";

type SaveResult = {
  ok: boolean;
  message: string;
};

const MAX_TEXT = 5000;

function readText(
  formData: FormData,
  key: string,
  max = 255,
) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value) {
    throw new Error(`Kolom ${key} wajib diisi.`);
  }

  if (value.length > max) {
    throw new Error(`Kolom ${key} terlalu panjang.`);
  }

  return value;
}

function validateLink(value: string, field: string) {
  if (!value) {
    throw new Error(`${field} wajib diisi.`);
  }

  // Hanya izinkan link internal, anchor, atau HTTPS.
  if (
    !value.startsWith("/") &&
    !value.startsWith("#") &&
    !/^https:\/\/[^\s]+$/i.test(value)
  ) {
    throw new Error(
      `${field} harus berupa link internal atau HTTPS.`,
    );
  }

  return value;
}

async function resolveUploadedImage(
  formData: FormData,
  field: string,
  currentImage: string,
) {
  const file = formData.get(field);

  if (!(file instanceof File) || file.size === 0) {
    return {
      image: currentImage,
      uploaded: null as string | null,
    };
  }

  const validation = await validateImageFile(file);

  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const image = await saveProductImage(file);

  return {
    image,
    uploaded: image,
  };
}

export async function saveHomePageSettingsAction(
  formData: FormData,
): Promise<SaveResult> {
  const admin = await getActionAdmin();

  if (!admin) {
    return {
      ok: false,
      message: "Sesi admin berakhir. Silakan login kembali.",
    };
  }

  let newHeroImage: string | null = null;
  let newAboutImage: string | null = null;
  let databaseSaved = false;

  try {
    // Ambil pengaturan sebelumnya.
    const existing = await prisma.homePageSettings.findUnique({
      where: { id: "main" },
    });

    const currentHeroImage =
      existing?.heroImage ??
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=90";

    const currentAboutImage =
      existing?.aboutImage ??
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1000&q=85";

    // Upload gambar Hero jika ada file baru.
    const heroUpload = await resolveUploadedImage(
      formData,
      "heroImageFile",
      currentHeroImage,
    );

    newHeroImage = heroUpload.uploaded;

    // Upload gambar About jika ada file baru.
    const aboutUpload = await resolveUploadedImage(
      formData,
      "aboutImageFile",
      currentAboutImage,
    );

    newAboutImage = aboutUpload.uploaded;

    // Validasi tinggi gambar Hero.
    const heroImageHeight = Number(
      formData.get("heroImageHeight") ?? 680,
    );

    if (
      !Number.isInteger(heroImageHeight) ||
      heroImageHeight < 300 ||
      heroImageHeight > 1200
    ) {
      throw new Error(
        "Tinggi gambar Hero harus antara 300–1200 px.",
      );
    }

    // Siapkan data pengaturan.
    const data = {
      heroEyebrow: readText(formData, "heroEyebrow"),
      heroTitle: readText(formData, "heroTitle"),
      heroDescription: readText(
        formData,
        "heroDescription",
        MAX_TEXT,
      ),
      heroImage: heroUpload.image,
      heroImagePosition: readText(
        formData,
        "heroImagePosition",
      ),
      heroImageHeight,
      heroPrimaryText: readText(
        formData,
        "heroPrimaryText",
      ),
      heroPrimaryLink: validateLink(
        readText(formData, "heroPrimaryLink"),
        "Link tombol utama",
      ),
      heroSecondaryText: readText(
        formData,
        "heroSecondaryText",
      ),
      heroSecondaryLink: validateLink(
        readText(formData, "heroSecondaryLink"),
        "Link tombol kedua",
      ),
      heroStampTop: readText(formData, "heroStampTop"),
      heroStampMiddle: readText(formData, "heroStampMiddle"),
      heroStampBottom: readText(formData, "heroStampBottom"),

      aboutEyebrow: readText(formData, "aboutEyebrow"),
      aboutTitle: readText(formData, "aboutTitle"),
      aboutDescription: readText(
        formData,
        "aboutDescription",
        MAX_TEXT,
      ),
      aboutImage: aboutUpload.image,
      aboutImageNote: readText(
        formData,
        "aboutImageNote",
      ),
      aboutValue1Title: readText(
        formData,
        "aboutValue1Title",
      ),
      aboutValue1Desc: readText(
        formData,
        "aboutValue1Desc",
        MAX_TEXT,
      ),
      aboutValue2Title: readText(
        formData,
        "aboutValue2Title",
      ),
      aboutValue2Desc: readText(
        formData,
        "aboutValue2Desc",
        MAX_TEXT,
      ),
      aboutValue3Title: readText(
        formData,
        "aboutValue3Title",
      ),
      aboutValue3Desc: readText(
        formData,
        "aboutValue3Desc",
        MAX_TEXT,
      ),
      aboutButtonText: readText(
        formData,
        "aboutButtonText",
      ),
      aboutButtonLink: validateLink(
        readText(formData, "aboutButtonLink"),
        "Link tombol Tentang Kami",
      ),
    };

    // Simpan ke database.
    await prisma.homePageSettings.upsert({
      where: { id: "main" },
      create: {
        id: "main",
        ...data,
      },
      update: data,
    });

    databaseSaved = true;

    // Hapus gambar lama setelah database berhasil diperbarui.
    // Kegagalan penghapusan tidak membatalkan penyimpanan.
    if (
      newHeroImage &&
      currentHeroImage !== newHeroImage
    ) {
      try {
        await deleteProductImage(currentHeroImage);
      } catch (error) {
        console.error(
          "Gagal menghapus gambar Hero lama:",
          error,
        );
      }
    }

    if (
      newAboutImage &&
      currentAboutImage !== newAboutImage
    ) {
      try {
        await deleteProductImage(currentAboutImage);
      } catch (error) {
        console.error(
          "Gagal menghapus gambar About lama:",
          error,
        );
      }
    }

    // Perbarui cache halaman.
    revalidatePath("/", "page");
    revalidatePath("/admin/pengaturan-beranda");

    return {
      ok: true,
      message: "Pengaturan beranda berhasil disimpan.",
    };
  } catch (error) {
    // Hapus file baru jika database belum berhasil disimpan.
    if (!databaseSaved) {
      if (newHeroImage) {
        try {
          await deleteProductImage(newHeroImage);
        } catch (cleanupError) {
          console.error(
            "Gagal membersihkan gambar Hero:",
            cleanupError,
          );
        }
      }

      if (newAboutImage) {
        try {
          await deleteProductImage(newAboutImage);
        } catch (cleanupError) {
          console.error(
            "Gagal membersihkan gambar About:",
            cleanupError,
          );
        }
      }
    }

    console.error("saveHomePageSettingsAction:", error);

    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Pengaturan gagal disimpan. Silakan coba lagi.",
    };
  }
}
