
"use client";

import {
  useEffect,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  ImagePlus,
  Save,
  LoaderCircle,
  Monitor,
  BookOpen,
} from "lucide-react";

import { saveHomePageSettingsAction } from "./actions";

export type HomePageSettingsData = {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  heroImagePosition: string;
  heroImageHeight: number;
  heroPrimaryText: string;
  heroPrimaryLink: string;
  heroSecondaryText: string;
  heroSecondaryLink: string;
  heroStampTop: string;
  heroStampMiddle: string;
  heroStampBottom: string;

  aboutEyebrow: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutImage: string;
  aboutImageNote: string;
  aboutValue1Title: string;
  aboutValue1Desc: string;
  aboutValue2Title: string;
  aboutValue2Desc: string;
  aboutValue3Title: string;
  aboutValue3Desc: string;
  aboutButtonText: string;
  aboutButtonLink: string;
};

const DEFAULT_SETTINGS: HomePageSettingsData = {
  heroEyebrow: "THE ART OF PERSONAL STYLE",
  heroTitle: "Elegance is in every stitch.",
  heroDescription:
    "Busana yang dibuat dengan ketelitian, sentuhan personal, dan perhatian pada setiap detail. Karena gaya terbaik adalah yang terasa seperti diri Anda.",
  heroImage:
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=90",
  heroImagePosition: "center 35%",
  heroImageHeight: 680,
  heroPrimaryText: "Jelajahi Koleksi",
  heroPrimaryLink: "/katalog",
  heroSecondaryText: "Cerita kami",
  heroSecondaryLink: "#about",
  heroStampTop: "MADE",
  heroStampMiddle: "WITH",
  heroStampBottom: "LOVE",

  aboutEyebrow: "OUR STORY & PHILOSOPHY",
  aboutTitle: "Lebih dari sekadar pakaian.",
  aboutDescription:
    "Rosmawati Thailor menghadirkan layanan butik dan jahit custom dengan sentuhan personal. Kami percaya bahwa busana yang indah bukan hanya tentang penampilan, tetapi juga kenyamanan dan karakter pemakainya.",
  aboutImage:
    "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1000&q=85",
  aboutImageNote: "Crafted with care",
  aboutValue1Title: "Detail Matters",
  aboutValue1Desc:
    "Perhatian pada detail dan kerapian pengerjaan.",
  aboutValue2Title: "Made Personal",
  aboutValue2Desc:
    "Busana dapat dikonsultasikan sesuai kebutuhan.",
  aboutValue3Title: "Made with Care",
  aboutValue3Desc:
    "Setiap proses dikerjakan dengan penuh perhatian.",
  aboutButtonText: "Temukan koleksi kami",
  aboutButtonLink: "/katalog",
};

type Props = {
  initialSettings?: Partial<HomePageSettingsData> | null;
};

type FieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
};

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
}: FieldProps) {
  return (
    <div className="ad-field">
      <label htmlFor={name}>{label}</label>

      <input
        id={name}
        name={name}
        type="text"
        className="ad-input"
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(name, event.target.value)
        }
        required
      />
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
}: FieldProps) {
  return (
    <div className="ad-field">
      <label htmlFor={name}>{label}</label>

      <textarea
        id={name}
        name={name}
        className="ad-input"
        rows={4}
        value={value}
        onChange={(event) =>
          onChange(name, event.target.value)
        }
        required
        style={{ resize: "vertical" }}
      />
    </div>
  );
}

