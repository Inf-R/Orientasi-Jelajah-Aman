// src/utils/konfirmasi.ts
import { Alert, Platform } from "react-native";

// Dialog konfirmasi lintas platform.
// Alert.alert dengan tombol kustom tidak jalan di web, jadi web memakai window.confirm.
export function konfirmasi(judul: string, pesan: string, labelYa: string, onYa: () => void) {
  if (Platform.OS === "web") {
    if (window.confirm(judul + "\n" + pesan)) onYa();
    return;
  }
  Alert.alert(judul, pesan, [
    { text: "Batal", style: "cancel" },
    { text: labelYa, style: "destructive", onPress: onYa },
  ]);
}