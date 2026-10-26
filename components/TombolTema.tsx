// components/TombolTema.tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import { useTema } from "../src/context/TemaContext";

export default function TombolTema() {
  const { skema, toggleTema } = useTema();
  const adalahGelap = skema === "gelap";

  // 0 = terang, 1 = gelap
  const animValue = useRef(new Animated.Value(adalahGelap ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: adalahGelap ? 1 : 0,
      friction: 8,
      tension: 55,
      useNativeDriver: false,
    }).start();
  }, [adalahGelap, animValue]);

  // Posisi thumb horizontal (0 di kiri, 32 di kanan)
  const thumbLeft = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 32],
  });

  // Warna track pill
  const trackBg = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#DDE2EB", "#54637D"],
  });

  const trackBorder = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#CBD1DE", "#414D62"],
  });

  // Opacity icon di dalam thumb
  const opacitySun = animValue.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [1, 0, 0],
  });

  const opacityMoon = animValue.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <TouchableOpacity
      onPress={toggleTema}
      activeOpacity={0.85}
      accessible
      accessibilityRole="switch"
      accessibilityState={{ checked: adalahGelap }}
      accessibilityLabel={
        adalahGelap
          ? "Mode gelap aktif. Ketuk untuk beralih ke mode terang"
          : "Mode terang aktif. Ketuk untuk beralih ke mode gelap"
      }
      style={{
        width: 68,
        height: 36,
        justifyContent: "center",
        marginRight: 16,
      }}
    >
      {/* Track Pill */}
      <Animated.View
        style={{
          width: 64,
          height: 30,
          borderRadius: 15,
          borderWidth: 1,
          borderColor: trackBorder,
          backgroundColor: trackBg,
          alignSelf: "center",
          justifyContent: "center",
        }}
      >
        {/* Ikon matahari redup di kiri (terlihat saat mode gelap) */}
        <View
          style={{
            position: "absolute",
            left: 7,
            top: 5,
            width: 20,
            height: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="sunny-outline" size={17} color="#8392A8" />
        </View>

        {/* Ikon bulan redup di kanan (terlihat saat mode terang) */}
        <View
          style={{
            position: "absolute",
            right: 8,
            top: 5,
            width: 20,
            height: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="moon-outline"
            size={15}
            color="#A4AFBF"
            style={{ transform: [{ rotate: "-15deg" }] }}
          />
          <Ionicons
            name="star"
            size={4.5}
            color="#A4AFBF"
            style={{ position: "absolute", top: 2, right: 1 }}
          />
          <Ionicons
            name="star"
            size={3}
            color="#A4AFBF"
            style={{ position: "absolute", top: 7, right: 3 }}
          />
        </View>
      </Animated.View>

      {/* Thumb Slider */}
      <Animated.View
        style={{
          position: "absolute",
          left: thumbLeft,
          top: 0,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "#FFFFFF",
          justifyContent: "center",
          alignItems: "center",
          ...Platform.select({
            web: {
              boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.22)",
            },
            default: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.22,
              shadowRadius: 4,
              elevation: 4,
            },
          }),
        }}
      >
        {/* Ikon Matahari Aktif (Mode Terang) */}
        <Animated.View
          style={{
            position: "absolute",
            opacity: opacitySun,
            transform: [
              {
                rotate: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "70deg"],
                }),
              },
              {
                scale: animValue.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 0.7, 0.5],
                }),
              },
            ],
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="sunny-outline" size={21} color="#FF8A00" />
        </Animated.View>

        {/* Ikon Bulan Aktif (Mode Gelap) */}
        <Animated.View
          style={{
            position: "absolute",
            opacity: opacityMoon,
            transform: [
              {
                rotate: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["-70deg", "0deg"],
                }),
              },
              {
                scale: animValue.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.5, 0.7, 1],
                }),
              },
            ],
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="moon"
              size={17}
              color="#3B66DE"
              style={{ transform: [{ rotate: "-15deg" }] }}
            />
            <Ionicons
              name="star"
              size={5}
              color="#3B66DE"
              style={{ position: "absolute", top: 1, right: 1 }}
            />
            <Ionicons
              name="star"
              size={3.5}
              color="#3B66DE"
              style={{ position: "absolute", top: 7, right: 3 }}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}
