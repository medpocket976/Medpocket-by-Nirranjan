import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MedCalcResult, getMedCalculatorById } from "@/data/medicalCalculators";
import { useColors } from "@/hooks/useColors";

export default function MedCalcDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const calc = getMedCalculatorById(id ?? "");
  const [values, setValues] = useState<Record<string, number>>(() => {
    if (!calc) return {};
    return calc.fields.reduce((acc, f) => {
      acc[f.id] = (f.defaultValue ?? 0) as number;
      return acc;
    }, {} as Record<string, number>);
  });
  const [result, setResult] = useState<MedCalcResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!calc) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "transparent" }}>
        <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
        <Text style={{ color: colors.foreground, marginTop: 12, fontWeight: "700" }}>Calculator not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  function updateValue(fieldId: string, raw: string) {
    const num = parseFloat(raw);
    setValues((prev) => ({ ...prev, [fieldId]: isNaN(num) ? 0 : num }));
    setResult(null);
    setError(null);
  }

  function selectValue(fieldId: string, val: number) {
    setValues((prev) => ({ ...prev, [fieldId]: val }));
    setResult(null);
    setError(null);
  }

  function calculate() {
    try {
      const res = calc!.calculate(values);
      setResult(res);
      setError(null);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {}, 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Calculation error. Check your inputs.");
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function reset() {
    setValues(calc!.fields.reduce((acc, f) => {
      acc[f.id] = (f.defaultValue ?? 0) as number;
      return acc;
    }, {} as Record<string, number>));
    setResult(null);
    setError(null);
  }

  const styles = makeStyles(colors);

  return (
    <GlassBackground style={styles.container}>
      {/* Header */}
      <GlassView radius={0} style={[styles.header, { paddingBottom: 12 }]} /* injected */>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          {calc.abbreviation && (
            <Text style={[styles.abbrev, { color: calc.color }]}>{calc.abbreviation}</Text>
          )}
          <Text style={styles.title}>{calc.name}</Text>
        </View>
        <View style={[styles.iconBadge, { backgroundColor: calc.color + "18" }]}>
          <Feather name={calc.icon as any} size={22} color={calc.color} />
        </View>
      </GlassView>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Description */}
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>{calc.description}</Text>

        {/* Fields */}
        <View style={[styles.card, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Input Parameters</Text>
          {calc.fields.map((field) => (
            <View key={field.id} style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                {field.label}
                {field.unit ? <Text style={{ color: colors.mutedForeground, fontWeight: "400" }}> ({field.unit})</Text> : null}
              </Text>
              {field.type === "select" && field.options ? (
                <View style={styles.optionsRow}>
                  {field.options.map((opt) => {
                    const isSelected = values[field.id] === opt.value;
                    return (
                      <Pressable
                        key={String(opt.value)}
                        style={[
                          styles.optionBtn,
                          {
                            backgroundColor: isSelected ? calc.color : colors.muted,
                            borderColor: isSelected ? calc.color : colors.glassBorder,
                          },
                        ]}
                        onPress={() => selectValue(field.id, opt.value as number)}
                      >
                        <Text style={[styles.optionText, { color: isSelected ? "#fff" : colors.foreground }]}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.muted,
                      borderColor: colors.glassBorder,
                      color: colors.foreground,
                    },
                  ]}
                  keyboardType="decimal-pad"
                  placeholder={field.placeholder ?? "Enter value"}
                  placeholderTextColor={colors.mutedForeground}
                  value={values[field.id] !== undefined && values[field.id] !== 0 ? String(values[field.id]) : ""}
                  onChangeText={(t) => updateValue(field.id, t)}
                />
              )}
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.calcBtn, { backgroundColor: calc.color }]}
            onPress={calculate}
          >
            <Feather name="cpu" size={16} color="#fff" />
            <Text style={styles.calcBtnText}>Calculate</Text>
          </Pressable>
          <Pressable
            style={[styles.resetBtn, { backgroundColor: colors.muted, borderColor: colors.glassBorder }]}
            onPress={reset}
          >
            <Feather name="refresh-ccw" size={15} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Error */}
        {error && (
          <View style={[styles.errorCard, { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }]}>
            <Feather name="alert-circle" size={14} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Result */}
        {result && (
          <View style={styles.resultSection}>
            {/* Result rows */}
            <View style={[styles.resultCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Result</Text>
              {result.rows.map((row, i) => (
                <View
                  key={i}
                  style={[
                    styles.resultRow,
                    row.highlight && { backgroundColor: calc.color + "12", borderRadius: 10, padding: 10, marginBottom: 4 },
                  ]}
                >
                  <Text style={[styles.resultLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                  <Text style={[styles.resultValue, { color: row.highlight ? calc.color : colors.foreground }]}>
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>

            {/* Formula */}
            <View style={[styles.formulaCard, { backgroundColor: colors.muted, borderColor: colors.glassBorder }]}>
              <Text style={[styles.formulaLabel, { color: colors.mutedForeground }]}>Formula Used</Text>
              <Text style={[styles.formulaText, { color: colors.foreground }]}>{result.formula}</Text>
            </View>

            {/* Normal Range */}
            {result.normalRange && (
              <View style={[styles.rangeCard, { backgroundColor: "#F0FDF4", borderColor: "#86EFAC" }]}>
                <Feather name="check-circle" size={13} color="#16A34A" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rangeLabel}>Normal Range</Text>
                  <Text style={styles.rangeValue}>{result.normalRange}</Text>
                </View>
              </View>
            )}

            {/* Warning */}
            {result.warning && (
              <View style={[styles.warnCard, { backgroundColor: "#FFFBEB", borderColor: "#FCD34D" }]}>
                <Feather name="alert-triangle" size={13} color="#D97706" />
                <Text style={styles.warnText}>{result.warning}</Text>
              </View>
            )}

            {/* Interpretation */}
            <View style={[styles.interpCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
              <Text style={[styles.interpLabel, { color: colors.mutedForeground }]}>Educational Interpretation</Text>
              <Text style={[styles.interpText, { color: colors.foreground }]}>{result.interpretation}</Text>
            </View>

            {/* Clinical Pearl */}
            <View style={[styles.pearlCard, { backgroundColor: calc.color + "10", borderColor: calc.color + "30" }]}>
              <Text style={[styles.pearlText, { color: colors.foreground }]}>{result.clinicalPearl}</Text>
            </View>
          </View>
        )}

        {/* Safety disclaimer */}
        <View style={[styles.disclaimer, { borderColor: colors.glassBorder }]}>
          <Feather name="shield" size={12} color={colors.mutedForeground} />
          <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
            For medical education purposes only. Always verify calculations before clinical use.
          </Text>
        </View>
      </ScrollView>
    </GlassBackground>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: "transparent" },
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
    abbrev: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6, marginBottom: 2 },
    title: { fontSize: 17, fontWeight: "800", color: colors.foreground },
    iconBadge: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    scroll: { paddingHorizontal: 16, paddingTop: 4 },
    desc: { fontSize: 13, lineHeight: 19, marginBottom: 16 },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 16,
      marginBottom: 14,
      gap: 14,
    },
    cardTitle: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2 },
    fieldGroup: { gap: 6 },
    fieldLabel: { fontSize: 13, fontWeight: "600" },
    input: {
      borderRadius: 10,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
    },
    optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    optionBtn: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
      borderWidth: 1,
    },
    optionText: { fontSize: 12, fontWeight: "600" },
    actions: { flexDirection: "row", gap: 10, marginBottom: 14 },
    calcBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: 14,
    },
    calcBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
    resetBtn: {
      width: 48,
      height: 48,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    errorCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 12,
    },
    errorText: { flex: 1, fontSize: 13, color: "#EF4444", lineHeight: 18 },
    resultSection: { gap: 12, marginBottom: 12 },
    resultCard: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 16,
      gap: 4,
    },
    resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
    resultLabel: { fontSize: 12, flex: 1 },
    resultValue: { fontSize: 14, fontWeight: "700", textAlign: "right", flexShrink: 0, maxWidth: "55%" },
    formulaCard: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 12,
      gap: 4,
    },
    formulaLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
    formulaText: { fontSize: 12, lineHeight: 18, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
    rangeCard: {
      flexDirection: "row",
      gap: 8,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: "flex-start",
    },
    rangeLabel: { fontSize: 10, fontWeight: "700", color: "#16A34A", textTransform: "uppercase" },
    rangeValue: { fontSize: 12, color: "#166534", lineHeight: 17 },
    warnCard: {
      flexDirection: "row",
      gap: 8,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: "flex-start",
    },
    warnText: { flex: 1, fontSize: 12, color: "#92400E", lineHeight: 17 },
    interpCard: {
      borderRadius: 14,
      borderWidth: 1,
      padding: 14,
      gap: 6,
    },
    interpLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
    interpText: { fontSize: 13, lineHeight: 19 },
    pearlCard: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 14,
    },
    pearlText: { fontSize: 13, lineHeight: 19 },
    disclaimer: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 6,
      padding: 12,
      borderTopWidth: 1,
      marginTop: 8,
    },
    disclaimerText: { flex: 1, fontSize: 10, lineHeight: 15 },
  });
}
