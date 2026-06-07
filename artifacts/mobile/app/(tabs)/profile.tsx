import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
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
import type { Bookmark, QuizResult } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

// ─── Discipline data ──────────────────────────────────────────────────────────
const DISCIPLINE_CATEGORIES = [
  { key: "medical",   label: "Medical",        icon: "activity" as const, color: "#009DB5",
    years: ["MBBS 1st Year","MBBS 2nd Year","MBBS 3rd Year","MBBS 4th Year","MBBS Final Year","MBBS Intern"] },
  { key: "nursing",   label: "Nursing",         icon: "heart"    as const, color: "#EC4899",
    years: ["GNM 1st Year","GNM 2nd Year","GNM 3rd Year","BSc Nursing 1st Year","BSc Nursing 2nd Year","BSc Nursing 3rd Year","BSc Nursing 4th Year","Post Basic BSc Nursing","MSc Nursing"] },
  { key: "pharmacy",  label: "Pharmacy",        icon: "tablet"   as const, color: "#8B5CF6",
    years: ["D.Pharm 1st Year","D.Pharm 2nd Year","B.Pharm 1st Year","B.Pharm 2nd Year","B.Pharm 3rd Year","B.Pharm 4th Year","M.Pharm","Pharm.D"] },
  { key: "physio",    label: "Physiotherapy",   icon: "zap"      as const, color: "#F59E0B",
    years: ["BPT 1st Year","BPT 2nd Year","BPT 3rd Year","BPT 4th Year","MPT"] },
  { key: "dental",    label: "Dental",          icon: "smile"    as const, color: "#10B981",
    years: ["BDS 1st Year","BDS 2nd Year","BDS 3rd Year","BDS 4th Year","BDS Intern","MDS"] },
  { key: "pg",        label: "PG / Consultant", icon: "award"    as const, color: "#6366F1",
    years: ["Resident (PG Year 1)","Resident (PG Year 2)","Resident (PG Year 3)","Fellow","Consultant / Specialist"] },
];

function findCatForYear(year: string) {
  return DISCIPLINE_CATEGORIES.find((c) => c.years.includes(year))?.key ?? "medical";
}

// ─── Bookmark type helpers ───────────────────────────────────────────────────
const BOOKMARK_TYPE_META: Record<
  Bookmark["type"],
  { icon: keyof typeof Feather.glyphMap; color: string; label: string; getRoute: (id: string) => string }
> = {
  drug:      { icon: "tablet",      color: "#009DB5", label: "Drug",      getRoute: (id) => `/drug-guide/${id}` },
  lab:       { icon: "bar-chart-2", color: "#10B981", label: "Lab",       getRoute: ()   => `/lab-values` },
  emergency: { icon: "alert-circle",color: "#EF4444", label: "Protocol",  getRoute: (id) => `/emergency/${id}` },
  exam:      { icon: "activity",    color: "#8B5CF6", label: "Exam",      getRoute: (id) => `/clinical-exam/${id}` },
  question:  { icon: "help-circle", color: "#F59E0B", label: "Quiz",      getRoute: ()   => `/quiz` },
};

