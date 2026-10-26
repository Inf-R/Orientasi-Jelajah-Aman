// components/WeatherCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useTema } from "../src/context/TemaContext";
import { WeatherCardProps } from "../types/cuaca";

interface WeatherCardExtendedProps extends WeatherCardProps {
  kondisi?: string;
  suhuMaks?: number;
  suhuMin?: number;
}

export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
  indeksAQI,
  kondisi,
  suhuMaks,
  suhuMin,
}: WeatherCardExtendedProps) {
  const { warna } = useTema();

  const teksAQI =
    indeksAQI !== undefined ? `AQI ${indeksAQI} (${tingkatAQI})` : `AQI ${tingkatAQI}`;

  const labelAksesibilitas =
    indeksAQI !== undefined
      ? `Cuaca ${kota}, suhu ${suhu} derajat, indeks kualitas udara ${indeksAQI}, kategori ${tingkatAQI}`
      : `Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${tingkatAQI}`;

  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={{
        padding: 18,
        borderRadius: 16,
        backgroundColor: warna.kartu,
        borderWidth: 1,
        borderColor: warna.garis,
        gap: 12,
      }}
    >
      {/* Baris Atas: Nama Kota & Badge AQI */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: "700",
              fontSize: 22,
              color: warna.teks,
              letterSpacing: -0.3,
            }}
          >
            {kota}
          </Text>
          {kondisi && (
            <Text style={{ fontSize: 13, color: warna.teksPelan, marginTop: 2 }}>
              {kondisi}
            </Text>
          )}
        </View>

        {/* Badge Tingkat AQI */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 9,
            paddingVertical: 4,
            borderRadius: 8,
            backgroundColor: warna.aqi[tingkatAQI] + "1A", // 10% opacity background
            borderWidth: 1,
            borderColor: warna.aqi[tingkatAQI] + "40",
            gap: 5,
          }}
        >
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 3.5,
              backgroundColor: warna.aqi[tingkatAQI],
            }}
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: warna.aqi[tingkatAQI],
            }}
          >
            {teksAQI}
          </Text>
        </View>
      </View>

      {/* Baris Utama: Suhu Besar & Min/Max */}
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 12 }}>
        <Text
          style={{
            fontSize: 44,
            fontWeight: "300",
            color: warna.teks,
            letterSpacing: -1,
          }}
        >
          {suhu}°
          <Text style={{ fontSize: 24, fontWeight: "400", color: warna.teksPelan }}>C</Text>
        </Text>

        {suhuMaks !== undefined && suhuMin !== undefined && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Ionicons name="arrow-up" size={12} color={warna.aksen} />
              <Text style={{ fontSize: 13, color: warna.teks, fontWeight: "500" }}>
                {suhuMaks}°
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Ionicons name="arrow-down" size={12} color={warna.teksPelan} />
              <Text style={{ fontSize: 13, color: warna.teksPelan, fontWeight: "500" }}>
                {suhuMin}°
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}