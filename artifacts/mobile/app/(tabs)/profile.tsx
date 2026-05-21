import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { useColors } from "@/hooks/useColors";

const DISCIPLINE_CATEGORIES = [
  {
    key: "medical",
    label: "Medical",
    icon: "activity" as const,
    color: "#009DB5",
    years: [
      "MBBS 1st Year", "MBBS 2nd Year", "MBBS 3rd Year",
      "MBBS 4th Year", "MBBS Final Year", "MBBS Intern",
    ],
  },
  {
    key: "nursing",
    label: "Nursing",
    icon: "heart" as const,
    color: "#EC4899",
    years: [
      "GNM 1st Year", "GNM 2nd Year", "GNM 3rd Year",
      "BSc Nursing 1st Year", "BSc Nursing 2nd Year",
      "BSc Nursing 3rd Year", "BSc Nursing 4th Year",
      "Post Basic BSc Nursing", "MSc Nursing",
    ],
  },
  {
    key: "pharmacy",
    label: "Pharmacy",
    icon: "tablet" as const,
    color: "#8B5CF6",
    years: [
      "D.Pharm 1st Year", "D.Pharm 2nd Year",
      "B.Pharm 1st Year", "B.Pharm 2nd Year",
      "B.Pharm 3rd Year", "B.Pharm 4th Year",
      "M.Pharm", "Pharm.D",
    ],
  },
  {
    key: "physio",
    label: "Physio",
    icon: "zap" as const,
    color: "#F59E0B",
    years: [
      "BPT 1st Year", "BPT 2nd Year", "BPT 3rd Year", "BPT 4th Year", "MPT",
    ],
  },
  {
    key: "dental",
    label: "Dental",
    icon: "smile" as const,
    color: "#10B981",
    years: [
      "BDS 1st Year", "BDS 2nd Year", "BDS 3rd Year", "BDS 4th Year", "BDS Intern", "MDS",
    ],
  },
  {
    key: "allied",
    label: "Allied",
    icon: "layers" as const,
    color: "#F97316",
    years: [
      "DMLT / BMLT", "BRIT / BMRIT", "BSc Optometry",
      "BSc Dietetics", "BSc Audiology",
    ],
  },
  {
    key: "pg",
    label: "PG / Consultant",
    icon: "award" as const,
    color: "#6366F1",
    years: [
      "Resident (PG Year 1)", "Resident (PG Year 2)", "Resident (PG Year 3)",
      "Fellow", "Consultant / Specialist",
    ],
  },
];

