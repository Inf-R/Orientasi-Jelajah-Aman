// src/app/(tabs)/riwayat.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTema } from "../../context/TemaContext";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { ambilRiwayat, kosongkanRiwayat } from "../../services/riwayatPencarian";
import { KotaFavorit } from "../../types/favorit";
import { konfirmasi } from "../../utils/konfirmasi";

export default function TabRiwayat() {
  const { warna } = useTema();
  const [riwayat, setRiwayat] = useState<string[]>([]);
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);

  // Muat ulang setiap kali tab ini difokuskan
  useFocusEffect(
    useCallback(() => {
      ambilRiwayat().then(setRiwayat);
      ambilSemuaFavorit()
        .then(setDaftarFavorit)
        .catch(() => {});
    }, [])
  );

  // UTS no. 2: buka Beranda dengan kota ini terisi di kotak pencarian
  function bukaPencarian(nama: string) {
    router.navigate({ pathname: "/", params: { cari: nama, t: String(Date.now()) } });
  }

  function konfirmasiKosongkan() {
    konfirmasi("Hapus riwayat", "Yakin hapus seluruh riwayat pencarian?", "Hapus", async () => {
      await kosongkanRiwayat();
      setRiwayat([]);
    });
  }

  function konfirmasiHapusFavorit(kota: KotaFavorit) {
    konfirmasi("Konfirmasi", `Yakin hapus ${kota.nama}?`, "Hapus", async () => {
      await hapusFavorit(kota.id);
      setDaftarFavorit((prev) => prev.filter((k) => k.id !== kota.id));
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.latar }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        {/* Bagian Riwayat Pencarian */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: warna.teks }}>
              Pencarian Terakhir
            </Text>
            {riwayat.length > 0 && (
              <TouchableOpacity
                onPress={konfirmasiKosongkan}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Ionicons name="trash-outline" size={14} color={warna.bahaya} />
                <Text style={{ fontSize: 12, fontWeight: "600", color: warna.bahaya }}>
                  Hapus Semua
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {riwayat.length === 0 ? (
            <View
              style={{
                padding: 18,
                borderRadius: 12,
                backgroundColor: warna.kartu,
                borderWidth: 1,
                borderColor: warna.garis,
                alignItems: "center",
              }}
            >
              <Text style={{ color: warna.teksPelan, fontSize: 13 }}>Belum ada riwayat pencarian</Text>
            </View>
          ) : (
            <View
              style={{
                borderRadius: 12,
                backgroundColor: warna.kartu,
                borderWidth: 1,
                borderColor: warna.garis,
                overflow: "hidden",
              }}
            >
              {riwayat.map((nama, idx) => (
                <TouchableOpacity
                  key={nama}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                    borderBottomWidth: idx < riwayat.length - 1 ? 1 : 0,
                    borderBottomColor: warna.garis,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Cari ulang ${nama}`}
                  onPress={() => bukaPencarian(nama)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Ionicons name="time-outline" size={17} color={warna.teksPelan} />
                    <Text style={{ color: warna.teks, fontSize: 14 }}>{nama}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={15} color={warna.teksPelan} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Bagian Kota Favorit */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: warna.teks }}>
              Kota Favorit
            </Text>
            <Text style={{ fontSize: 12, color: warna.teksPelan }}>
              {daftarFavorit.length} kota tersimpan
            </Text>
          </View>

          {daftarFavorit.length === 0 ? (
            <View
              style={{
                padding: 18,
                borderRadius: 12,
                backgroundColor: warna.kartu,
                borderWidth: 1,
                borderColor: warna.garis,
                alignItems: "center",
              }}
            >
              <Text style={{ color: warna.teksPelan, fontSize: 13 }}>Belum ada kota favorit</Text>
            </View>
          ) : (
            <View
              style={{
                borderRadius: 12,
                backgroundColor: warna.kartu,
                borderWidth: 1,
                borderColor: warna.garis,
                overflow: "hidden",
              }}
            >
              {daftarFavorit.map((kota, idx) => (
                <View
                  key={kota.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: idx < daftarFavorit.length - 1 ? 1 : 0,
                    borderBottomColor: warna.garis,
                  }}
                >
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}
                    onPress={() => bukaPencarian(kota.nama)}
                  >
                    <Ionicons name="star" size={17} color="#FBBF24" />
                    <Text style={{ color: warna.teks, fontSize: 14, fontWeight: "500" }}>
                      {kota.nama}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => konfirmasiHapusFavorit(kota)}
                    accessibilityLabel={`Hapus ${kota.nama} dari favorit`}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="trash-outline" size={17} color={warna.bahaya} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}