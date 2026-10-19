# Jelajah Aman

Aplikasi cuaca dan kualitas udara berbasis React Native (Expo) untuk mata kuliah
Pemrograman Berbasis Platform (INF2528), UIN K.H. Abdurrahman Wahid Pekalongan.

## Fitur

- Pencarian kota dengan debounce (Open-Meteo Geocoding API)
- Cuaca dan kualitas udara (AQI, PM2.5, PM10) dari Open-Meteo
- Lokasi saat ini dengan penanganan izin granted / denied / unavailable
- Kota favorit tersimpan permanen (AsyncStorage)
- Cache cuaca offline-first di SQLite dengan TTL 30 menit
- Indikator status data (terbaru, tersimpan segar, offline usang)
- Navigasi tab, halaman detail, dan modal (Expo Router)

## Teknologi

Expo, React Native, TypeScript, Expo Router, expo-location, expo-sqlite,
AsyncStorage.

## Menjalankan

    npm install
    npx expo start

Pindai QR code dengan Expo Go. Uji fitur SQLite dan mode offline di perangkat
HP, bukan di browser.

## Struktur Singkat

- `src/app/` : halaman dan routing
- `src/services/` : pemanggilan API, repository cache, lokasi
- `src/db/` : pembukaan dan migrasi database SQLite
- `src/types/` : definisi tipe data
- `components/` : komponen UI

## Status Data: Cache Segar, Cache Basi, dan First-Run Offline

(TULIS 3-4 KALIMAT DENGAN KATA-KATAMU SENDIRI DI SINI)

## Sumber Data

Data cuaca disediakan oleh [Open-Meteo.com](https://open-meteo.com/).