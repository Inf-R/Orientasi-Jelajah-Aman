// src/app/(tabs)/riwayat.tsx
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Button, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { KotaFavorit } from "../../types/favorit";

export default function TabRiwayat() {
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);

  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit().then(setDaftarFavorit);
    }, [])
  );

  async function hapus(id: number) {
    await hapusFavorit(id);
    setDaftarFavorit((prev) => prev.filter((k) => k.id !== id));
  }

  function konfirmasiHapus(id: number, nama: string) {
    if (Platform.OS === "web") {
      const yakin = window.confirm(`Yakin hapus ${nama}?`);
      if (yakin) hapus(id);
      return;
    }
    Alert.alert("Konfirmasi", `Yakin hapus ${nama}?`, [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: () => hapus(id) },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Kota Favorit</Text>
      {daftarFavorit.length === 0 && <Text>Belum ada kota favorit</Text>}
      {daftarFavorit.map((kota) => (
        <View
          key={kota.id}
          style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <Text>{kota.nama}</Text>
          <Button title="Hapus" onPress={() => konfirmasiHapus(kota.id, kota.nama)} />
        </View>
      ))}
    </SafeAreaView>
  );
}