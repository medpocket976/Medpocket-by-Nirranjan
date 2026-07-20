/**
 * LiquidGlassIntro — MedPocket v1.3.0
 * "Heartbeat Emergence" — cinematic intro with motion graphics.
 * Orbital ring · ECG pulse line · shimmer sweep · staggered features
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

// ── Continuously rotating orbital ring ───────────────────────────────────────
function OrbitalRing({ size, color, speed, reverse = false }: {
  size: number; color: string; speed: number; reverse?: boolean;
}) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1, duration: speed, easing: Easing.linear, useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const rotate = spin.interpolate({
    inputRange:  [0, 1],
    outputRange: reverse ? ["360deg", "0deg"] : ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size, height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: color,
        borderTopColor: "transparent",
        borderRightColor: "transparent",
        transform: [{ rotate }],
      }}
    />
  );
}

// ── Expanding pulse ring ──────────────────────────────────────────────────────
function PulseRing({ delay, color }: { delay: number; color: string }) {
  const scale   = useRef(new Animated.Value(0.55)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 2.5, duration: 2400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,   duration: 2400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 0.55, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.8,  duration: 0, useNativeDriver: true }),
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

// ── Shimmer sweep across logo ─────────────────────────────────────────────────
function ShimmerSweep({ progress }: { progress: Animated.Value }) {
  const translateX = progress.interpolate({
    inputRange:  [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          transform: [{ translateX }, { rotate: "25deg" }],
          overflow: "hidden",
        },
      ]}
    >
      <View
        style={{
          width: 60, height: "140%", marginTop: -20,
          backgroundColor: "rgba(255,255,255,0.18)",
        }}
      />
    </Animated.View>
  );
}

// ── ECG pulse line (reveals left → right) ────────────────────────────────────
function ECGLine({ progress }: { progress: Animated.Value }) {
  const lineW = W * 0.68;

  const translateX = progress.interpolate({
    inputRange:  [0, 1],
    outputRange: [-lineW, 0],
  });

  // Dot racing along the line
  const dotX = progress.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, lineW],
  });

  return (
    <View style={{ width: lineW, height: 28, overflow: "hidden" }}>
      {/* Baseline */}
      <Animated.View
        style={{
          position: "absolute",
          top: 14, left: 0,
          width: lineW, height: 1,
          backgroundColor: "rgba(20,184,166,0.55)",
          transform: [{ translateX }],
        }}
      />
      {/* ECG spike overlay — a simplified waveform built from Views */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0, left: 0,
          flexDirection: "row", alignItems: "center",
          transform: [{ translateX }],
        }}
      >
        {/* flat */}
        <View style={{ width: lineW * 0.28, height: 1, backgroundColor: "rgba(20,184,166,0.55)", marginTop: 14 }} />
        {/* small bump up */}
        <View style={{ width: 6, height: 6, borderTopWidth: 1.5, borderRightWidth: 0, borderColor: "rgba(20,184,166,0.85)", borderTopRightRadius: 2, transform: [{ rotate: "45deg" }], marginBottom: 3 }} />
        {/* spike up */}
        <View style={{ width: 1.5, height: 22, backgroundColor: "rgba(20,184,166,0.9)", marginTop: -8 }} />
        {/* spike down */}
        <View style={{ width: 1.5, height: 14, backgroundColor: "rgba(20,184,166,0.75)", marginTop: 14 }} />
        {/* flat */}
        <View style={{ width: lineW * 0.12, height: 1, backgroundColor: "rgba(20,184,166,0.55)", marginTop: 14 }} />
        {/* bump */}
        <View style={{ width: 10, height: 5, borderRadius: 3, borderWidth: 1, borderColor: "rgba(20,184,166,0.7)", marginTop: 10 }} />
        {/* flat tail */}
        <View style={{ width: lineW * 0.28, height: 1, backgroundColor: "rgba(20,184,166,0.55)", marginTop: 14 }} />
      </Animated.View>

      {/* Racing dot */}
      <Animated.View
        style={{
          position: "absolute",
          top: 10,
          width: 8, height: 8, borderRadius: 4,
          backgroundColor: "#14B8A6",
          shadowColor: "#14B8A6",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 6,
          transform: [{ translateX: dotX }],
        }}
      />
    </View>
  );
}

