import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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
import { getSystemById } from "@/data/clinicalExam";
import { useColors } from "@/hooks/useColors";

const TABS = ["Examination", "Signs", "Differentials", "OSCE / Viva"];

export default function ClinicalExamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isBookmarked, addBookmark, removeBookmark } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const system = getSystemById(id ?? "");

  if (!system) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground }}>System not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const bookmarked = isBookmarked(system.id);
  function toggleBookmark() {
    if (!system) return;
    if (bookmarked) removeBookmark(system.id);
    else addBookmark({ type: "exam", itemId: system.id, name: system.name });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const styles = makeStyles(colors, system.color);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: system.color }]}>
        <View style={styles.headerTop}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <Pressable style={styles.bookmarkBtn} onPress={toggleBookmark}>
            <Feather name="bookmark" size={18} color={bookmarked ? "#fff" : "rgba(255,255,255,0.6)"} />
          </Pressable>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Feather name={system.icon as keyof typeof Feather.glyphMap} size={28} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>{system.name}</Text>
        <Text style={styles.headerDesc}>{system.description}</Text>
      </View>

      <View style={styles.tabsRow}>
        {TABS.map((tab, i) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === i && styles.tabActive]}
            onPress={() => setActiveTab(i)}
          >
            <Text style={[styles.tabText, activeTab === i && { color: system.color }]} numberOfLines={1}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 0 && (
          <>
            <ExamSection title="Inspection" icon="eye" items={system.inspectionFindings} color={system.color} colors={colors} />
            <ExamSection title="Palpation" icon="hand" items={system.palpationFindings} color={system.color} colors={colors} />
            {system.percussionFindings && (
              <ExamSection title="Percussion" icon="music" items={system.percussionFindings} color={system.color} colors={colors} />
            )}
            {system.auscultationFindings && (
              <ExamSection title="Auscultation" icon="headphones" items={system.auscultationFindings} color={system.color} colors={colors} />
            )}
          </>
        )}

        {activeTab === 1 && system.importantSigns.map((sign, i) => (
          <View key={i} style={[styles.signCard, { borderLeftColor: system.color }]}>
            <Text style={[styles.signName, { color: system.color }]}>{sign.sign}</Text>
            <Text style={styles.signSignificance}>{sign.significance}</Text>
          </View>
        ))}

        {activeTab === 2 && system.differentialDiagnoses.map((diff, i) => (
          <View key={i} style={styles.diffCard}>
            <View style={[styles.diffDot, { backgroundColor: system.color }]} />
            <Text style={styles.diffText}>{diff}</Text>
          </View>
        ))}

        {activeTab === 3 && (
          <>
            <Text style={[styles.subSectionTitle, { color: system.color }]}>OSCE Tips</Text>
            {system.osceTips.map((tip, i) => (
              <View key={i} style={[styles.tipCard, { backgroundColor: system.color + "10", borderColor: system.color + "30" }]}>
                <Feather name="star" size={14} color={system.color} style={{ marginTop: 2 }} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
            <Text style={[styles.subSectionTitle, { color: system.color, marginTop: 16 }]}>Viva Questions</Text>
            {system.vivaQuestions.map((q, i) => (
              <View key={i} style={styles.vivaCard}>
                <View style={[styles.vivaNumber, { backgroundColor: system.color }]}>
                  <Text style={styles.vivaNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.vivaText}>{q}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ExamSection({
  title, icon, items, color, colors,
}: {
  title: string;
  icon: string;
  items: string[];
  color: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Feather name={icon as keyof typeof Feather.glyphMap} size={15} color={color} />
        <Text style={{ fontSize: 14, fontWeight: "700", color, textTransform: "uppercase", letterSpacing: 0.6 }}>{title}</Text>
      </View>
      <View style={{ backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
        {items.map((item, i) => (
          <View key={i} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginTop: 7, flexShrink: 0 }} />
            <Text style={{ flex: 1, fontSize: 13, color: colors.foreground, lineHeight: 21 }}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>, accentColor: string) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingBottom: 20 },
    headerTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
    backBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center",
    },
    bookmarkBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center",
    },
    headerIcon: {
      width: 56, height: 56, borderRadius: 16,
      alignItems: "center", justifyContent: "center", marginBottom: 10,
    },
    headerTitle: { fontSize: 24, fontWeight: "800", color: "#fff", marginBottom: 6 },
    headerDesc: { fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 19 },
    tabsRow: {
      flexDirection: "row", marginHorizontal: 20, marginTop: 14,
      backgroundColor: colors.muted, borderRadius: 12, padding: 4, marginBottom: 4,
    },
    tab: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: "center" },
    tabActive: { backgroundColor: colors.card, elevation: 2 },
    tabText: { fontSize: 10, fontWeight: "600", color: colors.mutedForeground, textAlign: "center" },
    signCard: {
      backgroundColor: colors.card, borderRadius: 12, padding: 14,
      marginBottom: 10, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4,
    },
    signName: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
    signSignificance: { fontSize: 13, color: colors.foreground, lineHeight: 20 },
    diffCard: {
      flexDirection: "row", gap: 10, backgroundColor: colors.card,
      borderRadius: 12, padding: 14, marginBottom: 8,
      borderWidth: 1, borderColor: colors.border, alignItems: "flex-start",
    },
    diffDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, flexShrink: 0 },
    diffText: { flex: 1, fontSize: 13, color: colors.foreground, lineHeight: 21 },
    subSectionTitle: { fontSize: 14, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 10 },
    tipCard: {
      flexDirection: "row", gap: 10, borderRadius: 12,
      padding: 14, marginBottom: 8, borderWidth: 1, alignItems: "flex-start",
    },
    tipText: { flex: 1, fontSize: 13, color: colors.foreground, lineHeight: 21 },
    vivaCard: {
      flexDirection: "row", gap: 12, backgroundColor: colors.card,
      borderRadius: 12, padding: 14, marginBottom: 8,
      borderWidth: 1, borderColor: colors.border, alignItems: "flex-start",
    },
    vivaNumber: {
      width: 26, height: 26, borderRadius: 13,
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    vivaNumberText: { fontSize: 12, fontWeight: "800", color: "#fff" },
    vivaText: { flex: 1, fontSize: 13, color: colors.foreground, lineHeight: 21 },
  });
}
