import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

import SkeletonLoader from "@/components/SkeletonLoader";
import { useApp } from "@/context/AppContext";
import { QUIZ_SUBJECTS } from "@/data/quizData";
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
};

const SUBJECT_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  Anatomy:      "box",
  Physiology:   "activity",
  Pathology:    "eye",
  Pharmacology: "tablet",
  Medicine:     "heart",
  Surgery:      "scissors",
  Pediatrics:   "smile",
  OBGYN:        "user",
};

function SubjectCard({
  subject,
  stats,
  color,
  icon,
  entranceAnim,
  styles,
  colors,
}: {
  subject: string;
  stats: { attempts: number; avg: number } | null;
  color: string;
  icon: keyof typeof Feather.glyphMap;
  entranceAnim: { opacity: Animated.Value; translateY: Animated.Value };
  styles: ReturnType<typeof makeStyles>;
  colors: ReturnType<typeof useColors>;
}) {
  const scaleAnim    = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (stats) {
      Animated.timing(progressAnim, {
        toValue: stats.avg,
        duration: 700,
        delay: 400,
        useNativeDriver: false,
      }).start();
    }
  }, [stats]);

  function pressIn() {
    Animated.spring(scaleAnim, { toValue: 0.96, tension: 160, friction: 8, useNativeDriver: true }).start();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  function pressOut() {
    Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }).start();
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  return (
    <Pressable
      style={styles.subjectCardOuter}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={() => router.push(`/quiz/${encodeURIComponent(subject)}` as any)}
    >
      <Animated.View
        style={[
          styles.subjectCard,
          { backgroundColor: colors.card, borderColor: colors.border },
          {
            opacity: entranceAnim.opacity,
            transform: [{ translateY: entranceAnim.translateY }, { scale: scaleAnim }],
          },
        ]}
      >
        <View style={[styles.subjectIcon, { backgroundColor: color + "20" }]}>
          <Feather name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.subjectName, { color: colors.foreground }]}>{subject}</Text>
        {stats ? (
          <View style={styles.statsRow}>
            <Text style={[styles.avgScore, { color }]}>{stats.avg}%</Text>
            <Text style={[styles.attempts, { color: colors.mutedForeground }]}>
              {stats.attempts} {stats.attempts === 1 ? "quiz" : "quizzes"}
            </Text>
          </View>
        ) : (
          <Text style={[styles.notStarted, { color: colors.mutedForeground }]}>Not started</Text>
        )}
        {stats ? (
          <View style={[styles.progressBar, { backgroundColor: color + "25" }]}>
            <Animated.View
              style={[styles.progressFill, { backgroundColor: color, width: progressWidth }]}
            />
          </View>
        ) : (
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.border, width: "0%" }]} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

function SkeletonGrid({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 14, gap: 10, marginBottom: 28 }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View
          key={i}
          style={{
            width: "46%", flexGrow: 1,
            backgroundColor: colors.card,
            borderRadius: 16, padding: 14,
            borderWidth: 1, borderColor: colors.border,
            gap: 10,
          }}
        >
          <SkeletonLoader width={40} height={40} borderRadius={10} />
          <SkeletonLoader width={80} height={12} borderRadius={6} />
          <SkeletonLoader width="60%" height={10} borderRadius={5} />
          <SkeletonLoader width="100%" height={4} borderRadius={2} />
        </View>
      ))}
    </View>
  );
}

