// src/app/(tabs)/index.tsx
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Button, ScrollView, Text, TouchableOpacity, View } from "react-native";
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

  // Segarkan daftar favorit setiap kali layar ini difokuskan (misalnya setelah modal ditutup)
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
      if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan
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
        setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual di atas.");
        return;
      }
      if (status === "unavailable") {
        setPesanLokasi("Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.");
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
      setPesanLokasi("Gagal mendapatkan lokasi. Silakan cari kota secara manual di atas.");
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
          // abaikan: daftar dimuat ulang di bawah
        }
        muatKotaTersimpan();
      }
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBox nilai={teksCari} onCari={setTeksCari} />
        <Button title="Gunakan Lokasi Saat Ini" onPress={gunakanLokasiSaatIni} />
        {pesanLokasi && (
          <Text accessibilityLabel={pesanLokasi} style={{ color: warna.teks }}>
            {pesanLokasi}
          </Text>
        )}

        {hasilPencarian.map((kota) => (
          <TouchableOpacity
            key={kota.id}
            style={{ paddingVertical: 8 }}
            onPress={() => pilihDariPencarian(kota)}
          >
            <Text style={{ color: warna.teks }}>
              {kota.name}
              {kota.admin1 ? `, ${kota.admin1}` : ""}
            </Text>
          </TouchableOpacity>
        ))}

        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 4 }}>
            <Text style={{ fontWeight: "bold", color: warna.teks }}>
              Tersimpan di perangkat (bisa dibuka offline)
            </Text>
            {kotaTersimpan.map((k) => (
              <View
                key={k.kunci}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <TouchableOpacity
                  style={{ flex: 1, paddingVertical: 10 }}
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
                  <Text style={{ color: warna.teks }}>{k.nama}</Text>
                </TouchableOpacity>
                <Button
                  title="Hapus Cache"
                  color={warna.bahaya}
                  accessibilityLabel={`Hapus data tersimpan ${k.nama}`}
                  onPress={() => konfirmasiHapusCache(k)}
                />
              </View>
            ))}
          </View>
        )}

        {sedangMemuat && <ActivityIndicator color={warna.aksen} />}

        {pesanError && (
          <View style={{ gap: 8 }}>
            <Text accessibilityLabel={pesanError} style={{ color: warna.teks }}>
              {pesanError}
            </Text>
            <Button
              title="Coba Lagi"
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
            />
          </View>
        )}

        {hasil && kotaTerpilih && !sedangMemuat && (
          <>
            <StatusData sumber={hasil.sumber} disimpanPada={hasil.disimpanPada} />
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
              indeksAQI={hasil.kualitasUdara.indeksAQI}
            />
            <Text style={{ fontSize: 12, color: warna.teksPelan }}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)} {"\u2022"} Angin{" "}
              {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>
            <Text style={{ fontSize: 12, color: warna.teks }}>
              Maks: {hasil.cuaca.harian.suhuMaksimal[0]}°C {"\u2022"} Min:{" "}
              {hasil.cuaca.harian.suhuMinimal[0]}°C
            </Text>
            <Text style={{ fontSize: 12, color: warna.teksPelan }}>
              PM2.5: {hasil.kualitasUdara.pm25} {"\u2022"} PM10: {hasil.kualitasUdara.pm10}
            </Text>
            <Button title="Perbarui Sekarang" onPress={() => pilihKota(kotaTerpilih, true)} />
            {!idFavorit.includes(kotaTerpilih.id) && (
              <Button
                title="Tambahkan ke Favorit"
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
              />
            )}
          </>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}