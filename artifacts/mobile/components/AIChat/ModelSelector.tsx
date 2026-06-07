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
  const selected = MODELS.find((m) => m.id === selectedModel) ?? MODELS[2];

  return (
    <>
      <Pressable
        style={[styles.trigger, { backgroundColor: colors.muted, borderColor: colors.border }]}
        onPress={() => setOpen(true)}
      >
        <Feather name={ICON_MAP[selected.icon] ?? "cpu"} size={13} color={colors.primary} />
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
                        <View style={[styles.modelIcon, { backgroundColor: isSelected ? colors.primary : colors.muted }]}>
                          <Feather
                            name={ICON_MAP[m.icon] ?? "cpu"}
                            size={16}
                            color={isSelected ? "#fff" : colors.primary}
                          />
                        </View>
                        <View style={styles.modelInfo}>
                          <Text style={[styles.modelLabel, { color: colors.foreground }]}>{m.label}</Text>
                          <Text style={[styles.modelDesc, { color: colors.mutedForeground }]}>{m.description}</Text>
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
    maxHeight: "70%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700" },
  modelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  },
  modelInfo: { flex: 1 },
  modelLabel: { fontSize: 14, fontWeight: "600" },
  modelDesc: { fontSize: 12, marginTop: 1 },
  sheetFooter: {
    borderTopWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  footerNote: { fontSize: 11 },
});