export default function QuizScreen() {
  const colors     = useColors();
  const insets     = useSafeAreaInsets();
  const { quizHistory } = useApp();
  const topPad     = Platform.OS === "web" ? 67 : insets.top;
  const styles     = makeStyles(colors);
  const subjects   = QUIZ_SUBJECTS.filter((s) => s !== "All");

  const [skeletonVisible, setSkeletonVisible] = useState(true);

  const headerOpacity   = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-14)).current;
  const dailyScale      = useRef(new Animated.Value(1)).current;
  const dailyOpacity    = useRef(new Animated.Value(0)).current;
  const dailyTranslateY = useRef(new Animated.Value(20)).current;

  const subjectAnims = useRef(
    subjects.map(() => ({
      opacity:    new Animated.Value(0),
      translateY: new Animated.Value(32),
    }))
  ).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSkeletonVisible(false);

      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(headerTranslateY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.timing(dailyOpacity, { toValue: 1, duration: 360, delay: 60, useNativeDriver: true }),
        Animated.spring(dailyTranslateY, { toValue: 0, tension: 65, friction: 10, delay: 60, useNativeDriver: true }),
      ]).start();

      Animated.stagger(
        55,
        subjectAnims.map((a) =>
          Animated.parallel([
            Animated.timing(a.opacity, { toValue: 1, duration: 340, useNativeDriver: true }),
            Animated.spring(a.translateY, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
          ])
        )
      ).start();
    }, 240);

    return () => clearTimeout(timer);
  }, []);

  const getSubjectStats = (subject: string) => {
    const results = quizHistory.filter((r) => r.subject === subject);
    if (!results.length) return null;
    const avg = results.reduce((acc, r) => acc + r.score / r.total, 0) / results.length;
    return { attempts: results.length, avg: Math.round(avg * 100) };
  };

  function dailyPressIn() {
    Animated.spring(dailyScale, { toValue: 0.97, tension: 160, friction: 8, useNativeDriver: true }).start();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
  function dailyPressOut() {
    Animated.spring(dailyScale, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }).start();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Quiz</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Test your knowledge</Text>
      </Animated.View>

      {/* Daily Challenge */}
      <Pressable
        onPressIn={dailyPressIn}
        onPressOut={dailyPressOut}
        onPress={() => router.push("/quiz/All")}
      >
        <Animated.View
          style={[
            styles.dailyCard,
            { backgroundColor: colors.primary },
            {
              opacity: dailyOpacity,
              transform: [{ translateY: dailyTranslateY }, { scale: dailyScale }],
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.dailyBadge}>
              <Feather name="zap" size={12} color="#fff" />
              <Text style={styles.dailyBadgeText}>Daily Challenge</Text>
            </View>
            <Text style={styles.dailyTitle}>Mixed Subject Quiz</Text>
            <Text style={styles.dailyDesc}>10 questions across all subjects</Text>
          </View>
          <View style={[styles.startBtn, { backgroundColor: "#fff" }]}>
            <Feather name="play" size={16} color={colors.primary} />
          </View>
        </Animated.View>
      </Pressable>

      {/* Subject Grid */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>By Subject</Text>
        <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
          Last updated · Jan 2026
        </Text>
      </View>

      {skeletonVisible ? (
        <SkeletonGrid colors={colors} />
      ) : (
        <View style={styles.grid}>
          {subjects.map((subject, i) => {
            const stats = getSubjectStats(subject);
            const color = SUBJECT_COLORS[subject] || colors.primary;
            const icon  = SUBJECT_ICONS[subject] || ("book" as const);
            return (
              <SubjectCard
                key={subject}
                subject={subject}
                stats={stats}
                color={color}
                icon={icon}
                entranceAnim={subjectAnims[i]}
                styles={styles}
                colors={colors}
              />
            );
          })}
        </View>
      )}

      {/* Quiz History */}
      {quizHistory.length > 0 && (
        <Animated.View style={{ opacity: headerOpacity }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Results</Text>
          </View>
          <View
            style={[
              styles.historyCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {quizHistory.slice(0, 5).map((result, i) => {
              const pct   = Math.round((result.score / result.total) * 100);
              const color = pct >= 70 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444";
              return (
                <View
                  key={i}
                  style={[
                    styles.historyRow,
                    i < Math.min(quizHistory.length - 1, 4) && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={[styles.historyBadge, { backgroundColor: color + "20" }]}>
                    <Text style={[styles.historyBadgeText, { color }]}>{pct}%</Text>
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={[styles.historySubject, { color: colors.foreground }]}>
                      {result.subject}
                    </Text>
                    <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>
                      {new Date(result.date).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </Text>
                  </View>
                  <Text style={[styles.historyScore, { color }]}>
                    {result.score}/{result.total}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  const isIOS = Platform.OS === "ios";
  const shadow = isIOS
    ? { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6 }
    : { elevation: 2 };
  return StyleSheet.create({
    container:        { flex: 1, backgroundColor: colors.background },
    header:           { paddingHorizontal: 20, marginBottom: 20 },
    title:            { fontSize: 28, fontWeight: "800" },
    subtitle:         { fontSize: 14, marginTop: 4 },
    dailyCard: {
      marginHorizontal: 20, padding: 20, borderRadius: 20,
      flexDirection: "row", justifyContent: "space-between",
      alignItems: "center", marginBottom: 28, ...shadow,
    },
    dailyBadge: {
      flexDirection: "row", alignItems: "center", gap: 4,
      backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 8,
      paddingVertical: 3, borderRadius: 20, alignSelf: "flex-start", marginBottom: 8,
    },
    dailyBadgeText:   { fontSize: 11, color: "#fff", fontWeight: "600" },
    dailyTitle:       { fontSize: 20, fontWeight: "800", color: "#fff" },
    dailyDesc:        { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4 },
    startBtn:         { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
    sectionHeader:    {
      flexDirection: "row", alignItems: "center",
      justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 12,
    },
    sectionTitle:     { fontSize: 18, fontWeight: "700" },
    sectionMeta:      { fontSize: 11 },
    grid:             { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 14, gap: 10, marginBottom: 28 },
    subjectCardOuter: { width: "46%", flexGrow: 1 },
    subjectCard: {
      borderRadius: 16, padding: 14,
      borderWidth: 1, ...shadow,
    },
    subjectIcon:      { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 10 },
    subjectName:      { fontSize: 14, fontWeight: "700", marginBottom: 4 },
    statsRow:         { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
    avgScore:         { fontSize: 13, fontWeight: "700" },
    attempts:         { fontSize: 11 },
    notStarted:       { fontSize: 11, marginBottom: 6 },
    progressBar:      { height: 4, borderRadius: 2, overflow: "hidden" },
    progressFill:     { height: "100%", borderRadius: 2 },
    historyCard: {
      marginHorizontal: 20, borderRadius: 16,
      borderWidth: 1, overflow: "hidden", marginBottom: 20,
    },
    historyRow:       { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
    historyBadge:     { width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    historyBadgeText: { fontSize: 14, fontWeight: "700" },
    historyContent:   { flex: 1 },
    historySubject:   { fontSize: 13, fontWeight: "600" },
    historyDate:      { fontSize: 11, marginTop: 2 },
    historyScore:     { fontSize: 14, fontWeight: "700" },
  });
}
