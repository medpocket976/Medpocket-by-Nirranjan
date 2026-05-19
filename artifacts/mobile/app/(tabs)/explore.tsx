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

import { useColors } from "@/hooks/useColors";

const EXPLORE_SECTIONS = [
  {
    title: "Clinical Reference",
    items: [
      { id: "drug-guide", label: "Drug Guide", icon: "tablet" as const, color: "#009DB5", description: "Searchable pharmacopeia with mechanisms, dosing, and clinical pearls" },
      { id: "lab-values", label: "Lab Values", icon: "bar-chart-2" as const, color: "#10B981", description: "Normal ranges, critical values, and interpretation guide" },
      { id: "emergency", label: "Emergency Protocols", icon: "alert-circle" as const, color: "#EF4444", description: "Step-by-step emergency management algorithms" },
    ],
  },
  {
    title: "Clinical Skills",
    items: [
      { id: "clinical-exam", label: "Clinical Examination", icon: "activity" as const, color: "#8B5CF6", description: "Systematic examination guides for all major systems" },
    ],
  },
  {
    title: "Tools & Calculators",
    items: [
      { id: "calculators", label: "Medical Calculators", icon: "sliders" as const, color: "#F59E0B", description: "BMI, GCS, CURB-65, APGAR, Wells score, CHADS2-VASc and more" },
    ],
  },
];

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const styles = makeStyles(colors);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Your medical reference library</Text>
      </View>

      {EXPLORE_SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => router.push(`/${item.id}` as any)}
            >
              <View style={[styles.iconWrapper, { backgroundColor: item.color + "15" }]}>
                <Feather name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.label}</Text>
                <Text style={styles.cardDesc}>{item.description}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>
      ))}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Feather name="shield" size={13} color={colors.primary} />
        <Text style={styles.disclaimerText}>
          MedPocket by Nirranjan — For educational purposes only. Clinical decisions should always involve professional medical judgment.
        </Text>
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, marginBottom: 24 },
    title: { fontSize: 28, fontWeight: "800", color: colors.foreground },
    subtitle: { fontSize: 14, color: colors.mutedForeground, marginTop: 4 },
    section: { marginBottom: 24 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginBottom: 8,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    iconWrapper: {
      width: 52,
      height: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: "700", color: colors.foreground, marginBottom: 3 },
    cardDesc: { fontSize: 12, color: colors.mutedForeground, lineHeight: 17 },
    disclaimer: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginHorizontal: 20,
      backgroundColor: colors.tealLight,
      borderRadius: 12,
      marginBottom: 20,
    },
    disclaimerText: {
      flex: 1,
      fontSize: 11,
      color: colors.tealDark,
      lineHeight: 17,
    },
  });
}
