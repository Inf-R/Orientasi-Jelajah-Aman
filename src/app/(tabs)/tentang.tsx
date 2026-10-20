// src/app/(tabs)/tentang.tsx
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typeScale } from "../../constants/styles";
import { useTema } from "../../context/TemaContext";

const NAMA_PEMBUAT = "R"; // ganti dengan nama lengkapmu

export default function TabTentang() {
  const { warna } = useTema();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: spacing.sedang, gap: spacing.kecil }}>
        <Text
          accessible
          accessibilityLabel="Judul halaman Tentang aplikasi Jelajah Aman"
          style={{ fontSize: typeScale.judul, fontWeight: "bold", color: warna.teks }}
        >
          Jelajah Aman
        </Text>
        <Text style={{ fontSize: typeScale.isi, color: warna.teks }}>Versi 1.0.0</Text>
        <Text style={{ fontSize: typeScale.isi, color: warna.teks }}>Dibuat oleh: {NAMA_PEMBUAT}</Text>
      </View>
    </SafeAreaView>
  );
}