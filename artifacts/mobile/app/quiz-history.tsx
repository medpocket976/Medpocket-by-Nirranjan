import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { GlassBackground } from "@/components/GlassBackground";
import { GlassView } from "@/components/GlassView";
import {
  Alert,
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

const SUBJECT_COLORS: Record<string, string> = {
  Anatomy:      "#EF4444",
  Physiology:   "#F59E0B",
  Pathology:    "#8B5CF6",
  Pharmacology: "#009DB5",
  Medicine:     "#3B82F6",
  Surgery:      "#10B981",
  Pediatrics:   "#F97316",
  OBGYN:        "#EC4899",
  All:          "#6366F1",
};

type Filter = "All" | string;

function scoreColor(pct: number) {
  if (pct >= 70) return "#10B981";
  if (pct >= 50) return "#F59E0B";
  return "#EF4444";
}

function scoreLabel(pct: number) {
  if (pct >= 80) return "Excellent";
  if (pct >= 70) return "Good";
  if (pct >= 50) return "Average";
  return "Needs work";
}

function StatCard({
  label,
  value,
  sub,
  color,
  colors,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[statStyles.card, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={[statStyles.label, { color: colors.foreground }]}>{label}</Text>
      {sub ? <Text style={[statStyles.sub, { color: colors.mutedForeground }]}>{sub}</Text> : null}
    </View>
  );
}

export default function QuizHistoryScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { quizHistory, clearQuizHistory } = useApp();

  const [filter, setFilter] = useState<Filter>("All");
  const scrollRef = useRef<ScrollView>(null);

  const subjects = useMemo(() => {
    const seen = new Set<string>();
    quizHistory.forEach((r) => seen.add(r.subject));
    return Array.from(seen).sort();
  }, [quizHistory]);

  const filtered = useMemo(() => {
    if (filter === "All") return quizHistory;
    return quizHistory.filter((r) => r.subject === filter);
  }, [quizHistory, filter]);

  const stats = useMemo(() => {
    if (!filtered.length) return null;
    const pcts = filtered.map((r) => Math.round((r.score / r.total) * 100));
    const avg  = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
    const best = Math.max(...pcts);
    const totalQ = filtered.reduce((a, r) => a + r.total, 0);
    const correct = filtered.reduce((a, r) => a + r.score, 0);
    return { avg, best, totalQ, correct, count: filtered.length };
  }, [filtered]);

  function handleClear() {
    Alert.alert(
      "Clear History",
      "This will permanently delete all quiz results. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            clearQuizHistory();
          },
        },
      ]
    );
  }

  return (
    <GlassBackground>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.glassBg,
            borderBottomColor: colors.glassBorder,
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.muted }]}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Quiz History</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              {quizHistory.length} attempt{quizHistory.length !== 1 ? "s" : ""} recorded
            </Text>
          </View>
          {quizHistory.length > 0 && (
            <Pressable
              onPress={handleClear}
              style={[styles.clearBtn, { backgroundColor: "#EF444415" }]}
            >
              <Feather name="trash-2" size={15} color="#EF4444" />
            </Pressable>
          )}
        </View>

        {/* Subject filter chips */}
        {subjects.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {(["All", ...subjects] as Filter[]).map((s) => {
              const active = filter === s;
              const col = s === "All" ? colors.primary : (SUBJECT_COLORS[s] ?? colors.primary);
              return (
                <Pressable
                  key={s}
                  onPress={() => {
                    setFilter(s);
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? col : colors.muted,
                      borderColor: active ? col : colors.glassBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? "#fff" : colors.mutedForeground },
                    ]}
                  >
                    {s}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {quizHistory.length === 0 ? (
        /* Empty state */
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
            <Feather name="clipboard" size={34} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No quizzes yet</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Complete a quiz and your results will appear here
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={[styles.goBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.goBtnText}>Go to Quizzes</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          {/* Summary stats */}
          {stats && (
            <View style={styles.statsGrid}>
              <StatCard
                label="Avg Score"
                value={`${stats.avg}%`}
                sub={scoreLabel(stats.avg)}
                color={scoreColor(stats.avg)}
                colors={colors}
              />
              <StatCard
                label="Best Score"
                value={`${stats.best}%`}
                color={scoreColor(stats.best)}
                colors={colors}
              />
              <StatCard
                label="Quizzes"
                value={`${stats.count}`}
                sub={filter === "All" ? "all subjects" : filter}
                color={colors.primary}
                colors={colors}
              />
              <StatCard
                label="Correct"
                value={`${stats.correct}`}
                sub={`of ${stats.totalQ} Qs`}
                color="#6366F1"
                colors={colors}
              />
            </View>
          )}

          {/* Result list */}
          <View style={[styles.listCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
            {filtered.map((result, i) => {
              const pct    = Math.round((result.score / result.total) * 100);
              const col    = scoreColor(pct);
              const subCol = SUBJECT_COLORS[result.subject] ?? colors.primary;
              const isLast = i === filtered.length - 1;
              const date   = new Date(result.date);
              const dateStr = date.toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
              });
              const timeStr = date.toLocaleTimeString("en-GB", {
                hour: "2-digit", minute: "2-digit",
              });

              return (
                <View
                  key={i}
                  style={[
                    styles.row,
                    !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.glassBorder },
                  ]}
                >
                  {/* Score badge */}
                  <View style={[styles.badge, { backgroundColor: col + "18" }]}>
                    <Text style={[styles.badgePct, { color: col }]}>{pct}%</Text>
                    <Text style={[styles.badgeScore, { color: col + "BB" }]}>
                      {result.score}/{result.total}
                    </Text>
                  </View>

                  {/* Subject + date */}
                  <View style={styles.rowContent}>
                    <View style={styles.subjectRow}>
                      <View style={[styles.subjectDot, { backgroundColor: subCol }]} />
                      <Text style={[styles.subjectText, { color: colors.foreground }]}>
                        {result.subject}
                      </Text>
                    </View>
                    <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
                      {dateStr} · {timeStr}
                    </Text>
                  </View>

                  {/* Grade pill */}
                  <View style={[styles.gradePill, { backgroundColor: col + "18" }]}>
                    <Text style={[styles.gradeText, { color: col }]}>
                      {scoreLabel(pct)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {filtered.length === 0 && (
            <Text style={[styles.noMatch, { color: colors.mutedForeground }]}>
              No results for {filter}
            </Text>
          )}
        </ScrollView>
      )}
    </GlassBackground>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 2,
  },
  value: { fontSize: 22, fontWeight: "800" },
  label: { fontSize: 11, fontWeight: "600", textAlign: "center" },
  sub:   { fontSize: 10, textAlign: "center" },
});

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  headerSub:   { fontSize: 11, marginTop: 1 },
  clearBtn: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 2,
    gap: 7,
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: "600" },

  emptyWrap: {
    flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12,
  },
  emptyIcon: {
    width: 76, height: 76, borderRadius: 22,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptySub:   { fontSize: 13, textAlign: "center", lineHeight: 20 },
  goBtn: {
    marginTop: 8, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 14,
  },
  goBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  statsGrid: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },

  listCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  badge: {
    width: 54, height: 54, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  badgePct:   { fontSize: 15, fontWeight: "800" },
  badgeScore: { fontSize: 10, fontWeight: "600" },
  rowContent: { flex: 1, gap: 3 },
  subjectRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  subjectDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  subjectText: { fontSize: 13, fontWeight: "600" },
  dateText:    { fontSize: 11 },
  gradePill: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, flexShrink: 0,
  },
  gradeText: { fontSize: 10, fontWeight: "700" },
  noMatch: { textAlign: "center", marginTop: 40, fontSize: 14 },
});
