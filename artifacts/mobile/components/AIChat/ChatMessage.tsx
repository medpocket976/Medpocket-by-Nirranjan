import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useAIChat } from "@/context/AIChatContext";
import { useColors } from "@/hooks/useColors";
import { ChatMessage as ChatMessageType, MODELS } from "@/services/openRouterService";

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const colors = useColors();
  const { bookmarkMessage } = useAIChat();
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isOffTopic = message.content.startsWith("⚠️ MedPocket AI");

  const modelConfig = message.modelId
    ? MODELS.find((m) => m.id === message.modelId)
    : null;

  async function handleCopy() {
    await Clipboard.setStringAsync(message.content);
    setCopied(true);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleBookmark() {
    bookmarkMessage(message.id);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  if (isUser) {
    return (
      <View style={styles.userRow}>
        <View style={[styles.userBubble, { backgroundColor: colors.primary }]}>
          <Text style={[styles.userText, { color: colors.primaryForeground }]}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.assistantRow}>
      <View style={[styles.avatarWrap, { backgroundColor: colors.primary }]}>
        <Feather name="activity" size={13} color="#fff" />
      </View>
      <View style={styles.assistantContent}>
        {modelConfig && !isOffTopic && (
          <Text style={[styles.modelTag, { color: colors.mutedForeground }]}>
            {modelConfig.label} · {modelConfig.description}
          </Text>
        )}
        <View
          style={[
            styles.assistantBubble,
            {
              backgroundColor: isOffTopic ? colors.tealLight : colors.muted,
              borderColor: isOffTopic ? colors.warning : colors.border,
              borderWidth: isOffTopic ? 1 : 0,
            },
          ]}
        >
          <Text
            style={[
              styles.assistantText,
              { color: isOffTopic ? colors.warning : colors.foreground },
            ]}
          >
            {message.content}
          </Text>
        </View>
        {!isOffTopic && (
          <View style={styles.actions}>
            <Pressable style={styles.actionBtn} onPress={handleCopy}>
              <Feather
                name={copied ? "check" : "copy"}
                size={13}
                color={copied ? colors.success : colors.mutedForeground}
              />
              <Text style={[styles.actionLabel, { color: colors.mutedForeground }]}>
                {copied ? "Copied" : "Copy"}
              </Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handleBookmark}>
              <Feather
                name={message.bookmarked ? "bookmark" : "bookmark"}
                size={13}
                color={message.bookmarked ? colors.warning : colors.mutedForeground}
                style={{ opacity: message.bookmarked ? 1 : 0.6 }}
              />
              <Text style={[styles.actionLabel, { color: colors.mutedForeground }]}>
                {message.bookmarked ? "Saved" : "Save"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
    paddingLeft: 48,
  },
  userBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    maxWidth: "100%",
  },
  userText: { fontSize: 14, lineHeight: 20 },
  assistantRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 12,
    paddingRight: 24,
  },
  avatarWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  assistantContent: { flex: 1 },
  modelTag: { fontSize: 10, fontWeight: "600", marginBottom: 4, letterSpacing: 0.3 },
  assistantBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderTopLeftRadius: 4,
  },
  assistantText: { fontSize: 14, lineHeight: 21 },
  actions: {
    flexDirection: "row",
    gap: 14,
    marginTop: 6,
    paddingLeft: 4,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionLabel: { fontSize: 11 },
});
