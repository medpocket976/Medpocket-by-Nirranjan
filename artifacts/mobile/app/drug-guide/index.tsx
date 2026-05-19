import { Feather } from "@expo/vector-icons";
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

export default function DrugGuideScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isBookmarked } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const results = searchDrugs(query, category);
  const styles = makeStyles(colors);

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
  };

  return (
    <View style={[styles.container]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={styles.title}>Drug Guide</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{results.length}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search drugs, brand names, class..."
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {DRUG_CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={[styles.categoryChip, category === cat && { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() => setCategory(cat)}
          >
            {cat !== "All" && (
              <View style={[styles.categoryDot, { backgroundColor: category === cat ? "#fff" : (CATEGORY_COLORS[cat] || colors.primary) }]} />
            )}
            <Text style={[styles.categoryText, category === cat && { color: "#fff" }]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Drug List */}
      <FlatList
        data={results}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
        renderItem={({ item }) => (
          <DrugRow
            drug={item}
            colors={colors}
            bookmarked={isBookmarked(item.id)}
            categoryColor={CATEGORY_COLORS[item.category] || colors.primary}
            onPress={() => router.push(`/drug-guide/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="tablet" size={48} color={colors.border} />
            <Text style={styles.emptyText}>No drugs found</Text>
            <Text style={styles.emptySubText}>Try a different search term or category</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function DrugRow({
  drug, colors, bookmarked, categoryColor, onPress,
}: {
  drug: Drug;
  colors: ReturnType<typeof useColors>;
  bookmarked: boolean;
  categoryColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: colors.card,
          borderRadius: 14,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={{ width: 44, height: 44, borderRadius: 11, backgroundColor: categoryColor + "20", alignItems: "center", justifyContent: "center" }}>
        <Feather name="tablet" size={20} color={categoryColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }} numberOfLines={1}>
          {drug.name}
        </Text>
        <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 2 }} numberOfLines={1}>
          {drug.drugClass}
        </Text>
        <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
          <View style={{ backgroundColor: categoryColor + "20", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
            <Text style={{ fontSize: 10, color: categoryColor, fontWeight: "600" }}>{drug.category}</Text>
          </View>
          <View style={{ backgroundColor: colors.muted, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
            <Text style={{ fontSize: 10, color: colors.mutedForeground }}>Cat. {drug.pregnancyCategory}</Text>
          </View>
        </View>
      </View>
      {bookmarked && <Feather name="bookmark" size={14} color={colors.primary} />}
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
    title: { flex: 1, fontSize: 20, fontWeight: "800", color: colors.foreground },
    countBadge: {
      backgroundColor: colors.tealLight,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    countText: { fontSize: 13, fontWeight: "700", color: colors.primary },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginBottom: 12,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    searchInput: { flex: 1, fontSize: 14, color: colors.foreground },
    categoryRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 12 },
    categoryChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryDot: { width: 6, height: 6, borderRadius: 3 },
    categoryText: { fontSize: 12, fontWeight: "600", color: colors.mutedForeground },
    empty: { alignItems: "center", paddingTop: 60, gap: 8 },
    emptyText: { fontSize: 17, fontWeight: "700", color: colors.mutedForeground },
    emptySubText: { fontSize: 13, color: colors.mutedForeground },
  });
}
