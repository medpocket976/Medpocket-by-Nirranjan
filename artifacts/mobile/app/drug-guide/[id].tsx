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
import { getDrugById } from "@/data/drugs";
import { useColors } from "@/hooks/useColors";

const TABS = ["Overview", "Dosage", "Safety", "Pearls"];

export default function DrugDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isBookmarked, addBookmark, removeBookmark } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const drug = getDrugById(id ?? "");

  if (!drug) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground, fontSize: 16 }}>Drug not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const bookmarked = isBookmarked(drug.id);

  function toggleBookmark() {
    if (bookmarked) {
      removeBookmark(drug.id);
    } else {
      addBookmark({ type: "drug", itemId: drug.id, name: drug.name });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const styles = makeStyles(colors);

  return (
    <View style={[styles.container]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.drugName} numberOfLines={1}>{drug.name}</Text>
          <Text style={styles.drugClass} numberOfLines={1}>{drug.drugClass}</Text>
        </View>
        <Pressable style={styles.bookmarkBtn} onPress={toggleBookmark}>
          <Feather name="bookmark" size={20} color={bookmarked ? colors.primary : colors.mutedForeground} />
        </Pressable>
      </View>

      {/* Brand names + category badges */}
      <View style={styles.metaRow}>
        <View style={[styles.badge, { backgroundColor: colors.tealLight }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{drug.category}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: drug.pregnancyCategory === "X" ? "#FEE2E2" : "#F0FDF4" }]}>
          <Text style={[styles.badgeText, { color: drug.pregnancyCategory === "X" ? "#EF4444" : "#10B981" }]}>
            Pregnancy Cat. {drug.pregnancyCategory}
          </Text>
        </View>
      </View>
      <Text style={styles.brandNames}>{drug.brandNames.join(" · ")}</Text>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab, i) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === i && styles.tabActive]}
            onPress={() => setActiveTab(i)}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 0 && (
          <>
            <InfoCard title="Mechanism of Action" icon="cpu" content={drug.mechanism} colors={colors} />
            <ListCard title="Indications" icon="check-circle" items={drug.indications} colors={colors} color="#10B981" />
            <ListCard title="Contraindications" icon="x-circle" items={drug.contraindications} colors={colors} color="#EF4444" />
          </>
        )}
        {activeTab === 1 && (
          <>
            <InfoCard title="Dosage & Administration" icon="thermometer" content={drug.dosage} colors={colors} />
            <ListCard title="Drug Interactions" icon="link" items={drug.interactions} colors={colors} color="#F59E0B" />
            <ListCard title="Monitoring Parameters" icon="eye" items={drug.monitoring} colors={colors} color="#3B82F6" />
          </>
        )}
        {activeTab === 2 && (
          <>
            <ListCard title="Side Effects" icon="alert-triangle" items={drug.sideEffects} colors={colors} color="#F97316" />
            <InfoCard title="Pregnancy Safety" icon="heart" content={`Category ${drug.pregnancyCategory}: ${pregnancyCategoryDesc(drug.pregnancyCategory)}`} colors={colors} />
          </>
        )}
        {activeTab === 3 && (
          <>
            {drug.mnemonics && (
              <InfoCard title="Mnemonic" icon="zap" content={drug.mnemonics} colors={colors} highlight />
            )}
            <ListCard title="Clinical Pearls" icon="star" items={drug.clinicalPearls} colors={colors} color="#009DB5" />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function InfoCard({
  title, icon, content, colors, highlight,
}: {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  content: string;
  colors: ReturnType<typeof useColors>;
  highlight?: boolean;
}) {
  return (
    <View style={[{ backgroundColor: highlight ? colors.tealLight : colors.card, borderColor: highlight ? colors.primary + "40" : colors.border, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1 }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Feather name={icon} size={16} color={highlight ? colors.primary : colors.mutedForeground} />
        <Text style={{ fontSize: 13, fontWeight: "700", color: highlight ? colors.primary : colors.foreground, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</Text>
      </View>
      <Text style={{ fontSize: 14, color: colors.foreground, lineHeight: 22 }}>{content}</Text>
    </View>
  );
}

function ListCard({
  title, icon, items, colors, color,
}: {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  items: string[];
  colors: ReturnType<typeof useColors>;
  color: string;
}) {
  return (
    <View style={{ backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Feather name={icon} size={16} color={color} />
        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.foreground, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</Text>
      </View>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 10, marginBottom: i < items.length - 1 ? 10 : 0, alignItems: "flex-start" }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginTop: 7, flexShrink: 0 }} />
          <Text style={{ flex: 1, fontSize: 14, color: colors.foreground, lineHeight: 22 }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function pregnancyCategoryDesc(cat: string) {
  const map: Record<string, string> = {
    A: "Adequate studies show no risk to fetus in 1st trimester.",
    B: "Animal studies show no risk; no adequate human studies OR animal studies show adverse effects but human studies show no risk.",
    C: "Animal studies show adverse effects; no adequate human studies. Use only if benefit outweighs risk.",
    D: "Evidence of fetal risk; benefits may outweigh risks in serious situations.",
    X: "Fetal abnormalities demonstrated. Risks outweigh benefits. CONTRAINDICATED in pregnancy.",
  };
  return map[cat] || "Category not specified.";
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 12,
      gap: 12,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    headerCenter: { flex: 1 },
    drugName: { fontSize: 18, fontWeight: "800", color: colors.foreground },
    drugClass: { fontSize: 12, color: colors.mutedForeground, marginTop: 1 },
    bookmarkBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    metaRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 6 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontSize: 11, fontWeight: "700" },
    brandNames: { fontSize: 12, color: colors.mutedForeground, paddingHorizontal: 20, marginBottom: 16 },
    tabsRow: {
      flexDirection: "row",
      marginHorizontal: 20,
      backgroundColor: colors.muted,
      borderRadius: 12,
      padding: 4,
      marginBottom: 4,
    },
    tab: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: "center" },
    tabActive: { backgroundColor: colors.card, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
    tabText: { fontSize: 12, fontWeight: "600", color: colors.mutedForeground },
    tabTextActive: { color: colors.primary },
  });
}
