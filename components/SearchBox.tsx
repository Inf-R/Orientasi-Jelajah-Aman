// components/SearchBox.tsx
import { Ionicons } from "@expo/vector-icons";
import { TextInput, TouchableOpacity, View } from "react-native";
import { useTema } from "../src/context/TemaContext";

interface SearchBoxProps {
  nilai: string; // teks dikendalikan oleh halaman pemanggil
  onCari: (teks: string) => void;
  onLokasi?: () => void; // opsional: integrasi tombol GPS langsung di samping search box
}

export default function SearchBox({ nilai, onCari, onLokasi }: SearchBoxProps) {
  const { warna } = useTema();

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: warna.kartu,
          borderWidth: 1,
          borderColor: warna.garis,
          borderRadius: 12,
          paddingHorizontal: 12,
          height: 44,
          gap: 8,
        }}
      >
        <Ionicons name="search-outline" size={18} color={warna.teksPelan} />
        <TextInput
          placeholder="Cari nama kota..."
          placeholderTextColor={warna.teksPelan}
          value={nilai}
          onChangeText={onCari}
          accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
          style={{
            flex: 1,
            color: warna.teks,
            fontSize: 14,
            paddingVertical: 0,
          }}
        />
        {nilai.length > 0 && (
          <TouchableOpacity
            onPress={() => onCari("")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Kosongkan pencarian"
          >
            <Ionicons name="close-circle" size={18} color={warna.teksPelan} />
          </TouchableOpacity>
        )}
      </View>

      {onLokasi && (
        <TouchableOpacity
          onPress={onLokasi}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Gunakan Lokasi Saat Ini"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: warna.kartu,
            borderWidth: 1,
            borderColor: warna.garis,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="locate-outline" size={20} color={warna.aksen} />
        </TouchableOpacity>
      )}
    </View>
  );
}