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

import { clinicalSystems } from "@/data/clinicalExam";
import { useColors } from "@/hooks/useColors";

export default function ClinicalExamScreen() {
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
          <Text style={styles.title}>Clinical Examination</Text>
          <Text style={styles.subtitle}>Systematic examination guides</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Feather name="info" size={14} color={colors.primary} />
          <Text style={styles.infoText}>
            Follow the Look-Feel-Move-Special Tests sequence for each system.
          </Text>
        </View>

        {clinicalSystems.map((system) => (
          <Pressable
            key={system.id}
            style={({ pressed }) => [styles.systemCard, { borderLeftColor: system.color, opacity: pressed ? 0.85 : 1 }]}
            onPress={() => router.push(`/clinical-exam/${system.id}`)}
          >
            <View style={[styles.systemIcon, { backgroundColor: system.color + "20" }]}>
              <Feather name={system.icon as keyof typeof Feather.glyphMap} size={24} color={system.color} />
            </View>
            <View style={styles.systemContent}>
              <Text style={styles.systemName}>{system.name}</Text>
              <Text style={styles.systemDesc} numberOfLines={2}>{system.description}</Text>
              <View style={styles.systemStats}>
                <StatBadge label={`${system.importantSigns.length} signs`} color={system.color} />
                <StatBadge label={`${system.osceTips.length} OSCE tips`} color={system.color} />
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function StatBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ backgroundColor: color + "15", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
      <Text style={{ fontSize: 10, color, fontWeight: "600" }}>{label}</Text>
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
    infoCard: {
      flexDirection: "row", alignItems: "flex-start", gap: 8,
      backgroundColor: colors.tealLight, borderRadius: 12,
      padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.primary + "30",
    },
    infoText: { flex: 1, fontSize: 12, color: colors.tealDark, lineHeight: 18 },
    systemCard: {
      flexDirection: "row", alignItems: "center", gap: 14,
      backgroundColor: colors.card, borderRadius: 16,
      padding: 16, marginBottom: 12, borderWidth: 1,
      borderColor: colors.border, borderLeftWidth: 4,
    },
    systemIcon: {
      width: 52, height: 52, borderRadius: 14,
      alignItems: "center", justifyContent: "center",
    },
    systemContent: { flex: 1 },
    systemName: { fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 4 },
    systemDesc: { fontSize: 12, color: colors.mutedForeground, lineHeight: 18, marginBottom: 8 },
    systemStats: { flexDirection: "row", gap: 6 },
  });
}
