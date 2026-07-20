/**
 * LiquidGlassIntro — MedPocket v1.3.0
 * "Heartbeat Emergence" — cinematic 4-scene intro.
 * Shows once on first launch. Skippable. Calls onDone() when complete.
 */
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
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
const isIOS = Platform.OS === "ios";

// ── Expanding pulse ring ──────────────────────────────────────────────────────
function PulseRing({ delay, color }: { delay: number; color: string }) {
  const scale   = useRef(new Animated.Value(0.55)).current;
  const opacity = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 2.4, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,   duration: 2200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 0.55, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.85, duration: 0, useNativeDriver: true }),
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
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: 200,
        borderWidth: 1.5,
        borderColor: color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

// ── Floating dust particle ────────────────────────────────────────────────────
function Particle({ x, size, delay }: { x: number; size: number; delay: number }) {
  const anim    = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim,    { toValue: 1, duration: 4200, easing: Easing.linear, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.45, duration: 700,  useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0,    duration: 3500, useNativeDriver: true }),
          ]),
        ]),
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
        bottom: H * 0.05,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "rgba(255,255,255,0.75)",
        opacity,
        transform: [{
          translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -H * 0.88] }),
        }],
      }}
    />
  );
}

const PARTICLES = [
  { x: W * 0.06, size: 3, delay: 0    },
  { x: W * 0.17, size: 4, delay: 600  },
  { x: W * 0.29, size: 3, delay: 1400 },
  { x: W * 0.41, size: 5, delay: 300  },
  { x: W * 0.53, size: 3, delay: 1000 },
  { x: W * 0.64, size: 4, delay: 200  },
  { x: W * 0.76, size: 3, delay: 800  },
  { x: W * 0.87, size: 5, delay: 1600 },
  { x: W * 0.95, size: 3, delay: 500  },
];

const FEATURES = [
  { icon: "book-open"      as const, label: "Drug Guide"    },
  { icon: "activity"       as const, label: "Calculators"   },
  { icon: "help-circle"    as const, label: "Quiz Mode"     },
  { icon: "clipboard"      as const, label: "Clinical Exam" },
  { icon: "alert-triangle" as const, label: "Emergency"     },
];

// ── Main component ────────────────────────────────────────────────────────────
interface Props { onDone: () => void; }

