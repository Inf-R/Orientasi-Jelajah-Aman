// src/app/tambah-favorit.tsx
import { router, useLocalSearchParams } from "expo-router";
import { Button, Text, View } from "react-native";
import { useTema } from "../context/TemaContext";
import { tambahFavorit } from "../services/favoritStorage";

export default function ModalTambahFavorit() {
  const { warna } = useTema();
  const { id, nama, lat, lon } = useLocalSearchParams<{
    id: string;
    nama: string;
    lat: string;
    lon: string;
  }>();

  async function simpan() {
    await tambahFavorit({
      id: Number(id),
      nama,
      latitude: Number(lat),
      longitude: Number(lon),
    });
    router.back();
  }

  return (
    <View style={{ padding: 16, gap: 16 }}>
      <Text style={{ color: warna.teks }}>Tambahkan {nama} ke daftar favorit?</Text>
      <Button title="Simpan" onPress={simpan} />
    </View>
  );
}