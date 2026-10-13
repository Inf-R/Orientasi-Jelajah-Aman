// src/services/cacheService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HasilGeocoding } from "../types/geocoding";
import { DataCuacaLengkap, DataKualitasUdara } from "../types/weather";

const KUNCI_CACHE = "@jelajah_aman:cache_cuaca";

export interface CacheCuaca {
    kota: HasilGeocoding;
    cuaca: DataCuacaLengkap;
    kualitasUdara: DataKualitasUdara;
    disimpanPada: string; // ISO date
}

interface IsiPenyimpanan {
    terakhir: string | null;
    data: Record<string, CacheCuaca>;
}

// Kunci per koordinat, supaya "Lokasi Saat Ini" (id -1) tetap unik
function kunciKota(kota: HasilGeocoding): string {
    return `${kota.latitude.toFixed(2)},${kota.longitude.toFixed(2)}`;
}

async function bacaSemua(): Promise<IsiPenyimpanan> {
    const json = await AsyncStorage.getItem(KUNCI_CACHE);
    return json ? JSON.parse(json) : { terakhir: null, data: {} };
}

export async function simpanCache(
    kota: HasilGeocoding,
    cuaca: DataCuacaLengkap,
    kualitasUdara: DataKualitasUdara
): Promise<void> {
    const isi = await bacaSemua();
    const kunci = kunciKota(kota);
    isi.data[kunci] = {
        kota,
        cuaca,
        kualitasUdara,
        disimpanPada: new Date().toISOString(),
    };
    isi.terakhir = kunci;
    await AsyncStorage.setItem(KUNCI_CACHE, JSON.stringify(isi));
}

export async function ambilCache(kota: HasilGeocoding): Promise<CacheCuaca | null> {
    const isi = await bacaSemua();
    return isi.data[kunciKota(kota)] ?? null;
}

export async function ambilCacheTerakhir(): Promise<CacheCuaca | null> {
    const isi = await bacaSemua();
    return isi.terakhir ? isi.data[isi.terakhir] ?? null : null;
}

export async function cariDiCache(teks: string): Promise<HasilGeocoding[]> {
    const isi = await bacaSemua();
    const kata = teks.trim().toLowerCase();
    return Object.values(isi.data)
        .map((c) => c.kota)
        .filter((k) => k.name.toLowerCase().includes(kata));
}