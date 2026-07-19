/**
 * LiquidGlassIntro — MedPocket v1.3.0
 * 5-scene premium intro animation. Shows once on first launch.
 * Skippable via button. Calls onDone() when complete.
 */
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: W, height: H } = Dimensions.get("window");

// ─── Floating particle ────────────────────────────────────────────────────────
function Particle({ x, size, delay }: { x: number; size: number; delay: number }) {
  const anim    = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim, { toValue: 1, duration: 3500, easing: Easing.linear, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.55, duration: 500, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 3000, useNativeDriver: true }),
          ]),
        ]),
        // reset
        Animated.parallel([
          Animated.timing(anim,    { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        bottom: H * 0.08,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "rgba(255,255,255,0.75)",
        opacity,
        transform: [{
          translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -H * 0.75] }),
        }],
      }}
    />
  );
}

// ─── Static particle data ─────────────────────────────────────────────────────
const PARTICLES = [
  { x: W * 0.07,  size: 4,  delay: 0 },
  { x: W * 0.18,  size: 3,  delay: 400 },
  { x: W * 0.29,  size: 6,  delay: 800 },
  { x: W * 0.41,  size: 3,  delay: 200 },
  { x: W * 0.52,  size: 5,  delay: 1200 },
  { x: W * 0.63,  size: 3,  delay: 600 },
  { x: W * 0.74,  size: 4,  delay: 1000 },
  { x: W * 0.85,  size: 6,  delay: 300 },
  { x: W * 0.93,  size: 3,  delay: 700 },
];

// ─── Medical icon cells ───────────────────────────────────────────────────────
const ICONS = [
  { emoji: "🩺", label: "Diagnosis"  },
  { emoji: "💊", label: "Medicine"   },
  { emoji: "🫀", label: "Cardiology" },
  { emoji: "🧬", label: "Genomics"   },
  { emoji: "🩻", label: "Radiology"  },
  { emoji: "🔬", label: "Research"   },
  { emoji: "🧮", label: "Calculators"},
];

// ─── Component ────────────────────────────────────────────────────────────────
interface Props { onDone: () => void; }

