/**
 * GlassView — Cross-platform Liquid Glass surface.
 *
 * iOS  : BlurView (expo-blur) with a semi-transparent overlay on top
 * Android/Web : Solid semi-transparent View (blur not supported natively)
 *
 * Usage:
 *   <GlassView style={styles.card} intensity={60}>
 *     {children}
 *   </GlassView>
 */
import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

interface GlassViewProps {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  /** Override the glass background rgba. Defaults to colors.glassBg */
  bgColor?: string;
  /** Override the border color. Defaults to colors.glassBorder */
  borderColor?: string;
  /** Border radius. Defaults to 20 */
  radius?: number;
}

export function GlassView({
  children,
  style,
  intensity = 55,
  bgColor,
  borderColor,
  radius = 20,
}: GlassViewProps) {
  const colors = useColors();
  const bg = bgColor ?? colors.glassBg;
  const bc = borderColor ?? colors.glassBorder;
  const isIOS = Platform.OS === "ios";

  const containerStyle: ViewStyle = {
    borderRadius: radius,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: bc,
  };

  if (isIOS) {
    return (
      <BlurView
        intensity={intensity}
        tint={colors.scheme === "dark" ? "dark" : "light"}
        style={[containerStyle, StyleSheet.flatten(style)]}
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: bg, borderRadius: radius }]} />
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[containerStyle, { backgroundColor: bg }, StyleSheet.flatten(style)]}>
      {children}
    </View>
  );
}
