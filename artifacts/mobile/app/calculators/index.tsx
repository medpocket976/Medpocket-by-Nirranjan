import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
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
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <View>
          <Text style={styles.title}>Medical Calculators</Text>
          <Text style={styles.subtitle}>{calculators.length} clinical scoring tools</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
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
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
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
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    calcCard: {
      width: "47%", flexGrow: 1,
      backgroundColor: colors.card, borderRadius: 16,
      padding: 16, borderWidth: 1, borderColor: colors.border,
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
