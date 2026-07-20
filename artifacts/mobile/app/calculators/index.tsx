import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { GlassBackground } from "@/components/GlassBackground";
import { GlassView } from "@/components/GlassView";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { calculators } from "@/data/calculators";
import { medicalCalculators } from "@/data/medicalCalculators";
import { useColors } from "@/hooks/useColors";

const CALC_COLORS = [
  "#009DB5", "#EF4444", "#F59E0B", "#10B981",
  "#8B5CF6", "#F97316", "#3B82F6", "#EC4899",
];

const CALC_ICONS: (keyof typeof Feather.glyphMap)[] = [
  "user", "alert-circle", "wind", "heart",
  "zap", "activity", "shield", "plus-circle",
];

export default function CalculatorsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const styles = makeStyles(colors);

  return (
    <GlassBackground style={styles.container}>
      <GlassView radius={0} style={[styles.header, { paddingBottom: 12 }]} /* injected */>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <View>
          <Text style={styles.title}>Medical Calculators</Text>
          <Text style={styles.subtitle}>
            {calculators.length + medicalCalculators.length}+ clinical tools
          </Text>
        </View>
      </GlassView>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Anaesthesia Dose Calculator — featured card ─────────────────── */}
        <Pressable
          style={({ pressed }) => [styles.featuredCard, { opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.push("/anaesthesia-calc")}
        >
          <View style={styles.featuredLeft}>
            <View style={[styles.featuredIcon, { backgroundColor: "#6366F1" }]}>
              <Feather name="wind" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.featuredBadge}>
                <Feather name="star" size={10} color="#6366F1" />
                <Text style={[styles.featuredBadgeText, { color: "#6366F1" }]}>Featured</Text>
              </View>
              <Text style={[styles.featuredName, { color: "#1E1B4B" }]}>Anaesthesia Dose Calculator</Text>
              <Text style={[styles.featuredDesc, { color: "#4338CA" }]}>
                Weight-based dosing for induction agents, opioids, NMBAs, reversal agents & local anaesthetics
              </Text>
            </View>
          </View>
          <View style={[styles.featuredArrow, { backgroundColor: "#6366F115" }]}>
            <Feather name="arrow-right" size={16} color="#6366F1" />
          </View>
        </Pressable>

        {/* ── Blood & Fluid Calculators — featured card ───────────────────── */}
        <Pressable
          style={({ pressed }) => [
            styles.featuredCard,
            { backgroundColor: "#FFF1F2", borderColor: "#EF444430", opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => router.push("/medical-calculators")}
        >
          <View style={styles.featuredLeft}>
            <View style={[styles.featuredIcon, { backgroundColor: "#EF4444" }]}>
              <Feather name="droplet" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.featuredBadge}>
                <Feather name="plus-circle" size={10} color="#EF4444" />
                <Text style={[styles.featuredBadgeText, { color: "#EF4444" }]}>New</Text>
              </View>
              <Text style={[styles.featuredName, { color: "#7F1D1D" }]}>Blood & Fluid Calculators</Text>
              <Text style={[styles.featuredDesc, { color: "#B91C1C" }]}>
                EBV, MABL, pRBC, Shock Index · Holliday-Segar, Parkland · Electrolyte & Renal tools ({medicalCalculators.length} calculators)
              </Text>
            </View>
          </View>
          <View style={[styles.featuredArrow, { backgroundColor: "#EF444415" }]}>
            <Feather name="arrow-right" size={16} color="#EF4444" />
          </View>
        </Pressable>

        <Text style={styles.sectionLabel}>Clinical Scoring Tools</Text>

        <View style={styles.grid}>
          {calculators.map((calc, i) => {
            const color = CALC_COLORS[i % CALC_COLORS.length];
            const icon = CALC_ICONS[i % CALC_ICONS.length];
            return (
              <Pressable
                key={calc.id}
                style={({ pressed }) => [styles.calcCard, { opacity: pressed ? 0.85 : 1 }]}
                onPress={() => router.push(`/calculators/${calc.id}`)}
              >
                <View style={[styles.calcIcon, { backgroundColor: color + "20" }]}>
                  <Feather name={icon} size={22} color={color} />
                </View>
                {calc.abbreviation && (
                  <Text style={[styles.calcAbbrev, { color }]}>{calc.abbreviation}</Text>
                )}
                <Text style={styles.calcName}>{calc.name}</Text>
                <Text style={styles.calcDesc} numberOfLines={2}>{calc.description}</Text>
                <View style={styles.calcFooter}>
                  <Text style={styles.calcRef}>{calc.reference}</Text>
                  <Feather name="arrow-right" size={12} color={color} />
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </GlassBackground>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: "transparent" },
    header: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 20, paddingBottom: 16, gap: 12,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.muted, alignItems: "center", justifyContent: "center",
    },
    title: { fontSize: 20, fontWeight: "800", color: colors.foreground },
    subtitle: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
    featuredCard: {
      backgroundColor: "#EEF2FF",
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: "#6366F130",
    },
    featuredLeft: { flex: 1, flexDirection: "row", gap: 12, alignItems: "flex-start" },
    featuredIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    featuredBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#6366F115",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      alignSelf: "flex-start",
      marginBottom: 4,
    },
    featuredBadgeText: { fontSize: 10, fontWeight: "700" },
    featuredName: { fontSize: 14, fontWeight: "800", marginBottom: 3 },
    featuredDesc: { fontSize: 11, lineHeight: 16 },
    featuredArrow: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 12,
      marginTop: 6,
    },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    calcCard: {
      width: "47%", flexGrow: 1,
      backgroundColor: colors.glassBg, borderRadius: 16,
      padding: 16, borderWidth: 1, borderColor: colors.glassBorder,
      gap: 6,
    },
    calcIcon: {
      width: 48, height: 48, borderRadius: 14,
      alignItems: "center", justifyContent: "center",
      marginBottom: 4,
    },
    calcAbbrev: { fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },
    calcName: { fontSize: 13, fontWeight: "600", color: colors.foreground },
    calcDesc: { fontSize: 11, color: colors.mutedForeground, lineHeight: 16 },
    calcFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
    calcRef: { fontSize: 9, color: colors.mutedForeground, flex: 1, fontStyle: "italic" },
  });
}