function findCategoryForYear(year: string) {
  for (const cat of DISCIPLINE_CATEGORIES) {
    if (cat.years.includes(year)) return cat.key;
  }
  return "medical";
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser, bookmarks, notes, quizHistory, streak, totalStudyDays, signOut } = useApp();

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [collegeInput, setCollegeInput] = useState(user.college);
  const [selectedCat, setSelectedCat] = useState(() => findCategoryForYear(user.year));

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 340, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  function saveProfile() {
    updateUser({ name: nameInput.trim() || "Medical Student", college: collegeInput.trim() });
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleSignOut() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Reset App Data",
      "This will clear all your profile, bookmarks, and quiz history, and take you back to the setup screen.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset Everything", style: "destructive", onPress: () => signOut() },
      ]
    );
  }

  const avgScore =
    quizHistory.length > 0
      ? Math.round((quizHistory.reduce((a, r) => a + r.score / r.total, 0) / quizHistory.length) * 100)
      : 0;

  const currentCat = DISCIPLINE_CATEGORIES.find((c) => c.key === selectedCat)!;
  const styles = makeStyles(colors, topPad);
  const avatarLetter = user.name.charAt(0).toUpperCase();

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Large Title Header */}
      <Animated.View style={[styles.headerBlock, { transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.pageTitle}>Profile</Text>
      </Animated.View>

      {/* Identity Card */}
      <View style={styles.identityCard}>
        <View style={[styles.avatar, { backgroundColor: currentCat.color }]}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </View>

        {editing ? (
          <View style={styles.editBlock}>
            <Text style={styles.iosLabel}>FULL NAME</Text>
            <TextInput
              style={[styles.iosInput, { color: colors.foreground, borderColor: colors.border }]}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
              autoFocus
              returnKeyType="next"
            />
            <Text style={[styles.iosLabel, { marginTop: 10 }]}>COLLEGE / INSTITUTION</Text>
            <TextInput
              style={[styles.iosInput, { color: colors.foreground, borderColor: colors.border }]}
              value={collegeInput}
              onChangeText={setCollegeInput}
              placeholder="e.g. AIIMS Delhi (optional)"
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="done"
            />
            <View style={styles.editActions}>
              <Pressable
                style={[styles.editActionBtn, { backgroundColor: colors.muted }]}
                onPress={() => setEditing(false)}
              >
                <Text style={[styles.editActionText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.editActionBtn, { backgroundColor: colors.primary }]}
                onPress={saveProfile}
              >
                <Text style={[styles.editActionText, { color: "#fff" }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.identityInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={[styles.yearPill, { backgroundColor: currentCat.color + "18" }]}>
              <Feather name={currentCat.icon} size={11} color={currentCat.color} />
              <Text style={[styles.yearPillText, { color: currentCat.color }]}>{user.year}</Text>
            </View>
            {user.college.length > 0 && (
              <Text style={styles.college}>{user.college}</Text>
            )}
            <Pressable
              style={({ pressed }) => [styles.editBtn, { opacity: pressed ? 0.6 : 1 }]}
              onPress={() => setEditing(true)}
            >
              <Feather name="edit-2" size={12} color={colors.primary} />
              <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit Profile</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Discipline + Year Picker */}
      {!editing && (
        <>
          <Text style={styles.sectionHeader}>DISCIPLINE</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catRow}
          >
            {DISCIPLINE_CATEGORIES.map((cat) => {
              const active = selectedCat === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  style={[
                    styles.catChip,
                    active && { backgroundColor: cat.color, borderColor: cat.color },
                    !active && { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => {
                    setSelectedCat(cat.key);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Feather name={cat.icon} size={12} color={active ? "#fff" : cat.color} />
                  <Text style={[styles.catChipText, { color: active ? "#fff" : colors.foreground }]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionHeader}>STUDY YEAR</Text>
          <View style={styles.iosGrouped}>
            {currentCat.years.map((y, i) => {
              const selected = user.year === y;
              return (
                <Pressable
                  key={y}
                  style={({ pressed }) => [
                    styles.iosRow,
                    i > 0 && styles.iosRowBorder,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                  onPress={() => {
                    updateUser({ year: y });
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[styles.iosRowText, selected && { color: currentCat.color, fontWeight: "700" }]}>
                    {y}
                  </Text>
                  {selected && <Feather name="check" size={16} color={currentCat.color} />}
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {/* Stats */}
      <Text style={styles.sectionHeader}>STUDY STATS</Text>
      <View style={styles.statsGrid}>
        {[
          { icon: "zap" as const, label: "Streak", value: streak, unit: "days", color: "#F59E0B" },
          { icon: "calendar" as const, label: "Study Days", value: totalStudyDays, unit: "total", color: "#3B82F6" },
          { icon: "bookmark" as const, label: "Bookmarks", value: bookmarks.length, unit: "saved", color: "#009DB5" },
          { icon: "check-circle" as const, label: "Quizzes", value: quizHistory.length, unit: "taken", color: "#10B981" },
          { icon: "bar-chart-2" as const, label: "Avg Score", value: avgScore, unit: "%", color: "#EC4899" },
          { icon: "file-text" as const, label: "Notes", value: notes.length, unit: "written", color: "#8B5CF6" },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconWrap, { backgroundColor: s.color + "15" }]}>
              <Feather name={s.icon} size={15} color={s.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
            <Text style={[styles.statUnit, { color: s.color }]}>{s.unit}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Settings */}
      <Text style={styles.sectionHeader}>SETTINGS</Text>
      <View style={styles.iosGrouped}>
        {[
          { icon: "bell" as const, label: "Study Reminders", value: "Daily 8 AM" },
          { icon: "moon" as const, label: "Dark Mode", value: "System default" },
          { icon: "shield" as const, label: "Privacy & Data", value: "" },
          { icon: "info" as const, label: "About MedPocket", value: "v1.1.0" },
        ].map((row, i) => (
          <Pressable
            key={row.label}
            style={({ pressed }) => [styles.iosRow, i > 0 && styles.iosRowBorder, { opacity: pressed ? 0.6 : 1 }]}
          >
            <View style={[styles.settingIconWrap, { backgroundColor: colors.muted }]}>
              <Feather name={row.icon} size={15} color={colors.foreground} />
            </View>
            <Text style={[styles.iosRowText, { flex: 1 }]}>{row.label}</Text>
            {row.value.length > 0 && (
              <Text style={[styles.iosRowValue, { color: colors.mutedForeground }]}>{row.value}</Text>
            )}
            <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>

      {/* References */}
      <Text style={styles.sectionHeader}>CONTENT SOURCES</Text>
      <View style={styles.iosGrouped}>
        {[
          "Harrison's Principles of Internal Medicine, 21e",
          "British National Formulary (BNF) 86",
          "WHO Clinical Guidelines",
          "UpToDate — Evidence-Based Medicine",
          "Robbins & Cotran Pathology, 10e",
          "Miller's Anesthesia, 9e",
        ].map((src, i) => (
          <View key={src} style={[styles.iosRow, i > 0 && styles.iosRowBorder]}>
            <Feather name="book-open" size={13} color={colors.primary} />
            <Text style={[styles.iosRowSmall, { color: colors.foreground }]}>{src}</Text>
          </View>
        ))}
      </View>

      {/* Reset */}
      <Pressable
        style={({ pressed }) => [styles.resetBtn, { backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 }]}
        onPress={handleSignOut}
      >
        <Feather name="log-out" size={16} color="#EF4444" />
        <Text style={styles.resetText}>Reset App Data</Text>
      </Pressable>

      {/* Footer */}
      <Text style={styles.footer}>
        MedPocket by Nirranjan · For educational purposes only{"\n"}Not a substitute for clinical judgment
      </Text>
    </Animated.ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>, topPad: number) {
  const isIOS = Platform.OS === "ios";
  const shadow = isIOS
    ? { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6 }
    : { elevation: 1 };

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerBlock: { paddingHorizontal: 20, paddingTop: topPad + 12, paddingBottom: 8 },
    pageTitle: { fontSize: 34, fontWeight: "800", color: colors.foreground, letterSpacing: -0.5 },

    // Identity card
    identityCard: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      borderRadius: 18,
      padding: 20,
      alignItems: "center",
      marginBottom: 28,
      ...shadow,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    avatarText: { fontSize: 34, fontWeight: "800", color: "#fff" },
    identityInfo: { alignItems: "center", gap: 6, width: "100%" },
    userName: { fontSize: 22, fontWeight: "700", color: colors.foreground },
    yearPill: {
      flexDirection: "row", alignItems: "center", gap: 5,
      paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    },
    yearPillText: { fontSize: 12, fontWeight: "700" },
    college: { fontSize: 12, color: colors.mutedForeground, textAlign: "center" },
    editBtn: {
      flexDirection: "row", alignItems: "center", gap: 5,
      marginTop: 8, paddingHorizontal: 14, paddingVertical: 7,
      borderRadius: 20, backgroundColor: colors.tealLight,
    },
    editBtnText: { fontSize: 12, fontWeight: "700" },

    // Edit form
    editBlock: { width: "100%", gap: 4 },
    iosLabel: {
      fontSize: 10, fontWeight: "700", color: colors.mutedForeground,
      letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4,
    },
    iosInput: {
      backgroundColor: colors.muted, borderRadius: 10,
      paddingHorizontal: 12, paddingVertical: 12,
      fontSize: 15, borderWidth: StyleSheet.hairlineWidth,
    },
    editActions: { flexDirection: "row", gap: 10, marginTop: 12 },
    editActionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
    editActionText: { fontSize: 14, fontWeight: "700" },

    // Section header (iOS ALL CAPS style)
    sectionHeader: {
      fontSize: 12, fontWeight: "700", color: colors.mutedForeground,
      textTransform: "uppercase", letterSpacing: 0.8,
      paddingHorizontal: 20, marginBottom: 8, marginTop: 4,
    },

    // Discipline chips
    catRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 16 },
    catChip: {
      flexDirection: "row", alignItems: "center", gap: 5,
      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
      borderWidth: 1,
    },
    catChipText: { fontSize: 12, fontWeight: "600" },

    // iOS grouped list
    iosGrouped: {
      backgroundColor: colors.card,
      marginHorizontal: 16, borderRadius: 14,
      overflow: "hidden", marginBottom: 28,
      ...shadow,
    },
    iosRow: {
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingHorizontal: 16, paddingVertical: 13, minHeight: 46,
    },
    iosRowBorder: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    iosRowText: { flex: 1, fontSize: 15, color: colors.foreground },
    iosRowValue: { fontSize: 14 },
    iosRowSmall: { flex: 1, fontSize: 13, lineHeight: 19 },
    settingIconWrap: {
      width: 30, height: 30, borderRadius: 8,
      alignItems: "center", justifyContent: "center",
    },

    // Stats
    statsGrid: {
      flexDirection: "row", flexWrap: "wrap",
      paddingHorizontal: 12, gap: 10, marginBottom: 28,
    },
    statCard: {
      width: "30%", flexGrow: 1,
      borderRadius: 14, padding: 14,
      alignItems: "center", gap: 4,
      ...shadow,
    },
    statIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 2 },
    statValue: { fontSize: 22, fontWeight: "800" },
    statUnit: { fontSize: 10, fontWeight: "700" },
    statLabel: { fontSize: 10, textAlign: "center" },

    // Reset
    resetBtn: {
      flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: 8, marginHorizontal: 16, borderRadius: 14,
      paddingVertical: 15, marginBottom: 16, ...shadow,
    },
    resetText: { fontSize: 15, fontWeight: "700", color: "#EF4444" },

    // Footer
    footer: {
      fontSize: 11, color: colors.mutedForeground,
      textAlign: "center", lineHeight: 17,
      paddingHorizontal: 24, marginBottom: 12,
    },
  });
}
