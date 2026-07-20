import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const DISCIPLINE_CATEGORIES = [
  {
    key: "medical",
    label: "Medical",
    icon: "activity" as const,
    color: "#009DB5",
    years: [
      "MBBS 1st Year", "MBBS 2nd Year", "MBBS 3rd Year",
      "MBBS 4th Year", "MBBS Final Year", "MBBS Intern",
    ],
  },
  {
    key: "nursing",
    label: "Nursing",
    icon: "heart" as const,
    color: "#EC4899",
    years: [
      "GNM 1st Year", "GNM 2nd Year", "GNM 3rd Year",
      "BSc Nursing 1st Year", "BSc Nursing 2nd Year",
      "BSc Nursing 3rd Year", "BSc Nursing 4th Year",
      "Post Basic BSc Nursing", "MSc Nursing",
    ],
  },
  {
    key: "pharmacy",
    label: "Pharmacy",
    icon: "tablet" as const,
    color: "#8B5CF6",
    years: [
      "D.Pharm 1st Year", "D.Pharm 2nd Year",
      "B.Pharm 1st Year", "B.Pharm 2nd Year",
      "B.Pharm 3rd Year", "B.Pharm 4th Year",
      "M.Pharm", "Pharm.D",
    ],
  },
  {
    key: "physio",
    label: "Physiotherapy",
    icon: "zap" as const,
    color: "#F59E0B",
    years: ["BPT 1st Year", "BPT 2nd Year", "BPT 3rd Year", "BPT 4th Year", "MPT"],
  },
  {
    key: "dental",
    label: "Dental",
    icon: "smile" as const,
    color: "#10B981",
    years: [
      "BDS 1st Year", "BDS 2nd Year", "BDS 3rd Year",
      "BDS 4th Year", "BDS Intern", "MDS",
    ],
  },
  {
    key: "allied",
    label: "Allied Health",
    icon: "layers" as const,
    color: "#F97316",
    years: [
      "MLT 1st Year", "MLT 2nd Year", "BMLT 3rd Year", "BMLT 4th Year",
      "OTAT 1st Year", "OTAT 2nd Year", "OTAT 3rd Year",
      "PA 1st Year", "PA 2nd Year", "PA 3rd Year",
      "CLP 1st Year", "CLP 2nd Year", "CLP 3rd Year",
      "CPPT 1st Year", "CPPT 2nd Year", "CPPT 3rd Year",
      "CVT 1st Year", "CVT 2nd Year", "CVT 3rd Year",
      "CT 1st Year", "CT 2nd Year", "CT 3rd Year",
      "RIT 1st Year", "RIT 2nd Year", "RIT 3rd Year",
      "OPTOM 1st Year", "OPTOM 2nd Year", "OPTOM 3rd Year", "OPTOM 4th Year",
      "DT 1st Year", "DT 2nd Year", "DT 3rd Year",
      "AECT 1st Year", "AECT 2nd Year", "AECT 3rd Year",
      "CCT 1st Year", "CCT 2nd Year", "CCT 3rd Year",
      "RT 1st Year", "RT 2nd Year", "RT 3rd Year",
      "NEP 1st Year", "NEP 2nd Year", "NEP 3rd Year",
      "BSc Dietetics", "BSc Audiology", "BSc MLT", "BSc Radiology",
      "BSc OT", "BSc PT", "BSc Perfusion Technology",
    ],
  },
  {
    key: "pg",
    label: "PG / Consultant",
    icon: "award" as const,
    color: "#6366F1",
    years: [
      "Resident (PG Year 1)", "Resident (PG Year 2)", "Resident (PG Year 3)",
      "Fellow", "Consultant / Specialist",
    ],
  },
];

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();

  // 2 steps: 0 = discipline, 1 = year
  const [step, setStep] = useState(0);
  const [selectedCat, setSelectedCat] = useState("medical");
  const [selectedYear, setSelectedYear] = useState("MBBS 3rd Year");

  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  function animateTo(next: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const dir = next > step ? -28 : 28;
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: dir, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      slideAnim.setValue(-dir);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]).start();
    });
  }

  function selectDiscipline(key: string) {
    setSelectedCat(key);
    const cat = DISCIPLINE_CATEGORIES.find((c) => c.key === key)!;
    setSelectedYear(cat.years[0]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function finish() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeOnboarding({
      name: "Medical Student",
      college: "",
      year: selectedYear,
    });
  }

  const currentCat = DISCIPLINE_CATEGORIES.find((c) => c.key === selectedCat)!;
  const isIOS = Platform.OS === "ios";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#060F1E", "#0B2447", "#19376D"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      {/* Header band */}
      <View style={[styles.topBand, { paddingTop: insets.top + 16 }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Feather name="activity" size={22} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.logoName}>MedPocket</Text>
            <Text style={styles.logoBy}>by Nirranjan</Text>
          </View>
        </View>
        {/* 2-dot progress indicator */}
        <View style={styles.dots}>
          {[0, 1].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === step && styles.dotActive,
                i < step && styles.dotDone,
              ]}
            />
          ))}
        </View>
      </View>

      <Animated.View
        style={[
          styles.body,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* ── Step 0: Discipline ── */}
        {step === 0 && (
          <ScrollView contentContainerStyle={styles.stepPad} showsVerticalScrollIndicator={false}>
            <Text style={[styles.stepTitle, { color: "#ffffff" }]}>
              What's your discipline?
            </Text>
            <Text style={[styles.stepSub, { color: "rgba(255,255,255,0.7)" }]}>
              We'll personalise your drug guide, quiz topics, and content.
            </Text>

            <View style={styles.catGrid}>
              {DISCIPLINE_CATEGORIES.map((cat) => {
                const active = selectedCat === cat.key;
                return (
                  <Pressable
                    key={cat.key}
                    style={[
                      styles.catCard,
                      { backgroundColor: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.12)" },
                      active && { backgroundColor: cat.color + "22", borderColor: cat.color },
                    ]}
                    onPress={() => selectDiscipline(cat.key)}
                  >
                    <View style={[styles.catCardIcon, { backgroundColor: cat.color + "20" }]}>
                      <Feather name={cat.icon} size={20} color={cat.color} />
                    </View>
                    <Text style={[styles.catCardLabel, { color: active ? cat.color : colors.foreground }]}>
                      {cat.label}
                    </Text>
                    {active && (
                      <View style={[styles.catCardCheck, { backgroundColor: cat.color }]}>
                        <Feather name="check" size={10} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* ── Step 1: Year / Course ── */}
        {step === 1 && (
          <ScrollView contentContainerStyle={styles.stepPad} showsVerticalScrollIndicator={false}>
            <Text style={[styles.stepTitle, { color: "#ffffff" }]}>
              Select your course year
            </Text>
            <Text style={[styles.stepSub, { color: "rgba(255,255,255,0.7)" }]}>
              {currentCat.label} — choose the closest match
            </Text>

            <View style={[styles.yearList, { backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", borderRadius: 20 }]}>
              {currentCat.years.map((y, i) => {
                const active = selectedYear === y;
                return (
                  <Pressable
                    key={y}
                    style={[
                      styles.yearRow,
                      i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(255,255,255,0.10)" },
                      active ? { backgroundColor: currentCat.color + "18", borderColor: currentCat.color + "40" } : { backgroundColor: "transparent", borderColor: "transparent" },
                      active && { borderWidth: 1, borderRadius: 12 }
                    ]}
                    onPress={() => {
                      setSelectedYear(y);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <View
                      style={[
                        styles.yearDot,
                        { borderColor: currentCat.color },
                        active && { backgroundColor: currentCat.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.yearRowText,
                        { color: active ? currentCat.color : colors.foreground, fontWeight: active ? "700" : "400" },
                      ]}
                    >
                      {y}
                    </Text>
                    {active && <Feather name="check" size={15} color={currentCat.color} />}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        )}
      </Animated.View>

      {/* Footer buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: "transparent", borderTopColor: "rgba(255,255,255,0.10)" }]}>
        {step > 0 && (
          <Pressable
            style={({ pressed }) => [styles.backBtn, { backgroundColor: "rgba(255,255,255,0.10)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", opacity: pressed ? 0.7 : 1 }]}
            onPress={() => animateTo(step - 1)}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
            <Text style={[styles.backBtnText, { color: "#ffffff" }]}>Back</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [
            { flex: step === 0 ? 1 : undefined, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => {
            if (step < 1) {
              animateTo(step + 1);
            } else {
              finish();
            }
          }}
        >
          <LinearGradient
            colors={step === 1 ? ["#2563EB", "#1D4ED8"] : [currentCat.color, currentCat.color + "90"]}
            style={[styles.nextBtn, { borderRadius: 16 }]}
          >
            <Text style={styles.nextBtnText}>{step === 1 ? "Get Started" : "Continue"}</Text>
            <Feather name={step === 1 ? "check" : "arrow-right"} size={18} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  glow1: {
    position: "absolute", borderRadius: 9999,
    width: 600, height: 600, top: -200, left: -200,
    backgroundColor: "rgba(37,99,235,0.22)",
  },
  glow2: {
    position: "absolute", borderRadius: 9999,
    width: 400, height: 400, bottom: -100, right: -100,
    backgroundColor: "rgba(20,184,166,0.18)",
  },
  topBand:      { paddingHorizontal: 20, paddingBottom: 20 },
  logoRow:      { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  logoIcon:     { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  logoName:     { fontSize: 20, fontWeight: "800", color: "#fff", letterSpacing: -0.3 },
  logoBy:       { fontSize: 11, color: "rgba(255,255,255,0.75)" },
  dots:         { flexDirection: "row", gap: 6 },
  dot:          { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.35)" },
  dotActive:    { width: 24, backgroundColor: "#fff" },
  dotDone:      { backgroundColor: "rgba(255,255,255,0.7)" },
  body:         { flex: 1 },
  stepPad:      { padding: 20, paddingBottom: 32 },
  stepTitle:    { fontSize: 26, fontWeight: "800", letterSpacing: -0.4, marginBottom: 8 },
  stepSub:      { fontSize: 14, lineHeight: 21, marginBottom: 28 },
  catGrid:      { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  catCard:      { width: "46%", flexGrow: 1, borderRadius: 16, borderWidth: 1.5, padding: 14, alignItems: "center", gap: 8, position: "relative" },
  catCardIcon:  { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  catCardLabel: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  catCardCheck: { position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  yearList:     { borderRadius: 16, overflow: "hidden" },
  yearRow:      { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  yearDot:      { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  yearRowText:  { flex: 1, fontSize: 15 },
  footer:       { flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth },
  backBtn:      { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, paddingVertical: 16, borderRadius: 16 },
  backBtnText:  { fontSize: 15, fontWeight: "600" },
  nextBtn:      { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 16 },
  nextBtnText:  { fontSize: 15, fontWeight: "700", color: "#fff" },
});
