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
import { DRUG_CATEGORIES, Drug, searchDrugs } from "@/data/drugs";
import { useColors } from "@/hooks/useColors";

const CATEGORY_COLORS: Record<string, string> = {
  Antibiotics: "#EF4444",
  Antihypertensives: "#009DB5",
  Antidiabetics: "#10B981",
  Analgesics: "#F59E0B",
  "CNS Drugs": "#8B5CF6",
  Emergency: "#EF4444",
  Respiratory: "#3B82F6",
  "GI Drugs": "#F97316",
  Diuretics: "#06B6D4",
  Anticoagulants: "#EC4899",
  Corticosteroids: "#84CC16",
  Cardiovascular: "#EF4444",
  Antifungals: "#A855F7",
  Antivirals: "#6366F1",
  Antitubercular: "#92400E",
  Antirheumatic: "#0EA5E9",
  Hormones: "#F97316",
  Antimalarials: "#16A34A",
  Anaesthesia: "#7C3AED",
  "Local Anaesthetics": "#0891B2",
  "Neuromuscular Blockers": "#B45309",
};

export default function DrugGuideScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isBookmarked } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const results = searchDrugs(query, category);
  const isIOS = Platform.OS === "ios";
  const shadow = isIOS
    ? { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 }
    : { elevation: 1 };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* iOS-style Navigation Header */}
      <View style={[styles.navHeader, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.5 : 1 }]}
          onPress={() => router.back()}
        >
          <Feather name="chevron-left" size={26} color={colors.primary} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>Drug Guide</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.countText}>{results.length}</Text>
        </View>
      </View>

      {/* Search bar — iOS style inset */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
          <Feather name="search" size={15} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search drugs, brand names, class..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <View style={styles.clearBtn}>
                <Feather name="x" size={11} color="#fff" />
              </View>
            </Pressable>
          )}
        </View>
      </View>

      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.categoryRow, { backgroundColor: colors.card }]}
        style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}
      >
        {DRUG_CATEGORIES.map((cat) => {
          const active = category === cat;
          const accent = CATEGORY_COLORS[cat] || colors.primary;
          return (
            <Pressable
              key={cat}
              onPress={() => {
                setCategory(cat);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.catChip,
                active
                  ? { backgroundColor: accent, borderColor: accent }
                  : { backgroundColor: colors.muted, borderColor: colors.border },
              ]}
            >
              {cat !== "All" && (
                <View style={[styles.catDot, { backgroundColor: active ? "rgba(255,255,255,0.8)" : accent }]} />
              )}
              <Text style={[styles.catText, { color: active ? "#fff" : colors.foreground }]}>{cat}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Drug list — iOS flat list style */}
      <FlatList
        data={results}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        ItemSeparatorComponent={() => (
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 70 }} />
        )}
        renderItem={({ item, index }) => (
          <DrugRow
            drug={item}
            colors={colors}
            bookmarked={isBookmarked(item.id)}
            categoryColor={CATEGORY_COLORS[item.category] || colors.primary}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/drug-guide/${item.id}`);
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
              <Feather name="search" size={32} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No drugs found</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Try a different search term or category
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function DrugRow({
  drug,
  colors,
  bookmarked,
  categoryColor,
  onPress,
}: {
  drug: Drug;
  colors: ReturnType<typeof useColors>;
  bookmarked: boolean;
  categoryColor: string;
  onPress: () => void;
}) {
  const initials = drug.name.charAt(0).toUpperCase();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.muted : colors.card },
      ]}
      onPress={onPress}
    >
      {/* Left — color circle with initial */}
      <View style={[styles.avatar, { backgroundColor: categoryColor + "20" }]}>
        <Text style={[styles.avatarText, { color: categoryColor }]}>{initials}</Text>
      </View>

      {/* Center — name, class, tags */}
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={[styles.drugName, { color: colors.foreground }]} numberOfLines={1}>
            {drug.name}
          </Text>
          {bookmarked && (
            <Feather name="bookmark" size={12} color={colors.primary} style={{ marginLeft: 5 }} />
          )}
        </View>
        <Text style={[styles.drugClass, { color: colors.mutedForeground }]} numberOfLines={1}>
          {drug.drugClass}
        </Text>
        <View style={styles.tagRow}>
          <View style={[styles.tag, { backgroundColor: categoryColor + "18" }]}>
            <Text style={[styles.tagText, { color: categoryColor }]}>{drug.category}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: colors.muted }]}>
            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>Cat. {drug.pregnancyCategory}</Text>
          </View>
          {drug.brandNames[0] && (
            <View style={[styles.tag, { backgroundColor: colors.muted }]}>
              <Text style={[styles.tagText, { color: colors.mutedForeground }]} numberOfLines={1}>
                {drug.brandNames[0]}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Feather name="chevron-right" size={16} color={colors.border} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 10,
    gap: 4,
  },
  backBtn: { padding: 8 },
  navTitle: { flex: 1, fontSize: 17, fontWeight: "700", textAlign: "center" },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  countText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  searchWrap: { paddingHorizontal: 12, paddingVertical: 8 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  clearBtn: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: "#C7C7CC",
    alignItems: "center", justifyContent: "center",
  },

  categoryRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  catChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  catDot: { width: 6, height: 6, borderRadius: 3 },
  catText: { fontSize: 12, fontWeight: "600" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
    minHeight: 72,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700" },
  rowContent: { flex: 1, gap: 2 },
  rowTop: { flexDirection: "row", alignItems: "center" },
  drugName: { fontSize: 15, fontWeight: "600", flex: 1 },
  drugClass: { fontSize: 12 },
  tagRow: { flexDirection: "row", gap: 5, marginTop: 4, flexWrap: "wrap" },
  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  tagText: { fontSize: 10, fontWeight: "600" },

  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptySub: { fontSize: 13 },
});
