import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
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
import { LAB_GROUPS, LabValue, searchLabValues } from "@/data/labValues";
import { useColors } from "@/hooks/useColors";

const GROUP_COLORS: Record<string, string> = {
  CBC: "#EF4444",
  Electrolytes: "#3B82F6",
  LFT: "#F59E0B",
  RFT: "#8B5CF6",
  ABG: "#10B981",
  Coagulation: "#EC4899",
  Cardiac: "#EF4444",
  Thyroid: "#F97316",
  Lipids: "#6366F1",
  Glucose: "#F59E0B",
  "Iron Studies": "#DC2626",
  Inflammatory: "#EF4444",
  "Tumour Markers": "#8B5CF6",
  Urine: "#06B6D4",
};

export default function LabValuesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isBookmarked, addBookmark, removeBookmark } = useApp();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const results = searchLabValues(query, group);
  const styles = makeStyles(colors);

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function toggleBookmark(lv: LabValue) {
    if (isBookmarked(lv.id)) {
      removeBookmark(lv.id);
    } else {
      addBookmark({ type: "lab", itemId: lv.id, name: lv.name });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={styles.title}>Lab Values</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{results.length}</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search lab tests..."
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.groupRow}
        style={styles.groupScroll}
        decelerationRate="fast"
      >
        {LAB_GROUPS.map((g) => {
          const active = group === g;
          const accent = GROUP_COLORS[g] || colors.primary;
          return (
            <Pressable
              key={g}
              style={[
                styles.groupChip,
                { backgroundColor: active ? accent : colors.muted, borderColor: active ? accent : colors.border },
              ]}
              onPress={() => setGroup(g)}
            >
              <Text
                style={[styles.groupText, { color: active ? "#fff" : colors.mutedForeground }]}
                numberOfLines={1}
              >
                {g}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={results}
        keyExtractor={(lv) => lv.id}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
        renderItem={({ item }) => {
          const color = GROUP_COLORS[item.group] || colors.primary;
          const expanded = expandedId === item.id;
          const bmed = isBookmarked(item.id);
          return (
            <Pressable
              style={[styles.labCard, expanded && { borderColor: color + "60" }]}
              onPress={() => toggleExpand(item.id)}
            >
              <View style={styles.labCardHeader}>
                <View style={[styles.labGroupDot, { backgroundColor: color }]} />
                <View style={styles.labInfo}>
                  <Text style={styles.labName}>{item.name}</Text>
                  <Text style={styles.labAbbrev}>{item.abbreviation} · {item.group}</Text>
                </View>
                <View style={styles.labActions}>
                  <Pressable onPress={() => toggleBookmark(item)} hitSlop={8}>
                    <Feather name="bookmark" size={14} color={bmed ? colors.primary : colors.mutedForeground} />
                  </Pressable>
                  <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
                </View>
              </View>

              <View style={styles.normalRange}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rangeLabel}>Normal Range</Text>
                  <Text style={styles.rangeValue}>{item.normalRangeAdult}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.rangeLabel}>Unit</Text>
                  <Text style={[styles.rangeValue, { color: color }]}>{item.unit}</Text>
                </View>
              </View>

              {expanded && (
                <View style={styles.expandedContent}>
                  {item.criticalLow && (
                    <View style={styles.criticalRow}>
                      <Feather name="arrow-down-circle" size={14} color="#EF4444" />
                      <Text style={styles.criticalText}>Critical Low: {item.criticalLow}</Text>
                    </View>
                  )}
                  {item.criticalHigh && (
                    <View style={styles.criticalRow}>
                      <Feather name="arrow-up-circle" size={14} color="#EF4444" />
                      <Text style={styles.criticalText}>Critical High: {item.criticalHigh}</Text>
                    </View>
                  )}
                  {item.normalRangePediatric && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Pediatric Range:</Text>
                      <Text style={styles.infoValue}>{item.normalRangePediatric}</Text>
                    </View>
                  )}
                  <View style={[styles.interpretBox, { backgroundColor: color + "10" }]}>
                    <Text style={[styles.interpretTitle, { color }]}>Interpretation</Text>
                    <Text style={styles.interpretText}>{item.interpretation}</Text>
                  </View>
                  <Text style={styles.significanceText}>{item.clinicalSignificance}</Text>
                </View>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bar-chart-2" size={48} color={colors.border} />
            <Text style={styles.emptyText}>No lab values found</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
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
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.muted, alignItems: "center", justifyContent: "center",
    },
    title: { flex: 1, fontSize: 20, fontWeight: "800", color: colors.foreground },
    countBadge: { backgroundColor: colors.tealLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    countText: { fontSize: 13, fontWeight: "700", color: colors.primary },
    searchRow: {
      flexDirection: "row", alignItems: "center", backgroundColor: colors.card,
      marginHorizontal: 20, marginBottom: 12, paddingHorizontal: 14, paddingVertical: 11,
      borderRadius: 12, borderWidth: 1, borderColor: colors.border, gap: 10,
    },
    searchInput: { flex: 1, fontSize: 14, color: colors.foreground },
    groupScroll: { flexGrow: 0, flexShrink: 0 },
    groupRow: {
      paddingHorizontal: 16,
      paddingVertical: 4,
      paddingBottom: 10,
      gap: 6,
      flexDirection: "row",
      alignItems: "center",
    },
    groupChip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 32,
    },
    groupText: { fontSize: 12, fontWeight: "600" },
    labCard: {
      backgroundColor: colors.card, borderRadius: 14, padding: 14,
      marginBottom: 10, borderWidth: 1, borderColor: colors.border,
    },
    labCardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    labGroupDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0, marginTop: 2 },
    labInfo: { flex: 1 },
    labName: { fontSize: 14, fontWeight: "700", color: colors.foreground },
    labAbbrev: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
    labActions: { flexDirection: "row", alignItems: "center", gap: 10 },
    normalRange: { flexDirection: "row", justifyContent: "space-between" },
    rangeLabel: { fontSize: 10, color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.5 },
    rangeValue: { fontSize: 13, fontWeight: "600", color: colors.foreground, marginTop: 2 },
    expandedContent: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, gap: 8 },
    criticalRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    criticalText: { fontSize: 12, color: "#EF4444", fontWeight: "600" },
    infoRow: { gap: 2 },
    infoLabel: { fontSize: 11, color: colors.mutedForeground, fontWeight: "600" },
    infoValue: { fontSize: 12, color: colors.foreground },
    interpretBox: { borderRadius: 8, padding: 10 },
    interpretTitle: { fontSize: 11, fontWeight: "700", marginBottom: 4, textTransform: "uppercase" },
    interpretText: { fontSize: 12, color: colors.foreground, lineHeight: 18 },
    significanceText: { fontSize: 12, color: colors.mutedForeground, lineHeight: 18, fontStyle: "italic" },
    empty: { alignItems: "center", paddingTop: 60, gap: 8 },
    emptyText: { fontSize: 17, fontWeight: "700", color: colors.mutedForeground },
  });
}
