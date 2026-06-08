import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

const { width: W, height: H } = Dimensions.get("window");
const LOGO = 148;

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  onDone: () => void;
}

export default function AnimatedSplash({ onDone }: Props) {
  // ── Logo entrance ──────────────────────────────────────────────────────
  const logoScale   = useRef(new Animated.Value(0.18)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // ── ECG line draw ──────────────────────────────────────────────────────
  // Total path length ≈ 310 — starts fully hidden, animates to 0
  const ecgOffset = useRef(new Animated.Value(310)).current;

  // ── Pulse rings (2 rings staggered) ────────────────────────────────────
  const ring1Scale   = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale   = useRef(new Animated.Value(1)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;

  // ── Text ───────────────────────────────────────────────────────────────
  const titleOpacity   = useRef(new Animated.Value(0)).current;
  const titleY         = useRef(new Animated.Value(22)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity  = useRef(new Animated.Value(0)).current;

  // ── Screen fade-out ────────────────────────────────────────────────────
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    Animated.sequence([
      // 1 — logo bounces in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 70,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 380,
          easing: ease,
          useNativeDriver: true,
        }),
      ]),

      // 2 — ECG draws across
      Animated.timing(ecgOffset, {
        toValue: 0,
        duration: 900,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false, // strokeDashoffset cannot use native driver
      }),

      // 3 — Pulse rings radiate (staggered)
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ring1Opacity, { toValue: 0.7, duration: 50, useNativeDriver: true }),
          Animated.parallel([
            Animated.timing(ring1Scale,   { toValue: 2.8, duration: 700, easing: ease, useNativeDriver: true }),
            Animated.timing(ring1Opacity, { toValue: 0,   duration: 700, easing: ease, useNativeDriver: true }),
          ]),
        ]),
        Animated.sequence([
          Animated.delay(180),
          Animated.timing(ring2Opacity, { toValue: 0.45, duration: 50, useNativeDriver: true }),
          Animated.parallel([
            Animated.timing(ring2Scale,   { toValue: 3.6, duration: 800, easing: ease, useNativeDriver: true }),
            Animated.timing(ring2Opacity, { toValue: 0,   duration: 800, easing: ease, useNativeDriver: true }),
          ]),
        ]),
      ]),

      // 4 — Title slides up
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 420,
          easing: ease,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 420,
          easing: ease,
          useNativeDriver: true,
        }),
      ]),

      // 5 — Subtitle fades in
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 320,
        easing: ease,
        useNativeDriver: true,
      }),

      // 6 — Tagline fades in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 320,
        easing: ease,
        useNativeDriver: true,
      }),

      // 7 — Hold
      Animated.delay(620),

      // 8 — Fade out entire screen
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 480,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => onDone());
  }, []);

  // ECG path inside the 160×160 viewBox — a realistic P-QRS-T waveform
  // that traverses the width of the logo
  const ECG_PATH = [
    "M 8 80",
    "L 28 80",
    "Q 33 80 35 74",   // P wave start
    "Q 38 68 40 74",   // P wave
    "Q 42 80 46 80",   // back to baseline
    "L 55 80",          // PR segment
    "L 60 86",          // Q dip
    "L 68 18",          // R spike
    "L 74 106",         // S dip
    "L 80 80",          // back up
    "Q 88 74 92 68",   // T wave start
    "Q 96 62 100 68",  // T wave peak
    "Q 104 74 108 80", // T wave end
    "L 152 80",         // flat tail
  ].join(" ");

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, { opacity: screenOpacity }]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={["#007A8F", "#009DB5", "#00C4B0", "#009DB5"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative background circles */}
      <View style={[styles.bgCircle, styles.bgCircle1]} />
      <View style={[styles.bgCircle, styles.bgCircle2]} />

      <View style={styles.content}>
        {/* ── Pulse rings ──────────────────────────────────────────── */}
        <View style={styles.ringWrap}>
          <Animated.View
            style={[
              styles.ring,
              { opacity: ring1Opacity, transform: [{ scale: ring1Scale }] },
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              { opacity: ring2Opacity, transform: [{ scale: ring2Scale }] },
            ]}
          />

          {/* ── Logo ────────────────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.logoWrap,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Svg width={LOGO} height={LOGO} viewBox="0 0 160 160">
              {/* White medical cross — vertical bar */}
              <Rect
                x="53" y="18" width="54" height="124"
                rx="14" ry="14"
                fill="white"
                opacity={0.97}
              />
              {/* White medical cross — horizontal bar */}
              <Rect
                x="18" y="53" width="124" height="54"
                rx="14" ry="14"
                fill="white"
                opacity={0.97}
              />
              {/* ECG waveform drawn in teal across the cross */}
              <AnimatedPath
                d={ECG_PATH}
                stroke="#009DB5"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray="310"
                strokeDashoffset={ecgOffset as unknown as number}
              />
            </Svg>
          </Animated.View>
        </View>

        {/* ── Title ─────────────────────────────────────────────────── */}
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleY }],
            alignItems: "center",
          }}
        >
          <Text style={styles.title}>MedPocket</Text>
        </Animated.View>

        {/* ── Subtitle ─────────────────────────────────────────────── */}
        <Animated.View style={{ opacity: subtitleOpacity, alignItems: "center" }}>
          <Text style={styles.subtitle}>by Nirranjan</Text>
        </Animated.View>

        {/* ── Tagline ──────────────────────────────────────────────── */}
        <Animated.View style={{ opacity: taglineOpacity, alignItems: "center", marginTop: 6 }}>
          <Text style={styles.tagline}>Your Complete Medical Reference</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 9999,
    elevation: 9999,
  },
  bgCircle: {
    position: "absolute",
    borderRadius: 9999,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  bgCircle1: {
    width: W * 1.6,
    height: W * 1.6,
    top: -W * 0.8,
    left: -W * 0.3,
  },
  bgCircle2: {
    width: W * 1.2,
    height: W * 1.2,
    bottom: -W * 0.5,
    right: -W * 0.4,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  ringWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: LOGO,
    height: LOGO,
  },
  ring: {
    position: "absolute",
    width: LOGO,
    height: LOGO,
    borderRadius: LOGO / 2,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
  },
  logoWrap: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.3,
    marginTop: -8,
  },
  tagline: {
    fontSize: 12,
    fontWeight: "400",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
