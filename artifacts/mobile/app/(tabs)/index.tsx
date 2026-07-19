import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
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

import { GlassBackground } from "@/components/GlassBackground";
import { GlassView } from "@/components/GlassView";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const CLINICAL_PEARLS = [
  { text: "Amoxicillin rash in infectious mononucleosis ≠ penicillin allergy.", ref: "Harrison's 21e" },
  { text: "GCS ≤ 8 → intubate. 'Eight, intubate!'", ref: "Teasdale & Jennett, Lancet 1974" },
  { text: "In anaphylaxis: Epinephrine IM first — never delay for antihistamines.", ref: "WAO Guidelines 2020" },
  { text: "Painless jaundice + palpable gallbladder = pancreatic head Ca (Courvoisier's law).", ref: "Bailey & Love's Surgery, 27e" },
  { text: "NEVER perform vaginal exam in suspected placenta previa.", ref: "RCOG Guideline No. 27" },
  { text: "Correct Na⁺ slowly — max 8–10 mEq/L per day to prevent osmotic demyelination.", ref: "Sterns RH, NEJM 2015" },
  { text: "AST:ALT >2:1 with absolute <300 U/L → alcoholic hepatitis.", ref: "Cohen & Kaplan, Gastroenterology 1979" },
  { text: "Wells DVT score ≥3 → skip D-dimer, go straight to ultrasound.", ref: "Wells PS et al., Lancet 1997" },
  { text: "Metformin does NOT cause hypoglycemia as monotherapy.", ref: "BNF 86 / ADA 2024" },
  { text: "Troponin rise and fall = acute MI. Troponin alone = not diagnostic.", ref: "ESC NSTEMI Guidelines 2020" },
  { text: "Free gas under diaphragm on erect AXR = perforated viscus → urgent surgery.", ref: "Bailey & Love's Surgery, 27e" },
  { text: "CURB-65 ≥3 → hospital admission for pneumonia.", ref: "Lim WS et al., Thorax 2003" },
  { text: "Warfarin antidote: Vitamin K for slow reversal; PCC for emergency reversal.", ref: "BSH Guidelines 2022" },
  { text: "In DKA: start insulin only AFTER potassium ≥3.3 mEq/L.", ref: "ADA DKA Guidelines 2022" },
  { text: "Beck's Triad of cardiac tamponade: hypotension, muffled heart sounds, JVD.", ref: "Sabiston Textbook, 21e" },
  { text: "Tension pneumothorax: treat clinically — needle decompress before CXR.", ref: "ATLS 10th Edition" },
  { text: "Posterior MI: ST depression in V1-V4 + tall R wave = posterior STEMI.", ref: "ESC STEMI Guidelines 2023" },
  { text: "FAST exam: fluid in Morrison's pouch = blood until proven otherwise.", ref: "ATLS 10th Edition" },
  { text: "Digoxin toxicity: bradycardia + yellow-green visual halos are classic.", ref: "BNF 86; Katzung 15e" },
  { text: "Penicillin G is DOC for syphilis (T. pallidum) at all stages.", ref: "WHO STI Guidelines 2021" },
];

const MODULES = [
  { id: "drug-guide",            label: "Drug Guide",      icon: "tablet"      as const, color: "#009DB5" },
  { id: "clinical-exam",         label: "Clinical Exam",   icon: "activity"    as const, color: "#8B5CF6" },
  { id: "emergency",             label: "Emergency",       icon: "alert-circle" as const, color: "#EF4444" },
  { id: "lab-values",            label: "Lab Values",      icon: "bar-chart-2" as const, color: "#10B981" },
  { id: "calculators",           label: "Calculators",     icon: "sliders"     as const, color: "#F59E0B" },
  { id: "anaesthesia-equipment", label: "Anaesthesia",     icon: "wind"        as const, color: "#7C3AED" },
  { id: "quiz",                  label: "Quiz",            icon: "check-circle" as const, color: "#EC4899" },
  { id: "search",                label: "Search All",      icon: "search"      as const, color: "#6366F1" },
];

