// src/app/_layout.tsx (root layout)
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import TombolTema from "../../components/TombolTema";
import { TemaProvider, useTema } from "../context/TemaContext";

SplashScreen.preventAutoHideAsync();

function IsiLayout() {
  const { skema, warna } = useTema();
  const dasar = skema === "gelap" ? DarkTheme : DefaultTheme;

  // Warna header dan tab bar ikut palet aplikasi
  const temaNavigasi = {
    ...dasar,
    colors: {
      ...dasar.colors,
      background: warna.latar,
      card: warna.kartu,
      text: warna.teks,
      border: warna.garis,
      primary: warna.aksen,
    },
  };

  return (
    <ThemeProvider value={temaNavigasi}>
      <StatusBar style={skema === "gelap" ? "light" : "dark"} />
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerRight: () => <TombolTema /> }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="detail/[kota]" options={{ title: "Detail Cuaca" }} />
        <Stack.Screen
          name="tambah-favorit"
          options={{ presentation: "modal", title: "Tambah Favorit" }}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <TemaProvider>
      <IsiLayout />
    </TemaProvider>
  );
}