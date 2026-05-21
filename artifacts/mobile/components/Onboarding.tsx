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
  TextInput,
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
    years: [
      "BPT 1st Year", "BPT 2nd Year", "BPT 3rd Year", "BPT 4th Year", "MPT",
    ],
  },
  {
    key: "dental",
    label: "Dental",
    icon: "smile" as const,
    color: "#10B981",
    years: [
      "BDS 1st Year", "BDS 2nd Year", "BDS 3rd Year", "BDS 4th Year", "BDS Intern", "MDS",
    ],
  },
  {
    key: "allied",
    label: "Allied Health",
    icon: "layers" as const,
    color: "#F97316",
    years: [
      "DMLT / BMLT", "BRIT / BMRIT", "BSc Optometry",
      "BSc Dietetics", "BSc Audiology",
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

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [selectedCat, setSelectedCat] = useState("medical");
  const [selectedYear, setSelectedYear] = useState("MBBS 3rd Year");

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  function animateTo(next: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const dir = next > step ? -28 : 28;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: dir, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      slideAnim.setValue(-dir);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
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
      name: name.trim() || "Medical Student",
      college: college.trim(),
      year: selectedYear,
    });
  }

  const currentCat = DISCIPLINE_CATEGORIES.find((c) => c.key === selectedCat)!;
  const isIOS = Platform.OS === "ios";
  const shadow = isIOS
    ? { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6 }
    : { elevation: 2 };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header band */}
      <View style={[styles.topBand, { paddingTop: insets.top + 16, backgroundColor: colors.primary }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Feather name="activity" size={22} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.logoName}>MedPocket</Text>
            <Text style={styles.logoBy}>by Nirranjan</Text>
          </View>
        </View>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
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

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: insets.bottom + 32, minHeight: SCREEN_HEIGHT * 0.68 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* STEP 0 — Welcome */}
          {step === 0 && (
            <View style={styles.stepWrap}>
              <View style={[styles.bigIcon, { backgroundColor: colors.tealLight }]}>
                <Feather name="heart" size={42} color={colors.primary} />
              </View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>
                Welcome to MedPocket
              </Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
                Your complete paramedical & medical reference — drugs, calculators, lab values, emergency protocols, and more.
              </Text>

              <View style={[styles.groupCard, { backgroundColor: colors.card, ...shadow }]}>
                {[
                  { icon: "tablet" as const, label: "1000+ Drug References", color: "#009DB5" },
                  { icon: "sliders" as const, label: "Clinical Calculators + Anaesthesia Doses", color: "#8B5CF6" },
                  { icon: "alert-circle" as const, label: "Emergency Protocols", color: "#EF4444" },
                  { icon: "bar-chart-2" as const, label: "Lab Value Reference", color: "#10B981" },
                ].map((f, i) => (
                  <View
                    key={f.label}
                    style={[
                      styles.featureRow,
                      i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                    ]}
                  >
                    <View style={[styles.featureIcon, { backgroundColor: f.color + "18" }]}>
                      <Feather name={f.icon} size={16} color={f.color} />
                    </View>
                    <Text style={[styles.featureLabel, { color: colors.foreground }]}>{f.label}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                style={({ pressed }) => [styles.primaryBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => animateTo(1)}
              >
                <Text style={styles.primaryBtnText}>Get Started</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </Pressable>

              <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
                For educational use only · Not a substitute for clinical judgment
              </Text>
            </View>
          )}

          {/* STEP 1 — Profile */}
          {step === 1 && (
            <View style={styles.stepWrap}>
              <View style={[styles.smallIcon, { backgroundColor: colors.tealLight }]}>
                <Feather name="user" size={26} color={colors.primary} />
              </View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Set Up Your Profile</Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
                Personalise your experience. You can update this anytime.
              </Text>

              <Text style={[styles.iosLabel, { color: colors.mutedForeground }]}>YOUR NAME</Text>
              <TextInput
                style={[
                  styles.iosInput,
                  { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, ...shadow },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Dr. Nirranjan"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="words"
                returnKeyType="next"
              />

              <Text style={[styles.iosLabel, { color: colors.mutedForeground, marginTop: 16 }]}>
                COLLEGE / INSTITUTION (optional)
              </Text>
              <TextInput
                style={[
                  styles.iosInput,
                  { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, ...shadow },
                ]}
                value={college}
                onChangeText={setCollege}
                placeholder="e.g. AIIMS Delhi, JIPMER"
                placeholderTextColor={colors.mutedForeground}
                returnKeyType="done"
              />

              <View style={styles.navRow}>
                <Pressable
                  style={({ pressed }) => [styles.secondaryBtn, { backgroundColor: colors.muted, opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => animateTo(0)}
                >
                  <Feather name="arrow-left" size={16} color={colors.foreground} />
                  <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>Back</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { flex: 1, backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                  ]}
                  onPress={() => animateTo(2)}
                >
                  <Text style={styles.primaryBtnText}>Continue</Text>
                  <Feather name="arrow-right" size={16} color="#fff" />
                </Pressable>
              </View>
            </View>
          )}

          {/* STEP 2 — Discipline + Year */}
          {step === 2 && (
            <View style={styles.stepWrap}>
              <View style={[styles.smallIcon, { backgroundColor: currentCat.color + "18" }]}>
                <Feather name={currentCat.icon} size={26} color={currentCat.color} />
              </View>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Your Discipline</Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
                Select your field and year so we can tailor content for you.
              </Text>

              <Text style={[styles.iosLabel, { color: colors.mutedForeground }]}>FIELD OF STUDY</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catScroll}
              >
                {DISCIPLINE_CATEGORIES.map((cat) => {
                  const active = selectedCat === cat.key;
                  return (
                    <Pressable
                      key={cat.key}
                      style={[
                        styles.catChip,
                        active
                          ? { backgroundColor: cat.color, borderColor: cat.color }
                          : { backgroundColor: colors.card, borderColor: colors.border },
                      ]}
                      onPress={() => selectDiscipline(cat.key)}
                    >
                      <Feather name={cat.icon} size={12} color={active ? "#fff" : cat.color} />
                      <Text style={[styles.catChipText, { color: active ? "#fff" : colors.foreground }]}>
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={[styles.iosLabel, { color: colors.mutedForeground, marginTop: 16 }]}>
                STUDY YEAR
              </Text>
              <View style={[styles.groupCard, { backgroundColor: colors.card, ...shadow }]}>
                {currentCat.years.map((y, i) => {
                  const sel = selectedYear === y;
                  return (
                    <Pressable
                      key={y}
                      style={({ pressed }) => [
                        styles.yearRow,
                        i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                        { opacity: pressed ? 0.6 : 1 },
                      ]}
                      onPress={() => {
                        setSelectedYear(y);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Text
                        style={[
                          styles.yearRowText,
                          { color: colors.foreground },
                          sel && { color: currentCat.color, fontWeight: "700" },
                        ]}
                      >
                        {y}
                      </Text>
                      {sel && <Feather name="check" size={16} color={currentCat.color} />}
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.navRow}>
                <Pressable
                  style={({ pressed }) => [styles.secondaryBtn, { backgroundColor: colors.muted, opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => animateTo(1)}
                >
                  <Feather name="arrow-left" size={16} color={colors.foreground} />
                  <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>Back</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { flex: 1, backgroundColor: "#10B981", opacity: pressed ? 0.85 : 1 },
                  ]}
                  onPress={finish}
                >
                  <Feather name="check-circle" size={16} color="#fff" />
                  <Text style={styles.primaryBtnText}>Start Learning</Text>
                </Pressable>
              </View>
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBand: { paddingHorizontal: 20, paddingBottom: 20 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  logoIcon: {
    width: 44, height: 44, borderRadius: 13,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
  },
  logoName: { fontSize: 20, fontWeight: "800", color: "#fff" },
  logoBy: { fontSize: 11, color: "rgba(255,255,255,0.72)", fontWeight: "500" },
  dots: { flexDirection: "row", gap: 6 },
  dot: { width: 22, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)" },
  dotActive: { width: 38, backgroundColor: "#fff" },
  dotDone: { backgroundColor: "rgba(255,255,255,0.65)" },

  body: { padding: 20 },
  stepWrap: { gap: 14 },

  bigIcon: {
    width: 90, height: 90, borderRadius: 26,
    alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 4,
  },
  smallIcon: {
    width: 60, height: 60, borderRadius: 18,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  stepTitle: { fontSize: 28, fontWeight: "800", lineHeight: 34, letterSpacing: -0.3 },
  stepSub: { fontSize: 14, lineHeight: 21 },

  groupCard: { borderRadius: 14, overflow: "hidden" },
  featureRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  featureIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  featureLabel: { fontSize: 14, fontWeight: "600", flex: 1 },

  iosLabel: {
    fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase",
  },
  iosInput: {
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 15, borderWidth: StyleSheet.hairlineWidth,
  },

  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 14, paddingVertical: 15, gap: 8,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "800", color: "#fff" },
  secondaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 14, paddingVertical: 15, paddingHorizontal: 20, gap: 6,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: "600" },
  navRow: { flexDirection: "row", gap: 10 },

  disclaimer: { fontSize: 11, textAlign: "center", lineHeight: 16 },

  catScroll: { gap: 8, paddingVertical: 4 },
  catChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
  },
  catChipText: { fontSize: 12, fontWeight: "600" },

  yearRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 13, minHeight: 46,
  },
  yearRowText: { flex: 1, fontSize: 15 },
});
