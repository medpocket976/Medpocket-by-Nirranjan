import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
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
  const { user, updateUser, bookmarks, notes, quizHistory, streak, totalStudyDays } = useApp();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [collegeInput, setCollegeInput] = useState(user.college);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const styles = makeStyles(colors);

  function saveProfile() {
    updateUser({ name: nameInput.trim() || "Medical Student", college: collegeInput.trim() });
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  const avgQuizScore =
    quizHistory.length > 0
      ? Math.round(
          (quizHistory.reduce((a, r) => a + r.score / r.total, 0) / quizHistory.length) * 100
        )
      : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        {editing ? (
          <View style={styles.editForm}>
            <Text style={styles.editLabel}>Full Name</Text>
            <TextInput
              style={styles.editInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
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
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileYear}>{user.year}</Text>
            {user.college.length > 0 && <Text style={styles.profileCollege}>{user.college}</Text>}
            <Pressable style={styles.editBtn} onPress={() => setEditing(true)}>
              <Feather name="edit-2" size={13} color={colors.primary} />
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Year Selector */}
      {!editing && (
        <>
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
        </>
      )}

      {/* Stats */}
      <Text style={styles.sectionTitle}>Study Stats</Text>
      <View style={styles.statsGrid}>
        <StatBox icon="zap" label="Streak" value={`${streak}`} unit="days" color="#F59E0B" colors={colors} />
        <StatBox icon="calendar" label="Study Days" value={`${totalStudyDays}`} unit="total" color="#3B82F6" colors={colors} />
        <StatBox icon="bookmark" label="Bookmarks" value={`${bookmarks.length}`} unit="saved" color="#009DB5" colors={colors} />
        <StatBox icon="file-text" label="Notes" value={`${notes.length}`} unit="created" color="#8B5CF6" colors={colors} />
        <StatBox icon="check-circle" label="Quizzes" value={`${quizHistory.length}`} unit="taken" color="#10B981" colors={colors} />
        <StatBox icon="bar-chart-2" label="Avg Score" value={`${avgQuizScore}`} unit="%" color="#EC4899" colors={colors} />
      </View>

      {/* Settings */}
      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.settingsCard}>
        <SettingRow icon="bell" label="Study Reminders" value="Daily 8 AM" colors={colors} />
        <SettingRow icon="moon" label="Dark Mode" value="System default" colors={colors} showBorder />
        <SettingRow icon="shield" label="Privacy & Data" value="" colors={colors} showBorder />
        <SettingRow icon="info" label="About MedPocket" value="v1.0.0" colors={colors} showBorder />
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerTitle}>Educational Disclaimer</Text>
        <Text style={styles.disclaimerText}>
          This application is intended for educational purposes only and should not replace professional medical judgment, diagnosis, or treatment. Always consult a qualified healthcare provider.
        </Text>
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
      <Feather name={icon} size={18} color={color} />
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
      style={[
        { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
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
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 3,
  },
  value: { fontSize: 22, fontWeight: "800" },
  unit: { fontSize: 10, fontWeight: "600" },
  label: { fontSize: 10, textAlign: "center" },
});

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    profileCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      borderRadius: 20,
      padding: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    avatarText: { fontSize: 28, fontWeight: "800", color: "#fff" },
    profileName: { fontSize: 20, fontWeight: "800", color: colors.foreground, textAlign: "center" },
    profileYear: { fontSize: 13, color: colors.primary, fontWeight: "600", marginTop: 4 },
    profileCollege: { fontSize: 12, color: colors.mutedForeground, marginTop: 2, textAlign: "center" },
    editBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 12,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.tealLight,
    },
    editBtnText: { fontSize: 12, color: colors.primary, fontWeight: "600" },
    editForm: { width: "100%", gap: 6 },
    editLabel: { fontSize: 11, color: colors.mutedForeground, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
    editInput: {
      backgroundColor: colors.muted,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.foreground,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 6,
    },
    editActions: { flexDirection: "row", gap: 10, marginTop: 4 },
    cancelBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.muted,
      alignItems: "center",
    },
    cancelBtnText: { fontSize: 14, color: colors.foreground, fontWeight: "600" },
    saveBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center",
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
      paddingVertical: 7,
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
      marginBottom: 24,
    },
    disclaimerBox: {
      backgroundColor: colors.tealLight,
      marginHorizontal: 20,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
    },
    disclaimerTitle: { fontSize: 13, fontWeight: "700", color: colors.tealDark, marginBottom: 6 },
    disclaimerText: { fontSize: 12, color: colors.tealDark, lineHeight: 18 },
    brand: { fontSize: 11, color: colors.primary, fontWeight: "700", marginTop: 10, textAlign: "right" },
  });
}
