// src/constants/kotaBawaan.ts
import { HasilGeocoding } from "../types/geocoding";

// id negatif supaya tidak bentrok dengan id dari Geocoding API (positif) dan "Lokasi Saat Ini" (-1)
export const kotaBawaan: HasilGeocoding[] = [
    { id: -101, name: "Jakarta", latitude: -6.2088, longitude: 106.8456, country: "Indonesia", admin1: "DKI Jakarta" },
    { id: -102, name: "Surabaya", latitude: -7.2575, longitude: 112.7521, country: "Indonesia", admin1: "Jawa Timur" },
    { id: -103, name: "Bandung", latitude: -6.9175, longitude: 107.6191, country: "Indonesia", admin1: "Jawa Barat" },
    { id: -104, name: "Medan", latitude: 3.5952, longitude: 98.6722, country: "Indonesia", admin1: "Sumatera Utara" },
    { id: -105, name: "Semarang", latitude: -6.9667, longitude: 110.4167, country: "Indonesia", admin1: "Jawa Tengah" },
    { id: -106, name: "Makassar", latitude: -5.1477, longitude: 119.4327, country: "Indonesia", admin1: "Sulawesi Selatan" },
    { id: -107, name: "Palembang", latitude: -2.9761, longitude: 104.7754, country: "Indonesia", admin1: "Sumatera Selatan" },
    { id: -108, name: "Tangerang", latitude: -6.1783, longitude: 106.6319, country: "Indonesia", admin1: "Banten" },
    { id: -109, name: "Depok", latitude: -6.4025, longitude: 106.7942, country: "Indonesia", admin1: "Jawa Barat" },
    { id: -110, name: "Bekasi", latitude: -6.2383, longitude: 106.9756, country: "Indonesia", admin1: "Jawa Barat" },
    { id: -111, name: "Bogor", latitude: -6.5971, longitude: 106.806, country: "Indonesia", admin1: "Jawa Barat" },
    { id: -112, name: "Yogyakarta", latitude: -7.7956, longitude: 110.3695, country: "Indonesia", admin1: "DI Yogyakarta" },
    { id: -113, name: "Surakarta", latitude: -7.5666, longitude: 110.8167, country: "Indonesia", admin1: "Jawa Tengah" },
    { id: -114, name: "Malang", latitude: -7.9666, longitude: 112.6326, country: "Indonesia", admin1: "Jawa Timur" },
    { id: -115, name: "Denpasar", latitude: -8.6705, longitude: 115.2126, country: "Indonesia", admin1: "Bali" },
    { id: -116, name: "Batam", latitude: 1.0456, longitude: 104.0305, country: "Indonesia", admin1: "Kepulauan Riau" },
    { id: -117, name: "Pekanbaru", latitude: 0.5071, longitude: 101.4478, country: "Indonesia", admin1: "Riau" },
    { id: -118, name: "Banjarmasin", latitude: -3.3194, longitude: 114.5908, country: "Indonesia", admin1: "Kalimantan Selatan" },
    { id: -119, name: "Balikpapan", latitude: -1.2379, longitude: 116.8529, country: "Indonesia", admin1: "Kalimantan Timur" },
    { id: -120, name: "Samarinda", latitude: -0.5022, longitude: 117.1537, country: "Indonesia", admin1: "Kalimantan Timur" },
    { id: -121, name: "Pontianak", latitude: -0.0263, longitude: 109.3425, country: "Indonesia", admin1: "Kalimantan Barat" },
    { id: -122, name: "Manado", latitude: 1.4748, longitude: 124.8421, country: "Indonesia", admin1: "Sulawesi Utara" },
    { id: -123, name: "Padang", latitude: -0.9471, longitude: 100.4172, country: "Indonesia", admin1: "Sumatera Barat" },
    { id: -124, name: "Bandar Lampung", latitude: -5.4294, longitude: 105.261, country: "Indonesia", admin1: "Lampung" },
    { id: -125, name: "Pekalongan", latitude: -6.8886, longitude: 109.6753, country: "Indonesia", admin1: "Jawa Tengah" },
    { id: -126, name: "Tegal", latitude: -6.8694, longitude: 109.1402, country: "Indonesia", admin1: "Jawa Tengah" },
    { id: -127, name: "Cirebon", latitude: -6.7063, longitude: 108.557, country: "Indonesia", admin1: "Jawa Barat" },
    { id: -128, name: "Kudus", latitude: -6.8048, longitude: 110.8405, country: "Indonesia", admin1: "Jawa Tengah" },
    { id: -129, name: "Purwokerto", latitude: -7.4242, longitude: 109.2396, country: "Indonesia", admin1: "Jawa Tengah" },
    { id: -130, name: "Kajen", latitude: -7.0167, longitude: 109.6167, country: "Indonesia", admin1: "Jawa Tengah" }, // koordinat perkiraan
    { id: -131, name: "Jayapura", latitude: -2.5337, longitude: 140.7181, country: "Indonesia", admin1: "Papua" },
    { id: -132, name: "Mataram", latitude: -8.5833, longitude: 116.1167, country: "Indonesia", admin1: "Nusa Tenggara Barat" },
    { id: -133, name: "Kupang", latitude: -10.1772, longitude: 123.607, country: "Indonesia", admin1: "Nusa Tenggara Timur" },
    { id: -134, name: "Ambon", latitude: -3.6954, longitude: 128.1814, country: "Indonesia", admin1: "Maluku" },
    { id: -135, name: "Banda Aceh", latitude: 5.5483, longitude: 95.3238, country: "Indonesia", admin1: "Aceh" },
    { id: -136, name: "Jambi", latitude: -1.6101, longitude: 103.6131, country: "Indonesia", admin1: "Jambi" },
];

export function cariKotaBawaan(teks: string): HasilGeocoding[] {
    const kata = teks.trim().toLowerCase();
    if (kata.length === 0) return [];
    return kotaBawaan.filter((k) => k.name.toLowerCase().includes(kata));
}