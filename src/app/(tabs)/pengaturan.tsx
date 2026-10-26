// src/app/(tabs)/pengaturan.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTema } from "../../context/TemaContext";
import { hapusSemuaCache } from "../../services/cacheRepository";
import { konfirmasi } from "../../utils/konfirmasi";

export default function TabPengaturan() {
  const { warna } = useTema();
  const [pesan, setPesan] = useState<string | null>(null);

  function konfirmasiHapusSemua() {
    konfirmasi(
      "Hapus data tersimpan",
      "Yakin hapus seluruh data cuaca tersimpan di perangkat?",
      "Hapus",
      async () => {
        try {
          await hapusSemuaCache();
          setPesan("Seluruh data cuaca tersimpan berhasil dibersihkan.");
        } catch {
          setPesan("Gagal menghapus data tersimpan.");
        }
      }
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.latar }}>
      <View style={{ padding: 16, gap: 16 }}>
        {/* Header Kartu Aplikasi */}
        <View
          style={{
            padding: 18,
            borderRadius: 14,
            backgroundColor: warna.kartu,
            borderWidth: 1,
            borderColor: warna.garis,
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: warna.teks }}>
            Jelajah Aman
          </Text>
          <Text style={{ fontSize: 13, color: warna.teksPelan }}>
            Aplikasi Informasi Cuaca & Kualitas Udara • Versi 1.0.0
          </Text>
        </View>

        {/* Manajemen Penyimpanan Data */}
        <View
          style={{
            padding: 18,
            borderRadius: 14,
            backgroundColor: warna.kartu,
            borderWidth: 1,
            borderColor: warna.garis,
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "700", color: warna.teks }}>
            Penyimpanan Cache Offline
          </Text>
          <Text style={{ fontSize: 13, color: warna.teksPelan, lineHeight: 18 }}>
            Data cuaca yang Anda lihat disimpan secara lokal agar dapat diakses saat tidak ada internet. Anda dapat membersihkan seluruh cache perangkat di sini.
          </Text>

          <TouchableOpacity
            onPress={konfirmasiHapusSemua}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              height: 42,
              borderRadius: 10,
              backgroundColor: warna.bahaya + "18",
              borderWidth: 1,
              borderColor: warna.bahaya + "40",
              gap: 8,
              marginTop: 4,
            }}
          >
            <Ionicons name="trash-outline" size={17} color={warna.bahaya} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: warna.bahaya }}>
              Hapus Seluruh Data Cuaca
            </Text>
          </TouchableOpacity>

          {pesan && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 10,
                borderRadius: 8,
                backgroundColor: warna.infoBaikLatar,
                gap: 6,
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color={warna.infoBaikTeks} />
              <Text accessibilityLabel={pesan} style={{ color: warna.infoBaikTeks, fontSize: 12, flex: 1 }}>
                {pesan}
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}