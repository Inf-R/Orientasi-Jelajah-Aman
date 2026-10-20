// src/services/riwayatPencarian.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const KUNCI_PENYIMPANAN = "@jelajah_aman:riwayat_pencarian";
export const MAKS_RIWAYAT = 10;

export async function ambilRiwayat(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(KUNCI_PENYIMPANAN);
    const data: unknown = json ? JSON.parse(json) : [];
    return Array.isArray(data) ? data.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

// Terbaru di urutan pertama, tanpa duplikat, maksimal 10
export async function tambahRiwayat(nama: string): Promise<void> {
  const bersih = nama.trim();
  if (bersih.length === 0) return;
  const daftar = await ambilRiwayat();
  const tanpaDuplikat = daftar.filter((k) => k.toLowerCase() !== bersih.toLowerCase());
  const daftarBaru = [bersih, ...tanpaDuplikat].slice(0, MAKS_RIWAYAT);
  await AsyncStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(daftarBaru));
}

export async function kosongkanRiwayat(): Promise<void> {
  await AsyncStorage.removeItem(KUNCI_PENYIMPANAN);
}