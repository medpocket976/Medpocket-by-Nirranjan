import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import SkeletonLoader from "@/components/SkeletonLoader";
import { useApp } from "@/context/AppContext";
import { QUIZ_SUBJECTS } from "@/data/quizData";
import { EXPANDED_QUIZ_SUBJECTS } from "@/data/quizDataExpanded";
import { useColors } from "@/hooks/useColors";

// All subjects: core + expanded (excluding "All")
const ALL_SUBJECTS = [
  ...QUIZ_SUBJECTS.filter((s) => s !== "All"),
  ...EXPANDED_QUIZ_SUBJECTS,
];

const SUBJECT_META: Record<string, { color: string; icon: keyof typeof Feather.glyphMap; group: string }> = {
  // Core medical
  Anatomy:      { color: "#EF4444", icon: "box",          group: "Core Medical" },
  Physiology:   { color: "#F59E0B", icon: "activity",     group: "Core Medical" },
  Biochemistry: { color: "#10B981", icon: "cpu",          group: "Core Medical" },
  Pathology:    { color: "#8B5CF6", icon: "eye",          group: "Core Medical" },
  Pharmacology: { color: "#009DB5", icon: "tablet",       group: "Core Medical" },
  Microbiology: { color: "#F97316", icon: "disc",         group: "Core Medical" },
  // Clinical
  Medicine:         { color: "#3B82F6", icon: "heart",       group: "Clinical Sciences" },
  Surgery:          { color: "#10B981", icon: "scissors",     group: "Clinical Sciences" },
  Pediatrics:       { color: "#F97316", icon: "smile",        group: "Clinical Sciences" },
  OBGYN:            { color: "#EC4899", icon: "user",         group: "Clinical Sciences" },
  Cardiology:       { color: "#EF4444", icon: "heart",        group: "Clinical Sciences" },
  Neurology:        { color: "#6366F1", icon: "zap",          group: "Clinical Sciences" },
  Orthopedics:      { color: "#84CC16", icon: "grid",         group: "Clinical Sciences" },
  // Emergency & Critical
  "Emergency Medicine": { color: "#EF4444", icon: "alert-triangle", group: "Emergency & Critical" },
  Anesthesiology:       { color: "#7C3AED", icon: "wind",           group: "Emergency & Critical" },
  "Critical Care":      { color: "#DC2626", icon: "monitor",        group: "Emergency & Critical" },
  // Interpretation
  ECG:          { color: "#009DB5", icon: "activity",    group: "Interpretation" },
  ABG:          { color: "#0EA5E9", icon: "droplet",     group: "Interpretation" },
  "IV Fluids":  { color: "#06B6D4", icon: "thermometer", group: "Interpretation" },
  "Drug Calculations": { color: "#8B5CF6", icon: "hash",    group: "Interpretation" },
  // Allied & OT
  "Operation Theatre Technology": { color: "#10B981", icon: "tool",    group: "Allied & OT" },
  CSSD:                            { color: "#6366F1", icon: "shield",  group: "Allied & OT" },
  "Infection Control":             { color: "#F59E0B", icon: "lock",    group: "Allied & OT" },
  "Biomedical Waste Management":   { color: "#84CC16", icon: "trash-2", group: "Allied & OT" },
  "Medical Instruments":           { color: "#EC4899", icon: "scissors", group: "Allied & OT" },
  "Surgical Instruments":          { color: "#F97316", icon: "git-merge", group: "Allied & OT" },
  // General
  "Medical Terminology": { color: "#A855F7", icon: "book",      group: "General" },
  "Clinical Procedures": { color: "#14B8A6", icon: "clipboard", group: "General" },
};

function getMeta(subject: string) {
  return SUBJECT_META[subject] ?? { color: "#009DB5", icon: "circle" as const, group: "General" };
}

interface SubjectStats { attempts: number; avg: number }

