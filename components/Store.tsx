"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  isLegacyProduct,
  LEGACY_STORAGE_KEYS,
  type LegacyProduct,
} from "@/lib/legacy";

const STORAGE_KEY = LEGACY_STORAGE_KEYS[0];
const LEGACY_STORAGE_KEY = LEGACY_STORAGE_KEYS[1];

type StoreValue = {
  products: LegacyProduct[];
  save: (products: LegacyProduct[]) => void;
  ready: boolean;
  storageError: string | null;
};

const StoreContext = createContext<StoreValue | null>(null);

/**
 * @deprecated Sejak Fase 1, data produk disimpan di PostgreSQL. Provider ini
 * dipertahankan sementara hanya untuk membaca data localStorage lama.
 */
function readStoredProducts(): LegacyProduct[] {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem(LEGACY_STORAGE_KEY);

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isLegacyProduct);
  } catch {
    return [];
  }
}

export function Store({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<LegacyProduct[]>([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    setProducts(readStoredProducts());
    setReady(true);
  }, []);

  const save = useCallback((nextProducts: LegacyProduct[]) => {
    setProducts(nextProducts);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProducts));
      setStorageError(null);
    } catch {
      setStorageError(
        "Data tidak dapat disimpan di browser ini. Penyimpanan penuh atau diblokir.",
      );
    }
  }, []);

  const value = useMemo(
    () => ({ products, save, ready, storageError }),
    [products, save, ready, storageError],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("Store provider missing");
  return value;
}