export default function LiquidGlassIntro({ onDone }: Props) {
  const doneRef = useRef(false);
  const easeOut = Easing.out(Easing.cubic);
  const easeIn  = Easing.in(Easing.quad);

  // Master fade-out
  const screenOpacity = useRef(new Animated.Value(1)).current;

  // Scene presence
  const s1Op = useRef(new Animated.Value(0)).current;
  const s2Op = useRef(new Animated.Value(0)).current;
  const s3Op = useRef(new Animated.Value(0)).current;
  const s4Op = useRef(new Animated.Value(0)).current;

  // Scene 1 — logo entrance
  const logoScale     = useRef(new Animated.Value(0.28)).current;
  const logoOpacity   = useRef(new Animated.Value(0)).current;
  const logoY         = useRef(new Animated.Value(36)).current;
  const glowScale     = useRef(new Animated.Value(0.4)).current;
  const glowOpacity   = useRef(new Animated.Value(0)).current;
  const nameY         = useRef(new Animated.Value(22)).current;
  const nameOpacity   = useRef(new Animated.Value(0)).current;
  const bylineOpacity = useRef(new Animated.Value(0)).current;

  // Scene 2 — tagline
  const t1Y  = useRef(new Animated.Value(24)).current;
  const t1Op = useRef(new Animated.Value(0)).current;
  const t2Y  = useRef(new Animated.Value(24)).current;
  const t2Op = useRef(new Animated.Value(0)).current;
  const t3Y  = useRef(new Animated.Value(24)).current;
  const t3Op = useRef(new Animated.Value(0)).current;

  // Scene 3 — features
  const fOp = useRef(FEATURES.map(() => new Animated.Value(0))).current;
  const fY  = useRef(FEATURES.map(() => new Animated.Value(22))).current;

  // Scene 4 — finale
  const m1Op = useRef(new Animated.Value(0)).current;
  const m2Op = useRef(new Animated.Value(0)).current;

  function callDone() {
    if (!doneRef.current) { doneRef.current = true; onDone(); }
  }

  function skip() {
    Animated.timing(screenOpacity, { toValue: 0, duration: 350, useNativeDriver: true }).start(callDone);
  }

  useEffect(() => {
    const seq = Animated.sequence([

      // ── Scene 1a: glow + logo spring in ─────────────────
      Animated.parallel([
        Animated.timing(s1Op,       { toValue: 1, duration: 420, easing: easeOut, useNativeDriver: true }),
        Animated.timing(glowOpacity,{ toValue: 1, duration: 650, easing: easeOut, useNativeDriver: true }),
        Animated.spring(glowScale,  { toValue: 1, tension: 38, friction: 9, useNativeDriver: true }),
        Animated.spring(logoScale,  { toValue: 1, tension: 55, friction: 6, useNativeDriver: true }),
        Animated.timing(logoOpacity,{ toValue: 1, duration: 420, easing: easeOut, useNativeDriver: true }),
        Animated.spring(logoY,      { toValue: 0, tension: 55, friction: 7, useNativeDriver: true }),
      ]),
      Animated.delay(220),

      // ── Scene 1b: name slides up, byline fades ───────────
      Animated.parallel([
        Animated.spring(nameY,    { toValue: 0, tension: 75, friction: 8, useNativeDriver: true }),
        Animated.timing(nameOpacity, { toValue: 1, duration: 380, easing: easeOut, useNativeDriver: true }),
      ]),
      Animated.delay(140),
      Animated.timing(bylineOpacity, { toValue: 1, duration: 340, easing: easeOut, useNativeDriver: true }),
      Animated.delay(700),

      // ── Scene 2: tagline — staggered word-by-word ────────
      Animated.parallel([
        Animated.timing(s1Op, { toValue: 0, duration: 340, easing: easeIn, useNativeDriver: true }),
        Animated.timing(s2Op, { toValue: 1, duration: 400, easing: easeOut, useNativeDriver: true }),
        Animated.spring(t1Y,  { toValue: 0, tension: 72, friction: 9, useNativeDriver: true }),
        Animated.timing(t1Op, { toValue: 1, duration: 360, easing: easeOut, useNativeDriver: true }),
      ]),
      Animated.delay(130),
      Animated.parallel([
        Animated.spring(t2Y,  { toValue: 0, tension: 72, friction: 9, useNativeDriver: true }),
        Animated.timing(t2Op, { toValue: 1, duration: 360, easing: easeOut, useNativeDriver: true }),
      ]),
      Animated.delay(130),
      Animated.parallel([
        Animated.spring(t3Y,  { toValue: 0, tension: 72, friction: 9, useNativeDriver: true }),
        Animated.timing(t3Op, { toValue: 1, duration: 360, easing: easeOut, useNativeDriver: true }),
      ]),
      Animated.delay(850),

      // ── Scene 3: features staggered ──────────────────────
      Animated.parallel([
        Animated.timing(s2Op, { toValue: 0, duration: 300, easing: easeIn,  useNativeDriver: true }),
        Animated.timing(s3Op, { toValue: 1, duration: 360, easing: easeOut, useNativeDriver: true }),
        ...FEATURES.map((_, i) =>
          Animated.sequence([
            Animated.delay(i * 95),
            Animated.parallel([
              Animated.timing(fOp[i], { toValue: 1, duration: 320, easing: easeOut, useNativeDriver: true }),
              Animated.spring(fY[i],  { toValue: 0, tension: 78, friction: 8, useNativeDriver: true }),
            ]),
          ])
        ),
      ]),
      Animated.delay(750),

      // ── Scene 4: finale ───────────────────────────────────
      Animated.parallel([
        Animated.timing(s3Op, { toValue: 0, duration: 300, easing: easeIn,  useNativeDriver: true }),
        Animated.timing(s4Op, { toValue: 1, duration: 360, easing: easeOut, useNativeDriver: true }),
        Animated.timing(m1Op, { toValue: 1, duration: 420, easing: easeOut, useNativeDriver: true }),
      ]),
      Animated.delay(220),
      Animated.timing(m2Op, { toValue: 1, duration: 420, easing: easeOut, useNativeDriver: true }),
      Animated.delay(950),

      // ── Fade out ──────────────────────────────────────────
      Animated.timing(screenOpacity, {
        toValue: 0, duration: 520, easing: Easing.in(Easing.quad), useNativeDriver: true,
      }),
    ]);

    seq.start(callDone);
    return () => seq.stop();
  }, []);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { opacity: screenOpacity, zIndex: 9999 }]}
      pointerEvents="box-none"
    >
      {/* ── Background ────────────────────────────────────────────────── */}
      <LinearGradient
        colors={["#010D1C", "#051428", "#0A2040", "#0F2D58", "#051428"]}
        locations={[0, 0.2, 0.5, 0.72, 1]}
        start={{ x: 0.25, y: 0 }}
        end={{ x: 0.75, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient blobs */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />
      <View style={[styles.blob, styles.blob3]} />

      {/* Particles */}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      {/* ── Skip ──────────────────────────────────────────────────────── */}
      <Pressable style={styles.skipWrap} onPress={skip} accessibilityLabel="Skip intro">
        {isIOS ? (
          <BlurView intensity={32} tint="dark" style={styles.skipInner}>
            <Text style={styles.skipText}>Skip</Text>
          </BlurView>
        ) : (
          <View style={[styles.skipInner, { backgroundColor: "rgba(0,0,0,0.52)" }]}>
            <Text style={styles.skipText}>Skip</Text>
          </View>
        )}
      </Pressable>

      {/* ── Scene 1: Logo ─────────────────────────────────────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, { opacity: s1Op }]}>

        {/* Glow halo */}
        <Animated.View style={[styles.logoGlow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />

        {/* Pulse rings — centered via absoluteFill container */}
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
          <View style={styles.ringContainer}>
            <PulseRing delay={0}    color="rgba(20,184,166,0.32)" />
            <PulseRing delay={730}  color="rgba(37,99,235,0.26)"  />
            <PulseRing delay={1460} color="rgba(20,184,166,0.18)" />
          </View>
        </View>

        {/* Logo card + text */}
        <Animated.View style={[styles.center, {
          transform: [{ scale: logoScale }, { translateY: logoY }],
          opacity: logoOpacity,
        }]}>
          {isIOS ? (
            <BlurView intensity={18} tint="dark" style={styles.logoCard}>
              <Image
                source={require("../assets/images/icon.png")}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </BlurView>
          ) : (
            <View style={[styles.logoCard, { backgroundColor: "rgba(255,255,255,0.06)" }]}>
              <Image
                source={require("../assets/images/icon.png")}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>
          )}

          <Animated.Text style={[styles.appName, {
            opacity: nameOpacity,
            transform: [{ translateY: nameY }],
          }]}>
            MedPocket
          </Animated.Text>
          <Animated.Text style={[styles.byLine, { opacity: bylineOpacity }]}>
            by Nirranjan
          </Animated.Text>
        </Animated.View>
      </Animated.View>

      {/* ── Scene 2: Tagline ──────────────────────────────────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, { opacity: s2Op }]}>
        <Animated.Text style={[styles.tagSmall, { opacity: t1Op, transform: [{ translateY: t1Y }] }]}>
          Your Pocket
        </Animated.Text>
        <Animated.Text style={[styles.tagLarge, { opacity: t2Op, transform: [{ translateY: t2Y }] }]}>
          Medical
        </Animated.Text>
        <Animated.Text style={[styles.tagLarge, styles.tagAccent, { opacity: t3Op, transform: [{ translateY: t3Y }] }]}>
          Companion
        </Animated.Text>
      </Animated.View>

      {/* ── Scene 3: Features ─────────────────────────────────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, { opacity: s3Op }]}>
        <Text style={styles.featTitle}>EVERYTHING YOU NEED</Text>
        <View style={styles.featGrid}>
          {FEATURES.map((f, i) => (
            <Animated.View
              key={f.label}
              style={{ opacity: fOp[i], transform: [{ translateY: fY[i] }] }}
            >
              {isIOS ? (
                <BlurView intensity={24} tint="dark" style={styles.featPill}>
                  <Feather name={f.icon} size={15} color="#14B8A6" />
                  <Text style={styles.featLabel}>{f.label}</Text>
                </BlurView>
              ) : (
                <View style={[styles.featPill, { backgroundColor: "rgba(255,255,255,0.09)" }]}>
                  <Feather name={f.icon} size={15} color="#14B8A6" />
                  <Text style={styles.featLabel}>{f.label}</Text>
                </View>
              )}
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* ── Scene 4: Finale ───────────────────────────────────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, { opacity: s4Op }]}>
        <Animated.Text style={[styles.motiveLine, { opacity: m1Op }]}>
          Study Smarter.{"\n"}Ace Exams.
        </Animated.Text>
        <Animated.Text style={[styles.motiveAccent, { opacity: m2Op }]}>
          Anywhere.
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },

  // Background blobs
  blob: { position: "absolute", borderRadius: 9999 },
  blob1: { width: W * 1.3, height: W * 1.3, top: -W * 0.32, left: -W * 0.25, backgroundColor: "rgba(37,99,235,0.16)"  },
  blob2: { width: W * 1.0, height: W * 1.0, bottom: -W * 0.2, right: -W * 0.22, backgroundColor: "rgba(20,184,166,0.13)" },
  blob3: { width: W * 0.7, height: W * 0.7, top: H * 0.40, left: W * 0.12, backgroundColor: "rgba(99,102,241,0.09)"  },

  // Skip button
  skipWrap:  { position: "absolute", top: 60, right: 20, zIndex: 100 },
  skipInner: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22,
    overflow: "hidden", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.22)",
  },
  skipText: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: "600" },

  // Scene 1
  logoGlow: {
    position: "absolute",
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: "rgba(20,184,166,0.20)",
  },
  ringContainer: {
    width: 220, height: 220, borderRadius: 110,
  },
  logoCard: {
    width: 160, height: 160, borderRadius: 38, overflow: "hidden",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
  },
  logoImg:  { width: 146, height: 146 },
  appName:  {
    fontSize: 40, fontWeight: "800", color: "#FFFFFF",
    letterSpacing: -0.7, marginTop: 26,
  },
  byLine:   { fontSize: 14, color: "rgba(255,255,255,0.44)", marginTop: 7, letterSpacing: 0.4 },

  // Scene 2 — tagline
  tagSmall:  {
    fontSize: 17, fontWeight: "500", color: "rgba(255,255,255,0.62)",
    letterSpacing: 3.8, textTransform: "uppercase", marginBottom: 8,
  },
  tagLarge:  { fontSize: 58, fontWeight: "800", color: "#FFFFFF", letterSpacing: -1.5, lineHeight: 64 },
  tagAccent: { color: "#14B8A6" },

  // Scene 3 — features
  featTitle: {
    fontSize: 10.5, color: "rgba(255,255,255,0.36)",
    letterSpacing: 2.2, textTransform: "uppercase", marginBottom: 28,
  },
  featGrid: {
    flexDirection: "row", flexWrap: "wrap",
    justifyContent: "center", gap: 10,
    paddingHorizontal: 24, maxWidth: 390,
  },
  featPill: {
    flexDirection: "row", alignItems: "center", gap: 9,
    paddingHorizontal: 18, paddingVertical: 13, borderRadius: 28,
    overflow: "hidden", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.15)",
  },
  featLabel: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.88)", letterSpacing: 0.2 },

  // Scene 4 — finale
  motiveLine:   {
    fontSize: 48, fontWeight: "800", color: "#FFFFFF",
    letterSpacing: -1.1, textAlign: "center", lineHeight: 56,
  },
  motiveAccent: {
    fontSize: 48, fontWeight: "800", color: "#14B8A6",
    letterSpacing: -1.1, textAlign: "center", lineHeight: 56, marginTop: 6,
  },
});
