// src/context/TemaContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { PaletWarna, paletGelap, paletTerang } from "../constants/warna";

export type ModeTema = "sistem" | "terang" | "gelap";
export type SkemaAktif = "terang" | "gelap";

const KUNCI_PENYIMPANAN = "@jelajah_aman:mode_tema";

interface NilaiTema {
  mode: ModeTema; // pilihan pengguna
  skema: SkemaAktif; // hasil akhir yang sedang dipakai
  warna: PaletWarna;
  ubahMode: (mode: ModeTema) => void;
}

const TemaContext = createContext<NilaiTema | null>(null);

export function TemaProvider({ children }: { children: ReactNode }) {
  const skemaSistem = useColorScheme();
  const [mode, setMode] = useState<ModeTema>("sistem");

  // Baca pilihan yang tersimpan saat aplikasi dibuka
  useEffect(() => {
    AsyncStorage.getItem(KUNCI_PENYIMPANAN)
      .then((nilai) => {
        if (nilai === "terang" || nilai === "gelap" || nilai === "sistem") setMode(nilai);
      })
      .catch(() => {});
  }, []);

  const ubahMode = useCallback((modeBaru: ModeTema) => {
    setMode(modeBaru);
    AsyncStorage.setItem(KUNCI_PENYIMPANAN, modeBaru).catch(() => {});
  }, []);

  const skema: SkemaAktif =
    mode === "sistem" ? (skemaSistem === "dark" ? "gelap" : "terang") : mode;

  const nilai = useMemo<NilaiTema>(
    () => ({ mode, skema, warna: skema === "gelap" ? paletGelap : paletTerang, ubahMode }),
    [mode, skema, ubahMode]
  );

  return <TemaContext.Provider value={nilai}>{children}</TemaContext.Provider>;
}

export function useTema(): NilaiTema {
  const konteks = useContext(TemaContext);
  if (!konteks) throw new Error("useTema harus dipakai di dalam TemaProvider");
  return konteks;
}