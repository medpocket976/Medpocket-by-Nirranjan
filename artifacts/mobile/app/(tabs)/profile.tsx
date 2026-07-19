import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassBackground } from "@/components/GlassBackground";
import { GlassView } from "@/components/GlassView";
import { useApp } from "@/context/AppContext";
import type { Bookmark } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

// ─── Discipline data ──────────────────────────────────────────────────────────
const DISCIPLINE_CATEGORIES = [
  {
    key: "medical", label: "Medical", icon: "activity" as const, color: "#009DB5",
    years: ["MBBS 1st Year","MBBS 2nd Year","MBBS 3rd Year","MBBS 4th Year","MBBS Final Year","MBBS Intern"],
  },
  {
    key: "nursing", label: "Nursing", icon: "heart" as const, color: "#EC4899",
    years: ["GNM 1st Year","GNM 2nd Year","GNM 3rd Year","BSc Nursing 1st Year","BSc Nursing 2nd Year","BSc Nursing 3rd Year","BSc Nursing 4th Year","Post Basic BSc Nursing","MSc Nursing"],
  },
  {
    key: "pharmacy", label: "Pharmacy", icon: "tablet" as const, color: "#8B5CF6",
    years: ["D.Pharm 1st Year","D.Pharm 2nd Year","B.Pharm 1st Year","B.Pharm 2nd Year","B.Pharm 3rd Year","B.Pharm 4th Year","M.Pharm","Pharm.D"],
  },
  {
    key: "physio", label: "Physiotherapy", icon: "zap" as const, color: "#F59E0B",
    years: ["BPT 1st Year","BPT 2nd Year","BPT 3rd Year","BPT 4th Year","MPT"],
  },
  {
    key: "dental", label: "Dental", icon: "smile" as const, color: "#10B981",
    years: ["BDS 1st Year","BDS 2nd Year","BDS 3rd Year","BDS 4th Year","BDS Intern","MDS"],
  },
  {
    key: "allied", label: "Allied Health", icon: "layers" as const, color: "#F97316",
    years: [
      "MLT 1st Year","MLT 2nd Year","BMLT 3rd Year","BMLT 4th Year",
      "OTAT 1st Year","OTAT 2nd Year","OTAT 3rd Year",
      "PA 1st Year","PA 2nd Year","PA 3rd Year",
      "CLP 1st Year","CLP 2nd Year","CLP 3rd Year",
      "CPPT 1st Year","CPPT 2nd Year","CPPT 3rd Year",
      "CVT 1st Year","CVT 2nd Year","CVT 3rd Year",
      "CT 1st Year","CT 2nd Year","CT 3rd Year",
      "RIT 1st Year","RIT 2nd Year","RIT 3rd Year",
      "OPTOM 1st Year","OPTOM 2nd Year","OPTOM 3rd Year","OPTOM 4th Year",
      "DT 1st Year","DT 2nd Year","DT 3rd Year",
      "AECT 1st Year","AECT 2nd Year","AECT 3rd Year",
      "CCT 1st Year","CCT 2nd Year","CCT 3rd Year",
      "RT 1st Year","RT 2nd Year","RT 3rd Year",
      "NEP 1st Year","NEP 2nd Year","NEP 3rd Year",
      "BSc Dietetics","BSc Audiology","BSc MLT","BSc Radiology",
      "BSc OT","BSc PT","BSc Perfusion Technology",
    ],
  },
  {
    key: "pg", label: "PG / Consultant", icon: "award" as const, color: "#6366F1",
    years: ["Resident (PG Year 1)","Resident (PG Year 2)","Resident (PG Year 3)","Fellow","Consultant / Specialist"],
  },
];

function findCatForYear(year: string) {
  return DISCIPLINE_CATEGORIES.find((c) => c.years.includes(year))?.key ?? "medical";
}

const BOOKMARK_TYPE_META: Record<
  Bookmark["type"],
  { icon: keyof typeof Feather.glyphMap; color: string; label: string; getRoute: (id: string) => string }