// ── Floating particle ─────────────────────────────────────────────────────────
function Particle({ x, size, delay }: { x: number; size: number; delay: number }) {
  const anim    = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim,    { toValue: 1, duration: 4500, easing: Easing.linear, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.40, duration: 700,  useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0,    duration: 3800, useNativeDriver: true }),
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
        left: x, bottom: H * 0.04,
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: "rgba(255,255,255,0.75)",
        opacity,
        transform: [{
          translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -H * 0.9] }),
        }],
      }}
    />
  );
}

const PARTICLES = [
  { x: W * 0.05, size: 3, delay: 0    },
  { x: W * 0.16, size: 4, delay: 700  },
  { x: W * 0.27, size: 3, delay: 1500 },
  { x: W * 0.39, size: 5, delay: 350  },
  { x: W * 0.51, size: 3, delay: 1100 },
  { x: W * 0.62, size: 4, delay: 250  },
  { x: W * 0.74, size: 3, delay: 900  },
  { x: W * 0.85, size: 5, delay: 1700 },
  { x: W * 0.93, size: 3, delay: 550  },
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

  // Scene opacities
  const s1Op = useRef(new Animated.Value(0)).current;
  const s2Op = useRef(new Animated.Value(0)).current;
  const s3Op = useRef(new Animated.Value(0)).current;
  const s4Op = useRef(new Animated.Value(0)).current;

  // Scene 1 — logo entrance
  const logoScale     = useRef(new Animated.Value(0.25)).current;
  const logoOpacity   = useRef(new Animated.Value(0)).current;
  const logoY         = useRef(new Animated.Value(40)).current;
  const glowScale     = useRef(new Animated.Value(0.4)).current;
  const glowOpacity   = useRef(new Animated.Value(0)).current;
  const nameY         = useRef(new Animated.Value(24)).current;
  const nameOpacity   = useRef(new Animated.Value(0)).current;
  const bylineOpacity = useRef(new Animated.Value(0)).current;
  // ECG line
  const ecgProgress   = useRef(new Animated.Value(0)).current;
  const ecgOpacity    = useRef(new Animated.Value(0)).current;
  // Shimmer
  const shimmerProg   = useRef(new Animated.Value(0)).current;
  // Orbital rings
  const orbitalOpacity = useRef(new Animated.Value(0)).current;

  // Scene 2 — tagline
  const t1Y  = useRef(new Animated.Value(24)).current;
  const t1Op = useRef(new Animated.Value(0)).current;
  const t2Y  = useRef(new Animated.Value(24)).current;
  const t2Op = useRef(new Animated.Value(0)).current;
  const t3Y  = useRef(new Animated.Value(24)).current;
  const t3Op = useRef(new Animated.Value(0)).current;

  // Scene 3 — features
  const fOp = useRef(FEATURES.map(() => new Animated.Value(0))).current;
  const fY  = useRef(FEATURES.map(() => new Animated.Value(24))).current;

  // Scene 4 — finale
  const m1Op  = useRef(new Animated.Value(0)).current;
  const m1Y   = useRef(new Animated.Value(20)).current;
  const m2Op  = useRef(new Animated.Value(0)).current;
  const m2Y   = useRef(new Animated.Value(20)).current;

  function callDone() {
    if (!doneRef.current) { doneRef.current = true; onDone(); }
  }

  function skip() {
    Animated.timing(screenOpacity, { toValue: 0, duration: 350, useNativeDriver: true }).start(callDone);
  }

  useEffect(() => {
    const seq = Animated.sequence([

      // ── Scene 1a: glow + orbital rings appear ────────────
      Animated.parallel([
        Animated.timing(s1Op,         { toValue: 1,    duration: 400, easing: easeOut, useNativeDriver: true }),
        Animated.timing(glowOpacity,  { toValue: 1,    duration: 700, easing: easeOut, useNativeDriver: true }),
        Animated.spring(glowScale,    { toValue: 1,    tension: 36, friction: 9,       useNativeDriver: true }),
        Animated.timing(orbitalOpacity, { toValue: 1,  duration: 600, easing: easeOut, useNativeDriver: true }),
      ]),
      Animated.delay(100),

      // ── Scene 1b: logo springs in ─────────────────────────
      Animated.parallel([
        Animated.spring(logoScale,    { toValue: 1,    tension: 52, friction: 6,       useNativeDriver: true }),
        Animated.timing(logoOpacity,  { toValue: 1,    duration: 400, easing: easeOut, useNativeDriver: true }),
        Animated.spring(logoY,        { toValue: 0,    tension: 52, friction: 7,       useNativeDriver: true }),
      ]),
      Animated.delay(80),

      // ── Scene 1c: shimmer sweep ───────────────────────────
      Animated.timing(shimmerProg, { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.delay(80),

      // ── Scene 1d: name slides up ──────────────────────────
      Animated.parallel([
        Animated.spring(nameY,       { toValue: 0, tension: 75, friction: 8,        useNativeDriver: true }),
        Animated.timing(nameOpacity, { toValue: 1, duration: 380, easing: easeOut,  useNativeDriver: true }),
      ]),
      Animated.delay(100),
      Animated.timing(bylineOpacity, { toValue: 1, duration: 320, easing: easeOut, useNativeDriver: true }),
      Animated.delay(120),

      // ── Scene 1e: ECG line draws in ───────────────────────
      Animated.parallel([
        Animated.timing(ecgOpacity,  { toValue: 1,    duration: 200, easing: easeOut, useNativeDriver: true }),
        Animated.timing(ecgProgress, { toValue: 1,    duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.delay(500),

      // ── Scene 2: tagline staggered ────────────────────────
      Animated.parallel([
        Animated.timing(s1Op, { toValue: 0, duration: 340, easing: easeIn,  useNativeDriver: true }),
        Animated.timing(s2Op, { toValue: 1, duration: 400, easing: easeOut, useNativeDriver: true }),
        Animated.spring(t1Y,  { toValue: 0, tension: 72, friction: 9,       useNativeDriver: true }),
        Animated.timing(t1Op, { toValue: 1, duration: 360, easing: easeOut, useNativeDriver: true }),
      ]),
      Animated.delay(130),
      Animated.parallel([
        Animated.spring(t2Y,  { toValue: 0, tension: 72, friction: 9,       useNativeDriver: true }),
        Animated.timing(t2Op, { toValue: 1, duration: 360, easing: easeOut, useNativeDriver: true }),
      ]),
      Animated.delay(130),
      Animated.parallel([
        Animated.spring(t3Y,  { toValue: 0, tension: 72, friction: 9,       useNativeDriver: true }),
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
              Animated.spring(fY[i],  { toValue: 0, tension: 78, friction: 8,       useNativeDriver: true }),
            ]),
          ])
        ),
      ]),
      Animated.delay(750),

      // ── Scene 4: finale ───────────────────────────────────
      Animated.parallel([
        Animated.timing(s3Op, { toValue: 0, duration: 300, easing: easeIn,  useNativeDriver: true }),
        Animated.timing(s4Op, { toValue: 1, duration: 360, easing: easeOut, useNativeDriver: true }),
        Animated.parallel([
          Animated.spring(m1Y,  { toValue: 0, tension: 68, friction: 8, useNativeDriver: true }),
          Animated.timing(m1Op, { toValue: 1, duration: 420, easing: easeOut, useNativeDriver: true }),
        ]),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(m2Y,  { toValue: 0, tension: 68, friction: 8, useNativeDriver: true }),
        Animated.timing(m2Op, { toValue: 1, duration: 420, easing: easeOut, useNativeDriver: true }),
      ]),
      Animated.delay(1000),

      // ── Fade out ──────────────────────────────────────────
      Animated.timing(screenOpacity, {
        toValue: 0, duration: 550, easing: Easing.in(Easing.quad), useNativeDriver: true,
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

        {/* Soft glow halo */}
        <Animated.View style={[styles.logoGlow, {
          opacity: glowOpacity,
          transform: [{ scale: glowScale }],
        }]} />

        {/* Pulse rings */}
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
          <View style={styles.ringWrap}>
            <PulseRing delay={0}    color="rgba(20,184,166,0.32)" />
            <PulseRing delay={800}  color="rgba(37,99,235,0.26)"  />
            <PulseRing delay={1600} color="rgba(20,184,166,0.18)" />
          </View>
        </View>

        {/* Orbital rings */}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center, { opacity: orbitalOpacity }]}>
          <OrbitalRing size={220} color="rgba(20,184,166,0.45)" speed={6000} />
          <OrbitalRing size={260} color="rgba(37,99,235,0.30)"  speed={9000} reverse />
          <OrbitalRing size={300} color="rgba(20,184,166,0.18)" speed={13000} />
        </Animated.View>

        {/* Logo + text column */}
        <Animated.View style={[styles.center, {
          transform: [{ scale: logoScale }, { translateY: logoY }],
          opacity: logoOpacity,
        }]}>
          {/* Logo card with shimmer */}
          <View style={styles.logoCardWrap}>
            {isIOS ? (
              <BlurView intensity={18} tint="dark" style={styles.logoCard}>
                <Image
                  source={require("../assets/images/icon.png")}
                  style={styles.logoImg}
                  resizeMode="contain"
                />
                <ShimmerSweep progress={shimmerProg} />
              </BlurView>
            ) : (
              <View style={[styles.logoCard, { backgroundColor: "rgba(255,255,255,0.06)" }]}>
                <Image
                  source={require("../assets/images/icon.png")}
                  style={styles.logoImg}
                  resizeMode="contain"
                />
                <ShimmerSweep progress={shimmerProg} />
              </View>
            )}
          </View>

          {/* App name */}
          <Animated.Text style={[styles.appName, {
            opacity: nameOpacity,
            transform: [{ translateY: nameY }],
          }]}>
            MedPocket
          </Animated.Text>

          {/* Byline */}
          <Animated.Text style={[styles.byLine, { opacity: bylineOpacity }]}>
            by Nirranjan
          </Animated.Text>

          {/* ECG line */}
          <Animated.View style={{ opacity: ecgOpacity, marginTop: 16 }}>
            <ECGLine progress={ecgProgress} />
          </Animated.View>
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
        <Animated.Text style={[styles.motiveLine, {
          opacity: m1Op,
          transform: [{ translateY: m1Y }],
        }]}>
          Study Smarter.{"\n"}Ace Exams.
        </Animated.Text>
        <Animated.Text style={[styles.motiveAccent, {
          opacity: m2Op,
          transform: [{ translateY: m2Y }],
        }]}>
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
  blob1: { width: W * 1.3, height: W * 1.3, top: -W * 0.32, left: -W * 0.26, backgroundColor: "rgba(37,99,235,0.16)"  },
  blob2: { width: W * 1.1, height: W * 1.1, bottom: -W * 0.22, right: -W * 0.24, backgroundColor: "rgba(20,184,166,0.13)" },
  blob3: { width: W * 0.75, height: W * 0.75, top: H * 0.38, left: W * 0.1, backgroundColor: "rgba(99,102,241,0.09)"  },

  // Skip
  skipWrap:  { position: "absolute", top: 60, right: 20, zIndex: 100 },
  skipInner: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22,
    overflow: "hidden", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.22)",
  },
  skipText: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: "600" },

  // Scene 1 — logo
  logoGlow: {
    position: "absolute",
    width: 270, height: 270, borderRadius: 135,
    backgroundColor: "rgba(20,184,166,0.22)",
  },
  ringWrap: {
    width: 220, height: 220, borderRadius: 110,
  },
  logoCardWrap: { overflow: "hidden" },
  logoCard: {
    width: 162, height: 162, borderRadius: 38, overflow: "hidden",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
  },
  logoImg:  { width: 148, height: 148 },
  appName:  { fontSize: 40, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.7, marginTop: 26 },
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
