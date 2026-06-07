import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAIChat } from "@/context/AIChatContext";
import { useColors } from "@/hooks/useColors";
import { ChatMessage, MODELS } from "@/services/openRouterService";

const TAB_BAR_HEIGHT = 80;

const QUICK_PROMPTS = [
  { label: "Spinal anesthesia mechanism", icon: "activity" as const },
  { label: "Chest pain differentials", icon: "heart" as const },
  { label: "Warfarin MOA & reversal", icon: "zap" as const },
  { label: "OSCE: Respiratory exam", icon: "wind" as const },
];

const OFF_TOPIC_PREFIX = "⚠️ MedPocket AI";

// ─── Message Bubble ────────────────────────────────────────────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
  const colors = useColors();
  const { bookmarkMessage } = useAIChat();
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";
  const isError = message.content.startsWith("❌");
  const isOffTopic = message.content.startsWith(OFF_TOPIC_PREFIX);
  const modelCfg = message.modelId
    ? MODELS.find((m) => m.id === message.modelId)
    : null;

  async function handleCopy() {
    await Clipboard.setStringAsync(message.content);
    setCopied(true);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setCopied(false), 1600);
  }

  if (isUser) {
    return (
      <View style={bubbleStyles.userRow}>
        <View style={[bubbleStyles.userBubble, { backgroundColor: colors.primary }]}>
          <Text style={[bubbleStyles.userText, { color: "#fff" }]}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  }

  const bubbleBg = isError
    ? `${colors.destructive}18`
    : isOffTopic
    ? `${colors.warning}18`
    : colors.muted;

  const bubbleBorder = isError
    ? colors.destructive
    : isOffTopic
    ? colors.warning
    : colors.border;

  const textColor = isError
    ? colors.destructive
    : isOffTopic
    ? colors.warning
    : colors.foreground;

  return (
    <View style={bubbleStyles.aiRow}>
      <View style={[bubbleStyles.aiAvatar, { backgroundColor: colors.primary }]}>
        <Feather name="activity" size={12} color="#fff" />
      </View>
      <View style={bubbleStyles.aiContent}>
        {modelCfg && !isOffTopic && !isError && (
          <Text style={[bubbleStyles.modelTag, { color: modelCfg.color }]}>
            {modelCfg.label} · {modelCfg.description}
          </Text>
        )}
        <View
          style={[
            bubbleStyles.aiBubble,
            { backgroundColor: bubbleBg, borderColor: bubbleBorder, borderWidth: 1 },
          ]}
        >
          <Text style={[bubbleStyles.aiText, { color: textColor }]}>
            {message.content}
          </Text>
        </View>
        {!isOffTopic && !isError && (
          <View style={bubbleStyles.actions}>
            <Pressable style={bubbleStyles.actionBtn} onPress={handleCopy}>
              <Feather
                name={copied ? "check" : "copy"}
                size={12}
                color={copied ? colors.success : colors.mutedForeground}
              />
              <Text style={[bubbleStyles.actionLabel, { color: colors.mutedForeground }]}>
                {copied ? "Copied" : "Copy"}
              </Text>
            </Pressable>
            <Pressable
              style={bubbleStyles.actionBtn}
              onPress={() => {
                bookmarkMessage(message.id);
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <Feather
                name="bookmark"
                size={12}
                color={message.bookmarked ? colors.warning : colors.mutedForeground}
              />
              <Text style={[bubbleStyles.actionLabel, { color: colors.mutedForeground }]}>
                {message.bookmarked ? "Saved" : "Save"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Typing Dots ────────────────────────────────────────────────────────────
function TypingDots() {
  const colors = useColors();
  const dot1 = useRef(new (require("react-native").Animated.Value)(0)).current;
  const dot2 = useRef(new (require("react-native").Animated.Value)(0)).current;
  const dot3 = useRef(new (require("react-native").Animated.Value)(0)).current;
  const { Animated } = require("react-native");

  useEffect(() => {
    const anims = [dot1, dot2, dot3].map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.delay(480 - i * 160),
        ])
      )
    );
    anims.forEach((a: any) => a.start());
    return () => anims.forEach((a: any) => a.stop());
  }, []);

  return (
    <View style={bubbleStyles.aiRow}>
      <View style={[bubbleStyles.aiAvatar, { backgroundColor: colors.primary }]}>
        <Feather name="activity" size={12} color="#fff" />
      </View>
      <View
        style={[
          bubbleStyles.typingBubble,
          { backgroundColor: colors.muted, borderColor: colors.border },
        ]}
      >
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View
            key={i}
            style={[
              bubbleStyles.dot,
              { backgroundColor: colors.primary },
              {
                opacity: d,
                transform: [
                  { translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Model Chip ─────────────────────────────────────────────────────────────
function ModelChip() {
  const colors = useColors();
  const { selectedModel, setSelectedModel } = useAIChat();
  const [open, setOpen] = useState(false);
  const current = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0];

  return (
    <View style={{ zIndex: 100 }}>
      <Pressable
        style={[chipStyles.chip, { backgroundColor: colors.muted, borderColor: colors.border }]}
        onPress={() => setOpen((v) => !v)}
      >
        <View style={[chipStyles.colorDot, { backgroundColor: current.color }]} />
        <Text style={[chipStyles.label, { color: colors.foreground }]} numberOfLines={1}>
          {current.label}
        </Text>
        <Feather
          name={open ? "chevron-up" : "chevron-down"}
          size={12}
          color={colors.mutedForeground}
        />
      </Pressable>

      {open && (
        <View
          style={[
            chipStyles.dropdown,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {MODELS.map((m) => {
            const sel = m.id === selectedModel;
            return (
              <Pressable
                key={m.id}
                style={[
                  chipStyles.dropItem,
                  sel && { backgroundColor: colors.tealLight },
                ]}
                onPress={() => {
                  setSelectedModel(m.id);
                  setOpen(false);
                }}
              >
                <View style={[chipStyles.colorDot, { backgroundColor: m.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[chipStyles.dropLabel, { color: colors.foreground }]}>
                    {m.label}
                  </Text>
                  <Text style={[chipStyles.dropDesc, { color: colors.mutedForeground }]}>
                    {m.description}
                  </Text>
                </View>
                {sel && <Feather name="check" size={14} color={colors.primary} />}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AIChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { messages, isLoading, sendUserMessage, clearHistory } = useAIChat();

  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const hasMessages = messages.length > 0;

  // Bottom clearance = tab bar + safe area
  const bottomClearance = TAB_BAR_HEIGHT + insets.bottom;

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isLoading]);

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;
    setInput("");
    inputRef.current?.blur();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendUserMessage(msg);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop: insets.top + 10,
          },
        ]}
      >
        <LinearGradient
          colors={[colors.primary + "28", "transparent"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primary }]}>
              <Feather name="activity" size={18} color="#fff" />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                MedPocket AI
              </Text>
              <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
                Medical Education Assistant
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <ModelChip />
            {hasMessages && (
              <Pressable
                style={styles.iconBtn}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  clearHistory();
                }}
              >
                <Feather name="trash-2" size={17} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* ── Body ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Messages / Empty state */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            !hasMessages && styles.scrollCenter,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          {!hasMessages ? (
            <View style={styles.emptyWrap}>
              <LinearGradient
                colors={[colors.primary + "38", colors.primary + "0A"]}
                style={styles.emptyIconBg}
              >
                <Feather name="activity" size={38} color={colors.primary} />
              </LinearGradient>

              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                Ask MedPocket AI
              </Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Clinical Q&A · Drug Info · Anatomy · OSCE · Differentials
              </Text>

              <View style={styles.quickGrid}>
                {QUICK_PROMPTS.map((q) => (
                  <Pressable
                    key={q.label}
                    style={[
                      styles.quickCard,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                    onPress={() => handleSend(q.label)}
                  >
                    <Feather name={q.icon} size={15} color={colors.primary} />
                    <Text
                      style={[styles.quickLabel, { color: colors.foreground }]}
                      numberOfLines={2}
                    >
                      {q.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View
                style={[
                  styles.disclaimerCard,
                  { backgroundColor: colors.tealLight, borderColor: colors.border },
                ]}
              >
                <Feather name="shield" size={13} color={colors.primary} />
                <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
                  For medical education purposes only. Not a substitute for professional clinical judgment.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.conversation}>
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {isLoading && <TypingDots />}
            </View>
          )}
        </ScrollView>

        {/* ── Input Bar ── */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              // Sit above the tab bar
              paddingBottom: bottomClearance + 8,
            },
          ]}
        >
          <View
            style={[
              styles.inputRow,
              { backgroundColor: colors.muted, borderColor: colors.border },
            ]}
          >
            <TextInput
              ref={inputRef}
              style={[styles.textInput, { color: colors.foreground }]}
              placeholder="Type your medical question…"
              placeholderTextColor={colors.mutedForeground}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={800}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={() => handleSend()}
              editable={!isLoading}
            />
            <Pressable
              style={[
                styles.sendBtn,
                {
                  backgroundColor:
                    input.trim() && !isLoading ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handleSend()}
              disabled={!input.trim() || isLoading}
            >
              <Feather
                name={isLoading ? "loader" : "send"}
                size={15}
                color={input.trim() && !isLoading ? "#fff" : colors.mutedForeground}
              />
            </Pressable>
          </View>
          <Text style={[styles.footerNote, { color: colors.mutedForeground }]}>
            Medical education only · Not clinical advice
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  headerSub: { fontSize: 11, marginTop: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: { padding: 8 },

  scrollContent: { flexGrow: 1, padding: 16 },
  scrollCenter: { justifyContent: "center" },

  emptyWrap: { alignItems: "center", paddingVertical: 16 },
  emptyIconBg: {
    width: 84,
    height: 84,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  emptySub: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 28,
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginBottom: 24,
    width: "100%",
  },
  quickCard: {
    width: "46%",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  quickLabel: { fontSize: 13, fontWeight: "600", lineHeight: 18 },

  disclaimerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    width: "100%",
  },
  disclaimerText: { fontSize: 11.5, lineHeight: 16, flex: 1 },

  conversation: { paddingBottom: 4 },

  inputBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 110,
    lineHeight: 22,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  footerNote: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
});

const bubbleStyles = StyleSheet.create({
  userRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 14,
    paddingLeft: 52,
  },
  userBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  userText: { fontSize: 14, lineHeight: 21 },

  aiRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 14,
    paddingRight: 28,
  },
  aiAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  aiContent: { flex: 1 },
  modelTag: { fontSize: 10, fontWeight: "700", marginBottom: 4, letterSpacing: 0.4 },
  aiBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderTopLeftRadius: 4,
  },
  aiText: { fontSize: 14, lineHeight: 22 },
  actions: { flexDirection: "row", gap: 16, marginTop: 6, paddingLeft: 4 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionLabel: { fontSize: 11 },

  typingBubble: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
});

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 140,
  },
  colorDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  label: { fontSize: 12, fontWeight: "600", flex: 1 },
  dropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    width: 210,
    borderRadius: 14,
    borderWidth: 1,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 14,
    paddingVertical: 6,
  },
  dropItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  dropLabel: { fontSize: 13, fontWeight: "600" },
  dropDesc: { fontSize: 11, marginTop: 1 },
});
