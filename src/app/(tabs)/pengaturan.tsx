// src/app/(tabs)/pengaturan.tsx
import { useState } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typeScale } from "../../constants/styles";
import { ModeTema, useTema } from "../../context/TemaContext";
import { hapusSemuaCache } from "../../services/cacheRepository";
import { konfirmasi } from "../../utils/konfirmasi";

const PILIHAN_TEMA: { nilai: ModeTema; label: string }[] = [
  { nilai: "terang", label: "Terang" },
  { nilai: "gelap", label: "Gelap" },
  { nilai: "sistem", label: "Ikuti Sistem" },
];

export default function TabPengaturan() {
  const { warna, mode, ubahMode } = useTema();
  const [pesan, setPesan] = useState<string | null>(null);

  function konfirmasiHapusSemua() {
    konfirmasi(
      "Hapus data tersimpan",
      "Yakin hapus seluruh data cuaca tersimpan di perangkat?",
      "Hapus",
      async () => {
        try {
          await hapusSemuaCache();
          setPesan("Data cuaca tersimpan sudah dihapus.");
        } catch {
          setPesan("Gagal menghapus data tersimpan.");
        }
      }
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: spacing.sedang, gap: spacing.sedang }}>
      <Text style={{ fontSize: typeScale.judul, fontWeight: "bold", color: warna.teks }}>
        Jelajah Aman
      </Text>
      <Text style={{ color: warna.teks }}>Versi 1.0.0</Text>

      <View style={{ gap: spacing.kecil }}>
        <Text style={{ fontSize: typeScale.subjudul, fontWeight: "bold", color: warna.teks }}>
          Tampilan
        </Text>
        {PILIHAN_TEMA.map((p) => {
          const terpilih = mode === p.nilai;
          return (
            <TouchableOpacity
              key={p.nilai}
              onPress={() => ubahMode(p.nilai)}
              accessibilityRole="radio"
              accessibilityState={{ selected: terpilih }}
              accessibilityLabel={`Mode tampilan ${p.label}`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                minHeight: 44,
                paddingHorizontal: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: terpilih ? warna.aksen : warna.garis,
                backgroundColor: warna.kartu,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: terpilih ? warna.aksen : warna.teksPelan,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {terpilih && (
                  <View
                    style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: warna.aksen }}
                  />
                )}
              </View>
              <Text style={{ color: warna.teks }}>{p.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ gap: spacing.kecil }}>
        <Text style={{ fontSize: typeScale.subjudul, fontWeight: "bold", color: warna.teks }}>
          Data
        </Text>
        <Button
          title="Hapus Data Cuaca Tersimpan"
          color={warna.bahaya}
          onPress={konfirmasiHapusSemua}
        />
        {pesan && (
          <Text accessibilityLabel={pesan} style={{ color: warna.teks }}>
            {pesan}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}