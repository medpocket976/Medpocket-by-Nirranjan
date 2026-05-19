import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { QUIZ_SUBJECTS } from "@/data/quizData";
import { useColors } from "@/hooks/useColors";

const SUBJECT_COLORS: Record<string, string> = {
  Anatomy: "#EF4444",
  Physiology: "#F59E0B",
  Pathology: "#8B5CF6",
  Pharmacology: "#009DB5",
  Medicine: "#3B82F6",
  Surgery: "#10B981",
  Pediatrics: "#F97316",
  OBGYN: "#EC4899",
};

const SUBJECT_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  Anatomy: "box",
  Physiology: "activity",
  Pathology: "eye",
  Pharmacology: "tablet",
  Medicine: "heart",
  Surgery: "scissors",
  Pediatrics: "smile",
  OBGYN: "user",
};

export default function QuizScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { quizHistory } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const styles = makeStyles(colors);

  const subjects = QUIZ_SUBJECTS.filter((s) => s !== "All");

  const getSubjectStats = (subject: string) => {
    const results = quizHistory.filter((r) => r.subject === subject);
    if (!results.length) return null;
    const avg = results.reduce((acc, r) => acc + r.score / r.total, 0) / results.length;
    return { attempts: results.length, avg: Math.round(avg * 100) };
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Quiz</Text>
        <Text style={styles.subtitle}>Test your knowledge</Text>
      </View>

      {/* Daily Challenge */}
      <Pressable
        style={({ pressed }) => [styles.dailyCard, { opacity: pressed ? 0.9 : 1 }]}
        onPress={() => router.push("/quiz/All")}
      >
        <View>
          <View style={styles.dailyBadge}>
            <Feather name="zap" size={12} color="#fff" />
            <Text style={styles.dailyBadgeText}>Daily Challenge</Text>
          </View>
          <Text style={styles.dailyTitle}>Mixed Subject Quiz</Text>
          <Text style={styles.dailyDesc}>10 questions across all subjects</Text>
        </View>
        <View style={styles.startBtn}>
          <Feather name="play" size={16} color={colors.primary} />
        </View>
      </Pressable>

      {/* Subjects Grid */}
      <Text style={styles.sectionTitle}>By Subject</Text>
      <View style={styles.grid}>
        {subjects.map((subject) => {
          const stats = getSubjectStats(subject);
          const color = SUBJECT_COLORS[subject] || colors.primary;
          const icon = SUBJECT_ICONS[subject] || "book";
          return (
            <Pressable
              key={subject}
              style={({ pressed }) => [styles.subjectCard, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => router.push(`/quiz/${encodeURIComponent(subject)}` as any)}
            >
              <View style={[styles.subjectIcon, { backgroundColor: color + "20" }]}>
                <Feather name={icon} size={20} color={color} />
              </View>
              <Text style={styles.subjectName}>{subject}</Text>
              {stats ? (
                <View style={styles.statsRow}>
                  <Text style={[styles.avgScore, { color }]}>{stats.avg}%</Text>
                  <Text style={styles.attempts}>{stats.attempts} done</Text>
                </View>
              ) : (
                <Text style={styles.notStarted}>Not started</Text>
              )}
              {stats && (
                <View style={[styles.progressBar, { backgroundColor: color + "30" }]}>
                  <View style={[styles.progressFill, { backgroundColor: color, width: `${stats.avg}%` }]} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Quiz History */}
      {quizHistory.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Results</Text>
          <View style={styles.historyCard}>
            {quizHistory.slice(0, 5).map((result, i) => {
              const pct = Math.round((result.score / result.total) * 100);
              const color = pct >= 70 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444";
              return (
                <View
                  key={i}
                  style={[styles.historyRow, i < Math.min(quizHistory.length - 1, 4) && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                >
                  <View style={[styles.historyBadge, { backgroundColor: color + "20" }]}>
                    <Text style={[styles.historyBadgeText, { color }]}>{pct}%</Text>
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historySubject}>{result.subject}</Text>
                    <Text style={styles.historyDate}>{new Date(result.date).toLocaleDateString()}</Text>
                  </View>
                  <Text style={[styles.historyScore, { color }]}>{result.score}/{result.total}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, marginBottom: 20 },
    title: { fontSize: 28, fontWeight: "800", color: colors.foreground },
    subtitle: { fontSize: 14, color: colors.mutedForeground, marginTop: 4 },
    dailyCard: {
      marginHorizontal: 20,
      padding: 20,
      borderRadius: 18,
      backgroundColor: colors.primary,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 28,
    },
    dailyBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
      alignSelf: "flex-start",
      marginBottom: 8,
    },
    dailyBadgeText: { fontSize: 11, color: "#fff", fontWeight: "600" },
    dailyTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
    dailyDesc: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4 },
    startBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.foreground,
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 14,
      gap: 10,
      marginBottom: 28,
    },
    subjectCard: {
      width: "46%",
      flexGrow: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    subjectIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    subjectName: { fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 4 },
    statsRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
    avgScore: { fontSize: 13, fontWeight: "700" },
    attempts: { fontSize: 11, color: colors.mutedForeground },
    notStarted: { fontSize: 11, color: colors.mutedForeground, marginBottom: 6 },
    progressBar: { height: 4, borderRadius: 2, overflow: "hidden" },
    progressFill: { height: "100%", borderRadius: 2 },
    historyCard: {
      marginHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      marginBottom: 20,
    },
    historyRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      gap: 12,
    },
    historyBadge: {
      width: 44,
      height: 44,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    historyBadgeText: { fontSize: 14, fontWeight: "700" },
    historyContent: { flex: 1 },
    historySubject: { fontSize: 13, fontWeight: "600", color: colors.foreground },
    historyDate: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
    historyScore: { fontSize: 14, fontWeight: "700" },
  });
}
