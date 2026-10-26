// components/StatusData.tsx
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useTema } from "../src/context/TemaContext";
import { SumberData } from "../src/types/cache";

interface StatusDataProps {
  sumber: SumberData;
  disimpanPada: number;
}

function formatUmur(disimpanPada: number): string {
  const menit = Math.floor((Date.now() - disimpanPada) / 60000);
  if (menit < 1) return "baru saja";
  if (menit < 60) return menit + " menit lalu";
  const jam = Math.floor(menit / 60);
  if (jam < 24) return jam + " jam lalu";
  return Math.floor(jam / 24) + " hari lalu";
}

function labelSumber(sumber: SumberData): string {
  if (sumber === "jaringan") return "Data langsung dari internet";
  if (sumber === "cache-segar") return "Data tersimpan (masih segar)";
  return "Mode offline - data tersimpan mungkin usang";
}

export default function StatusData({ sumber, disimpanPada }: StatusDataProps) {
  const { warna } = useTema();
  const basi = sumber === "cache-basi";
  const label = labelSumber(sumber);
  const umur = formatUmur(disimpanPada);

  return (
    <View
      accessible
      accessibilityLabel={label + ", diperbarui " + umur}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 10,
        backgroundColor: basi ? warna.infoBasiLatar : warna.infoBaikLatar,
        borderWidth: 1,
        borderColor: basi ? warna.infoBasiTeks + "25" : warna.infoBaikTeks + "25",
        gap: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
        <Ionicons
          name={sumber === "jaringan" ? "cloud-done-outline" : "cloud-offline-outline"}
          size={15}
          color={basi ? warna.infoBasiTeks : warna.infoBaikTeks}
        />
        <Text
          numberOfLines={1}
          style={{
            fontSize: 12,
            fontWeight: "500",
            color: basi ? warna.infoBasiTeks : warna.infoBaikTeks,
          }}
        >
          {label}
        </Text>
      </View>
      <Text style={{ fontSize: 11, color: warna.teksPelan }}>
        {umur}
      </Text>
    </View>
  );
}