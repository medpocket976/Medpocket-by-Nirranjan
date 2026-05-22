import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
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

const CLINICAL_PEARLS = [
  { text: "Amoxicillin rash in infectious mononucleosis ≠ penicillin allergy.", ref: "Harrison's Principles of Internal Medicine, 21e" },
  { text: "GCS ≤ 8 → intubate. 'Eight, intubate!'", ref: "Teasdale G, Jennett B. Lancet. 1974" },
  { text: "In anaphylaxis: Epinephrine IM first — never delay for antihistamines.", ref: "WAO Anaphylaxis Guidelines 2020" },
  { text: "Painless jaundice + palpable gallbladder = pancreatic head Ca (Courvoisier's law).", ref: "Bailey & Love's Surgery, 27e" },
  { text: "NEVER perform vaginal exam in suspected placenta previa.", ref: "RCOG Guideline No. 27, 2011" },
  { text: "Correct Na⁺ slowly — max 8–10 mEq/L per day to prevent osmotic demyelination.", ref: "Sterns RH. NEJM 2015; 372:55" },
  { text: "AST:ALT >2:1 with absolute <300 U/L → alcoholic hepatitis.", ref: "Cohen JA, Kaplan MM. Gastroenterology 1979" },
  { text: "Wells DVT score ≥3 → skip D-dimer, go straight to ultrasound.", ref: "Wells PS et al. Lancet 1997; 350:1795" },
  { text: "Metformin does NOT cause hypoglycemia as monotherapy.", ref: "BNF 86 / ADA Standards of Care 2024" },
  { text: "Troponin rise and fall = acute MI. Troponin alone = not diagnostic.", ref: "ESC NSTEMI Guidelines 2020" },
  { text: "Free gas under diaphragm on erect AXR = perforated viscus → urgent surgery.", ref: "Bailey & Love's Surgery, 27e" },
  { text: "CURB-65 ≥3 → hospital admission for pneumonia.", ref: "Lim WS et al. Thorax 2003; 58:377" },
  { text: "Warfarin antidote: Vitamin K for slow reversal; PCC for emergency reversal.", ref: "BSH Guidelines on Anticoagulation 2022" },
  { text: "Loop of Henle active transport: Na-K-2Cl — inhibited by furosemide.", ref: "Guyton & Hall Medical Physiology, 14e" },
  { text: "Coagulative necrosis = ischemic infarcts (except brain → liquefactive).", ref: "Robbins & Cotran Pathology, 10e" },
];

const MODULES = [
  { id: "drug-guide",      label: "Drug Guide",    icon: "tablet"      as const, color: "#009DB5", desc: "1000+ drugs" },
  { id: "clinical-exam",  label: "Clinical Exam", icon: "activity"    as const, color: "#8B5CF6", desc: "Systems" },
  { id: "emergency",      label: "Emergency",     icon: "alert-circle" as const, color: "#EF4444", desc: "Protocols" },
  { id: "lab-values",     label: "Lab Values",    icon: "bar-chart-2" as const, color: "#10B981", desc: "References" },
  { id: "calculators",    label: "Calculators",   icon: "sliders"     as const, color: "#F59E0B", desc: "9 calculators" },
  { id: "anaesthesia-calc", label: "Anaesthesia", icon: "wind"        as const, color: "#6366F1", desc: "Dose calculator" },
  { id: "search",         label: "Search All",    icon: "search"      as const, color: "#EC4899", desc: "Global search" },
];

