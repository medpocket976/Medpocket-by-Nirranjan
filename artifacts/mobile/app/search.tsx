import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { searchDrugs } from "@/data/drugs";
import { emergencyProtocols } from "@/data/emergencyProtocols";
import { searchLabValues } from "@/data/labValues";
import { useColors } from "@/hooks/useColors";

interface SearchResult {
  id: string;
  name: string;
  type: "drug" | "lab" | "emergency" | "note";
  subtitle: string;
  route: string;
  color: string;
  icon: keyof typeof Feather.glyphMap;
}

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notes, recentSearches, addRecentSearch, clearRecentSearches } = useApp();
  const [query, setQuery] = useState("");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const styles = makeStyles(colors);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim();
    if (!q) return [];
    const out: SearchResult[] = [];

    // Drugs
    searchDrugs(q).slice(0, 4).forEach((d) => {
      out.push({
        id: `drug-${d.id}`,
        name: d.name,
        type: "drug",
        subtitle: d.drugClass,
        route: `/drug-guide/${d.id}`,
        color: "#009DB5",
        icon: "tablet",
      });
    });

    // Lab values
    searchLabValues(q).slice(0, 3).forEach((lv) => {
      out.push({
        id: `lab-${lv.id}`,
        name: lv.name,
        type: "lab",
        subtitle: `${lv.group} · ${lv.normalRangeAdult}`,
        route: `/lab-values`,
        color: "#10B981",
        icon: "bar-chart-2",
      });
    });

    // Emergency
    emergencyProtocols
      .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 2)
      .forEach((p) => {
        out.push({
          id: `emg-${p.id}`,
          name: p.name,
          type: "emergency",
          subtitle: `${p.urgency} priority protocol`,
          route: `/emergency/${p.id}`,
          color: "#EF4444",
          icon: "alert-circle",
        });
      });

    // Notes
    notes
      .filter(
        (n) =>
          n.title.toLowerCase().includes(q.toLowerCase()) ||
          n.content.toLowerCase().includes(q.toLowerCase())
      )
      .slice(0, 2)
      .forEach((n) => {
        out.push({
          id: `note-${n.id}`,
          name: n.title,
          type: "note",
          subtitle: n.subject,
          route: `/notes/${n.id}`,
          color: "#8B5CF6",
          icon: "file-text",
        });
      });

    return out;
  }, [query, notes]);

  function handleSearch(q: string) {
    setQuery(q);
  }

  function handleSelectResult(result: SearchResult) {
    addRecentSearch(query);
    router.push(result.route as any);
  }

  function handleRecentSearch(term: string) {
    setQuery(term);
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Search Bar */}
      <View style={styles.searchHeader}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search drugs, labs, protocols, notes..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={handleSearch}
            autoFocus
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Results */}
      {query.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
          ListHeaderComponent={
            results.length > 0 ? (
              <Text style={styles.sectionTitle}>{results.length} result{results.length !== 1 ? "s" : ""}</Text>
            ) : (
              <View style={styles.noResults}>
                <Feather name="search" size={40} color={colors.border} />
                <Text style={styles.noResultsText}>No results for "{query}"</Text>
                <Text style={styles.noResultsSubtext}>Try a different search term</Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.resultCard, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => handleSelectResult(item)}
            >
              <View style={[styles.resultIcon, { backgroundColor: item.color + "20" }]}>
                <Feather name={item.icon} size={18} color={item.color} />
              </View>
              <View style={styles.resultContent}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
              </View>
              <View style={[styles.typeBadge, { backgroundColor: item.color + "15" }]}>
                <Text style={[styles.typeText, { color: item.color }]}>{item.type}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          {recentSearches.length > 0 && (
            <>
              <View style={styles.recentHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <Pressable onPress={clearRecentSearches}>
                  <Text style={styles.clearText}>Clear</Text>
                </Pressable>
              </View>
              {recentSearches.map((term, i) => (
                <Pressable
                  key={i}
                  style={styles.recentItem}
                  onPress={() => handleRecentSearch(term)}
                >
                  <Feather name="clock" size={14} color={colors.mutedForeground} />
                  <Text style={styles.recentText}>{term}</Text>
                  <Feather name="arrow-up-left" size={14} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Search across</Text>
          {[
            { label: "Drug Guide", desc: "Generic names, brand names, drug class", icon: "tablet" as const, color: "#009DB5" },
            { label: "Lab Values", desc: "CBC, LFT, RFT, ABG, coagulation", icon: "bar-chart-2" as const, color: "#10B981" },
            { label: "Emergency Protocols", desc: "ACLS, sepsis, anaphylaxis, DKA", icon: "alert-circle" as const, color: "#EF4444" },
            { label: "Your Notes", desc: "Search your personal notes", icon: "file-text" as const, color: "#8B5CF6" },
          ].map((item) => (
            <View key={item.label} style={styles.moduleRow}>
              <View style={[styles.moduleIcon, { backgroundColor: item.color + "20" }]}>
                <Feather name={item.icon} size={16} color={item.color} />
              </View>
              <View>
                <Text style={styles.moduleName}>{item.label}</Text>
                <Text style={styles.moduleDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    searchHeader: {
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingHorizontal: 20, paddingBottom: 16,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.muted, alignItems: "center", justifyContent: "center",
    },
    searchBox: {
      flex: 1, flexDirection: "row", alignItems: "center", gap: 10,
      backgroundColor: colors.card, borderRadius: 12,
      paddingHorizontal: 14, paddingVertical: 11,
      borderWidth: 1, borderColor: colors.border,
    },
    searchInput: { flex: 1, fontSize: 14, color: colors.foreground },
    sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 12 },
    noResults: { alignItems: "center", paddingTop: 40, gap: 8 },
    noResultsText: { fontSize: 16, fontWeight: "700", color: colors.foreground },
    noResultsSubtext: { fontSize: 12, color: colors.mutedForeground },
    resultCard: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: colors.card, borderRadius: 14, padding: 14,
      marginBottom: 8, borderWidth: 1, borderColor: colors.border,
    },
    resultIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    resultContent: { flex: 1 },
    resultName: { fontSize: 14, fontWeight: "700", color: colors.foreground },
    resultSubtitle: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    typeText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
    emptyState: { paddingHorizontal: 20, paddingTop: 8 },
    recentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    clearText: { fontSize: 12, color: colors.primary, fontWeight: "600" },
    recentItem: {
      flexDirection: "row", alignItems: "center", gap: 10,
      paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    recentText: { flex: 1, fontSize: 14, color: colors.foreground },
    moduleRow: {
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingVertical: 10,
    },
    moduleIcon: { width: 36, height: 36, borderRadius: 9, alignItems: "center", justifyContent: "center" },
    moduleName: { fontSize: 13, fontWeight: "600", color: colors.foreground },
    moduleDesc: { fontSize: 11, color: colors.mutedForeground, marginTop: 1 },
  });
}
