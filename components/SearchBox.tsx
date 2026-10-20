// components/SearchBox.tsx
import { TextInput, View } from "react-native";
import { useTema } from "../src/context/TemaContext";

interface SearchBoxProps {
  nilai: string; // teks kini dikendalikan oleh halaman pemanggil
  onCari: (teks: string) => void;
}

export default function SearchBox({ nilai, onCari }: SearchBoxProps) {
  const { warna } = useTema();
  return (
    <View>
      <TextInput
        placeholder="Cari nama kota..."
        placeholderTextColor={warna.teksPelan}
        value={nilai}
        onChangeText={onCari}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        style={{
          borderWidth: 1,
          borderColor: warna.garis,
          backgroundColor: warna.kartu,
          color: warna.teks,
          padding: 8,
          borderRadius: 8,
        }}
      />
    </View>
  );
}