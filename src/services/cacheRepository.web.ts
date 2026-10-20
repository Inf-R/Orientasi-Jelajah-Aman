// src/services/cacheRepository.web.ts  (versi WEB: browser)
// expo-sqlite di browser butuh WebAssembly (masih eksperimental). Karena itu di web
// cache disimpan lewat AsyncStorage (localStorage). Nama fungsinya SAMA dengan
// cacheRepository.ts, jadi file lain tidak perlu tahu bedanya.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataTersimpan, KotaUntukCache, RingkasanKotaTersimpan } from "../types/cache";
import { DataCuacaLengkap, DataKualitasUdara } from "../types/weather";

const KUNCI_PENYIMPANAN = "@jelajah_aman:cache_cuaca_web";
const MAKS_KOTA_TERSIMPAN = 5;

interface BarisWeb {
  kotaId: number;
  namaKota: string;
  latitude: number;
  longitude: number;
  cuaca: DataCuacaLengkap;
  kualitasUdara: DataKualitasUdara;
  disimpanPada: number;
}

type Penyimpanan = Record<string, BarisWeb>;

export function buatKunci(latitude: number, longitude: number): string {
  return latitude.toFixed(2) + "," + longitude.toFixed(2);
}

async function bacaSemua(): Promise<Penyimpanan> {
  try {
    const json = await AsyncStorage.getItem(KUNCI_PENYIMPANAN);
    return json ? (JSON.parse(json) as Penyimpanan) : {};
  } catch {
    return {};
  }
}

async function tulisSemua(data: Penyimpanan): Promise<void> {
  await AsyncStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(data));
}

export async function simpanCache(
  kota: KotaUntukCache,
  cuaca: DataCuacaLengkap,
  kualitasUdara: DataKualitasUdara
): Promise<void> {
  const data = await bacaSemua();
  data[buatKunci(kota.latitude, kota.longitude)] = {
    kotaId: kota.id,
    namaKota: kota.nama,
    latitude: kota.latitude,
    longitude: kota.longitude,
    cuaca,
    kualitasUdara,
    disimpanPada: Date.now(),
  };
  await tulisSemua(data);
}

export async function ambilCache(latitude: number, longitude: number): Promise<DataTersimpan | null> {
  const data = await bacaSemua();
  const baris = data[buatKunci(latitude, longitude)];
  if (!baris) return null;
  return { cuaca: baris.cuaca, kualitasUdara: baris.kualitasUdara, disimpanPada: baris.disimpanPada };
}

export async function daftarKotaTersimpan(): Promise<RingkasanKotaTersimpan[]> {
  const data = await bacaSemua();
  return Object.entries(data)
    .map(([kunci, b]) => ({
      kunci,
      id: b.kotaId,
      nama: b.namaKota,
      latitude: b.latitude,
      longitude: b.longitude,
      disimpanPada: b.disimpanPada,
    }))
    .sort((a, b) => b.disimpanPada - a.disimpanPada)
    .slice(0, MAKS_KOTA_TERSIMPAN);
}

export async function bersihkanCacheLama(batasUmurMs: number): Promise<void> {
  const data = await bacaSemua();
  const batas = Date.now() - batasUmurMs;
  for (const kunci of Object.keys(data)) {
    if (data[kunci].disimpanPada < batas) delete data[kunci];
  }
  await tulisSemua(data);
}

export async function hapusSemuaCache(): Promise<void> {
  await AsyncStorage.removeItem(KUNCI_PENYIMPANAN);
}

export async function hapusCacheKota(kunci: string): Promise<void> {
  const data = await bacaSemua();
  delete data[kunci];
  await tulisSemua(data);
}