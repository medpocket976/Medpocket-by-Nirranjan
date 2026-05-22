/**
 * SkeletonLoader — pulsing shimmer placeholder for content that is loading.
 * Uses opacity animation only (no external gradient library needed).
 */
import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  width?: number | `${number}%` | "100%";
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export default function SkeletonLoader({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
}: Props) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.75,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}