> = {
  drug:      { icon: "tablet",       color: "#009DB5", label: "Drug",     getRoute: (id) => `/drug-guide/${id}` },
  lab:       { icon: "bar-chart-2",  color: "#10B981", label: "Lab",      getRoute: ()   => `/lab-values` },
  emergency: { icon: "alert-circle", color: "#EF4444", label: "Protocol", getRoute: (id) => `/emergency/${id}` },
  exam:      { icon: "activity",     color: "#8B5CF6", label: "Exam",     getRoute: (id) => `/clinical-exam/${id}` },
  question:  { icon: "help-circle",  color: "#F59E0B", label: "Quiz",     getRoute: ()   => `/quiz` },
};

const THEME_META: Record<string, { icon: keyof typeof Feather.glyphMap; label: string }> = {
  system: { icon: "monitor", label: "System" },
  light:  { icon: "sun",     label: "Light"  },
  dark:   { icon: "moon",    label: "Dark"   },
};

// ─── Year Picker Bottom Sheet ─────────────────────────────────────────────────
function YearPickerSheet({
  visible,
  currentYear,
  onSelect,
  onClose,
  colors,
}: {
  visible: boolean;
  currentYear: string;
  onSelect: (year: string) => void;
  onClose: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const slideAnim = useRef(new Animated.Value(600)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [selectedCat, setSelectedCat] = useState(() => findCatForYear(currentYear));
  const [search, setSearch] = useState("");
  const insets = useSafeAreaInsets();
  const isDark = colors.scheme === "dark";

  useEffect(() => {
    if (visible) {
      setSelectedCat(findCatForYear(currentYear));
      setSearch("");
      Animated.parallel([
        Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim,   { toValue: 0, tension: 90, friction: 14, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim,   { toValue: 600, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const activeCat = DISCIPLINE_CATEGORIES.find((c) => c.key === selectedCat)!;
  const filteredYears = activeCat.years.filter((y) =>
    y.toLowerCase().includes(search.toLowerCase())
  );

  const sheetBg = isDark ? "rgba(12,22,44,0.98)" : "rgba(246,252,254,0.98)";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,120,150,0.06)";
  const borderC  = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,157,181,0.18)";

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.45)", opacity: overlayAnim }]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          transform: [{ translateY: slideAnim }],
        }}
        pointerEvents="box-none"
      >
        <View style={{
          backgroundColor: sheetBg,
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          paddingBottom: Math.max(insets.bottom, 16),
          borderTopWidth: 1,
          borderColor: borderC,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.22,
          shadowRadius: 24,
          elevation: 24,
          maxHeight: 520,
        }}>
          {/* Handle */}
          <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 4 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.14)" }} />
          </View>

          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text style={{ flex: 1, fontSize: 18, fontWeight: "800", color: colors.foreground, letterSpacing: -0.4 }}>
              Discipline & Year
            </Text>
            <Pressable onPress={onClose} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)", alignItems: "center", justifyContent: "center" }}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {/* Discipline pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingBottom: 12 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {DISCIPLINE_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.key}
                onPress={() => { setSelectedCat(cat.key); setSearch(""); if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 6,
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: selectedCat === cat.key ? cat.color : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"),
                  borderWidth: 1,
                  borderColor: selectedCat === cat.key ? "transparent" : borderC,
                }}
              >
                <Feather name={cat.icon} size={13} color={selectedCat === cat.key ? "#fff" : colors.mutedForeground} />
                <Text style={{ fontSize: 12, fontWeight: "700", color: selectedCat === cat.key ? "#fff" : colors.mutedForeground }}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Search */}
          <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: inputBg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: Platform.OS === "ios" ? 12 : 8, borderWidth: 1, borderColor: borderC }}>
              <Feather name="search" size={14} color={colors.mutedForeground} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={`Search ${activeCat.label} years…`}
                placeholderTextColor={colors.mutedForeground}
                style={{ flex: 1, fontSize: 14, color: colors.foreground, padding: 0 }}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <Feather name="x-circle" size={14} color={colors.mutedForeground} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Year list */}
          <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            {filteredYears.length === 0 ? (
              <Text style={{ color: colors.mutedForeground, textAlign: "center", paddingVertical: 20, fontSize: 13 }}>
                No results for "{search}"
              </Text>
            ) : (
              filteredYears.map((year) => {
                const isSelected = year === currentYear;
                return (
                  <Pressable
                    key={year}
                    onPress={() => { onSelect(year); if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    style={{
                      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                      paddingHorizontal: 14, paddingVertical: 13, borderRadius: 14, marginBottom: 4,
                      backgroundColor: isSelected ? activeCat.color + "18" : "transparent",
                      borderWidth: isSelected ? 1 : 0,
                      borderColor: isSelected ? activeCat.color + "40" : "transparent",
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: isSelected ? "700" : "500", color: isSelected ? activeCat.color : colors.foreground }}>
                      {year}
                    </Text>
                    {isSelected && <Feather name="check" size={16} color={activeCat.color} />}
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
}

// ─── Main profile screen ──────────────────────────────────────────────────────
export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 16 : insets.top;
  const {
    user, quizHistory, bookmarks, notes, streak, totalStudyDays,
    updateUser, setTheme, theme, removeBookmark, signOut,
    resetName,
  } = useApp();

  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [nameInput,   setNameInput]   = useState(user.name);
  const [collegeInput, setCollegeInput] = useState(user.college);
  const [editing,     setEditing]     = useState(false);
  const [showPicker,  setShowPicker]  = useState(false);

  const savePulse = useRef(new Animated.Value(1)).current;

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 460, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 460, useNativeDriver: true }),
    ]).start();
  }, []);

  const saveProfile = useCallback(() => {
    updateUser({ name: nameInput.trim() || "Medical Student", college: collegeInput.trim() });
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(savePulse, { toValue: 1.06, tension: 200, friction: 6, useNativeDriver: true }),
      Animated.spring(savePulse, { toValue: 1,    tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [nameInput, collegeInput, updateUser]);

  const handleSignOut = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Reset App Data",
      "This will clear all your profile, bookmarks, notes, and quiz history. Cannot be undone.",
      [{ text: "Cancel", style: "cancel" }, { text: "Reset Everything", style: "destructive", onPress: signOut }],
    );
  }, [signOut]);

  const handleResetName = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Reset Name",
      "This will remove your name and show the name setup screen on next launch.",
      [{ text: "Cancel", style: "cancel" }, { text: "Reset", style: "destructive", onPress: resetName }],
    );
  }, [resetName]);

  const cycleTheme = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next: Record<string, "system" | "light" | "dark"> = { system: "light", light: "dark", dark: "system" };
    setTheme(next[theme]);
  }, [theme, setTheme]);

  const handleBookmarkPress = useCallback((bk: Bookmark) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(BOOKMARK_TYPE_META[bk.type].getRoute(bk.itemId) as any);
  }, []);

  const handleDeleteBookmark = useCallback((bk: Bookmark) => {
    Alert.alert("Remove Bookmark", `Remove "${bk.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeBookmark(bk.itemId) },
    ]);
  }, [removeBookmark]);

  const avgScore = quizHistory.length > 0
    ? Math.round((quizHistory.reduce((a, r) => a + r.score / r.total, 0) / quizHistory.length) * 100)
    : 0;

  const currentCat = DISCIPLINE_CATEGORIES.find((c) => c.key === findCatForYear(user.year))!;
  const themeMeta  = THEME_META[theme];

  return (
    <GlassBackground>
      <YearPickerSheet
        visible={showPicker}
        currentYear={user.year}
        onSelect={(year) => { updateUser({ year }); setShowPicker(false); }}
        onClose={() => setShowPicker(false)}
        colors={colors}
      />

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView
          contentContainerStyle={{ paddingTop: topPad + 12, paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
            <Pressable
              onPress={editing ? saveProfile : () => setEditing(true)}
              accessibilityLabel={editing ? "Save profile" : "Edit profile"}
            >
              <Animated.View style={{ transform: [{ scale: savePulse }] }}>
                <GlassView style={styles.editBtn} radius={14}>
                  <Feather name={editing ? "check" : "edit-2"} size={16} color={editing ? colors.success : colors.primary} />
                  <Text style={[styles.editBtnText, { color: editing ? colors.success : colors.primary }]}>
                    {editing ? "Save" : "Edit"}
                  </Text>
                </GlassView>
              </Animated.View>
            </Pressable>
          </View>

          {/* ── Identity card ── */}
          <GlassView style={styles.identityCard} radius={24}>
            {/* Avatar */}
            <LinearGradient colors={["#2563EB", "#14B8A6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(nameInput || user.name).charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>

            {/* Name field */}
            {editing ? (
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                style={[styles.nameInput, { color: colors.foreground, borderColor: colors.primary + "50", backgroundColor: colors.glassBg }]}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                returnKeyType="next"
              />
            ) : (
              <Text style={[styles.nameText, { color: colors.foreground }]}>{user.name}</Text>
            )}

            {/* Year selector — taps open bottom sheet */}
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowPicker(true); }}
              accessibilityLabel="Change discipline and year"
              style={[styles.yearPill, { backgroundColor: currentCat.color + "18", borderColor: currentCat.color + "35" }]}
            >
              <Feather name={currentCat.icon} size={13} color={currentCat.color} />
              <Text style={[styles.yearPillText, { color: currentCat.color }]}>{user.year}</Text>
              <Feather name="chevron-down" size={13} color={currentCat.color} />
            </Pressable>

            {/* College field */}
            {editing ? (
              <TextInput
                value={collegeInput}
                onChangeText={setCollegeInput}
                style={[styles.collegeInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.glassBg }]}
                placeholder="College / Hospital (optional)"
                placeholderTextColor={colors.mutedForeground}
                returnKeyType="done"
                onSubmitEditing={saveProfile}
              />
            ) : user.college ? (
              <View style={styles.collegeRow}>
                <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                <Text style={[styles.collegeText, { color: colors.mutedForeground }]}>{user.college}</Text>
              </View>
            ) : null}
          </GlassView>

          {/* ── Stats strip ── */}
          <View style={styles.statsStrip}>
            {[
              { icon: "zap"          as const, label: "Streak",     value: `${streak}d`,     color: "#F59E0B" },
              { icon: "check-circle" as const, label: "Quizzes",    value: `${quizHistory.length}`, color: colors.primary },
              { icon: "trending-up"  as const, label: "Avg Score",  value: `${avgScore}%`,   color: colors.success },
              { icon: "file-text"    as const, label: "Notes",      value: `${notes.length}`, color: "#8B5CF6" },
              { icon: "bookmark"     as const, label: "Saved",      value: `${bookmarks.length}`, color: "#EC4899" },
              { icon: "calendar"     as const, label: "Study Days", value: `${totalStudyDays}`, color: "#6366F1" },
            ].map((s) => (
              <GlassView key={s.label} style={styles.stripCard} radius={16}>
                <View style={[styles.stripIcon, { backgroundColor: s.color + "20" }]}>
                  <Feather name={s.icon} size={12} color={s.color} />
                </View>
                <Text style={[styles.stripValue, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.stripLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </GlassView>
            ))}
          </View>

          {/* ── Bookmarks ── */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Bookmarks</Text>
            <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>{bookmarks.length}</Text>
          </View>

          {bookmarks.length === 0 ? (
            <GlassView style={styles.emptyCard} radius={18}>
              <Feather name="bookmark" size={22} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No bookmarks yet. Save drugs, lab values, and emergency protocols while browsing.
              </Text>
            </GlassView>
          ) : (
            <GlassView style={styles.bookmarkList} radius={20}>
              {bookmarks.map((bk, i) => {
                const meta = BOOKMARK_TYPE_META[bk.type];
                return (
                  <Pressable
                    key={bk.id}
                    onPress={() => handleBookmarkPress(bk)}
                    onLongPress={() => handleDeleteBookmark(bk)}
                    accessibilityLabel={`Open ${bk.name}`}
                    style={[styles.bookmarkRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border + "55" }]}
                  >
                    <View style={[styles.bookmarkIcon, { backgroundColor: meta.color + "18" }]}>
                      <Feather name={meta.icon} size={14} color={meta.color} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[styles.bookmarkName, { color: colors.foreground }]} numberOfLines={1}>{bk.name}</Text>
                      <Text style={[styles.bookmarkType, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                    <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
                  </Pressable>
                );
              })}
            </GlassView>
          )}

          {/* ── Quiz history summary ── */}
          {quizHistory.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quiz Performance</Text>
                <Pressable onPress={() => router.push("/quiz-history" as any)}>
                  <Text style={[{ color: colors.primary, fontSize: 12, fontWeight: "600" }]}>View all →</Text>
                </Pressable>
              </View>
              <GlassView style={styles.quizCard} radius={20}>
                <View style={styles.quizSummary}>
                  {[
                    { label: "Total",   value: quizHistory.length.toString() },
                    { label: "Avg Score", value: `${avgScore}%` },
                    { label: "Best",    value: `${Math.max(...quizHistory.map((r) => Math.round((r.score / r.total) * 100)))}%` },
                  ].map((s, i) => (
                    <React.Fragment key={s.label}>
                      {i > 0 && <View style={[styles.quizDivider, { backgroundColor: colors.border }]} />}
                      <View style={styles.quizSummaryItem}>
                        <Text style={[styles.quizNum, { color: colors.primary }]}>{s.value}</Text>
                        <Text style={[styles.quizLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              </GlassView>
            </>
          )}

          {/* ── Settings ── */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Settings</Text>
          </View>

          <GlassView style={styles.settingsGroup} radius={20}>
            {/* Theme */}
            <Pressable onPress={cycleTheme} style={styles.settingsRow} accessibilityLabel="Toggle theme">
              <View style={[styles.settingIcon, { backgroundColor: "#8B5CF6" + "20" }]}>
                <Feather name={themeMeta.icon} size={15} color="#8B5CF6" />
              </View>
              <Text style={[styles.settingsLabel, { color: colors.foreground }]}>Appearance</Text>
              <View style={[styles.themeBadge, { backgroundColor: colors.primary + "14" }]}>
                <Text style={[styles.themeBadgeText, { color: colors.primary }]}>{themeMeta.label}</Text>
              </View>
            </Pressable>

            <View style={[styles.rowDivider, { backgroundColor: colors.border + "55" }]} />

            {/* Notes */}
            <Pressable onPress={() => router.push("/(tabs)/notes" as any)} style={styles.settingsRow} accessibilityLabel="My notes">
              <View style={[styles.settingIcon, { backgroundColor: "#F59E0B" + "20" }]}>
                <Feather name="file-text" size={15} color="#F59E0B" />
              </View>
              <Text style={[styles.settingsLabel, { color: colors.foreground }]}>My Notes</Text>
              <Text style={[styles.settingsValue, { color: colors.mutedForeground }]}>{notes.length}</Text>
              <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
            </Pressable>

            <View style={[styles.rowDivider, { backgroundColor: colors.border + "55" }]} />

            {/* Privacy */}
            <Pressable onPress={() => router.push("/privacy-policy" as any)} style={styles.settingsRow} accessibilityLabel="Privacy policy">
              <View style={[styles.settingIcon, { backgroundColor: "#10B981" + "20" }]}>
                <Feather name="shield" size={15} color="#10B981" />
              </View>
              <Text style={[styles.settingsLabel, { color: colors.foreground }]}>Privacy Policy</Text>
              <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
            </Pressable>
          </GlassView>

          {/* ── Danger zone ── */}
          <View style={[styles.sectionHeader, { marginTop: 8 }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Danger Zone</Text>
          </View>
          <GlassView style={styles.settingsGroup} radius={20}>
            <Pressable onPress={handleResetName} style={styles.settingsRow} accessibilityLabel="Reset name">
              <View style={[styles.settingIcon, { backgroundColor: "#F59E0B20" }]}>
                <Feather name="user-x" size={15} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingsLabel, { color: colors.foreground }]}>Reset Name</Text>
                <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 1 }}>Shows name setup screen again</Text>
              </View>
            </Pressable>
          </GlassView>

          {/* ── Sources footer ── */}
          <View style={styles.sourcesHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sources</Text>
            <View style={[styles.verifiedBadge, { borderColor: colors.success + "40", backgroundColor: colors.success + "12" }]}>
              <Feather name="check-circle" size={11} color={colors.success} />
              <Text style={[styles.verifiedText, { color: colors.success }]}>Verified</Text>
            </View>
          </View>
          <GlassView style={styles.sourcesCard} radius={18}>
            {[
              "Harrison's Principles of Internal Medicine, 21e",
              "BNF 86 (British National Formulary)",
              "WHO Essential Medicines & Clinical Guidelines",
              "Robbins & Cotran Pathology, 10e",
              "Guyton & Hall Medical Physiology, 14e",
              "Miller's Anaesthesia, 9e · DAS Guidelines",
              "Bailey & Love's Surgery, 27e",
              "RCPA & NICE Clinical Guidelines (2023–2024)",
            ].map((src, i) => (
              <View key={i} style={[styles.sourceRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border + "55" }]}>
                <Feather name="book-open" size={11} color={colors.primary} />
                <Text style={[styles.sourceText, { color: colors.mutedForeground }]}>{src}</Text>
              </View>
            ))}
          </GlassView>

          {/* ── Reset ── */}
          <Pressable onPress={handleSignOut} style={styles.resetBtn} accessibilityLabel="Reset all data">
            <Feather name="trash-2" size={16} color="#EF4444" />
            <Text style={styles.resetText}>Reset All Data</Text>
          </Pressable>

          <Text style={[styles.footer, { color: colors.mutedForeground }]}>
            MedPocket v1.3.0 · For educational use only{"\n"}
            Always follow local clinical protocols
          </Text>
        </ScrollView>
      </Animated.View>
    </GlassBackground>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  const shadow = Platform.OS === "ios"
    ? { shadowColor: colors.glassShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16 }
    : { elevation: 3 };

  return StyleSheet.create({
    header:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 18 },
    title:     { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
    editBtn:   { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
    editBtnText: { fontSize: 13, fontWeight: "700" },

    identityCard: { marginHorizontal: 20, marginBottom: 16, padding: 20, alignItems: "center", gap: 10, ...shadow },
    avatar:       { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 4 },
    avatarText:   { fontSize: 30, fontWeight: "800", color: "#fff" },
    nameText:     { fontSize: 22, fontWeight: "800", color: colors.foreground, letterSpacing: -0.4 },
    nameInput:    { width: "100%", fontSize: 18, fontWeight: "700", textAlign: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
    yearPill:     { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    yearPillText: { fontSize: 13, fontWeight: "700" },
    collegeRow:   { flexDirection: "row", alignItems: "center", gap: 5 },
    collegeText:  { fontSize: 13, fontWeight: "500" },
    collegeInput: { width: "100%", fontSize: 14, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },

    statsStrip: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 8, marginBottom: 24 },
    stripCard:  { width: "30%", flexGrow: 1, alignItems: "center", paddingVertical: 12, gap: 4, ...shadow },
    stripIcon:  { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    stripValue: { fontSize: 17, fontWeight: "800" },
    stripLabel: { fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },

    sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 10, marginTop: 6 },
    sectionTitle:  { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
    sectionCount:  { fontSize: 14, fontWeight: "600" },

    emptyCard: { marginHorizontal: 20, padding: 18, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16, ...shadow },
    emptyText: { fontSize: 13, lineHeight: 20, flex: 1 },

    bookmarkList: { marginHorizontal: 20, marginBottom: 16, overflow: "hidden", ...shadow },
    bookmarkRow:  { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
    bookmarkIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    bookmarkName: { fontSize: 13, fontWeight: "600" },
    bookmarkType: { fontSize: 11, fontWeight: "700", marginTop: 1 },

    quizCard:        { marginHorizontal: 20, marginBottom: 16, ...shadow },
    quizSummary:     { flexDirection: "row", padding: 16 },
    quizSummaryItem: { flex: 1, alignItems: "center", gap: 3 },
    quizNum:         { fontSize: 20, fontWeight: "800" },
    quizLabel:       { fontSize: 11, fontWeight: "500" },
    quizDivider:     { width: 1, marginVertical: 8 },

    settingsGroup: { marginHorizontal: 20, marginBottom: 16, overflow: "hidden", ...shadow },
    settingsRow:   { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
    settingIcon:   { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
    settingsLabel: { flex: 1, fontSize: 14, fontWeight: "600" },
    settingsValue: { fontSize: 13, fontWeight: "500" },
    themeBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    themeBadgeText:{ fontSize: 12, fontWeight: "700" },
    rowDivider:    { height: 1, marginLeft: 58 },

    sourcesHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 10, marginTop: 6 },
    verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
    verifiedText:  { fontSize: 10.5, fontWeight: "700" },
    sourcesCard:   { marginHorizontal: 20, marginBottom: 8, overflow: "hidden", ...shadow },
    sourceRow:     { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingHorizontal: 14, paddingVertical: 10 },
    sourceText:    { fontSize: 12, flex: 1, lineHeight: 18 },

    resetBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 20, marginTop: 20, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "#EF4444" + "30", backgroundColor: "#EF4444" + "08" },
    resetText: { fontSize: 14, fontWeight: "700", color: "#EF4444" },
    footer:    { fontSize: 11, textAlign: "center", marginTop: 16, marginBottom: 4, lineHeight: 18, color: colors.mutedForeground },
  });
}
