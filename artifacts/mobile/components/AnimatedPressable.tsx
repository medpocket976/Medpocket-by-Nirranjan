/**
 * AnimatedPressable — spring-physics press feedback for any tappable element.
 * Wraps children in an Animated.View that scales to `scale` on press-in and
 * springs back to 1.0 on press-out. Optional haptic on all platforms.
 */
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";

interface Props extends Omit<PressableProps, "style"> {
  /** Styles applied to the outer Pressable (governs flex/layout in the parent). */
  pressableStyle?: StyleProp<ViewStyle>;
  /** Styles applied to the inner Animated.View (visual: bg, radius, padding…). */
  style?: StyleProp<ViewStyle>;
  /** Target scale on press (default 0.97). */
  scale?: number;
  /** Fire a haptic on press (no-op on web). */
  haptic?: boolean;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
  children: React.ReactNode;
}

export default function AnimatedPressable({
  pressableStyle,
  style,
  scale = 0.97,
  haptic = false,
  hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  children,
  onPress,
  disabled,
  ...rest
}: Props) {
  const anim = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.spring(anim, {
      toValue: scale,
      tension: 160,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }

  function pressOut() {
    Animated.spring(anim, {
      toValue: 1,
      tension: 80,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }

  function handlePress(e: any) {
    if (haptic && Platform.OS !== "web") {
      Haptics.impactAsync(hapticStyle);
    }
    onPress?.(e);
  }

  return (
    <Pressable
      style={pressableStyle}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={handlePress}
      disabled={disabled}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale: anim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