export default function HomePageSettingsForm({
  initialSettings,
}: Props) {
  const [settings, setSettings] =
    useState<HomePageSettingsData>({
      ...DEFAULT_SETTINGS,
      ...initialSettings,
    });

  const [heroPreview, setHeroPreview] =
    useState<string | null>(null);

  const [aboutPreview, setAboutPreview] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Membersihkan URL preview ketika komponen dilepas.
  useEffect(() => {
    return () => {
      if (heroPreview) {
        URL.revokeObjectURL(heroPreview);
      }

      if (aboutPreview) {
        URL.revokeObjectURL(aboutPreview);
      }
    };
  }, [heroPreview, aboutPreview]);

  function updateField(name: string, value: string) {
    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Preview gambar yang dipilih.
  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
    type: "hero" | "about",
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("File yang dipilih bukan gambar.");
      setIsSuccess(false);
      event.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);

    setMessage("");
    setIsSuccess(false);

    if (type === "hero") {
      setHeroPreview((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous);
        }

        return preview;
      });
    } else {
      setAboutPreview((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous);
        }

        return preview;
      });
    }
  }

  // Menyimpan pengaturan.
  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isPending) return;

    setMessage("");
    setIsSuccess(false);

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const result =
          await saveHomePageSettingsAction(formData);

        setMessage(result.message);
        setIsSuccess(result.ok);

        if (result.ok) {
          // Preview dipertahankan agar gambar baru tetap terlihat.
          // Setelah halaman dimuat ulang, gambar akan dibaca dari database.
        }
      } catch (error) {
        console.error(
          "Gagal menyimpan pengaturan beranda:",
          error,
        );

        setMessage(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menghubungi server.",
        );

        setIsSuccess(false);
      }
    });
  }

  return (
    <form
      className="ad-form ad-home-settings"
      onSubmit={handleSubmit}
    >
      {/* HEADER */}
      <div className="ad-page-head">
        <div>
          <h1>Pengaturan Beranda</h1>

          <p>
            Kelola tampilan Hero dan informasi Tentang Kami
            pada halaman utama website.
          </p>
        </div>
      </div>

      {/* NOTIFICATION */}
      {message && (
        <div
          className="ad-form-alert"
          role="status"
          style={{
            marginBottom: 20,
            borderColor: isSuccess
              ? "#75a88a"
              : "#c77b7b",
            whiteSpace: "pre-wrap",
          }}
        >
          {message}
        </div>
      )}

      {/* HERO SECTION */}
      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h2>
              <Monitor
                size={19}
                style={{
                  verticalAlign: "middle",
                  marginRight: 8,
                }}
              />
              Hero Section
            </h2>

            <p>
              Bagian utama yang pertama kali dilihat
              pengunjung website.
            </p>
          </div>
        </div>

        <div className="ad-card-body">
          <div className="ad-form-row">
            <TextField
              label="Eyebrow / Teks Kecil"
              name="heroEyebrow"
              value={settings.heroEyebrow}
              onChange={updateField}
            />

            <TextField
              label="Judul Hero"
              name="heroTitle"
              value={settings.heroTitle}
              onChange={updateField}
            />
          </div>

          <TextAreaField
            label="Deskripsi Hero"
            name="heroDescription"
            value={settings.heroDescription}
            onChange={updateField}
          />

          {/* HERO IMAGE */}
          <div className="ad-home-image">
            <label>Gambar Hero</label>

            <div className="ad-home-image-preview">
              <img
                src={
                  heroPreview || settings.heroImage
                }
                alt="Preview gambar Hero"
              />
            </div>

            <label className="ad-home-file">
              <ImagePlus size={17} />

              <span>Pilih gambar Hero</span>

              <input
                type="file"
                name="heroImageFile"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  handleImageChange(event, "hero")
                }
              />
            </label>

            <small>
              Format JPG, PNG, atau WebP. Gambar lama
              tetap digunakan jika tidak memilih gambar baru.
            </small>
          </div>

          <div className="ad-form-row">
            <TextField
              label="Posisi Gambar"
              name="heroImagePosition"
              value={settings.heroImagePosition}
              onChange={updateField}
              placeholder="center 35%"
            />

            <div className="ad-field">
              <label htmlFor="heroImageHeight">
                Tinggi Gambar (300–1200 px)
              </label>

              <input
                id="heroImageHeight"
                name="heroImageHeight"
                type="number"
                min={300}
                max={1200}
                className="ad-input"
                value={settings.heroImageHeight}
                onChange={(event) =>
                  setSettings((previous) => ({
                    ...previous,
                    heroImageHeight: Number(
                      event.target.value,
                    ),
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="ad-form-row">
            <TextField
              label="Teks Tombol Utama"
              name="heroPrimaryText"
              value={settings.heroPrimaryText}
              onChange={updateField}
            />

            <TextField
              label="Link Tombol Utama"
              name="heroPrimaryLink"
              value={settings.heroPrimaryLink}
              onChange={updateField}
            />
          </div>

          <div className="ad-form-row">
            <TextField
              label="Teks Tombol Kedua"
              name="heroSecondaryText"
              value={settings.heroSecondaryText}
              onChange={updateField}
            />

            <TextField
              label="Link Tombol Kedua"
              name="heroSecondaryLink"
              value={settings.heroSecondaryLink}
              onChange={updateField}
            />
          </div>

          <div className="ad-form-row">
            <TextField
              label="Stamp Bagian Atas"
              name="heroStampTop"
              value={settings.heroStampTop}
              onChange={updateField}
            />

            <TextField
              label="Stamp Bagian Tengah"
              name="heroStampMiddle"
              value={settings.heroStampMiddle}
              onChange={updateField}
            />

            <TextField
              label="Stamp Bagian Bawah"
              name="heroStampBottom"
              value={settings.heroStampBottom}
              onChange={updateField}
            />
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h2>
              <BookOpen
                size={19}
                style={{
                  verticalAlign: "middle",
                  marginRight: 8,
                }}
              />
              Tentang Kami
            </h2>

            <p>
              Kelola cerita, filosofi, dan nilai utama
              Rosmawati Thailor.
            </p>
          </div>
        </div>

        <div className="ad-card-body">
          <div className="ad-form-row">
            <TextField
              label="Eyebrow Tentang Kami"
              name="aboutEyebrow"
              value={settings.aboutEyebrow}
              onChange={updateField}
            />

            <TextField
              label="Judul Tentang Kami"
              name="aboutTitle"
              value={settings.aboutTitle}
              onChange={updateField}
            />
          </div>

          <TextAreaField
            label="Deskripsi Tentang Kami"
            name="aboutDescription"
            value={settings.aboutDescription}
            onChange={updateField}
          />

          {/* ABOUT IMAGE */}
          <div className="ad-home-image">
            <label>Gambar Tentang Kami</label>

            <div className="ad-home-image-preview">
              <img
                src={
                  aboutPreview || settings.aboutImage
                }
                alt="Preview gambar Tentang Kami"
              />
            </div>

            <label className="ad-home-file">
              <ImagePlus size={17} />

              <span>Pilih gambar Tentang Kami</span>

              <input
                type="file"
                name="aboutImageFile"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  handleImageChange(event, "about")
                }
              />
            </label>

            <small>
              Format JPG, PNG, atau WebP. Gambar lama
              tetap digunakan jika tidak memilih gambar baru.
            </small>
          </div>

          <TextField
            label="Catatan Gambar"
            name="aboutImageNote"
            value={settings.aboutImageNote}
            onChange={updateField}
          />

          <h3 className="ad-home-subtitle">
            Nilai Utama Butik
          </h3>

          <div className="ad-home-value">
            <h4>Nilai Pertama</h4>

            <TextField
              label="Judul"
              name="aboutValue1Title"
              value={settings.aboutValue1Title}
              onChange={updateField}
            />

            <TextAreaField
              label="Deskripsi"
              name="aboutValue1Desc"
              value={settings.aboutValue1Desc}
              onChange={updateField}
            />
          </div>

          <div className="ad-home-value">
            <h4>Nilai Kedua</h4>

            <TextField
              label="Judul"
              name="aboutValue2Title"
              value={settings.aboutValue2Title}
              onChange={updateField}
            />

            <TextAreaField
              label="Deskripsi"
              name="aboutValue2Desc"
              value={settings.aboutValue2Desc}
              onChange={updateField}
            />
          </div>

          <div className="ad-home-value">
            <h4>Nilai Ketiga</h4>

            <TextField
              label="Judul"
              name="aboutValue3Title"
              value={settings.aboutValue3Title}
              onChange={updateField}
            />

            <TextAreaField
              label="Deskripsi"
              name="aboutValue3Desc"
              value={settings.aboutValue3Desc}
              onChange={updateField}
            />
          </div>

          <div className="ad-form-row">
            <TextField
              label="Teks Tombol Tentang Kami"
              name="aboutButtonText"
              value={settings.aboutButtonText}
              onChange={updateField}
            />

            <TextField
              label="Link Tombol Tentang Kami"
              name="aboutButtonLink"
              value={settings.aboutButtonLink}
              onChange={updateField}
            />
          </div>
        </div>
      </section>

      {/* SAVE BUTTON */}
      <div className="ad-home-save">
        <button
          type="submit"
          className="ad-btn"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <LoaderCircle
                size={17}
                className="ad-home-spinner"
              />

              Menyimpan...
            </>
          ) : (
            <>
              <Save size={17} />

              Simpan Pengaturan Beranda
            </>
          )}
        </button>
      </div>
    </form>
  );
}
