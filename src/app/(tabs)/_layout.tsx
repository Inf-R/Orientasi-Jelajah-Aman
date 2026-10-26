// src/app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ComponentProps } from "react";
import TombolTema from "../../../components/TombolTema";
import { useTema } from "../../context/TemaContext";

type NamaIkon = ComponentProps<typeof Ionicons>["name"];

export default function TabLayout() {
  const { warna } = useTema();

  // Pembuat ikon: versi "penuh" saat tab aktif, versi "garis" saat tidak aktif
  const ikon =
    (aktif: NamaIkon, nonaktif: NamaIkon) =>
    ({ size, focused }: { size: number; focused: boolean }) => (
      <Ionicons
        name={focused ? aktif : nonaktif}
        size={size}
        color={focused ? warna.aksen : warna.teksPelan}
      />
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: warna.aksen,
        tabBarInactiveTintColor: warna.teksPelan,
        headerRight: () => <TombolTema />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Beranda", tabBarIcon: ikon("home", "home-outline") }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: "Riwayat & Favorit", // judul di header halaman
          tabBarLabel: "Riwayat", // label singkat di tab bar
          tabBarIcon: ikon("time", "time-outline"),
        }}
      />
      <Tabs.Screen
        name="pengaturan"
        options={{ title: "Pengaturan", tabBarIcon: ikon("settings", "settings-outline") }}
      />
      <Tabs.Screen
        name="tentang"
        options={{
          title: "Tentang",
          tabBarIcon: ikon("information-circle", "information-circle-outline"),
        }}
      />
    </Tabs>
  );
}