export default function LiquidGlassIntro({ onDone }: Props) {
  const doneRef = useRef(false);
  const ease    = Easing.out(Easing.cubic);

  // Screen fade-out
  const screenOpacity = useRef(new Animated.Value(1)).current;

  // Scene opacities
  const s1Op = useRef(new Animated.Value(0)).current;
  const s2Op = useRef(new Animated.Value(0)).current;
  const s3Op = useRef(new Animated.Value(0)).current;
  const s4Op = useRef(new Animated.Value(0)).current;

  // Scene 1 — logo
  const logoScale   = useRef(new Animated.Value(0.45)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Scene 3 — icon stagger
  const iconOpacities  = useRef(ICONS.map(() => new Animated.Value(0))).current;
  const iconTranslates = useRef(ICONS.map(() => new Animated.Value(28))).current;

  // Scene 4 — text lines
  const l1Op = useRef(new Animated.Value(0)).current;
  const l2Op = useRef(new Animated.Value(0)).current;
  const l3Op = useRef(new Animated.Value(0)).current;

  function callDone() {
    if (!doneRef.current) { doneRef.current = true; onDone(); }
  }

  function skip() {
    Animated.timing(screenOpacity, { toValue: 0, duration: 350, useNativeDriver: true }).start(callDone);
  }

  useEffect(() => {
    const seq = Animated.sequence([
      // ── Scene 1: Logo fades + scales in ─────────────────
      Animated.parallel([
        Animated.timing(s1Op, { toValue: 1, duration: 500, easing: ease, useNativeDriver: true }),
        Animated.spring(logoScale,   { toValue: 1, tension: 65, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, easing: ease, useNativeDriver: true }),
      ]),
      Animated.delay(500),

      // ── Scene 2: Tagline cross-fade ──────────────────────
      Animated.parallel([
        Animated.timing(s1Op, { toValue: 0.2, duration: 380, useNativeDriver: true }),
        Animated.timing(s2Op, { toValue: 1,   duration: 500, easing: ease, useNativeDriver: true }),
      ]),
      Animated.delay(800),

      // ── Scene 3: Icon grid ───────────────────────────────
      Animated.parallel([
        Animated.timing(s2Op, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(s3Op, { toValue: 1, duration: 350, useNativeDriver: true }),
        // Stagger icons
        ...ICONS.map((_, i) =>
          Animated.sequence([
            Animated.delay(i * 80),
            Animated.parallel([
              Animated.timing(iconOpacities[i],  { toValue: 1, duration: 350, easing: ease, useNativeDriver: true }),
              Animated.timing(iconTranslates[i], { toValue: 0, duration: 350, easing: ease, useNativeDriver: true }),
            ]),
          ])
        ),
      ]),
      Animated.delay(700),

      // ── Scene 4: Motivational text ───────────────────────
      Animated.parallel([
        Animated.timing(s3Op, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(s4Op, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(l1Op, { toValue: 1, duration: 400, easing: ease, useNativeDriver: true }),
      ]),
      Animated.delay(180),
      Animated.timing(l2Op, { toValue: 1, duration: 400, easing: ease, useNativeDriver: true }),
      Animated.delay(180),
      Animated.timing(l3Op, { toValue: 1, duration: 400, easing: ease, useNativeDriver: true }),
      Animated.delay(900),

      // ── Scene 5: Fade out ────────────────────────────────
      Animated.timing(screenOpacity, { toValue: 0, duration: 500, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]);

    seq.start(callDone);
    return () => seq.stop();
  }, []);

  const isIOS = Platform.OS === "ios";

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { opacity: screenOpacity, zIndex: 9999 }]}
      pointerEvents="box-none"
    >
      {/* Deep blue gradient background */}
      <LinearGradient
        colors={["#060F1E", "#0B2447", "#19376D", "#0B2447"]}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow blobs */}
      <View style={[styles.glow, styles.glow1]} />
      <View style={[styles.glow, styles.glow2]} />
      <View style={[styles.glow, styles.glow3]} />

      {/* Floating particles */}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      {/* Skip button */}
      <Pressable style={styles.skipWrap} onPress={skip} accessibilityLabel="Skip intro">
        {isIOS ? (
          <BlurView intensity={28} tint="dark" style={styles.skipInner}>
            <Text style={styles.skipText}>Skip</Text>
          </BlurView>
        ) : (
          <View style={[styles.skipInner, { backgroundColor: "rgba(0,0,0,0.45)" }]}>
            <Text style={styles.skipText}>Skip</Text>
          </View>
        )}
      </Pressable>

      {/* ── Scene 1: Logo ───────────────────────────────────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, { opacity: s1Op }]}>
        <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity, alignItems: "center" }}>
          {isIOS ? (
            <BlurView intensity={22} tint="dark" style={styles.logoCard}>
              <Image source={require("../assets/images/icon.png")} style={styles.logoImg} resizeMode="contain" />
            </BlurView>
          ) : (
            <View style={[styles.logoCard, { backgroundColor: "rgba(255,255,255,0.08)" }]}>
              <Image source={require("../assets/images/icon.png")} style={styles.logoImg} resizeMode="contain" />
            </View>
          )}
          <Text style={styles.appName}>MedPocket</Text>
          <Text style={styles.byLine}>by Nirranjan</Text>
        </Animated.View>
      </Animated.View>

      {/* ── Scene 2: Tagline ────────────────────────────────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, { opacity: s2Op }]}>
        <Text style={styles.tagSmall}>Your Pocket</Text>
        <Text style={styles.tagLarge}>Medical</Text>
        <Text style={[styles.tagLarge, { color: "#14B8A6" }]}>Companion</Text>
      </Animated.View>

      {/* ── Scene 3: Medical icons ──────────────────────────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, { opacity: s3Op }]}>
        <Text style={styles.iconsTitle}>Your Complete Toolkit</Text>
        <View style={styles.iconsGrid}>
          {ICONS.map((item, i) => (
            <Animated.View
              key={item.emoji}
              style={[
                styles.iconCell,
                { opacity: iconOpacities[i], transform: [{ translateY: iconTranslates[i] }] },
              ]}
            >
              {isIOS ? (
                <BlurView intensity={20} tint="dark" style={styles.iconBlur}>
                  <Text style={styles.iconEmoji}>{item.emoji}</Text>
                  <Text style={styles.iconLabel}>{item.label}</Text>
                </BlurView>
              ) : (
                <View style={[styles.iconBlur, { backgroundColor: "rgba(255,255,255,0.09)" }]}>
                  <Text style={styles.iconEmoji}>{item.emoji}</Text>
                  <Text style={styles.iconLabel}>{item.label}</Text>
                </View>
              )}
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* ── Scene 4: "Study Smarter" ────────────────────────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, { opacity: s4Op }]}>
        <Animated.Text style={[styles.motiveLine, { opacity: l1Op }]}>Study Smarter.</Animated.Text>
        <Animated.Text style={[styles.motiveLine, { opacity: l2Op }]}>Learn Faster.</Animated.Text>
        <Animated.Text style={[styles.motiveLine, styles.motiveAccent, { opacity: l3Op }]}>Anywhere.</Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },

  glow: { position: "absolute", borderRadius: 9999 },
  glow1: { width: W * 1.1, height: W * 1.1, top: -W * 0.25, left: -W * 0.25, backgroundColor: "rgba(37,99,235,0.20)" },
  glow2: { width: W * 0.9, height: W * 0.9, bottom: -W * 0.15, right: -W * 0.2,  backgroundColor: "rgba(20,184,166,0.16)" },
  glow3: { width: W * 0.6, height: W * 0.6, top: H * 0.4, left: W * 0.2, backgroundColor: "rgba(99,102,241,0.12)" },

  skipWrap: { position: "absolute", top: 60, right: 20, zIndex: 100 },
  skipInner: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22,
    overflow: "hidden", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.2)",
  },
  skipText: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: "600" },

  logoCard: {
    width: 148, height: 148, borderRadius: 34, overflow: "hidden",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.14)",
  },
  logoImg: { width: 128, height: 128, borderRadius: 24 },
  appName: { fontSize: 36, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.5, marginTop: 22 },
  byLine:  { fontSize: 14, color: "rgba(255,255,255,0.48)", marginTop: 5 },

  tagSmall: { fontSize: 18, fontWeight: "400", color: "rgba(255,255,255,0.65)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 },
  tagLarge: { fontSize: 54, fontWeight: "800", color: "#FFFFFF", letterSpacing: -1.5, lineHeight: 60 },

  iconsTitle: { fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 22 },
  iconsGrid:  { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, paddingHorizontal: 16, maxWidth: 370 },
  iconCell:   { width: 90, alignItems: "center" },
  iconBlur:   {
    width: 82, height: 82, borderRadius: 22, overflow: "hidden",
    alignItems: "center", justifyContent: "center",
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.14)", gap: 5,
  },
  iconEmoji: { fontSize: 30 },
  iconLabel: { fontSize: 9, color: "rgba(255,255,255,0.6)", textAlign: "center", fontWeight: "600", letterSpacing: 0.3 },

  motiveLine:   { fontSize: 44, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.8, textAlign: "center", lineHeight: 52 },
  motiveAccent: { color: "#14B8A6" },
});
