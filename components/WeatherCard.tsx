// components/WeatherCard.tsx
import { Text, View } from "react-native";
import { spacing, typeScale } from "../src/constants/styles";
import { useTema } from "../src/context/TemaContext";
import { WeatherCardProps } from "../types/cuaca";

export default function WeatherCard({ kota, suhu, tingkatAQI, indeksAQI }: WeatherCardProps) {
  const { warna } = useTema();

  const teksAQI =
    indeksAQI !== undefined ? `AQI: ${indeksAQI} (${tingkatAQI})` : `AQI: ${tingkatAQI}`;

  const labelAksesibilitas =
    indeksAQI !== undefined
      ? `Cuaca ${kota}, suhu ${suhu} derajat, indeks kualitas udara ${indeksAQI}, kategori ${tingkatAQI}`
      : `Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${tingkatAQI}`;

  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={{
        padding: spacing.sedang,
        borderRadius: 8,
        backgroundColor: warna.kartu,
        borderWidth: 1,
        borderColor: warna.garis,
      }}
    >
      <Text style={{ fontWeight: "bold", fontSize: typeScale.judul, color: warna.teks }}>{kota}</Text>
      <Text style={{ fontSize: 32, color: warna.teks }}>{suhu}°C</Text>
      <Text style={{ color: warna.aqi[tingkatAQI], fontSize: typeScale.isi }}>{teksAQI}</Text>
    </View>
  );
}