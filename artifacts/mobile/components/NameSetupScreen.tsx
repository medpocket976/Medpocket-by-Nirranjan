/**
 * NameSetupScreen — MedPocket v1.3.0
 * First-launch glassmorphism name entry screen.
 * App does NOT proceed until a valid name is entered.
 */
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
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

const { width: W } = Dimensions.get("window");

export default function NameSetupScreen() {
  const { setUserName } = useApp();
  const insets = useSafeAreaInsets();

  const [name, setName]       = useState("");
  const [focused, setFocused] = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const ease      = Easing.out(Easing.cubic);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, easing: ease, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: ease, useNativeDriver: true }),
    ]).start();
  }, []);

  const isValid = name.trim().length >= 2;

  function handleContinue() {
    if (!isValid) return;
    setUserName(name.trim());
  }

  const isIOS = Platform.OS === "ios";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={isIOS ? "padding" : undefined}
    >
      {/* Deep blue gradient */}
      <LinearGradient
        colors={["#060F1E", "#0B2447", "#19376D"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Glow blobs */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <Animated.View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 56,
            paddingBottom: insets.bottom + 48,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Welcome to{"\n"}MedPocket</Text>
        <Text style={styles.sub}>What should we call you?</Text>

        {/* Glass input card */}
        {isIOS ? (
          <BlurView
            intensity={24}
            tint="dark"
            style={[styles.card, focused && styles.cardFocused]}
          >
            <NameInputContent
              name={name}
              setName={setName}
              focused={focused}
              setFocused={setFocused}
              onSubmit={handleContinue}
            />
          </BlurView>
        ) : (
          <View
            style={[
              styles.card,
              { backgroundColor: "rgba(255,255,255,0.09)" },
              focused && styles.cardFocused,
            ]}
          >
            <NameInputContent
              name={name}
              setName={setName}
              focused={focused}
              setFocused={setFocused}
              onSubmit={handleContinue}
            />
          </View>
        )}

        <Text style={styles.note}>
          🔒 Stored only on your device. Never shared.
        </Text>

        {/* Continue button */}
        <Pressable
          onPress={handleContinue}
          disabled={!isValid}
          style={({ pressed }) => [{ opacity: pressed && isValid ? 0.85 : 1, width: "100%" }]}
        >
          <LinearGradient
            colors={isValid ? ["#2563EB", "#1D4ED8"] : ["#334155", "#334155"]}
            style={[styles.btn, !isValid && styles.btnDisabled]}
          >
            <Text style={[styles.btnText, !isValid && styles.btnTextDim]}>
              Continue →
            </Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// Extracted so it can be reused inside BlurView or View
function NameInputContent({
  name, setName, focused, setFocused, onSubmit,
}: {
  name: string; setName: (v: string) => void;
  focused: boolean; setFocused: (v: boolean) => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <Text style={styles.label}>YOUR NAME</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Nirranjan"
        placeholderTextColor="rgba(255,255,255,0.32)"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={40}
      />
      {name.length > 0 && name.trim().length < 2 && (
        <Text style={styles.validationHint}>At least 2 characters required</Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  glow1: {
    position: "absolute", borderRadius: 9999,
    width: W * 1.1, height: W * 1.1, top: -W * 0.3, left: -W * 0.3,
    backgroundColor: "rgba(37,99,235,0.22)",
  },
  glow2: {
    position: "absolute", borderRadius: 9999,
    width: W * 0.8, height: W * 0.8, bottom: -W * 0.2, right: -W * 0.2,
    backgroundColor: "rgba(20,184,166,0.18)",
  },

  content: {
    flex: 1, alignItems: "center", paddingHorizontal: 28,
  },

  logoWrap: {
    width: 108, height: 108, borderRadius: 26, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45, shadowRadius: 24, elevation: 16,
    marginBottom: 28,
  },
  logo: { width: 108, height: 108, borderRadius: 26 },

  heading: {
    fontSize: 34, fontWeight: "800", color: "#FFFFFF",
    textAlign: "center", letterSpacing: -0.5, lineHeight: 40, marginBottom: 10,
  },
  sub: {
    fontSize: 16, color: "rgba(255,255,255,0.58)", marginBottom: 36,
  },

  card: {
    width: "100%", borderRadius: 24, overflow: "hidden",
    padding: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 14,
  },
  cardFocused: { borderColor: "rgba(37,99,235,0.65)" },

  label: {
    fontSize: 11, fontWeight: "700", letterSpacing: 1.6,
    color: "rgba(255,255,255,0.48)", marginBottom: 12, textTransform: "uppercase",
  },
  input: {
    fontSize: 22, fontWeight: "600", color: "#FFFFFF",
    paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.18)",
  },
  validationHint: {
    fontSize: 12, color: "#F87171", marginTop: 8, fontWeight: "500",
  },

  note: {
    fontSize: 12, color: "rgba(255,255,255,0.35)",
    textAlign: "center", marginBottom: 32,
  },

  btn: {
    borderRadius: 18, paddingVertical: 19,
    alignItems: "center", justifyContent: "center",
    width: "100%",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.3 },
  btnTextDim: { color: "rgba(255,255,255,0.5)" },
});
