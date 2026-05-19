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

import { EmergencyProtocol, emergencyProtocols } from "@/data/emergencyProtocols";
import { useColors } from "@/hooks/useColors";

export default function EmergencyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const styles = makeStyles(colors);

  const criticalProtocols = emergencyProtocols.filter((p) => p.urgency === "critical");
  const highProtocols = emergencyProtocols.filter((p) => p.urgency === "high");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Emergency Protocols</Text>
          <Text style={styles.subtitle}>Step-by-step management</Text>
        </View>
      </View>

      {/* Warning Banner */}
      <View style={styles.warningBanner}>
        <Feather name="alert-triangle" size={14} color="#F59E0B" />
        <Text style={styles.warningText}>
          For educational reference only. Always follow local protocols and senior guidance in real emergencies.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {criticalProtocols.length > 0 && (
          <>
            <SectionHeader label="Critical" color="#EF4444" />
            {criticalProtocols.map((p) => (
              <ProtocolCard key={p.id} protocol={p} colors={colors} onPress={() => router.push(`/emergency/${p.id}`)} />
            ))}
          </>
        )}
        {highProtocols.length > 0 && (
          <>
            <SectionHeader label="High Priority" color="#F97316" />
            {highProtocols.map((p) => (
              <ProtocolCard key={p.id} protocol={p} colors={colors} onPress={() => router.push(`/emergency/${p.id}`)} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function SectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10, marginTop: 4 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Text style={{ fontSize: 13, fontWeight: "700", color, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</Text>
    </View>
  );
}

function ProtocolCard({
  protocol, colors, onPress,
}: {
  protocol: EmergencyProtocol;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
          borderLeftWidth: 4,
          borderLeftColor: protocol.color,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <View style={{ backgroundColor: protocol.color + "20", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: protocol.color, textTransform: "uppercase" }}>
                {protocol.urgency}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 16, fontWeight: "800", color: colors.foreground, marginBottom: 6 }}>
            {protocol.name}
          </Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, lineHeight: 18 }} numberOfLines={2}>
            {protocol.description}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} style={{ marginLeft: 8 }} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 }}>
        <Feather name="list" size={12} color={colors.mutedForeground} />
        <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
          {protocol.steps.length} steps · {protocol.keyDrugs.length} key drugs
        </Text>
      </View>
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
      paddingBottom: 16,
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
    headerContent: { flex: 1 },
    title: { fontSize: 20, fontWeight: "800", color: colors.foreground },
    subtitle: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
    warningBanner: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      backgroundColor: "#FFFBEB",
      marginHorizontal: 20,
      padding: 12,
      borderRadius: 10,
      marginBottom: 4,
      borderWidth: 1,
      borderColor: "#FDE68A",
    },
    warningText: { flex: 1, fontSize: 11, color: "#92400E", lineHeight: 17 },
  });
}
