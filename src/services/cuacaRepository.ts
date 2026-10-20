// src/services/cuacaRepository.ts
import { HasilCuacaOffline, KotaUntukCache, DataTersimpan } from "../types/cache";
import { ambilKualitasUdara } from "./airQualityService";
import { ambilCache, simpanCache } from "./cacheRepository";
import { ambilCuaca } from "./weatherService";

export const TTL_SEGAR_MS = 30 * 60 * 1000; // 30 menit
export const BATAS_CACHE_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari

interface OpsiAmbil {
  paksaPerbarui?: boolean;
}

export async function ambilCuacaOfflineFirst(
  kota: KotaUntukCache,
  opsi: OpsiAmbil = {}
): Promise<HasilCuacaOffline> {
  // Kegagalan membaca cache tidak boleh merusak aplikasi: anggap saja tidak ada cache
  let cache: DataTersimpan | null = null;
  try {
    cache = await ambilCache(kota.latitude, kota.longitude);
  } catch {
    cache = null;
  }
  const umur = cache ? Date.now() - cache.disimpanPada : Infinity;

  if (cache && umur < TTL_SEGAR_MS && !opsi.paksaPerbarui) {
    return { ...cache, sumber: "cache-segar" };
  }

  const dariJaringan = await Promise.all([
    ambilCuaca(kota.latitude, kota.longitude),
    ambilKualitasUdara(kota.latitude, kota.longitude),
  ]).catch(() => null);

  if (!dariJaringan) {
    if (cache) return { ...cache, sumber: "cache-basi" };
    throw new Error("Tidak ada koneksi dan belum ada data tersimpan");
  }

  const [cuaca, kualitasUdara] = dariJaringan;
  try {
    await simpanCache(kota, cuaca, kualitasUdara);
  } catch {
    // Gagal menyimpan cache tidak boleh merusak data yang sudah ada
  }
  return { cuaca, kualitasUdara, disimpanPada: Date.now(), sumber: "jaringan" };
}