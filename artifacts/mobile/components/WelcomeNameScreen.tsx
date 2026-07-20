/**
 * WelcomeNameScreen — shown once after the intro animation.
 * User enters their name, then proceeds to onboarding / main app.
 */
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

export default function WelcomeNameScreen() {
  const { setUserName } = useApp();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");

  // Fade + slide-up on mount
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  function handleContinue() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setUserName(trimmed);
  }

  const canContinue = name.trim().length > 0;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Same dark gradient as the intro */}
      <LinearGradient
        colors={["#07101F", "#0B1A30", "#0D1E38"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient blobs matching GlassBackground */}
      <View style={[styles.blob, { top: -60,  right: -50, width: 280, height: 280, backgroundColor: "rgba(0,157,181,0.15)" }]} />
      <View style={[styles.blob, { top: 260,  left: -80,  width: 220, height: 220, backgroundColor: "rgba(0,198,216,0.10)" }]} />
      <View style={[styles.blob, { bottom: 180, right: -60, width: 260, height: 260, backgroundColor: "rgba(99,102,241,0.08)" }]} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View
          style={[
            styles.inner,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 },
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Icon */}
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.icon}
            resizeMode="contain"
          />

          {/* Titles */}
          <Text style={styles.title}>Welcome to{"\n"}MedPocket</Text>
          <Text style={styles.subtitle}>What should we call you?</Text>

          {/* Name input card */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>YOUR NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Nirranjan"
              placeholderTextColor="rgba(255,255,255,0.30)"
              value={name}
              onChangeText={setName}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              autoCapitalize="words"
              autoCorrect={false}
              selectionColor="#00C6D8"
            />
          </View>

          {/* Privacy note */}
          <Text style={styles.privacy}>🔒  Stored only on your device. Never shared.</Text>

          {/* Continue button */}
          <Pressable
            onPress={handleContinue}
            disabled={!canContinue}
            style={({ pressed }) => [
              styles.btn,
              canContinue
                ? { backgroundColor: "rgba(0,198,216,0.18)", borderColor: "rgba(0,198,216,0.50)" }
                : { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.10)" },
              pressed && canContinue && { opacity: 0.75 },
            ]}
          >
            <Text style={[styles.btnText, !canContinue && { color: "rgba(255,255,255,0.30)" }]}>
              Continue →
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    borderRadius: 9999,
  },
  inner: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 28,
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 22,
    marginBottom: 28,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    marginBottom: 40,
  },
  inputCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.40)",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  input: {
    fontSize: 17,
    color: "#FFFFFF",
    padding: 0,
  },
  privacy: {
    fontSize: 13,
    color: "rgba(255,255,255,0.40)",
    textAlign: "center",
    marginBottom: 32,
  },
  btn: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    alignItems: "center",
  },
  btnText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
