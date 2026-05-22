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
import { useColors } from "@/hooks/useColors";

const DISCIPLINE_CATEGORIES = [
  {
    key: "medical", label: "Medical", icon: "activity" as const, color: "#009DB5",
    years: ["MBBS 1st Year","MBBS 2nd Year","MBBS 3rd Year","MBBS 4th Year","MBBS Final Year","MBBS Intern"],
  },
  {
    key: "nursing", label: "Nursing", icon: "heart" as const, color: "#EC4899",
    years: [
      "GNM 1st Year","GNM 2nd Year","GNM 3rd Year",
      "BSc Nursing 1st Year","BSc Nursing 2nd Year","BSc Nursing 3rd Year","BSc Nursing 4th Year",
      "Post Basic BSc Nursing","MSc Nursing",
    ],
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
      "BSc Dietetics","BSc Audiology",
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

const SECTION_COUNT = 5; // header, identity, stats, settings, sources

export default function ProfileScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const router  = useRouter();
  const {
    user, updateUser,
    bookmarks, notes, quizHistory, streak, totalStudyDays,
    signOut,
    theme, setTheme,
  } = useApp();

  const [editing, setEditing]           = useState(false);
  const [nameInput, setNameInput]       = useState(user.name);
  const [collegeInput, setCollegeInput] = useState(user.college);
  const [selectedCat, setSelectedCat]  = useState(() => findCatForYear(user.year));
  const [showYearPicker, setShowYearPicker] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // Entrance animations — stagger per section
  const sectionAnims = useRef(
    Array.from({ length: SECTION_COUNT }, () => ({
      opacity:    new Animated.Value(0),
      translateY: new Animated.Value(20),
    }))
  ).current;

  // Save button pulse
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
    return {
      opacity:   sectionAnims[i].opacity,
      transform: [{ translateY: sectionAnims[i].translateY }],
    };
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
    const next: Record<string, "system" | "light" | "dark"> = {
      system: "light", light: "dark", dark: "system",
    };
    setTheme(next[theme]);
  }

  const avgScore =
    quizHistory.length > 0
      ? Math.round((quizHistory.reduce((a, r) => a + r.score / r.total, 0) / quizHistory.length) * 100)
      : 0;

  const currentCat = DISCIPLINE_CATEGORIES.find((c) => c.key === selectedCat)!;
  const s = makeStyles(colors, topPad);
  const themeLabel = { system: "System Default", light: "Light Mode", dark: "Dark Mode" }[theme];
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
      <Animated.View style={[{ marginBottom: 28 }, animStyle(1)]}>
        <View style={s.identityCard}>
          <View style={[s.avatar, { backgroundColor: currentCat.color }]}>
            <Text style={s.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>

          {editing ? (
            <View style={s.editBlock}>
              <Text style={[s.iosLabel, { color: colors.mutedForeground }]}>FULL NAME</Text>
              <TextInput
                style={[s.iosInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                autoFocus
              />
              <Text style={[s.iosLabel, { marginTop: 10, color: colors.mutedForeground }]}>COLLEGE / INSTITUTION</Text>
              <TextInput
                style={[s.iosInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
                value={collegeInput}
                onChangeText={setCollegeInput}
                placeholder="e.g. AIIMS Delhi (optional)"
                placeholderTextColor={colors.mutedForeground}
              />
              <View style={s.editActions}>
                <Pressable
                  style={({ pressed }) => [s.editActionBtn, { backgroundColor: colors.muted, opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => setEditing(false)}
                >
                  <Text style={[s.editActionText, { color: colors.foreground }]}>Cancel</Text>
                </Pressable>
                <Animated.View style={[{ flex: 1 }, { transform: [{ scale: savePulse }] }]}>
                  <Pressable
                    style={({ pressed }) => [s.editActionBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
                    onPress={saveProfile}
                  >
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
              <SettingPressable
                style={[s.editBtn, { backgroundColor: colors.tealLight }]}
                onPress={() => setEditing(true)}
                scale={0.94}
              >
                <Feather name="edit-2" size={12} color={colors.primary} />
                <Text style={[s.editBtnText, { color: colors.primary }]}>Edit Profile</Text>
              </SettingPressable>
            </View>
          )}
        </View>

        {/* Discipline picker */}
        {!editing && (
          <>
            <Text style={[s.sectionHeader, { color: colors.mutedForeground }]}>DISCIPLINE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
              {DISCIPLINE_CATEGORIES.map((cat) => {
                const active = selectedCat === cat.key;
                return (
                  <Pressable
                    key={cat.key}
                    style={[
                      s.catChip,
                      active
                        ? { backgroundColor: cat.color, borderColor: cat.color }
                        : { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                    onPress={() => {
                      setSelectedCat(cat.key);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Feather name={cat.icon} size={12} color={active ? "#fff" : cat.color} />
                    <Text style={[s.catChipText, { color: active ? "#fff" : colors.foreground }]}>
                      {cat.label}
                    </Text>
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
                      style={({ pressed }) => [
                        s.iosRow, i > 0 && s.iosRowBorder,
                        { backgroundColor: colors.card, opacity: pressed ? 0.6 : 1 },
                      ]}
                      onPress={() => {
                        updateUser({ year: y });
                        setShowYearPicker(false);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Text style={[s.iosRowText, { flex: 1, color: sel ? currentCat.color : colors.foreground, fontWeight: sel ? "700" : "400" }]}>
                        {y}
                      </Text>
                      {sel && <Feather name="check" size={16} color={currentCat.color} />}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}
      </Animated.View>

      {/* ── Section 2 — Stats ── */}
      <Animated.View style={animStyle(2)}>
        <Text style={[s.sectionHeader, { color: colors.mutedForeground }]}>STUDY STATS</Text>
        <View style={s.statsGrid}>
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} colors={colors} s={s} />
          ))}
        </View>
      </Animated.View>

      {/* ── Section 3 — Settings ── */}
      <Animated.View style={animStyle(3)}>
        <Text style={[s.sectionHeader, { color: colors.mutedForeground }]}>SETTINGS</Text>
        <View style={[s.iosGrouped, s.shadow, { backgroundColor: colors.card }]}>
          <SettingPressable
            style={[s.iosRow, { backgroundColor: colors.card }]}
            onPress={cycleTheme}
          >
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
            <Text style={[s.iosRowValue, { color: colors.mutedForeground }]}>Jan 2026</Text>
            <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
          </SettingPressable>

          <SettingPressable
            style={[s.iosRow, s.iosRowBorder, { backgroundColor: colors.card }]}
            onPress={() =>
              Alert.alert(
                "MedPocket v1.1.0",
                "Built by Nirranjan\n\nContent sourced from Harrison's, BNF, WHO, UpToDate, Robbins, Miller's Anesthesia.\n\nFor educational use only — not a substitute for clinical judgment."
              )
            }
          >
            <View style={[s.settingIconWrap, { backgroundColor: "#3B82F618" }]}>
              <Feather name="info" size={15} color="#3B82F6" />
            </View>
            <Text style={[s.iosRowText, { flex: 1, color: colors.foreground }]}>About MedPocket</Text>
            <Text style={[s.iosRowValue, { color: colors.mutedForeground }]}>v1.1.0</Text>
            <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
          </SettingPressable>
        </View>
      </Animated.View>

      {/* ── Section 4 — Content Sources ── */}
      <Animated.View style={animStyle(4)}>
        <View style={s.sourcesHeader}>
          <Text style={[s.sectionHeader, { color: colors.mutedForeground, marginBottom: 0 }]}>CONTENT SOURCES</Text>
          <View style={[s.verifiedBadge, { backgroundColor: "#10B98112", borderColor: "#10B98130" }]}>
            <Feather name="check-circle" size={10} color="#10B981" />
            <Text style={[s.verifiedText, { color: "#10B981" }]}>Verified · Jan 2026</Text>
          </View>
        </View>
        <View style={[s.iosGrouped, s.shadow, { backgroundColor: colors.card }]}>
          {[
            { src: "Harrison's Principles of Internal Medicine, 21e", year: "2022" },
            { src: "British National Formulary (BNF) 86",             year: "2024" },
            { src: "WHO Clinical Guidelines",                          year: "2024" },
            { src: "UpToDate — Evidence-Based Medicine",              year: "2024" },
            { src: "Robbins & Cotran Pathology, 10e",                 year: "2020" },
            { src: "Miller's Anesthesia, 9e",                         year: "2019" },
          ].map(({ src, year }, i) => (
            <View
              key={src}
              style={[s.iosRow, i > 0 && s.iosRowBorder, { backgroundColor: colors.card }]}
            >
              <Feather name="book-open" size={13} color={colors.primary} />
              <Text style={[s.iosRowSmall, { color: colors.foreground, flex: 1 }]}>{src}</Text>
              <Text style={[s.iosRowValue, { color: colors.mutedForeground }]}>{year}</Text>
            </View>
          ))}
        </View>

        {/* Reset */}
        <SettingPressable
          style={[s.resetBtn, s.shadow, { backgroundColor: colors.card }]}
          onPress={handleSignOut}
          scale={0.97}
        >
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

/** Animated settings row / button — spring-scale on press */
function SettingPressable({
  children, style, onPress, scale = 0.98,
}: {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  scale?: number;
}) {
  const anim = useRef(new Animated.Value(1)).current;
  function pressIn() {
    Animated.spring(anim, { toValue: scale, tension: 160, friction: 8, useNativeDriver: true }).start();
  }
  function pressOut() {
    Animated.spring(anim, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }).start();
  }
  return (
    <Pressable onPressIn={pressIn} onPressOut={pressOut} onPress={onPress}>
      <Animated.View style={[style, { transform: [{ scale: anim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

/** Individual stat card with staggered entrance */
function StatCard({
  stat, index, colors, s,
}: {
  stat: { icon: keyof typeof Feather.glyphMap; label: string; value: number; unit: string; color: string };
  index: number;
  colors: ReturnType<typeof useColors>;
  s: ReturnType<typeof makeStyles>;
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

  function pressIn() {
    Animated.spring(scale, { toValue: 0.93, tension: 160, friction: 8, useNativeDriver: true }).start();
  }
  function pressOut() {
    Animated.spring(scale, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }).start();
  }

  return (
    <Pressable style={s.statCardOuter} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View
        style={[
          s.statCard,
          { backgroundColor: colors.card },
          { opacity, transform: [{ translateY }, { scale }] },
        ]}
      >
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
    identityCard: {
      backgroundColor: colors.card, marginHorizontal: 16, borderRadius: 18,
      padding: 20, alignItems: "center", ...shadow,
    },
    avatar:        { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 14 },
    avatarText:    { fontSize: 34, fontWeight: "800", color: "#fff" },
    identityInfo:  { alignItems: "center", gap: 6, width: "100%" },
    userName:      { fontSize: 22, fontWeight: "700" },
    yearPill:      { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    yearPillText:  { fontSize: 12, fontWeight: "700" },
    college:       { fontSize: 12, textAlign: "center" },
    editBtn:       { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    editBtnText:   { fontSize: 12, fontWeight: "700" },
    editBlock:     { width: "100%", gap: 4 },
    iosLabel:      { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 },
    iosInput:      { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, borderWidth: StyleSheet.hairlineWidth },
    editActions:   { flexDirection: "row", gap: 10, marginTop: 12 },
    editActionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
    editActionText:{ fontSize: 14, fontWeight: "700" },
    sectionHeader: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, paddingHorizontal: 20, marginBottom: 8, marginTop: 4 },
    catRow:        { paddingHorizontal: 16, gap: 8, paddingBottom: 16 },
    catChip:       { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    catChipText:   { fontSize: 12, fontWeight: "600" },
    iosGrouped:    { backgroundColor: colors.card, marginHorizontal: 16, borderRadius: 14, overflow: "hidden", marginBottom: 4 },
    iosGroupedBelow: { marginHorizontal: 16, borderRadius: 14, overflow: "hidden", marginBottom: 28, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
    iosRow:        { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 13, minHeight: 46 },
    iosRowBorder:  { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
    iosRowText:    { fontSize: 15, color: colors.foreground },
    iosRowValue:   { fontSize: 12, color: colors.mutedForeground },
    iosRowSmall:   { fontSize: 13, lineHeight: 19, marginLeft: 6 },
    settingIconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    sourcesHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingRight: 16, marginBottom: 8, marginTop: 4 },
    verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
    verifiedText:  { fontSize: 10, fontWeight: "600" },
    statsGrid:     { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 10, marginBottom: 28 },
    statCardOuter: { width: "30%", flexGrow: 1 },
    statCard:      {
      borderRadius: 14, padding: 14, alignItems: "center", gap: 4,
      ...(isIOS ? { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 } : { elevation: 1 }),
    },
    statIconWrap:  { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 2 },
    statValue:     { fontSize: 22, fontWeight: "800" },
    statUnit:      { fontSize: 10, fontWeight: "700" },
    statLabel:     { fontSize: 10, textAlign: "center" },
    resetBtn:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, borderRadius: 14, paddingVertical: 15, marginTop: 12, marginBottom: 16 },
    resetText:     { fontSize: 15, fontWeight: "700", color: "#EF4444" },
    footer:        { fontSize: 11, textAlign: "center", lineHeight: 17, paddingHorizontal: 24, marginBottom: 12 },
  });
}
