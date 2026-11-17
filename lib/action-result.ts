import type { Category, Product } from "@/lib/catalog";

/** Data admin terbaru yang dikirim balik setelah mutasi berhasil. */
export type AdminSnapshot = {
  products: Product[];
  categories: Category[];
};

export type ActionResult =
  | ({
      ok: true;
      message: string;
      id?: string;
    } & Partial<AdminSnapshot>)
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };
