// src/app/(tabs)/index.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AtribusiCuaca from "../../../components/AtribusiCuaca";
import SearchBox from "../../../components/SearchBox";
import StatusData from "../../../components/StatusData";
import WeatherCard from "../../../components/WeatherCard";
import { cariKotaBawaan } from "../../constants/kotaBawaan";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useTema } from "../../context/TemaContext";
import { useDebounce } from "../../hooks/use-debounce";
import {
  bersihkanCacheLama,
  daftarKotaTersimpan,
  hapusCacheKota,
} from "../../services/cacheRepository";
import { ambilCuacaOfflineFirst, BATAS_CACHE_MS } from "../../services/cuacaRepository";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { cariKota } from "../../services/geocodingServices";
import { ambilKoordinatSaatIni, mintaIzinLokasi } from "../../services/locationService";
import { tambahRiwayat } from "../../services/riwayatPencarian";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../types/cache";
import { HasilGeocoding } from "../../types/geocoding";
import { konfirmasi } from "../../utils/konfirmasi";

export default function HalamanUtama() {
  const { warna } = useTema();
  // Parameter dari tab Riwayat: kota yang diklik ("cari") dan penanda waktu klik ("t")
  const { cari, t } = useLocalSearchParams<{ cari?: string; t?: string }>();

  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const [idFavorit, setIdFavorit] = useState<number[]>([]);
  const [versiCari, setVersiCari] = useState(0);
  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition

  async function muatKotaTersimpan() {
    try {
      setKotaTersimpan(await daftarKotaTersimpan());
    } catch {
      setKotaTersimpan([]);
    }
  }

  // Saat aplikasi dibuka: buang cache > 7 hari, lalu tampilkan daftar tersimpan
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .catch(() => {})
      .finally(() => {
        muatKotaTersimpan();
      });
  }, []);

  // Segarkan daftar favorit setiap kali layar ini difokuskan
  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit()
        .then((list) => setIdFavorit(list.map((k) => k.id)))
        .catch(() => {});
    }, [])
  );

  // UTS no. 2: kota yang diklik di tab Riwayat otomatis dicari di sini
  useEffect(() => {
    if (!cari) return;
    if (cari === teksCari) {
      setVersiCari((v) => v + 1); // teks sama: paksa pencarian dijalankan ulang
    } else {
      setTeksCari(cari);
    }
  }, [cari, t]);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    let dibatalkan = false;
    cariKota(teksTertunda)
      .then((data) => {
        if (!dibatalkan) setHasilPencarian(data);
      })
      .catch(() => {
        if (dibatalkan) return;
        // Offline: cari di kota tersimpan, lalu di daftar kota bawaan
        const kata = teksTertunda.trim().toLowerCase();
        const gabungan: HasilGeocoding[] = kotaTersimpan
          .filter((k) => k.nama.toLowerCase().includes(kata))
          .map((k) => ({
            id: k.id,
            name: k.nama,
            latitude: k.latitude,
            longitude: k.longitude,
            country: "",
          }));
        for (const k of cariKotaBawaan(teksTertunda)) {
          if (!gabungan.some((g) => g.name.toLowerCase() === k.name.toLowerCase())) {
            gabungan.push(k);
          }
        }
        setHasilPencarian(gabungan);
      });
    return () => {
      dibatalkan = true;
    };
  }, [teksTertunda, versiCari]);

  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);
    setHasilPencarian([]);
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);
    try {
      const data = await ambilCuacaOfflineFirst(
        { id: kota.id, nama: kota.name, latitude: kota.latitude, longitude: kota.longitude },
        { paksaPerbarui }
      );
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(data);
      muatKotaTersimpan();
    } catch {
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi."
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  // UTS no. 2: kota yang dipilih dari hasil pencarian dicatat ke riwayat
  function pilihDariPencarian(kota: HasilGeocoding) {
    tambahRiwayat(kota.name).catch(() => {});
    pilihKota(kota);
  }

  async function gunakanLokasiSaatIni() {
    try {
      const status = await mintaIzinLokasi();
      if (status === "denied") {
        setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual.");
        return;
      }
      if (status === "unavailable") {
        setPesanLokasi("Layanan lokasi tidak aktif di perangkat ini.");
        return;
      }
      setPesanLokasi(null);
      const koordinat = await ambilKoordinatSaatIni();
      pilihKota({
        id: -1,
        name: "Lokasi Saat Ini",
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: "",
      });
    } catch {
      setPesanLokasi("Gagal mendapatkan lokasi. Silakan cari kota secara manual.");
    }
  }

  // UTS no. 3: hapus cache satu kota, dengan konfirmasi
  function konfirmasiHapusCache(kota: RingkasanKotaTersimpan) {
    konfirmasi(
      "Hapus data tersimpan",
      `Yakin hapus data cuaca tersimpan untuk ${kota.nama}?`,
      "Hapus",
      async () => {
        try {
          await hapusCacheKota(kota.kunci);
        } catch {
          // abaikan
        }
        muatKotaTersimpan();
      }
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.latar }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Baris Pencarian Terpadu & Tombol Lokasi */}
        <SearchBox
          nilai={teksCari}
          onCari={setTeksCari}
          onLokasi={gunakanLokasiSaatIni}
        />

        {/* Pesan Status Lokasi */}
        {pesanLokasi && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor: warna.infoBasiLatar,
              borderWidth: 1,
              borderColor: warna.infoBasiTeks + "30",
              gap: 8,
            }}
          >
            <Ionicons name="information-circle-outline" size={16} color={warna.infoBasiTeks} />
            <Text accessibilityLabel={pesanLokasi} style={{ color: warna.infoBasiTeks, fontSize: 13, flex: 1 }}>
              {pesanLokasi}
            </Text>
          </View>
        )}

        {/* Dropdown Hasil Pencarian */}
        {hasilPencarian.length > 0 && (
          <View
            style={{
              backgroundColor: warna.kartu,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: warna.garis,
              overflow: "hidden",
            }}
          >
            {hasilPencarian.map((kota, index) => (
              <TouchableOpacity
                key={kota.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderBottomWidth: index < hasilPencarian.length - 1 ? 1 : 0,
                  borderBottomColor: warna.garis,
                }}
                onPress={() => pilihDariPencarian(kota)}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                  <Ionicons name="location-outline" size={17} color={warna.aksen} />
                  <Text style={{ color: warna.teks, fontSize: 14 }}>
                    {kota.name}
                    {kota.admin1 ? `, ${kota.admin1}` : ""}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={warna.teksPelan} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Chip Kota Tersimpan di Perangkat (Offline Pills) */}
        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: warna.teksPelan, letterSpacing: 0.2 }}>
                TERSIMPAN DI PERANGKAT (OFFLINE)
              </Text>
              <Text style={{ fontSize: 11, color: warna.teksPelan }}>
                {kotaTersimpan.length} kota
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {kotaTersimpan.map((k) => {
                const aktif = kotaTerpilih?.name === k.nama;
                return (
                  <View
                    key={k.kunci}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: aktif ? warna.aksen + "1A" : warna.kartu,
                      borderWidth: 1,
                      borderColor: aktif ? warna.aksen : warna.garis,
                      borderRadius: 20,
                      paddingLeft: 12,
                      paddingRight: 8,
                      paddingVertical: 6,
                      gap: 6,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        pilihKota({
                          id: k.id,
                          name: k.nama,
                          latitude: k.latitude,
                          longitude: k.longitude,
                          country: "",
                        })
                      }
                    >
                      <Text
                        style={{
                          color: aktif ? warna.aksen : warna.teks,
                          fontSize: 13,
                          fontWeight: aktif ? "600" : "400",
                        }}
                      >
                        {k.nama}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => konfirmasiHapusCache(k)}
                      accessibilityLabel={`Hapus data tersimpan ${k.nama}`}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={aktif ? warna.aksen : warna.teksPelan}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Loading Indicator */}
        {sedangMemuat && (
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            <ActivityIndicator size="large" color={warna.aksen} />
          </View>
        )}

        {/* Pesan Error */}
        {pesanError && (
          <View
            style={{
              padding: 14,
              borderRadius: 12,
              backgroundColor: warna.kartu,
              borderWidth: 1,
              borderColor: warna.bahaya + "40",
              gap: 10,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="alert-circle-outline" size={20} color={warna.bahaya} />
              <Text style={{ fontWeight: "600", color: warna.bahaya, fontSize: 14 }}>
                Gagal Memuat Data
              </Text>
            </View>
            <Text accessibilityLabel={pesanError} style={{ color: warna.teks, fontSize: 13 }}>
              {pesanError}
            </Text>
            <TouchableOpacity
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
              style={{
                alignSelf: "flex-start",
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: warna.aksen,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 13 }}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tampilan Cuaca Lengkap & Terpadu */}
        {hasil && kotaTerpilih && !sedangMemuat && (
          <View style={{ gap: 12 }}>
            {/* Status Kesegaran Data */}
            <StatusData sumber={hasil.sumber} disimpanPada={hasil.disimpanPada} />

            {/* Kartu Cuaca Utama */}
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
              indeksAQI={hasil.kualitasUdara.indeksAQI}
              kondisi={labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}
              suhuMaks={hasil.cuaca.harian.suhuMaksimal[0]}
              suhuMin={hasil.cuaca.harian.suhuMinimal[0]}
            />

            {/* 2 Kolom Metrik Ringkas: Angin & Polusi */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              {/* Box 1: Kecepatan Angin */}
              <View
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: warna.kartu,
                  borderWidth: 1,
                  borderColor: warna.garis,
                  gap: 6,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <MaterialCommunityIcons name="weather-windy-variant" size={18} color={warna.aksen} />
                  <Text style={{ fontSize: 12, color: warna.teksPelan, fontWeight: "500" }}>
                    Kecepatan Angin
                  </Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: "700", color: warna.teks }}>
                  {hasil.cuaca.saatIni.kecepatanAngin}{" "}
                  <Text style={{ fontSize: 12, fontWeight: "400", color: warna.teksPelan }}>km/j</Text>
                </Text>
              </View>

              {/* Box 2: Partikel Polusi */}
              <View
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: warna.kartu,
                  borderWidth: 1,
                  borderColor: warna.garis,
                  gap: 6,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons
                    name="leaf-outline"
                    size={16}
                    color={warna.aqi[konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)]}
                  />
                  <Text style={{ fontSize: 12, color: warna.teksPelan, fontWeight: "500" }}>
                    Partikel Polusi
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: warna.teks, fontWeight: "600" }}>
                  PM2.5: {hasil.kualitasUdara.pm25}
                </Text>
                <Text style={{ fontSize: 12, color: warna.teksPelan }}>
                  PM10: {hasil.kualitasUdara.pm10}
                </Text>
              </View>
            </View>

            {/* Tombol Aksi Bersih: Perbarui & Simpan Favorit */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              <TouchableOpacity
                onPress={() => pilihKota(kotaTerpilih, true)}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 42,
                  borderRadius: 10,
                  backgroundColor: warna.kartu,
                  borderWidth: 1,
                  borderColor: warna.garis,
                  gap: 6,
                }}
              >
                <Ionicons name="refresh-outline" size={17} color={warna.aksen} />
                <Text style={{ fontSize: 13, fontWeight: "600", color: warna.aksen }}>
                  Perbarui
                </Text>
              </TouchableOpacity>

              {!idFavorit.includes(kotaTerpilih.id) ? (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/tambah-favorit",
                      params: {
                        id: String(kotaTerpilih.id),
                        nama: kotaTerpilih.name,
                        lat: String(kotaTerpilih.latitude),
                        lon: String(kotaTerpilih.longitude),
                      },
                    })
                  }
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 42,
                    borderRadius: 10,
                    backgroundColor: warna.aksen,
                    gap: 6,
                  }}
                >
                  <Ionicons name="bookmark-outline" size={17} color="#FFFFFF" />
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#FFFFFF" }}>
                    Simpan Favorit
                  </Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 42,
                    borderRadius: 10,
                    backgroundColor: warna.kartu,
                    borderWidth: 1,
                    borderColor: warna.garis,
                    gap: 6,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={17} color={warna.aqi.BAIK} />
                  <Text style={{ fontSize: 13, fontWeight: "500", color: warna.teksPelan }}>
                    Tersimpan Favorit
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}