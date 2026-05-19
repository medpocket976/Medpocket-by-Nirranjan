import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CalculatorResult, getCalculatorById } from "@/data/calculators";
import { useColors } from "@/hooks/useColors";

export default function CalculatorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const calculator = getCalculatorById(id ?? "");
  const [values, setValues] = useState<Record<string, number>>(() => {
    if (!calculator) return {};
    return calculator.fields.reduce(
      (acc, f) => ({ ...acc, [f.id]: f.defaultValue ?? 0 }),
      {} as Record<string, number>
    );
  });
  const [result, setResult] = useState<CalculatorResult | null>(null);

  if (!calculator) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground }}>Calculator not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  function updateValue(fieldId: string, value: number) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setResult(null);
  }

  function calculate() {
    try {
      const res = calculator!.calculate(values);
      setResult(res);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function resetAll() {
    setValues(calculator!.fields.reduce((acc, f) => ({ ...acc, [f.id]: f.defaultValue ?? 0 }), {} as Record<string, number>));
    setResult(null);
  }

  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerContent}>
          {calculator.abbreviation && (
            <Text style={styles.abbreviation}>{calculator.abbreviation}</Text>
          )}
          <Text style={styles.calcName}>{calculator.name}</Text>
          <Text style={styles.calcDesc}>{calculator.description}</Text>
        </View>
        <Pressable style={styles.resetBtn} onPress={resetAll}>
          <Feather name="refresh-ccw" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Fields */}
        {calculator.fields.map((field) => (
          <View key={field.id} style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            {field.type === "number" && (
              <View style={styles.numberInput}>
                <TextInput
                  style={styles.numberInputText}
                  keyboardType="numeric"
                  value={values[field.id] ? String(values[field.id]) : ""}
                  onChangeText={(t) => {
                    const n = parseFloat(t);
                    if (!isNaN(n)) updateValue(field.id, n);
                    else if (t === "") updateValue(field.id, 0);
                  }}
                  placeholder={field.placeholder ?? "Enter value"}
                  placeholderTextColor={colors.mutedForeground}
                />
                {field.unit && (
                  <Text style={styles.unit}>{field.unit}</Text>
                )}
              </View>
            )}
            {field.type === "checkbox" && (
              <View style={styles.checkboxRow}>
                <Switch
                  value={values[field.id] === 1}
                  onValueChange={(v) => updateValue(field.id, v ? 1 : 0)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
                <Text style={styles.checkboxValue}>{values[field.id] ? "Yes (+1)" : "No"}</Text>
              </View>
            )}
            {field.type === "select" && (
              <View style={styles.selectGroup}>
                {field.options?.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.selectOption,
                      values[field.id] === opt.value && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => updateValue(field.id, opt.value)}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        values[field.id] === opt.value && { color: "#fff" },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Calculate Button */}
        <Pressable
          style={({ pressed }) => [styles.calculateBtn, { opacity: pressed ? 0.9 : 1 }]}
          onPress={calculate}
        >
          <Feather name="zap" size={18} color="#fff" />
          <Text style={styles.calculateBtnText}>Calculate</Text>
        </Pressable>

        {/* Result */}
        {result && (
          <View style={[styles.resultCard, { borderColor: result.color + "60" }]}>
            <View style={styles.resultTop}>
              <View>
                <Text style={styles.resultScoreLabel}>Result</Text>
                <Text style={[styles.resultScore, { color: result.color }]}>{result.score}</Text>
              </View>
              <View style={[styles.resultLabelBadge, { backgroundColor: result.color + "20" }]}>
                <Text style={[styles.resultLabelText, { color: result.color }]}>{result.label}</Text>
              </View>
            </View>
            <Text style={styles.resultInterpretation}>{result.interpretation}</Text>
            {result.action && (
              <View style={[styles.actionBox, { backgroundColor: result.color + "10" }]}>
                <Feather name="check-circle" size={14} color={result.color} />
                <Text style={[styles.actionText, { color: result.color }]}>{result.action}</Text>
              </View>
            )}
            <Text style={styles.reference}>Reference: {calculator.reference}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row", alignItems: "flex-start",
      paddingHorizontal: 20, paddingBottom: 16, gap: 12,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.muted, alignItems: "center", justifyContent: "center",
      marginTop: 2,
    },
    headerContent: { flex: 1 },
    abbreviation: { fontSize: 12, fontWeight: "800", color: colors.primary, letterSpacing: 1, marginBottom: 2 },
    calcName: { fontSize: 18, fontWeight: "800", color: colors.foreground },
    calcDesc: { fontSize: 12, color: colors.mutedForeground, marginTop: 4, lineHeight: 17 },
    resetBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.muted, alignItems: "center", justifyContent: "center", marginTop: 2,
    },
    fieldCard: {
      backgroundColor: colors.card, borderRadius: 14,
      padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border,
    },
    fieldLabel: { fontSize: 13, fontWeight: "700", color: colors.foreground, marginBottom: 10 },
    numberInput: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.muted, borderRadius: 10,
      paddingHorizontal: 14, paddingVertical: 12, gap: 10,
    },
    numberInputText: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.foreground },
    unit: { fontSize: 13, color: colors.mutedForeground, fontWeight: "600" },
    checkboxRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    checkboxValue: { fontSize: 13, color: colors.mutedForeground, fontWeight: "600" },
    selectGroup: { gap: 6 },
    selectOption: {
      paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
      backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border,
    },
    selectOptionText: { fontSize: 13, fontWeight: "600", color: colors.foreground },
    calculateBtn: {
      flexDirection: "row", alignItems: "center", justifyContent: "center",
      backgroundColor: colors.primary, borderRadius: 14,
      paddingVertical: 16, gap: 10, marginBottom: 16,
    },
    calculateBtnText: { fontSize: 16, fontWeight: "800", color: "#fff" },
    resultCard: {
      backgroundColor: colors.card, borderRadius: 16,
      padding: 18, borderWidth: 2, gap: 12,
    },
    resultTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    resultScoreLabel: { fontSize: 11, color: colors.mutedForeground, fontWeight: "600", textTransform: "uppercase" },
    resultScore: { fontSize: 40, fontWeight: "800" },
    resultLabelBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, maxWidth: 180 },
    resultLabelText: { fontSize: 13, fontWeight: "700", textAlign: "center" },
    resultInterpretation: { fontSize: 14, color: colors.foreground, lineHeight: 21 },
    actionBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 10, padding: 12 },
    actionText: { flex: 1, fontSize: 13, fontWeight: "600", lineHeight: 19 },
    reference: { fontSize: 10, color: colors.mutedForeground, fontStyle: "italic" },
  });
}
