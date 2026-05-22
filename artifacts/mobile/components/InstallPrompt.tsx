/**
 * InstallPrompt — shows an "Add to Home Screen" banner on Android Chrome.
 * Uses the deferred beforeinstallprompt event stored by +html.tsx.
 * Renders nothing on iOS / already-installed PWA.
 */
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export default function InstallPrompt() {
  const colors = useColors();
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);
  const translateY = useRef(new Animated.Value(120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== "web") return;

    // Show banner if the deferred install prompt is already available
    if ((window as any)._medpocketInstallPrompt) {
      show();
    }

    const onInstallable = () => show();
    const onInstalled = () => { setInstalled(true); hide(); };

    window.addEventListener("medpocket:installable", onInstallable);
    window.addEventListener("medpocket:installed", onInstalled);
    return () => {
      window.removeEventListener("medpocket:installable", onInstallable);
      window.removeEventListener("medpocket:installed", onInstalled);
    };
  }, []);

  function show() {
    setVisible(true);
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  }

  function hide() {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 120, duration: 240, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  }

  async function handleInstall() {
    const prompt = (window as any)._medpocketInstallPrompt;
    if (!prompt) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      (window as any)._medpocketInstallPrompt = null;
      hide();
    }
  }

  if (!visible || installed || Platform.OS !== "web") return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
        { transform: [{ translateY }], opacity },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: "#009DB5" }]}>
        <Feather name="activity" size={20} color="#fff" />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.foreground }]}>Install Med Pocket</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Add to home screen for offline access
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.installBtn, { backgroundColor: "#009DB5", opacity: pressed ? 0.8 : 1 }]}
        onPress={handleInstall}
      >
        <Text style={styles.installBtnText}>Install</Text>
      </Pressable>
      <Pressable style={styles.close} onPress={hide}>
        <Feather name="x" size={16} color={colors.mutedForeground} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  iconWrap:    { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  text:        { flex: 1, gap: 2 },
  title:       { fontSize: 14, fontWeight: "700" },
  sub:         { fontSize: 11, lineHeight: 15 },
  installBtn:  { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  installBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  close:       { padding: 4 },
});