// ─── Streak dots (simulate last 7 days from streak count) ───────────────────
function StreakDots({ streak, color }: { streak: number; color: string }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date().getDay(); // 0=Sun,1=Mon,...
  const todayIdx = today === 0 ? 6 : today - 1;

  return (
    <View style={streakStyles.dotsRow}>
      {days.map((label, i) => {
        // Count back from today: i is Mon-Sun index, todayIdx is today
        const daysAgo = (todayIdx - i + 7) % 7;
        const active = daysAgo < streak;
        const isToday = i === todayIdx;
        return (
          <View key={i} style={streakStyles.dotWrap}>
            <View
              style={[
                streakStyles.dot,
                {
                  backgroundColor: active ? color : color + "20",
                  borderWidth: isToday ? 2 : 0,
                  borderColor: isToday ? color : "transparent",
                },
              ]}
            />
            <Text style={[streakStyles.dayLabel, { color: color + (active ? "CC" : "50") }]}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Quiz score bar ──────────────────────────────────────────────────────────
function QuizBar({ result, colors }: { result: QuizResult; colors: ReturnType<typeof useColors> }) {
  const pct = result.total > 0 ? (result.score / result.total) * 100 : 0;
  const barAnim = useRef(new Animated.Value(0)).current;
  const color = pct >= 75 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444";

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: pct / 100,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, []);

  const date = new Date(result.date);
  const dateStr = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <View style={quizStyles.row}>
      <View style={quizStyles.info}>
        <Text style={[quizStyles.subject, { color: colors.foreground }]} numberOfLines={1}>
          {result.subject}
        </Text>
        <Text style={[quizStyles.date, { color: colors.mutedForeground }]}>{dateStr}</Text>
      </View>
      <View style={quizStyles.barCol}>
        <View style={[quizStyles.barBg, { backgroundColor: colors.muted }]}>
          <Animated.View
            style={[
              quizStyles.barFill,
              {
                backgroundColor: color,
                width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
              },
            ]}
          />
        </View>
        <Text style={[quizStyles.score, { color }]}>
          {result.score}/{result.total} · {Math.round(pct)}%
        </Text>
      </View>
    </View>
  );
}

// ─── Animated pressable ──────────────────────────────────────────────────────
function SettingPressable({
  children, style, onPress, scale = 0.98,
}: {
  children: React.ReactNode; style?: any; onPress?: () => void; scale?: number;
}) {
  const anim = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPressIn={() => Animated.spring(anim, { toValue: scale, tension: 160, friction: 8, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(anim, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }).start()}
      onPress={onPress}
    >
      <Animated.View style={[style, { transform: [{ scale: anim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ stat, index, colors, s }: {
  stat: { icon: keyof typeof Feather.glyphMap; label: string; value: number; unit: string; color: string };
  index: number; colors: ReturnType<typeof useColors>; s: ReturnType<typeof makeStyles>;
}) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const scale      = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, delay: 300 + index * 55, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, tension: 65, friction: 10, delay: 300 + index * 55, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Pressable
      style={s.statCardOuter}
      onPressIn={() => Animated.spring(scale, { toValue: 0.93, tension: 160, friction: 8, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }).start()}
    >
      <Animated.View style={[s.statCard, { backgroundColor: colors.card }, { opacity, transform: [{ translateY }, { scale }] }]}>
        <View style={[s.statIconWrap, { backgroundColor: stat.color + "15" }]}>
          <Feather name={stat.icon} size={15} color={stat.color} />
        </View>
        <Text style={[s.statValue, { color: colors.foreground }]}>{stat.value}</Text>
        <Text style={[s.statUnit, { color: stat.color }]}>{stat.unit}</Text>
        <Text style={[s.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
const SECTION_COUNT = 7;

export default function ProfileScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const router  = useRouter();
  const {
    user, updateUser,
    bookmarks, notes, quizHistory, streak, totalStudyDays,
    signOut, removeBookmark,
    theme, setTheme,
  } = useApp();

  const [editing,          setEditing]          = useState(false);
  const [nameInput,        setNameInput]         = useState(user.name);
  const [collegeInput,     setCollegeInput]      = useState(user.college);
  const [selectedCat,      setSelectedCat]       = useState(() => findCatForYear(user.year));
  const [showYearPicker,   setShowYearPicker]    = useState(false);
  const [showAllBookmarks, setShowAllBookmarks]  = useState(false);
  const [showAllQuiz,      setShowAllQuiz]       = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const sectionAnims = useRef(
    Array.from({ length: SECTION_COUNT }, () => ({
      opacity:    new Animated.Value(0),
      translateY: new Animated.Value(20),
    }))
  ).current;

  const savePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(
      80,
      sectionAnims.map((a) =>
        Animated.parallel([
          Animated.timing(a.opacity,    { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(a.translateY, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
        ])
      )
    ).start();
  }, []);

  function animStyle(i: number) {
    return { opacity: sectionAnims[i].opacity, transform: [{ translateY: sectionAnims[i].translateY }] };
  }

  function saveProfile() {
    updateUser({ name: nameInput.trim() || "Medical Student", college: collegeInput.trim() });
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(savePulse, { toValue: 1.06, tension: 200, friction: 6, useNativeDriver: true }),
      Animated.spring(savePulse, { toValue: 1,    tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
  }

  function handleSignOut() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Reset App Data",
      "This will clear all your profile, bookmarks, notes, and quiz history. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset Everything", style: "destructive", onPress: () => signOut() },
      ]
    );
  }

  function cycleTheme() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next: Record<string, "system" | "light" | "dark"> = { system: "light", light: "dark", dark: "system" };
    setTheme(next[theme]);
  }

  function handleBookmarkPress(bk: Bookmark) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const meta = BOOKMARK_TYPE_META[bk.type];
    router.push(meta.getRoute(bk.itemId) as any);
  }

  function handleDeleteBookmark(bk: Bookmark) {
    Alert.alert("Remove Bookmark", `Remove "${bk.name}" from bookmarks?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeBookmark(bk.itemId) },
    ]);
  }

  const avgScore = quizHistory.length > 0
    ? Math.round((quizHistory.reduce((a, r) => a + r.score / r.total, 0) / quizHistory.length) * 100)
    : 0;

  const currentCat  = DISCIPLINE_CATEGORIES.find((c) => c.key === selectedCat)!;
  const s           = makeStyles(colors, topPad);
  const themeLabel  = { system: "System Default", light: "Light Mode", dark: "Dark Mode" }[theme];
  const themeIcon: "sun" | "moon" | "smartphone" =
    theme === "light" ? "sun" : theme === "dark" ? "moon" : "smartphone";

  const STATS = [
    { icon: "zap"          as const, label: "Streak",     value: streak,             unit: "days",  color: "#F59E0B" },
    { icon: "calendar"     as const, label: "Study Days", value: totalStudyDays,     unit: "total", color: "#3B82F6" },
    { icon: "bookmark"     as const, label: "Bookmarks",  value: bookmarks.length,   unit: "saved", color: "#009DB5" },
    { icon: "check-circle" as const, label: "Quizzes",    value: quizHistory.length, unit: "taken", color: "#10B981" },
    { icon: "bar-chart-2"  as const, label: "Avg Score",  value: avgScore,           unit: "%",     color: "#EC4899" },
    { icon: "file-text"    as const, label: "Notes",      value: notes.length,       unit: "saved", color: "#8B5CF6" },
  ];

  const visibleBookmarks = showAllBookmarks ? bookmarks : bookmarks.slice(0, 3);
  const visibleQuiz = showAllQuiz ? quizHistory : quizHistory.slice(0, 4);

  return (
    <Animated.ScrollView
      style={[s.container]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Section 0 — Page title ── */}
      <Animated.View style={[s.headerBlock, animStyle(0)]}>
        <Text style={s.pageTitle}>Profile</Text>
      </Animated.View>

      {/* ── Section 1 — Identity card ── */}
      <Animated.View style={[{ marginBottom: 24 }, animStyle(1)]}>
        <View style={s.identityCard}>
          <View style={[s.avatar, { backgroundColor: currentCat.color }]}>
            <Text style={s.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>

          {editing ? (
            <View style={s.editBlock}>
              <Text style={[s.iosLabel, { color: colors.mutedForeground }]}>FULL NAME</Text>
              <TextInput
                style={[s.iosInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
                value={nameInput} onChangeText={setNameInput}
                placeholder="Your name" placeholderTextColor={colors.mutedForeground} autoFocus
              />
              <Text style={[s.iosLabel, { marginTop: 10, color: colors.mutedForeground }]}>COLLEGE / INSTITUTION</Text>
              <TextInput
                style={[s.iosInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
                value={collegeInput} onChangeText={setCollegeInput}
                placeholder="e.g. AIIMS Delhi (optional)" placeholderTextColor={colors.mutedForeground}
              />
              <View style={s.editActions}>
                <Pressable style={[s.editActionBtn, { backgroundColor: colors.muted }]} onPress={() => setEditing(false)}>
                  <Text style={[s.editActionText, { color: colors.foreground }]}>Cancel</Text>
                </Pressable>
                <Animated.View style={[{ flex: 1 }, { transform: [{ scale: savePulse }] }]}>
                  <Pressable style={[s.editActionBtn, { backgroundColor: colors.primary }]} onPress={saveProfile}>
                    <Text style={[s.editActionText, { color: "#fff" }]}>Save</Text>
                  </Pressable>
                </Animated.View>
              </View>
            </View>
          ) : (
            <View style={s.identityInfo}>
              <Text style={[s.userName, { color: colors.foreground }]}>{user.name}</Text>
              <View style={[s.yearPill, { backgroundColor: currentCat.color + "18" }]}>
                <Feather name={currentCat.icon} size={11} color={currentCat.color} />
                <Text style={[s.yearPillText, { color: currentCat.color }]}>{user.year}</Text>
              </View>
              {user.college.length > 0 && (
                <Text style={[s.college, { color: colors.mutedForeground }]}>{user.college}</Text>
              )}
              <SettingPressable style={[s.editBtn, { backgroundColor: colors.tealLight }]} onPress={() => setEditing(true)} scale={0.94}>
                <Feather name="edit-2" size={12} color={colors.primary} />
                <Text style={[s.editBtnText, { color: colors.primary }]}>Edit Profile</Text>
              </SettingPressable>
            </View>
          )}
        </View>

        {/* Discipline + year picker */}
        {!editing && (
          <>
            <Text style={[s.sectionHeader, { color: colors.mutedForeground }]}>DISCIPLINE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
              {DISCIPLINE_CATEGORIES.map((cat) => {
                const active = selectedCat === cat.key;
                return (
                  <Pressable
                    key={cat.key}
                    style={[s.catChip, active ? { backgroundColor: cat.color, borderColor: cat.color } : { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => { setSelectedCat(cat.key); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  >
                    <Feather name={cat.icon} size={12} color={active ? "#fff" : cat.color} />
                    <Text style={[s.catChipText, { color: active ? "#fff" : colors.foreground }]}>{cat.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Text style={[s.sectionHeader, { color: colors.mutedForeground }]}>COURSE / YEAR</Text>
            <Pressable style={[s.iosGrouped, s.shadow]} onPress={() => setShowYearPicker(!showYearPicker)}>
              <View style={[s.iosRow, { backgroundColor: colors.card, borderRadius: 14 }]}>
                <View style={[s.settingIconWrap, { backgroundColor: currentCat.color + "18" }]}>
                  <Feather name={currentCat.icon} size={15} color={currentCat.color} />
                </View>
                <Text style={[s.iosRowText, { flex: 1, color: colors.foreground }]}>{user.year}</Text>
                <Feather name={showYearPicker ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
              </View>
            </Pressable>
            {showYearPicker && (
              <View style={[s.iosGroupedBelow, { backgroundColor: colors.card }]}>
                {currentCat.years.map((y, i) => {
                  const sel = user.year === y;
                  return (
                    <Pressable
                      key={y}
                      style={({ pressed }) => [s.iosRow, i > 0 && s.iosRowBorder, { backgroundColor: colors.card, opacity: pressed ? 0.6 : 1 }]}
                      onPress={() => { updateUser({ year: y }); setShowYearPicker(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    >
                      <Text style={[s.iosRowText, { flex: 1, color: sel ? currentCat.color : colors.foreground, fontWeight: sel ? "700" : "400" }]}>{y}</Text>
                      {sel && <Feather name="check" size={16} color={currentCat.color} />}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}
      </Animated.View>

      {/* ── Section 2 — Streak Card ── */}
      <Animated.View style={[{ marginBottom: 28 }, animStyle(2)]}>
        <Text style={[s.sectionHeader, { color: colors.mutedForeground }]}>STREAK</Text>
        <View style={[s.streakCard, { backgroundColor: colors.card }]}>
          <View style={s.streakTop}>
            <View>
              <View style={s.streakRow}>
                <Text style={s.streakFire}>🔥</Text>
                <Text style={[s.streakNumber, { color: colors.foreground }]}>{streak}</Text>
                <Text style={[s.streakUnit, { color: colors.mutedForeground }]}>
                  {streak === 1 ? "day streak" : "day streak"}
                </Text>
              </View>
              <Text style={[s.streakSub, { color: colors.mutedForeground }]}>
                {totalStudyDays} total study days
              </Text>
            </View>
            <View style={[s.streakBadge, { backgroundColor: streak >= 7 ? "#F59E0B18" : colors.muted }]}>
              <Feather
                name={streak >= 7 ? "award" : "calendar"}
                size={18}
                color={streak >= 7 ? "#F59E0B" : colors.mutedForeground}
              />
              {streak >= 7 && (
                <Text style={s.streakBadgeText}>🏆</Text>
              )}
            </View>
          </View>
          <StreakDots streak={streak} color="#F59E0B" />
        </View>
      </Animated.View>

      {/* ── Section 3 — Stats ── */}
      <Animated.View style={[{ marginBottom: 28 }, animStyle(3)]}>
        <Text style={[s.sectionHeader, { color: colors.mutedForeground }]}>STUDY STATS</Text>
        <View style={s.statsGrid}>
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} colors={colors} s={s} />
          ))}
        </View>
      </Animated.View>

      {/* ── Section 4 — Bookmarks ── */}
      <Animated.View style={[{ marginBottom: 28 }, animStyle(4)]}>
        <View style={s.sectionRowHeader}>
          <Text style={[s.sectionHeader, { color: colors.mutedForeground, marginBottom: 0 }]}>BOOKMARKS</Text>
          {bookmarks.length > 3 && (
            <Pressable onPress={() => setShowAllBookmarks((v) => !v)}>
              <Text style={[s.seeAll, { color: colors.primary }]}>
                {showAllBookmarks ? "Show less" : `See all ${bookmarks.length}`}
              </Text>
            </Pressable>
          )}
        </View>

        {bookmarks.length === 0 ? (
          <View style={[s.emptyCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="bookmark" size={22} color={colors.mutedForeground} />
            <Text style={[s.emptyCardText, { color: colors.mutedForeground }]}>
              No bookmarks yet — save drugs, labs, or protocols
            </Text>
          </View>
        ) : (
          <View style={[s.iosGrouped, s.shadow, { backgroundColor: colors.card }]}>
            {visibleBookmarks.map((bk, i) => {
              const meta = BOOKMARK_TYPE_META[bk.type];
              const date = new Date(bk.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
              return (
                <Pressable
                  key={bk.id}
                  style={({ pressed }) => [s.iosRow, i > 0 && s.iosRowBorder, { backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => handleBookmarkPress(bk)}
                  onLongPress={() => handleDeleteBookmark(bk)}
                >
                  <View style={[s.settingIconWrap, { backgroundColor: meta.color + "18" }]}>
                    <Feather name={meta.icon} size={14} color={meta.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.iosRowText, { color: colors.foreground }]} numberOfLines={1}>{bk.name}</Text>
                    <Text style={[s.iosRowSmall, { color: colors.mutedForeground, fontSize: 11, marginTop: 1 }]}>
                      {meta.label} · {date}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
                </Pressable>
              );
            })}
          </View>
        )}
        {bookmarks.length > 0 && (
          <Text style={[s.hintText, { color: colors.mutedForeground }]}>
            Long-press to remove a bookmark
          </Text>
        )}
      </Animated.View>

      {/* ── Section 5 — Quiz History ── */}
      <Animated.View style={[{ marginBottom: 28 }, animStyle(5)]}>
        <View style={s.sectionRowHeader}>
          <Text style={[s.sectionHeader, { color: colors.mutedForeground, marginBottom: 0 }]}>QUIZ HISTORY</Text>
          {quizHistory.length > 4 && (
            <Pressable onPress={() => setShowAllQuiz((v) => !v)}>
              <Text style={[s.seeAll, { color: colors.primary }]}>
                {showAllQuiz ? "Show less" : `See all ${quizHistory.length}`}
              </Text>
            </Pressable>
          )}
        </View>

        {quizHistory.length === 0 ? (
          <View style={[s.emptyCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="bar-chart-2" size={22} color={colors.mutedForeground} />
            <Text style={[s.emptyCardText, { color: colors.mutedForeground }]}>
              No quiz results yet — take a quiz to track your progress
            </Text>
          </View>
        ) : (
          <View style={[s.quizCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Summary row */}
            <View style={s.quizSummary}>
              <View style={s.quizSummaryItem}>
                <Text style={[s.quizSumNum, { color: colors.foreground }]}>{quizHistory.length}</Text>
                <Text style={[s.quizSumLabel, { color: colors.mutedForeground }]}>Taken</Text>
              </View>
              <View style={[s.quizSumDivider, { backgroundColor: colors.border }]} />
              <View style={s.quizSummaryItem}>
                <Text style={[s.quizSumNum, { color: avgScore >= 75 ? "#10B981" : avgScore >= 50 ? "#F59E0B" : "#EF4444" }]}>
                  {avgScore}%
                </Text>
                <Text style={[s.quizSumLabel, { color: colors.mutedForeground }]}>Avg Score</Text>
              </View>
              <View style={[s.quizSumDivider, { backgroundColor: colors.border }]} />
              <View style={s.quizSummaryItem}>
                <Text style={[s.quizSumNum, { color: colors.foreground }]}>
                  {quizHistory.filter((q) => q.score / q.total >= 0.75).length}
                </Text>
                <Text style={[s.quizSumLabel, { color: colors.mutedForeground }]}>≥75%</Text>
              </View>
            </View>
            <View style={[s.quizDivider, { backgroundColor: colors.border }]} />
            {visibleQuiz.map((result, i) => (
              <QuizBar key={i} result={result} colors={colors} />
            ))}
            {quizHistory.length > 4 && !showAllQuiz && (
              <Pressable
                onPress={() => setShowAllQuiz(true)}
                style={[s.showMoreBtn, { borderTopColor: colors.border }]}
              >
                <Text style={[s.showMoreText, { color: colors.primary }]}>
                  Show {quizHistory.length - 4} more
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </Animated.View>

      {/* ── Section 6 — Settings + Sources ── */}
      <Animated.View style={animStyle(6)}>
        <Text style={[s.sectionHeader, { color: colors.mutedForeground }]}>SETTINGS</Text>
        <View style={[s.iosGrouped, s.shadow, { backgroundColor: colors.card }]}>
          <SettingPressable style={[s.iosRow, { backgroundColor: colors.card }]} onPress={cycleTheme}>
            <View style={[s.settingIconWrap, { backgroundColor: "#8B5CF618" }]}>
              <Feather name={themeIcon} size={15} color="#8B5CF6" />
            </View>
            <Text style={[s.iosRowText, { flex: 1, color: colors.foreground }]}>Appearance</Text>
            <Text style={[s.iosRowValue, { color: colors.mutedForeground }]}>{themeLabel}</Text>
            <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
          </SettingPressable>

          <SettingPressable
            style={[s.iosRow, s.iosRowBorder, { backgroundColor: colors.card }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/privacy-policy"); }}
          >
            <View style={[s.settingIconWrap, { backgroundColor: "#10B98118" }]}>
              <Feather name="shield" size={15} color="#10B981" />
            </View>
            <Text style={[s.iosRowText, { flex: 1, color: colors.foreground }]}>Privacy Policy</Text>
            <Text style={[s.iosRowValue, { color: colors.mutedForeground }]}>May 2026</Text>
            <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
          </SettingPressable>

          <SettingPressable
            style={[s.iosRow, s.iosRowBorder, { backgroundColor: colors.card }]}
            onPress={() => Alert.alert(
              "MedPocket v1.1.0",
              "Built by Nirranjan\n\nContent sourced from Harrison's, BNF, WHO, UpToDate, Robbins, Miller's Anesthesia.\n\nFor educational use only — not a substitute for clinical judgment."
            )}
          >
            <View style={[s.settingIconWrap, { backgroundColor: "#3B82F618" }]}>
              <Feather name="info" size={15} color="#3B82F6" />
            </View>
            <Text style={[s.iosRowText, { flex: 1, color: colors.foreground }]}>About MedPocket</Text>
            <Text style={[s.iosRowValue, { color: colors.mutedForeground }]}>v1.1.0</Text>
            <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
          </SettingPressable>
        </View>

        {/* Content sources */}
        <View style={s.sourcesHeader}>
          <Text style={[s.sectionHeader, { color: colors.mutedForeground, marginBottom: 0 }]}>CONTENT SOURCES</Text>
          <View style={[s.verifiedBadge, { backgroundColor: "#10B98112", borderColor: "#10B98130" }]}>
            <Feather name="check-circle" size={10} color="#10B981" />
            <Text style={[s.verifiedText, { color: "#10B981" }]}>Verified · May 2026</Text>
          </View>
        </View>
        <View style={[s.iosGrouped, s.shadow, { backgroundColor: colors.card }]}>
          {[
            { src: "Harrison's Principles of Internal Medicine, 21e", year: "2022" },
            { src: "British National Formulary (BNF) 86",             year: "2024" },
            { src: "WHO Clinical Guidelines",                          year: "2024" },
            { src: "UpToDate — Evidence-Based Medicine",               year: "2024" },
            { src: "Robbins & Cotran Pathology, 10e",                  year: "2020" },
            { src: "Miller's Anesthesia, 9e",                          year: "2019" },
          ].map(({ src, year }, i) => (
            <View key={src} style={[s.iosRow, i > 0 && s.iosRowBorder, { backgroundColor: colors.card }]}>
              <Feather name="book-open" size={13} color={colors.primary} />
              <Text style={[s.iosRowSmall, { color: colors.foreground, flex: 1 }]}>{src}</Text>
              <Text style={[s.iosRowValue, { color: colors.mutedForeground }]}>{year}</Text>
            </View>
          ))}
        </View>

        <SettingPressable style={[s.resetBtn, s.shadow, { backgroundColor: colors.card }]} onPress={handleSignOut} scale={0.97}>
          <Feather name="trash-2" size={16} color="#EF4444" />
          <Text style={s.resetText}>Reset App Data</Text>
        </SettingPressable>

        <Text style={[s.footer, { color: colors.mutedForeground }]}>
          MedPocket by Nirranjan · For educational use only{"\n"}Not a substitute for clinical judgment
        </Text>
      </Animated.View>
    </Animated.ScrollView>
  );
}

// ─── Streak styles ────────────────────────────────────────────────────────────
const streakStyles = StyleSheet.create({
  dotsRow:   { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  dotWrap:   { alignItems: "center", gap: 4 },
  dot:       { width: 28, height: 28, borderRadius: 14 },
  dayLabel:  { fontSize: 10, fontWeight: "700" },
});

// ─── Quiz styles ──────────────────────────────────────────────────────────────
const quizStyles = StyleSheet.create({
  row:     { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 10 },
  info:    { width: 90 },
  subject: { fontSize: 12, fontWeight: "700", lineHeight: 16 },
  date:    { fontSize: 10, marginTop: 2 },
  barCol:  { flex: 1, gap: 4 },
  barBg:   { height: 6, borderRadius: 3, overflow: "hidden" },
  barFill: { height: 6, borderRadius: 3 },
  score:   { fontSize: 11, fontWeight: "700" },
});

// ─── Main styles ──────────────────────────────────────────────────────────────
function makeStyles(colors: ReturnType<typeof useColors>, topPad: number) {
  const isIOS = Platform.OS === "ios";
  const shadow = isIOS
    ? { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6 }
    : { elevation: 1 };

  return StyleSheet.create({
    container:    { flex: 1, backgroundColor: colors.background },
    headerBlock:  { paddingHorizontal: 20, paddingTop: topPad + 12, paddingBottom: 8 },
    pageTitle:    { fontSize: 34, fontWeight: "800", color: colors.foreground, letterSpacing: -0.5 },
    shadow,
    sectionHeader:  { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", paddingHorizontal: 20, marginBottom: 10, marginTop: 4 },
    sectionRowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 10, marginTop: 4 },
    seeAll:   { fontSize: 12, fontWeight: "600" },
    hintText: { fontSize: 10.5, textAlign: "center", marginTop: 6 },

    // Identity card
    identityCard: { backgroundColor: colors.card, marginHorizontal: 16, borderRadius: 18, padding: 20, alignItems: "center", ...shadow },
    avatar:       { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 14 },
    avatarText:   { fontSize: 34, fontWeight: "800", color: "#fff" },
    identityInfo: { alignItems: "center", gap: 6, width: "100%" },
    userName:     { fontSize: 22, fontWeight: "700" },
    yearPill:     { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    yearPillText: { fontSize: 12, fontWeight: "700" },
    college:      { fontSize: 12, textAlign: "center" },
    editBtn:      { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    editBtnText:  { fontSize: 12, fontWeight: "700" },
    editBlock:    { width: "100%", gap: 4 },
    iosLabel:     { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 },
    iosInput:     { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, borderWidth: StyleSheet.hairlineWidth },
    editActions:  { flexDirection: "row", gap: 10, marginTop: 12 },
    editActionBtn:{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
    editActionText:{ fontSize: 14, fontWeight: "700" },

    // Discipline
    catRow:     { paddingHorizontal: 16, gap: 8 },
    catChip:    { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    catChipText:{ fontSize: 12, fontWeight: "600" },

    // Streak
    streakCard: { marginHorizontal: 16, borderRadius: 18, padding: 18, ...shadow },
    streakTop:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    streakRow:  { flexDirection: "row", alignItems: "baseline", gap: 4 },
    streakFire: { fontSize: 28 },
    streakNumber:{ fontSize: 32, fontWeight: "800", letterSpacing: -1 },
    streakUnit: { fontSize: 14, fontWeight: "600" },
    streakSub:  { fontSize: 12, marginTop: 3 },
    streakBadge:{ width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    streakBadgeText: { fontSize: 18, position: "absolute" },

    // Stats grid
    statsGrid:     { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 8 },
    statCardOuter: { width: "30%", flexGrow: 1 },
    statCard:      { borderRadius: 14, padding: 14, alignItems: "center", gap: 4 },
    statIconWrap:  { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 2 },
    statValue:     { fontSize: 20, fontWeight: "800" },
    statUnit:      { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
    statLabel:     { fontSize: 10.5 },

    // Bookmarks / quiz empty state
    emptyCard: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, padding: 20, alignItems: "center", gap: 10, flexDirection: "row" },
    emptyCardText: { fontSize: 13, lineHeight: 19, flex: 1 },

    // Quiz card
    quizCard:    { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
    quizSummary: { flexDirection: "row", paddingVertical: 14 },
    quizSummaryItem: { flex: 1, alignItems: "center", gap: 2 },
    quizSumNum:  { fontSize: 20, fontWeight: "800" },
    quizSumLabel:{ fontSize: 11 },
    quizSumDivider: { width: 1, marginVertical: 6 },
    quizDivider: { height: 1 },
    showMoreBtn: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 12, alignItems: "center" },
    showMoreText:{ fontSize: 13, fontWeight: "600" },

    // iOS grouped lists
    iosGrouped:     { marginHorizontal: 16, borderRadius: 14, overflow: "hidden" },
    iosGroupedBelow:{ marginHorizontal: 16, borderRadius: 14, marginTop: 2, overflow: "hidden" },
    iosRow:         { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13, minHeight: 48 },
    iosRowBorder:   { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
    iosRowText:     { fontSize: 14, fontWeight: "500" },
    iosRowSmall:    { fontSize: 13 },
    iosRowValue:    { fontSize: 12 },
    settingIconWrap:{ width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },

    // Sources / footer
    sourcesHeader:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginTop: 24, marginBottom: 10 },
    verifiedBadge:{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
    verifiedText: { fontSize: 10.5, fontWeight: "700" },
    resetBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, marginTop: 20, borderRadius: 14, paddingVertical: 14 },
    resetText:    { fontSize: 14, fontWeight: "700", color: "#EF4444" },
    footer:       { fontSize: 11, textAlign: "center", marginTop: 16, lineHeight: 18 },
  });
}