// ─── Subject card ─────────────────────────────────────────────────────────────
const SubjectCard = memo(function SubjectCard({
  subject, stats, entranceAnim, colors, styles,
}: {
  subject: string;
  stats: SubjectStats | null;
  entranceAnim: { opacity: Animated.Value; translateY: Animated.Value };
  colors: ReturnType<typeof useColors>;
  styles: ReturnType<typeof makeStyles>;
}) {
  const { color, icon } = getMeta(subject);
  const scaleAnim    = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (stats) {
      Animated.timing(progressAnim, { toValue: stats.avg, duration: 700, delay: 400, useNativeDriver: false }).start();
    }
  }, [stats?.avg]);

  const pressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.95, tension: 160, friction: 8, useNativeDriver: true }).start();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);
  const pressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }).start();
  }, []);
  const handlePress = useCallback(() => router.push(`/quiz/${encodeURIComponent(subject)}` as any), [subject]);

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"], extrapolate: "clamp" });

  return (
    <Pressable style={styles.subjectOuter} onPressIn={pressIn} onPressOut={pressOut} onPress={handlePress}
      accessibilityRole="button" accessibilityLabel={`${subject} quiz`}>
      <Animated.View style={{
        opacity: entranceAnim.opacity,
        transform: [{ translateY: entranceAnim.translateY }, { scale: scaleAnim }],
      }}>
        <GlassView style={styles.subjectCard} radius={18}>
          <View style={[styles.subjectIcon, { backgroundColor: color + "20" }]}>
            <Feather name={icon} size={18} color={color} />
          </View>
          <Text style={[styles.subjectName, { color: colors.foreground }]} numberOfLines={2}>{subject}</Text>
          {stats ? (
            <>
              <View style={styles.statsRow}>
                <Text style={[styles.avgScore, { color }]}>{stats.avg}%</Text>
                <Text style={[styles.attempts, { color: colors.mutedForeground }]}>
                  {stats.attempts}×
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: color }]} />
              </View>
            </>
          ) : (
            <Text style={[styles.notStarted, { color: colors.mutedForeground }]}>Not started</Text>
          )}
        </GlassView>
      </Animated.View>
    </Pressable>
  );
});

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function QuizScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 16 : insets.top;
  const { quizHistory } = useApp();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [ready, setReady] = useState(false);
  const [activeGroup, setActiveGroup] = useState("Core Medical");

  const groups = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const s of ALL_SUBJECTS) {
      const g = getMeta(s).group;
      if (!seen.has(g)) { seen.add(g); list.push(g); }
    }
    return list;
  }, []);

  const subjectsInGroup = useMemo(
    () => ALL_SUBJECTS.filter((s) => getMeta(s).group === activeGroup),
    [activeGroup]
  );

  const statsMap = useMemo<Record<string, SubjectStats>>(() => {
    const map: Record<string, SubjectStats> = {};
    for (const r of quizHistory) {
      const pct = Math.round((r.score / r.total) * 100);
      if (!map[r.subject]) map[r.subject] = { attempts: 0, avg: 0 };
      const prev = map[r.subject];
      map[r.subject] = { attempts: prev.attempts + 1, avg: Math.round((prev.avg * prev.attempts + pct) / (prev.attempts + 1)) };
    }
    return map;
  }, [quizHistory]);

  const entranceAnims = useRef(
    Array.from({ length: subjectsInGroup.length + 5 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(16),
    }))
  ).current;

  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    Animated.timing(headerFade, { toValue: 1, duration: 380, useNativeDriver: true }).start();
    entranceAnims.forEach((anim, i) => {
      const delay = 60 + i * 45;
      Animated.parallel([
        Animated.timing(anim.opacity,    { toValue: 1, duration: 320, delay, useNativeDriver: true }),
        Animated.spring(anim.translateY, { toValue: 0, tension: 100, friction: 10, delay, useNativeDriver: true }),
      ]).start();
    });
  }, [ready, activeGroup]);

  const recentResults = quizHistory.slice(-5).reverse();

  const totalAttempts = quizHistory.length;
  const overallAvg = totalAttempts > 0
    ? Math.round((quizHistory.reduce((a, r) => a + r.score / r.total, 0) / totalAttempts) * 100)
    : 0;

  return (
    <GlassBackground>
      <ScrollView contentContainerStyle={{ paddingTop: topPad + 12, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerFade }]}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Quiz</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {ALL_SUBJECTS.length} subjects · {totalAttempts} quizzes taken
            </Text>
          </View>
          <Pressable onPress={() => router.push("/quiz-history" as any)} accessibilityLabel="View quiz history">
            <GlassView style={styles.historyBtn} radius={14}>
              <Feather name="clock" size={16} color={colors.primary} />
            </GlassView>
          </Pressable>
        </Animated.View>

        {/* Daily Challenge */}
        <View style={styles.dailyWrap}>
          <LinearGradient colors={["#009DB5", "#00B4CC", "#00C6D8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.dailyCard}>
            <View>
              <View style={styles.dailyBadge}>
                <Feather name="zap" size={11} color="#fff" />
                <Text style={styles.dailyBadgeText}>Daily Challenge</Text>
              </View>
              <Text style={styles.dailyTitle}>Mixed Subjects</Text>
              <Text style={styles.dailyDesc}>10 random questions · All topics</Text>
              {overallAvg > 0 && (
                <Text style={styles.dailyAvg}>Your average: {overallAvg}%</Text>
              )}
            </View>
            <Pressable
              onPress={() => router.push(`/quiz/${encodeURIComponent("All")}` as any)}
              style={styles.startBtn}
              accessibilityLabel="Start daily challenge"
            >
              <GlassView style={styles.startBtnInner} radius={24} bgColor="rgba(255,255,255,0.25)" borderColor="rgba(255,255,255,0.4)">
                <Feather name="play" size={20} color="#fff" />
              </GlassView>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Overall stats strip */}
        {totalAttempts > 0 && (
          <View style={styles.statsStrip}>
            {[
              { label: "Quizzes", value: totalAttempts.toString(), icon: "check-circle" as const, color: colors.success },
              { label: "Avg Score", value: `${overallAvg}%`, icon: "trending-up" as const, color: colors.primary },
              { label: "Subjects", value: Object.keys(statsMap).length.toString(), icon: "layers" as const, color: "#8B5CF6" },
            ].map((s) => (
              <GlassView key={s.label} style={styles.stripCard} radius={16}>
                <Feather name={s.icon} size={14} color={s.color} />
                <Text style={[styles.stripValue, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.stripLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </GlassView>
            ))}
          </View>
        )}

        {/* Group filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupScroll} contentContainerStyle={styles.groupContent}>
          {groups.map((g) => (
            <Pressable key={g} onPress={() => { setActiveGroup(g); if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
              <View style={[
                styles.groupPill,
                activeGroup === g
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorder },
              ]}>
                <Text style={[styles.groupPillText, { color: activeGroup === g ? "#fff" : colors.mutedForeground }]}>
                  {g}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Section label */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{activeGroup}</Text>
          <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
            {subjectsInGroup.length} subjects
          </Text>
        </View>

        {/* Subject grid */}
        {!ready
          ? (
            <View style={styles.grid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View key={i} style={styles.subjectOuter}>
                  <SkeletonLoader width="100%" height={110} borderRadius={18} />
                </View>
              ))}
            </View>
          )
          : (
            <View style={styles.grid}>
              {subjectsInGroup.map((subject, i) => (
                <SubjectCard
                  key={subject}
                  subject={subject}
                  stats={statsMap[subject] ?? null}
                  entranceAnim={entranceAnims[i] ?? { opacity: new Animated.Value(1), translateY: new Animated.Value(0) }}
                  colors={colors}
                  styles={styles}
                />
              ))}
            </View>
          )}

        {/* Recent results */}
        {recentResults.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 8 }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Results</Text>
              <Pressable onPress={() => router.push("/quiz-history" as any)}>
                <Text style={[{ color: colors.primary, fontSize: 13, fontWeight: "600" }]}>View all →</Text>
              </Pressable>
            </View>
            <GlassView style={styles.historyCard} radius={20}>
              {recentResults.map((r, i) => {
                const pct = Math.round((r.score / r.total) * 100);
                const col = pct >= 70 ? colors.success : pct >= 50 ? colors.warning : colors.critical;
                const { color } = getMeta(r.subject);
                return (
                  <View key={i} style={[styles.histRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border + "60" }]}>
                    <View style={[styles.histBadge, { backgroundColor: color + "18" }]}>
                      <Text style={[styles.histBadgeText, { color }]}>{pct}%</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.histSubject, { color: colors.foreground }]}>{r.subject}</Text>
                      <Text style={[styles.histDate, { color: colors.mutedForeground }]}>
                        {new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </Text>
                    </View>
                    <Text style={[styles.histScore, { color: col }]}>{r.score}/{r.total}</Text>
                  </View>
                );
              })}
            </GlassView>
          </>
        )}
      </ScrollView>
    </GlassBackground>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  const shadow = Platform.OS === "ios"
    ? { shadowColor: colors.glassShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16 }
    : { elevation: 3 };
  return StyleSheet.create({
    header:     { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 18 },
    title:      { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
    subtitle:   { fontSize: 13, marginTop: 4, fontWeight: "500" },
    historyBtn: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },

    dailyWrap: { marginHorizontal: 20, marginBottom: 16, borderRadius: 22, overflow: "hidden", ...shadow },
    dailyCard: { padding: 20, borderRadius: 22, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    dailyBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.22)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start", marginBottom: 8 },
    dailyBadgeText: { fontSize: 11, color: "#fff", fontWeight: "700" },
    dailyTitle:     { fontSize: 22, fontWeight: "800", color: "#fff" },
    dailyDesc:      { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4 },
    dailyAvg:       { fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 6, fontWeight: "600" },
    startBtn:       { padding: 4 },
    startBtnInner:  { width: 52, height: 52, alignItems: "center", justifyContent: "center" },

    statsStrip: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 16 },
    stripCard:  { flex: 1, alignItems: "center", paddingVertical: 12, gap: 3, ...shadow },
    stripValue: { fontSize: 17, fontWeight: "800" },
    stripLabel: { fontSize: 10, fontWeight: "600" },

    groupScroll:   { marginBottom: 14 },
    groupContent:  { paddingHorizontal: 20, gap: 8 },
    groupPill:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    groupPillText: { fontSize: 12, fontWeight: "700" },

    sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 12 },
    sectionTitle:  { fontSize: 17, fontWeight: "800", letterSpacing: -0.2 },
    sectionMeta:   { fontSize: 12, fontWeight: "500" },

    grid:         { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 14, gap: 10, marginBottom: 24 },
    subjectOuter: { width: "46%", flexGrow: 1 },
    subjectCard:  { padding: 14, ...shadow },
    subjectIcon:  { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8 },
    subjectName:  { fontSize: 13, fontWeight: "700", marginBottom: 4, lineHeight: 18 },
    statsRow:     { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 },
    avgScore:     { fontSize: 13, fontWeight: "800" },
    attempts:     { fontSize: 11, fontWeight: "500" },
    notStarted:   { fontSize: 11, marginBottom: 8 },
    progressBar:  { height: 4, borderRadius: 2, overflow: "hidden" },
    progressFill: { height: "100%", borderRadius: 2 },

    historyCard: { marginHorizontal: 20, marginBottom: 20, ...shadow },
    histRow:     { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
    histBadge:   { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    histBadgeText: { fontSize: 13, fontWeight: "800" },
    histSubject:   { fontSize: 13, fontWeight: "600" },
    histDate:      { fontSize: 11, marginTop: 2 },
    histScore:     { fontSize: 14, fontWeight: "800" },
  });
}
