import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { GlassBackground } from "@/components/GlassBackground";
import { GlassView } from "@/components/GlassView";
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
import {
  ANAESTHESIA_CATEGORIES,
  AnaesthesiaCategory,
  AnaesthesiaEquipment,
  searchAnaesthesiaEquipment,
} from "@/data/anaesthesiaEquipment";
import { useColors } from "@/hooks/useColors";

const CATEGORY_COLORS: Record<string, string> = {
  "All": "#009DB5",
  "Airway Devices": "#EF4444",
  "Laryngoscopes": "#8B5CF6",
  "Scopes": "#10B981",
  "Anaesthesia Workstation": "#F59E0B",
  "Monitoring Devices": "#3B82F6",
  "Vascular Access": "#EC4899",
  "Regional Anaesthesia": "#6366F1",
  "Surgical Instruments": "#64748B",
};

const CATEGORY_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  "All": "grid",
  "Airway Devices": "wind",
  "Laryngoscopes": "eye",
  "Scopes": "camera",
  "Anaesthesia Workstation": "settings",
  "Monitoring Devices": "activity",
  "Vascular Access": "droplet",
  "Regional Anaesthesia": "crosshair",
  "Surgical Instruments": "tool",
};

const ALL_CATEGORIES = ["All", ...ANAESTHESIA_CATEGORIES] as const;

function CategoryPill({
  cat,
  active,
  onPress,
}: {
  cat: string;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const accent = CATEGORY_COLORS[cat] || colors.primary;
  const icon = CATEGORY_ICONS[cat] || "circle";

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor: active ? accent : colors.muted,
          borderColor: active ? accent : colors.glassBorder,
        },
      ]}
    >
      <Feather
        name={icon}
        size={12}
        color={active ? "#fff" : colors.mutedForeground}
      />
      <Text
        style={[
          styles.pillText,
          { color: active ? "#fff" : colors.mutedForeground },
        ]}
        numberOfLines={1}
      >
        {cat}
      </Text>
    </Pressable>
  );
}

function EquipmentCard({
  item,
  onPress,
  onBookmark,
  bookmarked,
}: {
  item: AnaesthesiaEquipment;
  onPress: () => void;
  onBookmark: () => void;
  bookmarked: boolean;
}) {
  const colors = useColors();
  const accent = CATEGORY_COLORS[item.category] || colors.primary;

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
      onPress={onPress}
    >
      <View style={[styles.cardAccent, { backgroundColor: accent + "20" }]}>
        <Feather
          name={CATEGORY_ICONS[item.category] || "box"}
          size={22}
          color={accent}
        />
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.cardMeta}>
          <View style={[styles.subcatBadge, { backgroundColor: accent + "15" }]}>
            <Text style={[styles.subcatText, { color: accent }]}>{item.subcategory}</Text>
          </View>
        </View>
        <Text style={[styles.cardDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.infoRow}>
            <Feather name="layers" size={10} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              {item.sizes.split(".")[0]}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="zap" size={10} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              {item.indications.length} indications
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardRight}>
        <Pressable onPress={onBookmark} hitSlop={12} style={styles.bookmarkBtn}>
          <Feather
            name={bookmarked ? "bookmark" : "bookmark"}
            size={15}
            color={bookmarked ? accent : colors.mutedForeground}
            style={{ opacity: bookmarked ? 1 : 0.5 }}
          />
        </Pressable>
        <Feather name="chevron-right" size={16} color={colors.glassBorder} />
      </View>
    </Pressable>
  );
}

export default function AnaesthesiaEquipmentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isBookmarked, addBookmark, removeBookmark } = useApp();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const results = useMemo(
    () => searchAnaesthesiaEquipment(query, selectedCategory),
    [query, selectedCategory]
  );

  function handleBookmark(item: AnaesthesiaEquipment) {
    if (isBookmarked(item.id)) {
      removeBookmark(item.id);
    } else {
      addBookmark({ type: "drug", itemId: item.id, name: item.name });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleSelect(cat: string) {
    setSelectedCategory(cat);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const accent = CATEGORY_COLORS[selectedCategory] || colors.primary;

  return (
    <GlassBackground style={styles.container}>
      {/* Header */}
      <GlassView radius={0} style={[styles.header, { paddingBottom: 12 }]} /* injected */>
        <Pressable
          style={[styles.backBtn, { backgroundColor: colors.muted }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Anaesthesia Equipment
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Airway & OT Reference
          </Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: accent + "20" }]}>
          <Text style={[styles.countText, { color: accent }]}>{results.length}</Text>
        </View>
      </GlassView>

      {/* Search */}
      <View
        style={[
          styles.searchRow,
          { backgroundColor: colors.glassBg, borderColor: colors.glassBorder },
        ]}
      >
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search equipment, devices..."
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")} hitSlop={8}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
        style={styles.pillScroll}
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {ALL_CATEGORIES.map((cat) => (
          <CategoryPill
            key={cat}
            cat={cat}
            active={selectedCategory === cat}
            onPress={() => handleSelect(cat)}
          />
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: insets.bottom + 80,
        }}
        renderItem={({ item }) => (
          <EquipmentCard
            item={item}
            bookmarked={isBookmarked(item.id)}
            onBookmark={() => handleBookmark(item)}
            onPress={() =>
              router.push(`/anaesthesia-equipment/${item.id}` as any)
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="tool" size={48} color={colors.glassBorder} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No equipment found
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>
              Try a different search term or category
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1 },
  title: { fontSize: 18, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: 1 },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    minWidth: 36,
    alignItems: "center",
  },
  countText: { fontSize: 13, fontWeight: "700" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },
  pillScroll: { flexGrow: 0, flexShrink: 0 },
  pillRow: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    paddingBottom: 10,
    gap: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  cardAccent: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardBody: { flex: 1, gap: 4 },
  cardName: { fontSize: 14, fontWeight: "700", lineHeight: 20 },
  cardMeta: { flexDirection: "row", gap: 6, alignItems: "center" },
  subcatBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subcatText: { fontSize: 10, fontWeight: "600" },
  cardDesc: { fontSize: 12, lineHeight: 17 },
  cardFooter: { flexDirection: "row", gap: 12, marginTop: 2 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  infoText: { fontSize: 10 },
  cardRight: {
    alignItems: "center",
    gap: 8,
    paddingTop: 2,
  },
  bookmarkBtn: { padding: 2 },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 17, fontWeight: "700" },
  emptySubtext: { fontSize: 13 },
});
