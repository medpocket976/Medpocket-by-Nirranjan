import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAIChat } from "@/context/AIChatContext";
import { useColors } from "@/hooks/useColors";
import ChatWindow from "./ChatWindow";

export default function FloatingChatBubble() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isOpen, isLoading, messages, openChat, closeChat } = useAIChat();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const hasUnread = messages.length > 0 && !isOpen;

  // Pulse ring animation when idle
  useEffect(() => {
    if (isOpen || isLoading) {
      pulseAnim.setValue(1);
      pulseOpacity.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.55,
            duration: 900,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1800),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isOpen, isLoading]);

  // Loading spinner
  useEffect(() => {
    if (isLoading) {
      const spin = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spin.start();
      return () => spin.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isLoading]);

  function handlePress() {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 180, friction: 8, useNativeDriver: true }),
    ]).start();
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <>
      <ChatWindow />

      {/* Bubble */}
      <View
        style={[
          styles.bubbleContainer,
          { bottom: insets.bottom + 20 },
        ]}
        pointerEvents="box-none"
      >
        {/* Pulse ring */}
        {!isOpen && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                backgroundColor: colors.primary,
                transform: [{ scale: pulseAnim }],
                opacity: pulseOpacity,
              },
            ]}
          />
        )}

        <Pressable onPress={handlePress} style={styles.pressable}>
          <Animated.View
            style={[
              styles.bubble,
              {
                backgroundColor: isOpen ? colors.foreground : colors.primary,
                shadowColor: colors.primary,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {isLoading ? (
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Feather name="loader" size={22} color="#fff" />
              </Animated.View>
            ) : isOpen ? (
              <Feather name="x" size={22} color={colors.primaryForeground} />
            ) : (
              <Feather name="activity" size={22} color="#fff" />
            )}
          </Animated.View>
        </Pressable>

        {/* Unread dot */}
        {hasUnread && !isOpen && (
          <View style={[styles.unreadDot, { backgroundColor: colors.warning }]} />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: {
    position: "absolute",
    right: 20,
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  pressable: {},
  pulseRing: {
    position: "absolute",
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  bubble: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  unreadDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
});