function ModuleCard({
  mod,
  colors,
  styles,
}: {
  mod: (typeof MODULES)[number];
  colors: ReturnType<typeof useColors>;
  styles: ReturnType<typeof makeStyles>;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.spring(scaleAnim, { toValue: 0.95, tension: 160, friction: 8, useNativeDriver: true }).start();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  function pressOut() {
    Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }).start();
  }

  return (
    <Pressable
      style={styles.moduleCardOuter}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={() => router.push(`/${mod.id}` as any)}
    >
      <Animated.View
        style={[
          styles.moduleCard,
          { backgroundColor: colors.card, borderColor: colors.border },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={[styles.moduleIcon, { backgroundColor: mod.color + "20" }]}>
          <Feather name={mod.icon} size={22} color={mod.color} />
        </View>
        <Text style={[styles.moduleLabel, { color: colors.foreground }]}>{mod.label}</Text>
        <Text style={[styles.moduleDesc, { color: colors.mutedForeground }]}>{mod.desc}</Text>
      </Animated.View>
    </Pressable>
  );
}

function StatCard({
  icon, label, value, color, colors, styles,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  color: string;
  colors: ReturnType<typeof useColors>;
  styles: ReturnType<typeof makeStyles>;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.spring(scaleAnim, { toValue: 0.93, tension: 160, friction: 8, useNativeDriver: true }).start();
  }
  function pressOut() {
    Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }).start();
  }

  return (
    <Pressable style={{ flex: 1 }} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View
        style={[
          styles.statCard,
          { backgroundColor: colors.card, borderColor: colors.border },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={[styles.statIconWrap, { backgroundColor: color + "18" }]}>
          <Feather name={icon} size={14} color={color} />
        </View>
        <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { user, streak, totalStudyDays, bookmarks, quizHistory, recordStudySession } = useApp();

  const todayPearl = CLINICAL_PEARLS[new Date().getDate() % CLINICAL_PEARLS.length];
  const dateLabel  = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim  = useRef(new Animated.Value(0)).current;
  const pearlAnim  = useRef(new Animated.Value(0)).current;
  const gridAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    recordStudySession();
    Animated.stagger(70, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 9 }),
      Animated.spring(statsAnim,  { toValue: 1, useNativeDriver: true, tension: 60, friction: 9 }),
      Animated.spring(pearlAnim,  { toValue: 1, useNativeDriver: true, tension: 60, friction: 9 }),
      Animated.spring(gridAnim,   { toValue: 1, useNativeDriver: true, tension: 60, friction: 9 }),
    ]).start();
  }, []);

  const animStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }],
  });

  const styles  = makeStyles(colors);
  const topPad  = Platform.OS === "web" ? 67 : insets.top;

  const pearlScale = useRef(new Animated.Value(1)).current;
  function pearlPressIn() {
    Animated.spring(pearlScale, { toValue: 0.98, tension: 120, friction: 8, useNativeDriver: true }).start();
  }
  function pearlPressOut() {
    Animated.spring(pearlScale, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }).start();
  }

  const searchScale = useRef(new Animated.Value(1)).current;
  function searchPressIn() {
    Animated.spring(searchScale, { toValue: 0.9, tension: 160, friction: 8, useNativeDriver: true }).start();
  }
  function searchPressOut() {
    Animated.spring(searchScale, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }).start();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View style={[styles.header, animStyle(headerAnim)]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Good {getTimeOfDay()},
          </Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{user.name} 👋</Text>
          <Text style={[styles.subtitle, { color: colors.primary }]}>{user.year}</Text>
        </View>
        <Pressable
          onPressIn={searchPressIn}
          onPressOut={searchPressOut}
          onPress={() => router.push("/search")}
        >
          <Animated.View
            style={[styles.searchBtn, { backgroundColor: colors.tealLight }, { transform: [{ scale: searchScale }] }]}
          >
            <Feather name="search" size={20} color={colors.primary} />
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* Stats Row */}
      <Animated.View style={[styles.statsRow, animStyle(statsAnim)]}>
        <StatCard icon="zap"          label="Streak"  value={`${streak}d`}            color="#F59E0B" colors={colors} styles={styles} />
        <StatCard icon="bookmark"     label="Saved"   value={`${bookmarks.length}`}   color="#009DB5" colors={colors} styles={styles} />
        <StatCard icon="check-circle" label="Quizzes" value={`${quizHistory.length}`} color="#8B5CF6" colors={colors} styles={styles} />
        <StatCard icon="calendar"     label="Days"    value={`${totalStudyDays}`}      color="#10B981" colors={colors} styles={styles} />
      </Animated.View>

      {/* Daily Pearl */}
      <Animated.View style={animStyle(pearlAnim)}>
        <Pressable onPressIn={pearlPressIn} onPressOut={pearlPressOut}>
          <Animated.View
            style={[styles.pearlCard, { backgroundColor: colors.primary }, { transform: [{ scale: pearlScale }] }]}
          >
            <View style={styles.pearlHeader}>
              <View style={styles.pearlBadge}>
                <Feather name="sun" size={12} color="#fff" />
                <Text style={styles.pearlBadgeText}>Daily Pearl</Text>
              </View>
              <Text style={styles.pearlDate}>{dateLabel}</Text>
            </View>
            <Text style={styles.pearlText}>"{todayPearl.text}"</Text>
            <View style={styles.pearlRefRow}>
              <Feather name="book-open" size={10} color="rgba(255,255,255,0.7)" />
              <Text style={styles.pearlRef}>{todayPearl.ref}</Text>
            </View>
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* Modules Grid */}
      <Animated.View style={animStyle(gridAnim)}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Access</Text>
          <View style={[styles.verifiedBadge, { backgroundColor: "#10B98112", borderColor: "#10B98130" }]}>
            <Feather name="check-circle" size={10} color="#10B981" />
            <Text style={[styles.verifiedText, { color: "#10B981" }]}>Verified · 2026</Text>
          </View>
        </View>
        <View style={styles.grid}>
          {MODULES.map((mod) => (
            <ModuleCard key={mod.id} mod={mod} colors={colors} styles={styles} />
          ))}
        </View>
      </Animated.View>

      {/* Recent Quiz */}
      {quizHistory.length > 0 && (
        <Animated.View style={animStyle(gridAnim)}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, paddingHorizontal: 20, marginBottom: 12 }]}>
            Recent Activity
          </Text>
          <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {quizHistory.slice(0, 3).map((result, i) => (
              <View
                key={i}
                style={[
                  styles.activityRow,
                  i < Math.min(quizHistory.length - 1, 2) && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.activityLeft}>
                  <View
                    style={[
                      styles.activityDot,
                      { backgroundColor: result.score / result.total >= 0.6 ? "#10B981" : "#EF4444" },
                    ]}
                  />
                  <View>
                    <Text style={[styles.activityTitle, { color: colors.foreground }]}>
                      {result.subject} Quiz
                    </Text>
                    <Text style={[styles.activityDate, { color: colors.mutedForeground }]}>
                      {new Date(result.date).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short",
                      })}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.activityScore,
                    { color: result.score / result.total >= 0.6 ? "#10B981" : "#EF4444" },
                  ]}
                >
                  {result.score}/{result.total}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Feather name="info" size={12} color={colors.mutedForeground} />
        <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
          For educational purposes only. Not a substitute for clinical judgment.
        </Text>
      </View>
    </ScrollView>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  const isIOS = Platform.OS === "ios";
  const shadow = isIOS
    ? { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 }
    : { elevation: 1 };
  return StyleSheet.create({
    container:       { flex: 1, backgroundColor: colors.background },
    header:          { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, marginBottom: 20 },
    greeting:        { fontSize: 14 },
    name:            { fontSize: 24, fontWeight: "700", marginTop: 2 },
    subtitle:        { fontSize: 12, marginTop: 2 },
    searchBtn:       { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
    statsRow:        { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 20 },
    statCard:        { alignItems: "center", paddingVertical: 10, borderRadius: 14, borderWidth: 1, gap: 3, ...shadow },
    statIconWrap:    { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    statValue:       { fontSize: 14, fontWeight: "700" },
    statLabel:       { fontSize: 9, textAlign: "center" },
    pearlCard:       { marginHorizontal: 20, padding: 18, borderRadius: 20, marginBottom: 24, ...shadow },
    pearlHeader:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    pearlBadge:      { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    pearlBadgeText:  { fontSize: 11, color: "#fff", fontWeight: "600" },
    pearlDate:       { fontSize: 11, color: "rgba(255,255,255,0.7)" },
    pearlText:       { fontSize: 14, color: "#fff", lineHeight: 22, fontStyle: "italic" },
    pearlRefRow:     { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)" },
    pearlRef:        { fontSize: 10, color: "rgba(255,255,255,0.7)", fontStyle: "italic", flex: 1 },
    sectionHeader:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 12 },
    sectionTitle:    { fontSize: 18, fontWeight: "700" },
    verifiedBadge:   { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
    verifiedText:    { fontSize: 10, fontWeight: "600" },
    grid:            { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10, marginBottom: 24 },
    moduleCardOuter: { width: "30%", flexGrow: 1 },
    moduleCard:      { borderRadius: 16, padding: 14, borderWidth: 1, alignItems: "center", gap: 6, ...shadow },
    moduleIcon:      { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    moduleLabel:     { fontSize: 12, fontWeight: "600", textAlign: "center" },
    moduleDesc:      { fontSize: 10, textAlign: "center" },
    activityCard:    { marginHorizontal: 20, borderRadius: 16, borderWidth: 1, marginBottom: 20, overflow: "hidden" },
    activityRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
    activityLeft:    { flexDirection: "row", alignItems: "center", gap: 10 },
    activityDot:     { width: 8, height: 8, borderRadius: 4 },
    activityTitle:   { fontSize: 13, fontWeight: "600" },
    activityDate:    { fontSize: 11, marginTop: 2 },
    activityScore:   { fontSize: 14, fontWeight: "700" },
    disclaimer:      { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, paddingBottom: 8 },
    disclaimerText:  { fontSize: 10, flex: 1, lineHeight: 14 },
  });
}
