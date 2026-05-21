import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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

const { width } = Dimensions.get("window");

const STUDY_YEARS = [
  "MBBS 1st Year", "MBBS 2nd Year", "MBBS 3rd Year",
  "MBBS 4th Year", "MBBS Final Year", "Intern",
  "Resident (PG Year 1)", "Resident (PG Year 2)", "Resident (PG Year 3)",
  "Fellow", "Consultant",
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [year, setYear] = useState("MBBS 3rd Year");

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function goToStep(next: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  }

  function finish() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeOnboarding({
      name: name.trim() || "Medical Student",
      college: college.trim(),
      year,
    });
  }

  const styles = makeStyles(colors);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#009DB5", "#006A7A"]}
        style={[styles.topBanner, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Feather name="activity" size={28} color="#009DB5" />
          </View>
          <View>
            <Text style={styles.logoTitle}>MedPocket</Text>
            <Text style={styles.logoSub}>by Nirranjan</Text>
          </View>
        </View>

        <View style={styles.stepsRow}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                i === step && styles.stepDotActive,
                i < step && styles.stepDotDone,
              ]}
            />
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        style={[styles.body, { backgroundColor: colors.background }]}
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 40,
          minHeight: Dimensions.get("window").height * 0.65,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {step === 0 && <StepWelcome onNext={() => goToStep(1)} colors={colors} styles={styles} />}
          {step === 1 && (
            <StepProfile
              name={name}
              college={college}
              onNameChange={setName}
              onCollegeChange={setCollege}
              onNext={() => goToStep(2)}
              colors={colors}
              styles={styles}
            />
          )}
          {step === 2 && (
            <StepYear
              year={year}
              onYearChange={setYear}
              onFinish={finish}
              colors={colors}
              styles={styles}
            />
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function StepWelcome({ onNext, colors, styles }: any) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.welcomeIconWrap}>
        <LinearGradient colors={["#009DB5", "#00C6D8"]} style={styles.welcomeIcon}>
          <Feather name="heart" size={40} color="#fff" />
        </LinearGradient>
      </View>
      <Text style={[styles.stepTitle, { color: colors.foreground }]}>
        Welcome to MedPocket
      </Text>
      <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
        Your complete medical reference companion. Drug guide, clinical calculators, lab values, emergency protocols, and more — all in one pocket.
      </Text>

      <View style={styles.featureList}>
        {[
          { icon: "tablet", label: "1000+ Drug References", color: "#009DB5" },
          { icon: "sliders", label: "Clinical Calculators", color: "#8B5CF6" },
          { icon: "alert-circle", label: "Emergency Protocols", color: "#EF4444" },
          { icon: "bar-chart-2", label: "Lab Value Reference", color: "#10B981" },
        ].map((f) => (
          <View key={f.label} style={[styles.featureRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.featureIcon, { backgroundColor: f.color + "20" }]}>
              <Feather name={f.icon as any} size={16} color={f.color} />
            </View>
            <Text style={[styles.featureLabel, { color: colors.foreground }]}>{f.label}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.85 : 1 }]}
        onPress={onNext}
      >
        <Text style={styles.primaryBtnText}>Get Started</Text>
        <Feather name="arrow-right" size={18} color="#fff" />
      </Pressable>

      <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
        For educational use only. Not a substitute for clinical judgment.
      </Text>
    </View>
  );
}

function StepProfile({ name, college, onNameChange, onCollegeChange, onNext, colors, styles }: any) {
  return (
    <View style={styles.stepContainer}>
      <View style={[styles.stepIconSmall, { backgroundColor: colors.tealLight }]}>
        <Feather name="user" size={26} color={colors.primary} />
      </View>
      <Text style={[styles.stepTitle, { color: colors.foreground }]}>
        Set Up Your Profile
      </Text>
      <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
        Personalise your experience. You can always update this later from your profile.
      </Text>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>FULL NAME</Text>
        <TextInput
          style={[styles.formInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          value={name}
          onChangeText={onNameChange}
          placeholder="e.g. Dr. Nirranjan"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="words"
          returnKeyType="next"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>COLLEGE / INSTITUTION</Text>
        <TextInput
          style={[styles.formInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          value={college}
          onChangeText={onCollegeChange}
          placeholder="e.g. AIIMS Delhi (optional)"
          placeholderTextColor={colors.mutedForeground}
          returnKeyType="done"
        />
      </View>

      <Pressable
        style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.85 : 1 }]}
        onPress={onNext}
      >
        <Text style={styles.primaryBtnText}>Continue</Text>
        <Feather name="arrow-right" size={18} color="#fff" />
      </Pressable>
    </View>
  );
}

function StepYear({ year, onYearChange, onFinish, colors, styles }: any) {
  return (
    <View style={styles.stepContainer}>
      <View style={[styles.stepIconSmall, { backgroundColor: colors.tealLight }]}>
        <Feather name="award" size={26} color={colors.primary} />
      </View>
      <Text style={[styles.stepTitle, { color: colors.foreground }]}>
        Your Study Level
      </Text>
      <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
        This helps us tailor content to your stage of training.
      </Text>

      <View style={styles.yearGrid}>
        {STUDY_YEARS.map((y) => (
          <Pressable
            key={y}
            style={[
              styles.yearChip,
              { backgroundColor: colors.card, borderColor: colors.border },
              year === y && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => {
              onYearChange(y);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={[styles.yearChipText, { color: colors.mutedForeground }, year === y && { color: "#fff" }]}>
              {y}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [styles.primaryBtn, styles.finishBtn, { opacity: pressed ? 0.85 : 1 }]}
        onPress={onFinish}
      >
        <Feather name="check-circle" size={18} color="#fff" />
        <Text style={styles.primaryBtnText}>Start Learning</Text>
      </Pressable>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  return StyleSheet.create({
    topBanner: {
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    logoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginBottom: 20,
    },
    logoCircle: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    logoTitle: { fontSize: 22, fontWeight: "800", color: "#fff" },
    logoSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: "500" },
    stepsRow: {
      flexDirection: "row",
      gap: 6,
    },
    stepDot: {
      width: 24,
      height: 4,
      borderRadius: 2,
      backgroundColor: "rgba(255,255,255,0.35)",
    },
    stepDotActive: { backgroundColor: "#fff", width: 40 },
    stepDotDone: { backgroundColor: "rgba(255,255,255,0.7)" },
    body: { flex: 1 },
    stepContainer: { gap: 16 },
    welcomeIconWrap: { alignItems: "center", marginBottom: 8 },
    welcomeIcon: {
      width: 88,
      height: 88,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    stepIconSmall: {
      width: 60,
      height: 60,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    stepTitle: { fontSize: 26, fontWeight: "800", lineHeight: 32 },
    stepDesc: { fontSize: 14, lineHeight: 22 },
    featureList: { gap: 8 },
    featureRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
    },
    featureIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    featureLabel: { fontSize: 14, fontWeight: "600" },
    formGroup: { gap: 6 },
    formLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1 },
    formInput: {
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      fontSize: 15,
      borderWidth: 1,
    },
    primaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#009DB5",
      borderRadius: 14,
      paddingVertical: 16,
      gap: 8,
      marginTop: 8,
    },
    finishBtn: { backgroundColor: "#10B981" },
    primaryBtnText: { fontSize: 16, fontWeight: "800", color: "#fff" },
    disclaimer: { fontSize: 11, textAlign: "center", lineHeight: 16 },
    yearGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    yearChip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 22,
      borderWidth: 1,
    },
    yearChipText: { fontSize: 13, fontWeight: "600" },
  });
}
