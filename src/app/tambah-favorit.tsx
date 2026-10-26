// src/app/tambah-favorit.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
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
    <View
      style={{
        flex: 1,
        backgroundColor: warna.latar,
        padding: 20,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          padding: 24,
          borderRadius: 16,
          backgroundColor: warna.kartu,
          borderWidth: 1,
          borderColor: warna.garis,
          alignItems: "center",
          gap: 16,
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: warna.aksen + "1A",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="bookmark" size={26} color={warna.aksen} />
        </View>

        <View style={{ alignItems: "center", gap: 4 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: warna.teks, textAlign: "center" }}>
            Tambah ke Favorit
          </Text>
          <Text style={{ fontSize: 14, color: warna.teksPelan, textAlign: "center" }}>
            Tambahkan <Text style={{ fontWeight: "700", color: warna.teks }}>{nama}</Text> ke daftar kota favorit Anda?
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10, width: "100%", marginTop: 8 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              flex: 1,
              height: 42,
              borderRadius: 10,
              backgroundColor: warna.kartu,
              borderWidth: 1,
              borderColor: warna.garis,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: warna.teksPelan }}>
              Batal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={simpan}
            activeOpacity={0.7}
            style={{
              flex: 1,
              height: 42,
              borderRadius: 10,
              backgroundColor: warna.aksen,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF" }}>
              Simpan
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}