/**
 * GlassBackground — Gradient background with ambient glow blobs.
 * Wrap each screen with this instead of a plain View.
 */
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  children: React.ReactNode;
  style?: object;
}

export function GlassBackground({ children, style }: Props) {
  const colors = useColors();
  const isDark = colors.scheme === "dark";

  const gradColors: [string, string, string] = isDark
    ? ["#07101F", "#0B1A30", "#0D1E38"]
    : ["#DFF2F8", "#E8F6FA", "#EEF8FC"];

  const blob1 = isDark ? "rgba(0,157,181,0.12)" : "rgba(0,157,181,0.18)";
  const blob2 = isDark ? "rgba(0,198,216,0.08)" : "rgba(0,198,216,0.14)";
  const blob3 = isDark ? "rgba(99,102,241,0.07)" : "rgba(99,102,241,0.10)";

  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={gradColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Ambient blobs */}
      <View style={[styles.blob, { top: -60, right: -50, width: 280, height: 280, backgroundColor: blob1 }]} />
      <View style={[styles.blob, { top: 240, left: -80, width: 220, height: 220, backgroundColor: blob2 }]} />
      <View style={[styles.blob, { bottom: 160, right: -60, width: 260, height: 260, backgroundColor: blob3 }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  blob: {
    position: "absolute",
    borderRadius: 9999,
  },
});
