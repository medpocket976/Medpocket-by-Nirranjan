import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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

import { getProtocolById } from "@/data/emergencyProtocols";
import { useColors } from "@/hooks/useColors";

export default function EmergencyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const protocol = getProtocolById(id ?? "");

  if (!protocol) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "transparent" }}>
        <Text style={{ color: colors.foreground }}>Protocol not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const styles = makeStyles(colors, protocol.color);

  return (
    <GlassBackground style={styles.container}>
      {/* Header */}
      <GlassView radius={0} style={[styles.header, { paddingBottom: 12 }]} /* injected */>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <View style={styles.headerContent}>
          <View style={styles.urgencyBadge}>
            <Text style={styles.urgencyText}>{protocol.urgency.toUpperCase()}</Text>
          </View>
          <Text style={styles.headerTitle}>{protocol.name}</Text>
          <Text style={styles.headerDesc}>{protocol.description}</Text>
        </View>
      </GlassView>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {["Steps", "Key Drugs", "Key Points"].map((tab, i) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === i && styles.tabActive]}
            onPress={() => setActiveTab(i)}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 0 && protocol.steps.map((step) => (
          <View
            key={step.step}
            style={[styles.stepCard, step.urgent && { borderColor: protocol.color + "80", backgroundColor: protocol.color + "08" }]}
          >
            <View style={[styles.stepNumber, { backgroundColor: step.urgent ? protocol.color : colors.muted }]}>
              <Text style={[styles.stepNumberText, { color: step.urgent ? "#fff" : colors.foreground }]}>
                {step.step}
              </Text>
            </View>
            <View style={styles.stepContent}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                {step.urgent && (
                  <View style={[styles.urgentTag, { backgroundColor: protocol.color }]}>
                    <Text style={styles.urgentTagText}>URGENT</Text>
                  </View>
                )}
              </View>
              <Text style={styles.stepDetails}>{step.details}</Text>
              {step.drugs && step.drugs.length > 0 && (
                <View style={styles.drugsBox}>
                  {step.drugs.map((drug, i) => (
                    <View key={i} style={styles.drugItem}>
                      <Feather name="tablet" size={12} color={colors.primary} />
                      <Text style={styles.drugText}>{drug}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}

        {activeTab === 1 && (
          <View style={styles.section}>
            {protocol.keyDrugs.map((drug, i) => (
              <View key={i} style={styles.keyDrugCard}>
                <View style={[styles.keyDrugIcon, { backgroundColor: protocol.color + "20" }]}>
                  <Feather name="tablet" size={18} color={protocol.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.keyDrugName}>{drug.name}</Text>
                  <Text style={styles.keyDrugDose}>{drug.dose}</Text>
                  <View style={styles.routeBadge}>
                    <Text style={styles.routeText}>{drug.route}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 2 && (
          <View style={styles.section}>
            {protocol.keyPoints.map((point, i) => (
              <View key={i} style={styles.keyPointRow}>
                <View style={[styles.keyPointDot, { backgroundColor: protocol.color }]} />
                <Text style={styles.keyPointText}>{point}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </GlassBackground>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>, accentColor: string) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: "transparent" },
    header: {
      backgroundColor: accentColor,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    headerContent: {},
    urgencyBadge: {
      alignSelf: "flex-start",
      backgroundColor: "rgba(255,255,255,0.25)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      marginBottom: 8,
    },
    urgencyText: { fontSize: 11, color: "#fff", fontWeight: "800", letterSpacing: 1 },
    headerTitle: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 8 },
    headerDesc: { fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 19 },
    tabsRow: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: colors.muted,
      borderRadius: 12,
      padding: 4,
      marginBottom: 4,
    },
    tab: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: "center" },
    tabActive: { backgroundColor: colors.glassBg, elevation: 2 },
    tabText: { fontSize: 12, fontWeight: "600", color: colors.mutedForeground },
    tabTextActive: { color: accentColor },
    section: {},
    stepCard: {
      flexDirection: "row",
      gap: 12,
      backgroundColor: colors.glassBg,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      alignItems: "flex-start",
    },
    stepNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    stepNumberText: { fontSize: 14, fontWeight: "800" },
    stepContent: { flex: 1 },
    stepTitle: { fontSize: 14, fontWeight: "700", color: colors.foreground },
    urgentTag: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    urgentTagText: { fontSize: 9, color: "#fff", fontWeight: "800", letterSpacing: 0.5 },
    stepDetails: { fontSize: 13, color: colors.foreground, lineHeight: 20 },
    drugsBox: {
      marginTop: 10,
      backgroundColor: colors.tealLight,
      borderRadius: 8,
      padding: 10,
      gap: 6,
    },
    drugItem: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
    drugText: { flex: 1, fontSize: 12, color: colors.primary, fontWeight: "600" },
    keyDrugCard: {
      flexDirection: "row",
      gap: 12,
      backgroundColor: colors.glassBg,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      alignItems: "flex-start",
    },
    keyDrugIcon: {
      width: 42,
      height: 42,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    keyDrugName: { fontSize: 15, fontWeight: "700", color: colors.foreground, marginBottom: 3 },
    keyDrugDose: { fontSize: 13, color: colors.mutedForeground, marginBottom: 6 },
    routeBadge: {
      alignSelf: "flex-start",
      backgroundColor: colors.tealLight,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    routeText: { fontSize: 11, color: colors.primary, fontWeight: "600" },
    keyPointRow: {
      flexDirection: "row",
      gap: 10,
      backgroundColor: colors.glassBg,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      alignItems: "flex-start",
    },
    keyPointDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, flexShrink: 0 },
    keyPointText: { flex: 1, fontSize: 14, color: colors.foreground, lineHeight: 22 },
  });
}
