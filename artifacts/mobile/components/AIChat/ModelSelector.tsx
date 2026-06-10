import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useAIChat } from "@/context/AIChatContext";
import { useColors } from "@/hooks/useColors";
import { MODELS, ModelConfig } from "@/services/openRouterService";

const ICON_MAP: Record<string, keyof typeof Feather.glyphMap> = {
  cpu: "cpu",
  "book-open": "book-open",
  layers: "layers",
  zap: "zap",
};

export default function ModelSelector() {
  const colors = useColors();
  const { selectedModel, setSelectedModel } = useAIChat();
  const [open, setOpen] = useState(false);
  const selected = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0];

  return (
    <>
      <Pressable
        style={[styles.trigger, { backgroundColor: colors.muted, borderColor: colors.border }]}
        onPress={() => setOpen(true)}
      >
        <View style={[styles.triggerDot, { backgroundColor: selected.isDefault ? "#22C55E" : colors.mutedForeground }]} />
        <Text style={[styles.triggerLabel, { color: colors.foreground }]} numberOfLines={1}>
          {selected.label}
        </Text>
        <Feather name="chevron-down" size={12} color={colors.mutedForeground} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.sheetHeader}>
                  <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Select AI Model</Text>
                  <Pressable onPress={() => setOpen(false)}>
                    <Feather name="x" size={18} color={colors.mutedForeground} />
                  </Pressable>
                </View>
                <ScrollView>
                  {MODELS.map((m: ModelConfig) => {
                    const isSelected = m.id === selectedModel;
                    const dotColor = m.isDefault ? "#22C55E" : colors.mutedForeground + "80";
                    return (
                      <Pressable
                        key={m.id}
                        style={[
                          styles.modelRow,
                          {
                            backgroundColor: isSelected ? colors.tealLight : "transparent",
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => {
                          setSelectedModel(m.id);
                          setOpen(false);
                        }}
                      >
                        <View style={styles.dotCol}>
                          <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
                        </View>
                        <View style={[styles.modelIcon, { backgroundColor: isSelected ? colors.primary : colors.muted }]}>
                          <Feather
                            name={ICON_MAP[m.icon] ?? "cpu"}
                            size={16}
                            color={isSelected ? "#fff" : colors.primary}
                          />
                        </View>
                        <View style={styles.modelInfo}>
                          <View style={styles.modelLabelRow}>
                            <Text style={[styles.modelLabel, { color: colors.foreground }]}>{m.label}</Text>
                            {m.isDefault && (
                              <View style={[styles.defaultBadge, { backgroundColor: "#22C55E18", borderColor: "#22C55E50" }]}>
                                <Text style={styles.defaultBadgeText}>Default</Text>
                              </View>
                            )}
                          </View>
                          <Text style={[styles.modelDesc, { color: colors.mutedForeground }]}>{m.description}</Text>
                          {m.isDefault && (
                            <Text style={styles.recommendedText}>✦ Recommended</Text>
                          )}
                        </View>
                        {isSelected && (
                          <Feather name="check-circle" size={18} color={colors.primary} />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <View style={[styles.sheetFooter, { borderTopColor: colors.border }]}>
                  <Text style={[styles.footerNote, { color: colors.mutedForeground }]}>
                    All models are free via OpenRouter
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 150,
  },
  triggerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },
  triggerLabel: { fontSize: 12, fontWeight: "600", flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: "75%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700" },
  dotCol: { alignItems: "center", justifyContent: "center", width: 16 },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  modelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  modelIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  modelInfo: { flex: 1 },
  modelLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  modelLabel: { fontSize: 14, fontWeight: "600" },
  defaultBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  defaultBadgeText: { fontSize: 10, color: "#16A34A", fontWeight: "700" },
  modelDesc: { fontSize: 12, marginTop: 2 },
  recommendedText: { fontSize: 11, color: "#22C55E", fontWeight: "600", marginTop: 2 },
  sheetFooter: {
    borderTopWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  footerNote: { fontSize: 11 },
});
