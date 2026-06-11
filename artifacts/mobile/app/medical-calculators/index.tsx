import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  CATEGORIES,
  MedCalcCategory,
  medicalCalculators,
  getMedCalculatorsByCategory,
} from "@/data/medicalCalculators";
import { useColors } from "@/hooks/useColors";

export default function MedicalCalculatorsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<MedCalcCategory | "all">("all");

  const filtered = medicalCalculators.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.abbreviation ?? "").toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Blood & Fluid Calculators</Text>
          <Text style={styles.subtitle}>{medicalCalculators.length} medical calculators</Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Feather name="search" size={15} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search calculators…"
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <Feather name="x" size={14} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          <Pressable
            style={[
              styles.tab,
              activeCategory === "all"
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: colors.muted, borderColor: colors.border },
            ]}
            onPress={() => {
              setActiveCategory("all");
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={[styles.tabText, { color: activeCategory === "all" ? "#fff" : colors.mutedForeground }]}>
              All
            </Text>
          </Pressable>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                style={[
                  styles.tab,
                  isActive
                    ? { backgroundColor: cat.color, borderColor: cat.color }
                    : { backgroundColor: colors.muted, borderColor: colors.border },
                ]}
                onPress={() => {
                  setActiveCategory(cat.id);
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Feather name={cat.icon as any} size={11} color={isActive ? "#fff" : cat.color} />
                <Text style={[styles.tabText, { color: isActive ? "#fff" : colors.mutedForeground }]}>
                  {cat.label.replace(" Calculators", "")}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: "#F59E0B15", borderColor: "#F59E0B30" }]}>
          <Feather name="alert-triangle" size={13} color="#D97706" />
          <Text style={styles.disclaimerText}>
            For medical education purposes only. Always verify calculations before clinical use.
          </Text>
        </View>

        {/* Results */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="search" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No calculators found</Text>
          </View>
        ) : (
          activeCategory === "all" && !search
            ? CATEGORIES.map((cat) => {
                const items = getMedCalculatorsByCategory(cat.id);
                if (items.length === 0) return null;
                return (
                  <View key={cat.id} style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <View style={[styles.sectionIcon, { backgroundColor: cat.color + "20" }]}>
                        <Feather name={cat.icon as any} size={14} color={cat.color} />
                      </View>
                      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{cat.label}</Text>
                      <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>{items.length}</Text>
                    </View>
                    {items.map((calc) => (
                      <CalcRow key={calc.id} calc={calc} colors={colors} styles={styles} />
                    ))}
                  </View>
                );
              })
            : (
              <View style={styles.section}>
                {filtered.map((calc) => (
                  <CalcRow key={calc.id} calc={calc} colors={colors} styles={styles} />
                ))}
              </View>
            )
        )}
      </ScrollView>
    </View>
  );
}

function CalcRow({
  calc,
  colors,
  styles,
}: {
  calc: ReturnType<typeof getMedCalculatorsByCategory>[number];
  colors: ReturnType<typeof useColors>;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.calcRow,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/medical-calculators/${calc.id}`);
      }}
    >
      <View style={[styles.calcIcon, { backgroundColor: calc.color + "18" }]}>
        <Feather name={calc.icon as any} size={20} color={calc.color} />
      </View>
      <View style={styles.calcInfo}>
        <View style={styles.calcNameRow}>
          {calc.abbreviation && (
            <Text style={[styles.calcAbbrev, { color: calc.color }]}>{calc.abbreviation}</Text>
          )}
          <Text style={[styles.calcName, { color: colors.foreground }]}>{calc.name}</Text>
        </View>
        <Text style={[styles.calcDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {calc.description}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
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
    title: { fontSize: 18, fontWeight: "800", color: colors.foreground },
    subtitle: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      marginBottom: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 12,
      borderWidth: 1,
      gap: 8,
    },
    searchInput: { flex: 1, fontSize: 14 },
    tabsWrap: { paddingVertical: 8 },
    tabs: {
      paddingHorizontal: 14,
      gap: 7,
      alignItems: "center",
    },
    tab: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
      height: 30,
    },
    tabText: { fontSize: 12, fontWeight: "600" },
    content: { paddingHorizontal: 16, paddingTop: 4 },
    disclaimer: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      marginBottom: 16,
    },
    disclaimerText: { flex: 1, fontSize: 11, color: "#92400E", lineHeight: 16 },
    empty: { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyText: { fontSize: 14 },
    section: { marginBottom: 20 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    sectionIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionTitle: { fontSize: 14, fontWeight: "700", flex: 1 },
    sectionCount: {
      fontSize: 11,
      fontWeight: "600",
      backgroundColor: colors.muted,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    calcRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      marginBottom: 8,
    },
    calcIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    calcInfo: { flex: 1 },
    calcNameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
    calcAbbrev: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
    calcName: { fontSize: 13, fontWeight: "600" },
    calcDesc: { fontSize: 11, marginTop: 2, lineHeight: 16 },
  });
}