// ─── Module card ─────────────────────────────────────────────────────────────
const ModuleCard = memo(function ModuleCard({
  id, label, icon, color, colors, styles,
}: {
  id: string; label: string; icon: keyof typeof Feather.glyphMap;
  color: string; colors: ReturnType<typeof useColors>; styles: ReturnType<typeof makeStyles>;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.94, tension: 160, friction: 8, useNativeDriver: true }).start();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [scaleAnim]);

  const pressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (id === "search") { router.push("/search" as any); return; }
    if (id === "quiz") { router.push("/(tabs)/quiz" as any); return; }
    router.push(`/${id}` as any);
  }, [id]);

  return (
    <Pressable
      style={styles.moduleOuter}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <GlassView style={styles.moduleCard} radius={20}>
          <View style={[styles.moduleIcon, { backgroundColor: color + "22" }]}>
            <Feather name={icon} size={20} color={color} />
          </View>
          <Text style={[styles.moduleLabel, { color: colors.foreground }]} numberOfLines={2}>{label}</Text>
        </GlassView>
      </Animated.View>
    </Pressable>
  );
});

// ─── Stat card ───────────────────────────────────────────────────────────────
const StatCard = memo(function StatCard({
  icon, label, value, color, colors, styles,
}: {
  icon: keyof typeof Feather.glyphMap; label: string; value: string;
  color: string; colors: ReturnType<typeof useColors>; styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <GlassView style={styles.statCard} radius={18}>
      <View style={[styles.statIconWrap, { backgroundColor: color + "20" }]}>
        <Feather name={icon} size={14} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </GlassView>
  );
});

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, quizHistory, streak, totalStudyDays, bookmarks, recordStudySession } = useApp();
  const topPad = Platform.OS === "web" ? 16 : insets.top;
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // ── Pick daily pearl ──
  const pearl = useMemo(() => {
    const idx = Math.floor(Date.now() / 86400000) % CLINICAL_PEARLS.length;
    return CLINICAL_PEARLS[idx];
  }, []);

  // ── Entrance animation ──
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    recordStudySession();
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 480, useNativeDriver: true }),
    ]).start();
  }, []);

  const savedCount  = bookmarks.length;
  const quizCount   = quizHistory.length;
  const studyDays   = totalStudyDays;
  const userName    = user.name.split(" ")[0];

  const recentActivity = quizHistory.slice(-4).reverse();

  return (
    <GlassBackground>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView
          contentContainerStyle={{ paddingTop: topPad + 12, paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
                Welcome back,
              </Text>
              <Text style={[styles.name, { color: colors.foreground }]}>
                {userName} 👋
              </Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                {user.year}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/search" as any)}
              accessibilityLabel="Search"
              style={styles.searchBtnWrap}
            >
              <GlassView style={styles.searchBtn} radius={16}>
                <Feather name="search" size={18} color={colors.primary} />
              </GlassView>
            </Pressable>
          </View>

          {/* ── Stats row ── */}
          <View style={styles.statsRow}>
            <StatCard icon="zap"      label="Day Streak" value={`${streak}`}    color="#F59E0B" colors={colors} styles={styles} />
            <StatCard icon="bookmark" label="Saved"      value={`${savedCount}`} color={colors.primary} colors={colors} styles={styles} />
            <StatCard icon="check-circle" label="Quizzes" value={`${quizCount}`} color="#10B981" colors={colors} styles={styles} />
            <StatCard icon="calendar" label="Study Days" value={`${studyDays}`} color="#8B5CF6" colors={colors} styles={styles} />
          </View>

          {/* ── Daily Pearl ── */}
          <View style={styles.pearlWrap}>
            <LinearGradient
              colors={["#009DB5", "#00B8CC", "#00C6D8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pearlCard}
            >
              <View style={styles.pearlHeader}>
                <View style={styles.pearlBadge}>
                  <Feather name="zap" size={11} color="#fff" />
                  <Text style={styles.pearlBadgeText}>Daily Clinical Pearl</Text>
                </View>
                <Text style={styles.pearlDate}>{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</Text>
              </View>
              <Text style={styles.pearlText}>"{pearl.text}"</Text>
              <View style={styles.pearlRefRow}>
                <Feather name="book-open" size={10} color="rgba(255,255,255,0.7)" />
                <Text style={styles.pearlRef}>{pearl.ref}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* ── Quick access grid ── */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Access</Text>
            <View style={styles.verifiedBadge}>
              <Feather name="shield" size={10} color={colors.primary} />
              <Text style={[styles.verifiedText, { color: colors.primary }]}>Evidence-based</Text>
            </View>
          </View>
          <View style={styles.grid}>
            {MODULES.map((m) => (
              <ModuleCard key={m.id} {...m} colors={colors} styles={styles} />
            ))}
          </View>

          {/* ── Recent activity ── */}
          {recentActivity.length > 0 && (
            <>
              <View style={[styles.sectionHeader, { marginTop: 4 }]}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
                <Pressable onPress={() => router.push("/quiz-history" as any)}>
                  <Text style={[styles.viewAllText, { color: colors.primary }]}>View all →</Text>
                </Pressable>
              </View>
              <GlassView style={styles.activityCard} radius={20}>
                {recentActivity.map((r, i) => {
                  const pct = Math.round((r.score / r.total) * 100);
                  const resultColor = pct >= 70 ? colors.success : pct >= 50 ? colors.warning : colors.critical;
                  return (
                    <View key={i} style={[styles.activityRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border + "60" }]}>
                      <View style={[styles.activityDot, { backgroundColor: resultColor }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.activityTitle, { color: colors.foreground }]}>{r.subject} Quiz</Text>
                        <Text style={[styles.activityDate, { color: colors.mutedForeground }]}>
                          {new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={[styles.activityScore, { color: resultColor }]}>{r.score}/{r.total}</Text>
                        <Text style={[styles.activityPct, { color: colors.mutedForeground }]}>{pct}%</Text>
                      </View>
                    </View>
                  );
                })}
              </GlassView>
            </>
          )}

          {/* ── Disclaimer ── */}
          <View style={styles.disclaimer}>
            <Feather name="info" size={11} color={colors.mutedForeground} />
            <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
              MedPocket is for educational use only. Always follow local protocols and consult qualified professionals for clinical decisions.
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </GlassBackground>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  const shadow = Platform.OS === "ios"
    ? { shadowColor: colors.glassShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16 }
    : { elevation: 3 };

  return StyleSheet.create({
    header:        { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, marginBottom: 16 },
    greeting:      { fontSize: 14, fontWeight: "500" },
    name:          { fontSize: 26, fontWeight: "800", marginTop: 2, letterSpacing: -0.5 },
    subtitle:      { fontSize: 13, marginTop: 2, fontWeight: "500" },
    searchBtnWrap: { paddingTop: 4 },
    searchBtn:     { width: 44, height: 44, alignItems: "center", justifyContent: "center" },

    statsRow:  { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 20 },
    statCard:  { flex: 1, alignItems: "center", paddingVertical: 12, paddingHorizontal: 4, gap: 3, ...shadow },
    statIconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    statValue: { fontSize: 16, fontWeight: "800" },
    statLabel: { fontSize: 9, textAlign: "center", fontWeight: "600" },

    pearlWrap: { marginHorizontal: 20, marginBottom: 24, borderRadius: 22, overflow: "hidden", ...shadow },
    pearlCard: { padding: 18, borderRadius: 22 },
    pearlHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    pearlBadge:    { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.22)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    pearlBadgeText: { fontSize: 11, color: "#fff", fontWeight: "700" },
    pearlDate:     { fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
    pearlText:     { fontSize: 15, color: "#fff", lineHeight: 24, fontStyle: "italic", fontWeight: "500" },
    pearlRefRow:   { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)" },
    pearlRef:      { fontSize: 10, color: "rgba(255,255,255,0.7)", fontStyle: "italic", flex: 1 },

    sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 12 },
    sectionTitle:  { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
    verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: colors.primary + "40", backgroundColor: colors.primary + "12" },
    verifiedText:  { fontSize: 10, fontWeight: "700" },
    viewAllText:   { fontSize: 13, fontWeight: "600" },

    grid:        { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10, marginBottom: 24 },
    moduleOuter: { width: "22%", flexGrow: 1 },
    moduleCard:  { padding: 12, alignItems: "center", gap: 8, ...shadow },
    moduleIcon:  { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
    moduleLabel: { fontSize: 11, fontWeight: "700", textAlign: "center", lineHeight: 14 },

    activityCard: { marginHorizontal: 20, marginBottom: 16, ...shadow },
    activityRow:  { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
    activityDot:  { width: 9, height: 9, borderRadius: 5 },
    activityTitle: { fontSize: 13, fontWeight: "600" },
    activityDate:  { fontSize: 11, marginTop: 2 },
    activityScore: { fontSize: 14, fontWeight: "800" },
    activityPct:   { fontSize: 10, marginTop: 1 },

    disclaimer:     { flexDirection: "row", alignItems: "flex-start", gap: 6, paddingHorizontal: 20, paddingTop: 4 },
    disclaimerText: { fontSize: 10.5, flex: 1, lineHeight: 16 },
  });
}
