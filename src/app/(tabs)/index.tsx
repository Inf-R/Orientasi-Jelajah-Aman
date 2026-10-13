// src/app/(tabs)/index.tsx
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Button, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AtribusiCuaca from "../../../components/AtribusiCuaca";
import SearchBox from "../../../components/SearchBox";
import WeatherCard from "../../../components/WeatherCard";
import { cariKotaBawaan } from "../../constants/kotaBawaan";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useDebounce } from "../../hooks/use-debounce";
import { ambilKualitasUdara } from "../../services/airQualityService";
import { ambilCache, ambilCacheTerakhir, cariDiCache, simpanCache } from "../../services/cacheService";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { cariKota } from "../../services/geocodingServices";
import { ambilKoordinatSaatIni, mintaIzinLokasi } from "../../services/locationService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { ambilCuaca } from "../../services/weatherService";
import { HasilGeocoding } from "../../types/geocoding";
import { DataCuacaLengkap, DataKualitasUdara } from "../../types/weather";

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [cuaca, setCuaca] = useState<DataCuacaLengkap | null>(null);
  const [kualitasUdara, setKualitasUdara] = useState<DataKualitasUdara | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [infoOffline, setInfoOffline] = useState<string | null>(null);
  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const [idFavorit, setIdFavorit] = useState<number[]>([]);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda)
      .then(setHasilPencarian)
      .catch(async () => {
        const dariCache = await cariDiCache(teksTertunda);
        const gabungan = [...dariCache];
        for (const k of cariKotaBawaan(teksTertunda)) {
          const sudahAda = gabungan.some(
            (g) => g.name.toLowerCase() === k.name.toLowerCase()
          );
          if (!sudahAda) gabungan.push(k);
        }
        setHasilPencarian(gabungan);
      });
  }, [teksTertunda]);

  useEffect(() => {
    if (kotaTerpilih) {
      ambilSemuaFavorit().then((list) => setIdFavorit(list.map((k) => k.id)));
    }
  }, [kotaTerpilih]);

  // Saat aplikasi dibuka: muat kembali kota terakhir (online -> data baru, offline -> dari cache)
  useEffect(() => {
    ambilCacheTerakhir().then((cache) => {
      if (cache) pilihKota(cache.kota);
    });
  }, []);

  async function pilihKota(kota: HasilGeocoding) {
    setKotaTerpilih(kota);
    setHasilPencarian([]);
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);
    setInfoOffline(null);
    try {
      const [dataCuaca, dataAQI] = await Promise.all([
        ambilCuaca(kota.latitude, kota.longitude),
        ambilKualitasUdara(kota.latitude, kota.longitude),
      ]);
      if (idSaatIni !== requestIdRef.current) return;
      setCuaca(dataCuaca);
      setKualitasUdara(dataAQI);
      await simpanCache(kota, dataCuaca, dataAQI);
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      const cache = await ambilCache(kota);
      if (idSaatIni !== requestIdRef.current) return;
      if (cache) {
        setCuaca(cache.cuaca);
        setKualitasUdara(cache.kualitasUdara);
        setInfoOffline(
          `Mode offline. Menampilkan data tersimpan (${new Date(
            cache.disimpanPada
          ).toLocaleString("id-ID")}).`
        );
      } else {
        setCuaca(null);
        setKualitasUdara(null);
        setPesanError("Gagal memuat data cuaca dan belum ada data tersimpan untuk kota ini.");
      }
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  async function gunakanLokasiSaatIni() {
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
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 16 }}>
      <SearchBox onCari={setTeksCari} />
      <Button title="Gunakan Lokasi Saat Ini" onPress={gunakanLokasiSaatIni} />
      {pesanLokasi && <Text>{pesanLokasi}</Text>}
      {hasilPencarian.map((kota) => (
        <TouchableOpacity key={kota.id} onPress={() => pilihKota(kota)}>
          <Text>{kota.name}</Text>
        </TouchableOpacity>
      ))}
      {sedangMemuat && <ActivityIndicator />}
      {infoOffline && (
        <Text
          accessibilityLabel={infoOffline}
          style={{ fontSize: 12, color: "#B45309", backgroundColor: "#FEF3C7", padding: 8, borderRadius: 8 }}
        >
          {infoOffline}
        </Text>
      )}
      {pesanError && (
        <View>
          <Text>{pesanError}</Text>
          <Button
            title="Coba Lagi"
            onPress={() => kotaTerpilih && pilihKota(kotaTerpilih)}
          />
        </View>
      )}
      {cuaca && kualitasUdara && kotaTerpilih && !sedangMemuat && (
        <>
          <WeatherCard
            kota={kotaTerpilih.name}
            suhu={cuaca.saatIni.suhu}
            tingkatAQI={konversiTingkatAQI(kualitasUdara.indeksAQI)}
            indeksAQI={kualitasUdara.indeksAQI}
          />
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
      {cuaca && (
        <Text style={{ fontSize: 12, color: "#888" }}>
          Kondisi: {labelKodeCuaca(cuaca.saatIni.kodeCuaca)} • Angin{" "}
          {cuaca.saatIni.kecepatanAngin} km/j
        </Text>
      )}
      {cuaca && (
        <Text style={{ fontSize: 12 }}>
          Maks: {cuaca.harian.suhuMaksimal[0]}°C • Min: {cuaca.harian.suhuMinimal[0]}°C
        </Text>
      )}
      {kualitasUdara && (
        <Text style={{ fontSize: 12, color: "#888" }}>
          PM2.5: {kualitasUdara.pm25} • PM10: {kualitasUdara.pm10}
        </Text>
      )}
      <AtribusiCuaca />
    </SafeAreaView>
  );
}