import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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

const STUDY_YEARS = [
  "MBBS 1st Year", "MBBS 2nd Year", "MBBS 3rd Year",
  "MBBS 4th Year", "MBBS Final Year", "Intern",
  "Resident (PG Year 1)", "Resident (PG Year 2)", "Resident (PG Year 3)",
  "Fellow", "Consultant",
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser, bookmarks, notes, quizHistory, streak, totalStudyDays, signOut } = useApp();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [collegeInput, setCollegeInput] = useState(user.college);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const cardAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const settingsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.spring(statsAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.spring(settingsAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
    ]).start();
  }, []);

  function saveProfile() {
    updateUser({ name: nameInput.trim() || "Medical Student", college: collegeInput.trim() });
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleSignOut() {
    Alert.alert(
      "Reset App Data",
      "This will clear all your notes, bookmarks, quiz history, and profile. You'll go back to the onboarding screen. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            signOut();
          },
        },
      ]
    );
  }

  const avgQuizScore =
    quizHistory.length > 0
      ? Math.round(
          (quizHistory.reduce((a, r) => a + r.score / r.total, 0) / quizHistory.length) * 100
        )
      : 0;

  const animStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  });

  const styles = makeStyles(colors);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: topPad + 8, paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>My Profile</Text>

      {/* Profile Card */}
      <Animated.View style={animStyle(cardAnim)}>
        <View style={styles.profileCard}>
          <LinearGradient
            colors={["#009DB5", "#006A7A"]}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </LinearGradient>

          {editing ? (
            <View style={styles.editForm}>
              <Text style={styles.editLabel}>Full Name</Text>
              <TextInput
                style={styles.editInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                autoFocus
              />
              <Text style={styles.editLabel}>College / Institution</Text>
              <TextInput
                style={styles.editInput}
                value={collegeInput}
                onChangeText={setCollegeInput}
                placeholder="e.g. AIIMS Delhi"
                placeholderTextColor={colors.mutedForeground}
              />
              <View style={styles.editActions}>
                <Pressable style={styles.cancelBtn} onPress={() => setEditing(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.saveBtn} onPress={saveProfile}>
                  <Feather name="check" size={15} color="#fff" />
                  <Text style={styles.saveBtnText}>Save</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.profileName}>{user.name}</Text>
              <View style={styles.yearBadge}>
                <Feather name="award" size={11} color={colors.primary} />
                <Text style={styles.profileYear}>{user.year}</Text>
              </View>
              {user.college.length > 0 && (
                <View style={styles.collegeRow}>
                  <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                  <Text style={styles.profileCollege}>{user.college}</Text>
                </View>
              )}
              <Pressable
                style={({ pressed }) => [styles.editBtn, { opacity: pressed ? 0.8 : 1 }]}
                onPress={() => setEditing(true)}
              >
                <Feather name="edit-2" size={13} color={colors.primary} />
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </Pressable>
            </>
          )}
        </View>
      </Animated.View>

      {/* Year Selector */}
      {!editing && (
        <Animated.View style={animStyle(cardAnim)}>
          <Text style={styles.sectionTitle}>Study Year</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearRow}
          >
            {STUDY_YEARS.map((y) => (
              <Pressable
                key={y}
                style={[styles.yearChip, user.year === y && styles.yearChipActive]}
                onPress={() => {
                  updateUser({ year: y });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={[styles.yearChipText, user.year === y && styles.yearChipTextActive]}>
                  {y}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Stats */}
      <Animated.View style={animStyle(statsAnim)}>
        <Text style={styles.sectionTitle}>Study Stats</Text>
        <View style={styles.statsGrid}>
          <StatBox icon="zap" label="Streak" value={`${streak}`} unit="days" color="#F59E0B" colors={colors} />
          <StatBox icon="calendar" label="Study Days" value={`${totalStudyDays}`} unit="total" color="#3B82F6" colors={colors} />
          <StatBox icon="bookmark" label="Bookmarks" value={`${bookmarks.length}`} unit="saved" color="#009DB5" colors={colors} />
          <StatBox icon="file-text" label="Notes" value={`${notes.length}`} unit="created" color="#8B5CF6" colors={colors} />
          <StatBox icon="check-circle" label="Quizzes" value={`${quizHistory.length}`} unit="taken" color="#10B981" colors={colors} />
          <StatBox icon="bar-chart-2" label="Avg Score" value={`${avgQuizScore}`} unit="%" color="#EC4899" colors={colors} />
        </View>
      </Animated.View>

      {/* Settings */}
      <Animated.View style={animStyle(settingsAnim)}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsCard}>
          <SettingRow icon="bell" label="Study Reminders" value="Daily 8 AM" colors={colors} />
          <SettingRow icon="moon" label="Dark Mode" value="System default" colors={colors} showBorder />
          <SettingRow icon="shield" label="Privacy & Data" value="" colors={colors} showBorder />
          <SettingRow icon="info" label="About MedPocket" value="v1.1.0" colors={colors} showBorder />
        </View>

        <Pressable
          style={({ pressed }) => [styles.signOutBtn, { opacity: pressed ? 0.8 : 1 }]}
          onPress={handleSignOut}
        >
          <Feather name="log-out" size={16} color={colors.critical} />
          <Text style={[styles.signOutText, { color: colors.critical }]}>Reset App Data</Text>
        </Pressable>
      </Animated.View>

      {/* Disclaimer */}
      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerTitle}>Educational Disclaimer</Text>
        <Text style={styles.disclaimerText}>
          This application is intended for educational purposes only and should not replace professional medical judgment, diagnosis, or treatment. Always consult a qualified healthcare provider.
        </Text>
        <View style={styles.sourceRow}>
          <Feather name="book-open" size={11} color={colors.primary} />
          <Text style={styles.sourceText}>Content sourced from Harrison's, BNF, WHO, UpToDate, and standard medical references.</Text>
        </View>
        <Text style={styles.brand}>MedPocket by Nirranjan</Text>
      </View>
    </ScrollView>
  );
}

function StatBox({
  icon, label, value, unit, color, colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  unit: string;
  color: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[{ backgroundColor: colors.card, borderColor: colors.border }, statStyles.box]}>
      <View style={[statStyles.iconWrap, { backgroundColor: color + "18" }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <Text style={[statStyles.value, { color: colors.foreground }]}>{value}</Text>
      <Text style={[statStyles.unit, { color }]}>{unit}</Text>
      <Text style={[statStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function SettingRow({
  icon, label, value, colors, showBorder,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
  showBorder?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        { flexDirection: "row", alignItems: "center", padding: 14, gap: 12, opacity: pressed ? 0.7 : 1 },
        showBorder && { borderTopWidth: 1, borderTopColor: colors.border },
      ]}
    >
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }}>
        <Feather name={icon} size={17} color={colors.foreground} />
      </View>
      <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: colors.foreground }}>{label}</Text>
      {value.length > 0 && <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{value}</Text>}
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

const statStyles = StyleSheet.create({
  box: {
    width: "30%",
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  value: { fontSize: 22, fontWeight: "800" },
  unit: { fontSize: 10, fontWeight: "700" },
  label: { fontSize: 10, textAlign: "center" },
});

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    pageTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.foreground,
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    profileCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      borderRadius: 22,
      padding: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
    },
    avatarGradient: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    avatarText: { fontSize: 32, fontWeight: "800", color: "#fff" },
    profileName: { fontSize: 22, fontWeight: "800", color: colors.foreground, textAlign: "center" },
    yearBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.tealLight,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      marginTop: 6,
    },
    profileYear: { fontSize: 12, color: colors.primary, fontWeight: "700" },
    collegeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
    },
    profileCollege: { fontSize: 12, color: colors.mutedForeground, textAlign: "center" },
    editBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 14,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.tealLight,
    },
    editBtnText: { fontSize: 12, color: colors.primary, fontWeight: "700" },
    editForm: { width: "100%", gap: 6 },
    editLabel: {
      fontSize: 10,
      color: colors.mutedForeground,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    editInput: {
      backgroundColor: colors.muted,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.foreground,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 6,
    },
    editActions: { flexDirection: "row", gap: 10, marginTop: 4 },
    cancelBtn: {
      flex: 1,
      paddingVertical: 11,
      borderRadius: 10,
      backgroundColor: colors.muted,
      alignItems: "center",
    },
    cancelBtnText: { fontSize: 14, color: colors.foreground, fontWeight: "600" },
    saveBtn: {
      flex: 1,
      paddingVertical: 11,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 5,
    },
    saveBtnText: { fontSize: 14, color: "#fff", fontWeight: "700" },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.foreground,
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    yearRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 20 },
    yearChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    yearChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    yearChipText: { fontSize: 12, fontWeight: "600", color: colors.mutedForeground },
    yearChipTextActive: { color: "#fff" },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 16,
      gap: 10,
      marginBottom: 24,
    },
    settingsCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      marginBottom: 14,
    },
    signOutBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginHorizontal: 20,
      paddingVertical: 14,
      justifyContent: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
    },
    signOutText: { fontSize: 14, fontWeight: "700" },
    disclaimerBox: {
      backgroundColor: colors.tealLight,
      marginHorizontal: 20,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      gap: 6,
    },
    disclaimerTitle: { fontSize: 13, fontWeight: "700", color: colors.tealDark },
    disclaimerText: { fontSize: 12, color: colors.tealDark, lineHeight: 18 },
    sourceRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 6,
      marginTop: 4,
    },
    sourceText: { fontSize: 11, color: colors.primary, lineHeight: 16, flex: 1 },
    brand: { fontSize: 11, color: colors.primary, fontWeight: "700", marginTop: 6, textAlign: "right" },
  });
}
