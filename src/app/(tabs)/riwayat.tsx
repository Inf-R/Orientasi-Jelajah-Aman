// src/app/(tabs)/riwayat.tsx
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Button, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typeScale } from "../../constants/styles";
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
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: spacing.sedang, gap: spacing.besar }}>
        <View style={{ gap: spacing.kecil }}>
          <Text style={{ fontSize: typeScale.subjudul, fontWeight: "bold", color: warna.teks }}>
            Pencarian Terakhir
          </Text>
          {riwayat.length === 0 && (
            <Text style={{ color: warna.teksPelan }}>Belum ada riwayat pencarian</Text>
          )}
          {riwayat.map((nama) => (
            <TouchableOpacity
              key={nama}
              style={{ paddingVertical: 10 }}
              accessibilityRole="button"
              accessibilityLabel={`Cari ulang ${nama}`}
              onPress={() => bukaPencarian(nama)}
            >
              <Text style={{ color: warna.teks }}>{nama}</Text>
            </TouchableOpacity>
          ))}
          {riwayat.length > 0 && (
            <Button title="Hapus Semua Riwayat" color={warna.bahaya} onPress={konfirmasiKosongkan} />
          )}
        </View>

        <View style={{ gap: spacing.kecil }}>
          <Text style={{ fontSize: typeScale.subjudul, fontWeight: "bold", color: warna.teks }}>
            Kota Favorit
          </Text>
          <Text style={{ color: warna.teksPelan }}>Tersimpan {daftarFavorit.length} kota</Text>
          {daftarFavorit.length === 0 && (
            <Text style={{ color: warna.teksPelan }}>Belum ada kota favorit</Text>
          )}
          {daftarFavorit.map((kota) => (
            <View
              key={kota.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: warna.teks }}>{kota.nama}</Text>
              <Button
                title="Hapus"
                accessibilityLabel={`Hapus ${kota.nama} dari favorit`}
                onPress={() => konfirmasiHapusFavorit(kota)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}