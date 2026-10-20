// src/constants/warna.ts
import { TingkatAQI } from "../../types/cuaca";

export interface PaletWarna {
  latar: string;
  kartu: string;
  teks: string;
  teksPelan: string;
  garis: string;
  aksen: string;
  bahaya: string;
  infoBaikLatar: string;
  infoBaikTeks: string;
  infoBasiLatar: string;
  infoBasiTeks: string;
  aqi: Record<TingkatAQI, string>;
}

export const paletTerang: PaletWarna = {
  latar: "#F2F4F7",
  kartu: "#FFFFFF",
  teks: "#11181C",
  teksPelan: "#5F6B76",
  garis: "#C9D1D9",
  aksen: "#0A7EA4",
  bahaya: "#C62828",
  infoBaikLatar: "#EAFBF6",
  infoBaikTeks: "#0F6B52",
  infoBasiLatar: "#FEF3E2",
  infoBasiTeks: "#9A4A07",
  aqi: {
    BAIK: "#15803D",
    SEDANG: "#A16207",
    TIDAK_SEHAT: "#C2410C",
    BERBAHAYA: "#B91C1C",
  },
};

export const paletGelap: PaletWarna = {
  latar: "#0F1419",
  kartu: "#1B232C",
  teks: "#ECEDEE",
  teksPelan: "#9BA7B4",
  garis: "#2C3946",
  aksen: "#4DB6E8",
  bahaya: "#FF8A80",
  infoBaikLatar: "#10302A",
  infoBaikTeks: "#5EE0B8",
  infoBasiLatar: "#3A2A12",
  infoBasiTeks: "#F5B461",
  aqi: {
    BAIK: "#4ADE80",
    SEDANG: "#FACC15",
    TIDAK_SEHAT: "#FB923C",
    BERBAHAYA: "#F87171",
  },
};