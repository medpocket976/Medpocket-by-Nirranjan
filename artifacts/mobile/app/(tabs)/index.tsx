import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
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
import { useColors } from "@/hooks/useColors";

const CLINICAL_PEARLS = [
  "Amoxicillin rash in infectious mononucleosis ≠ penicillin allergy.",
  "GCS ≤ 8 → intubate. 'Eight, intubate!'",
  "In anaphylaxis: Epinephrine IM first — never delay for antihistamines.",
  "Painless jaundice + palpable gallbladder = pancreatic head Ca (Courvoisier's law).",
  "NEVER perform vaginal exam in suspected placenta previa.",
  "Correct Na+ slowly — max 8–10 mEq/L per day to prevent osmotic demyelination.",
  "AST:ALT >2:1 with absolute <300 U/L → alcoholic hepatitis.",
  "Wells DVT score ≥3 → skip D-dimer, go straight to ultrasound.",
  "Metformin does NOT cause hypoglycemia as monotherapy.",
  "Troponin rise and fall = acute MI. Troponin alone = not diagnostic.",
  "Free gas under diaphragm on erect AXR = perforated viscus → urgent surgery.",
  "CURB-65 ≥3 → hospital admission for pneumonia.",
  "Warfarin antidote: Vitamin K for slow reversal; PCC for emergency reversal.",
  "Loop of Henle active transport: Na-K-2Cl — inhibited by furosemide.",
  "Coagulative necrosis = ischemic infarcts (except brain → liquefactive).",
];

const MODULES = [
  { id: "drug-guide", label: "Drug Guide", icon: "tablet" as const, color: "#009DB5", desc: "1000+ drugs" },
  { id: "clinical-exam", label: "Clinical Exam", icon: "activity" as const, color: "#8B5CF6", desc: "Systems" },
  { id: "emergency", label: "Emergency", icon: "alert-circle" as const, color: "#EF4444", desc: "Protocols" },
  { id: "lab-values", label: "Lab Values", icon: "bar-chart-2" as const, color: "#10B981", desc: "References" },
  { id: "calculators", label: "Calculators", icon: "sliders" as const, color: "#F59E0B", desc: "8 calculators" },
  { id: "search", label: "Search All", icon: "search" as const, color: "#6366F1", desc: "Global search" },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, streak, totalStudyDays, bookmarks, quizHistory, recordStudySession } = useApp();

  const todayPearl = CLINICAL_PEARLS[new Date().getDate() % CLINICAL_PEARLS.length];

  useEffect(() => {
    recordStudySession();
  }, []);

  const styles = makeStyles(colors);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {getTimeOfDay()},</Text>
          <Text style={styles.name}>{user.name} 👋</Text>
          <Text style={styles.subtitle}>{user.year}</Text>
        </View>
        <Pressable style={styles.searchBtn} onPress={() => router.push("/search")}>
          <Feather name="search" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard icon="zap" label="Study Streak" value={`${streak} days`} color="#F59E0B" colors={colors} />
        <StatCard icon="bookmark" label="Bookmarks" value={`${bookmarks.length}`} color="#009DB5" colors={colors} />
        <StatCard icon="check-circle" label="Quizzes" value={`${quizHistory.length}`} color="#8B5CF6" colors={colors} />
        <StatCard icon="calendar" label="Study Days" value={`${totalStudyDays}`} color="#10B981" colors={colors} />
      </View>

      {/* Daily Pearl */}
      <Pressable style={styles.pearlCard} onPress={() => {}}>
        <View style={styles.pearlHeader}>
          <View style={styles.pearlBadge}>
            <Feather name="sun" size={12} color="#fff" />
            <Text style={styles.pearlBadgeText}>Daily Pearl</Text>
          </View>
          <Text style={styles.pearlDate}>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</Text>
        </View>
        <Text style={styles.pearlText}>"{todayPearl}"</Text>
      </Pressable>

      {/* Modules Grid */}
      <Text style={styles.sectionTitle}>Quick Access</Text>
      <View style={styles.grid}>
        {MODULES.map((mod) => (
          <Pressable
            key={mod.id}
            style={({ pressed }) => [styles.moduleCard, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push(`/${mod.id}` as any)}
          >
            <View style={[styles.moduleIcon, { backgroundColor: mod.color + "20" }]}>
              <Feather name={mod.icon} size={22} color={mod.color} />
            </View>
            <Text style={styles.moduleLabel}>{mod.label}</Text>
            <Text style={styles.moduleDesc}>{mod.desc}</Text>
          </Pressable>
        ))}
      </View>

      {/* Recent Quiz */}
      {quizHistory.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            {quizHistory.slice(0, 3).map((result, i) => (
              <View key={i} style={[styles.activityRow, i < 2 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={styles.activityLeft}>
                  <View style={[styles.activityDot, { backgroundColor: result.score / result.total >= 0.6 ? "#10B981" : "#EF4444" }]} />
                  <View>
                    <Text style={styles.activityTitle}>{result.subject} Quiz</Text>
                    <Text style={styles.activityDate}>{new Date(result.date).toLocaleDateString()}</Text>
                  </View>
                </View>
                <Text style={[styles.activityScore, { color: result.score / result.total >= 0.6 ? "#10B981" : "#EF4444" }]}>
                  {result.score}/{result.total}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Feather name="info" size={12} color={colors.mutedForeground} />
        <Text style={styles.disclaimerText}>
          For educational purposes only. Not a substitute for clinical judgment.
        </Text>
      </View>
    </ScrollView>
  );
}

function StatCard({
  icon, label, value, color, colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  color: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[statStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon} size={14} color={color} />
      <Text style={[statStyles.value, { color: colors.foreground }]}>{value}</Text>
      <Text style={[statStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
  },
  value: { fontSize: 14, fontWeight: "700" },
  label: { fontSize: 9, textAlign: "center" },
});

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    greeting: { fontSize: 14, color: colors.mutedForeground },
    name: { fontSize: 24, fontWeight: "700", color: colors.foreground, marginTop: 2 },
    subtitle: { fontSize: 12, color: colors.primary, marginTop: 2 },
    searchBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.tealLight,
      alignItems: "center",
      justifyContent: "center",
    },
    statsRow: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    pearlCard: {
      marginHorizontal: 20,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.primary,
      marginBottom: 24,
    },
    pearlHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    pearlBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(255,255,255,0.25)",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
    },
    pearlBadgeText: { fontSize: 11, color: "#fff", fontWeight: "600" },
    pearlDate: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
    pearlText: { fontSize: 14, color: "#fff", lineHeight: 22, fontStyle: "italic" },
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
      paddingHorizontal: 16,
      gap: 10,
      marginBottom: 24,
    },
    moduleCard: {
      width: "30%",
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      gap: 6,
      flexGrow: 1,
    },
    moduleIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    moduleLabel: { fontSize: 12, fontWeight: "600", color: colors.foreground, textAlign: "center" },
    moduleDesc: { fontSize: 10, color: colors.mutedForeground, textAlign: "center" },
    activityCard: {
      marginHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
      overflow: "hidden",
    },
    activityRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 14,
    },
    activityLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    activityDot: { width: 8, height: 8, borderRadius: 4 },
    activityTitle: { fontSize: 13, fontWeight: "600", color: colors.foreground },
    activityDate: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
    activityScore: { fontSize: 14, fontWeight: "700" },
    disclaimer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
    disclaimerText: {
      fontSize: 10,
      color: colors.mutedForeground,
      flex: 1,
      lineHeight: 14,
    },
  });
}
