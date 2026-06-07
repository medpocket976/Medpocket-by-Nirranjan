import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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
import { MODELS, ChatMessage } from "@/services/openRouterService";

const QUICK_PROMPTS = [
  { label: "Spinal anesthesia", icon: "activity" as const },
  { label: "Differential: chest pain", icon: "heart" as const },
  { label: "Warfarin mechanism", icon: "zap" as const },
  { label: "OSCE — respiratory exam", icon: "wind" as const },
];

const OFF_TOPIC_PREFIX = "⚠️ MedPocket AI";

// ---------- Message bubble ----------
function MessageBubble({ message }: { message: ChatMessage }) {
  const colors = useColors();
  const { bookmarkMessage } = useAIChat();
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";
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
      <View style={[bubbleStyles.userRow]}>
        <View style={[bubbleStyles.userBubble, { backgroundColor: colors.primary }]}>
          <Text style={[bubbleStyles.userText, { color: "#fff" }]}>{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={bubbleStyles.aiRow}>
      <View style={[bubbleStyles.aiAvatar, { backgroundColor: colors.primary }]}>
        <Feather name="activity" size={12} color="#fff" />
      </View>
      <View style={bubbleStyles.aiContent}>
        {modelCfg && !isOffTopic && (
          <Text style={[bubbleStyles.modelTag, { color: modelCfg.color }]}>
            {modelCfg.label} · {modelCfg.description}
          </Text>
        )}
        <View
          style={[
            bubbleStyles.aiBubble,
            {
              backgroundColor: isOffTopic
                ? `${colors.warning}18`
                : colors.muted,
              borderColor: isOffTopic ? colors.warning : colors.border,
              borderWidth: 1,
            },
          ]}
        >
          <Text
            style={[
              bubbleStyles.aiText,
              { color: isOffTopic ? colors.warning : colors.foreground },
            ]}
          >
            {message.content}
          </Text>
        </View>
        {!isOffTopic && (
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

// ---------- Typing indicator ----------
function TypingDots() {
  const colors = useColors();
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.delay(480 - i * 160),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={[bubbleStyles.aiRow]}>
      <View style={[bubbleStyles.aiAvatar, { backgroundColor: colors.primary }]}>
        <Feather name="activity" size={12} color="#fff" />
      </View>
      <View style={[bubbleStyles.typingBubble, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        {dots.map((d, i) => (
          <Animated.View
            key={i}
            style={[
              bubbleStyles.dot,
              { backgroundColor: colors.primary },
              {
                opacity: d,
                transform: [{ translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ---------- Model chip ----------
function ModelChip() {
  const colors = useColors();
  const { selectedModel, setSelectedModel } = useAIChat();
  const [open, setOpen] = useState(false);
  const current = MODELS.find((m) => m.id === selectedModel) ?? MODELS[2];

  return (
    <View>
      <Pressable
        style={[chipStyles.chip, { backgroundColor: colors.muted, borderColor: colors.border }]}
        onPress={() => setOpen(!open)}
      >
        <View style={[chipStyles.dot, { backgroundColor: current.color }]} />
        <Text style={[chipStyles.label, { color: colors.foreground }]}>{current.label}</Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={12} color={colors.mutedForeground} />
      </Pressable>
      {open && (
        <View style={[chipStyles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {MODELS.map((m) => {
            const sel = m.id === selectedModel;
            return (
              <Pressable
                key={m.id}
                style={[
                  chipStyles.dropItem,
                  sel && { backgroundColor: colors.tealLight },
                ]}
                onPress={() => { setSelectedModel(m.id); setOpen(false); }}
              >
                <View style={[chipStyles.dot, { backgroundColor: m.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[chipStyles.dropLabel, { color: colors.foreground }]}>{m.label}</Text>
                  <Text style={[chipStyles.dropDesc, { color: colors.mutedForeground }]}>{m.description}</Text>
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

// ---------- Main screen ----------
export default function AIChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { messages, isLoading, sendUserMessage, clearHistory } = useAIChat();

  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages, isLoading]);

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;
    setInput("");
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendUserMessage(msg);
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
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <LinearGradient
          colors={[colors.primary + "22", "transparent"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerInner}>
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
                style={styles.clearBtn}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  clearHistory();
                }}
              >
                <Feather name="trash-2" size={16} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* ── Messages / Empty state ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            !hasMessages && styles.scrollCenter,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          {!hasMessages ? (
            /* ── Welcome / Empty state ── */
            <View style={styles.emptyWrap}>
              <LinearGradient
                colors={[colors.primary + "30", colors.primary + "08"]}
                style={styles.emptyIconBg}
              >
                <Feather name="activity" size={36} color={colors.primary} />
              </LinearGradient>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                Ask MedPocket AI
              </Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Clinical Q&A, drug info, anatomy, OSCE prep, differential diagnosis — all for medical education.
              </Text>

              {/* Quick prompts */}
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
                    <Text style={[styles.quickLabel, { color: colors.foreground }]} numberOfLines={2}>
                      {q.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={[styles.disclaimerCard, { backgroundColor: colors.tealLight, borderColor: colors.border }]}>
                <Feather name="info" size={13} color={colors.primary} />
                <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
                  For medical education purposes only. Not a substitute for professional clinical judgment.
                </Text>
              </View>
            </View>
          ) : (
            /* ── Conversation ── */
            <View style={styles.conversation}>
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {isLoading && <TypingDots />}
            </View>
          )}
        </ScrollView>

        {/* ── Input bar ── */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 8,
            },
          ]}
        >
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Ask a medical question…"
              placeholderTextColor={colors.mutedForeground}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={800}
            />
            <Pressable
              style={[
                styles.sendBtn,
                { backgroundColor: input.trim() && !isLoading ? colors.primary : colors.border },
              ]}
              onPress={() => handleSend()}
              disabled={!input.trim() || isLoading}
            >
              <Feather
                name="send"
                size={15}
                color={input.trim() && !isLoading ? "#fff" : colors.mutedForeground}
              />
            </Pressable>
          </View>
          {hasMessages && (
            <Text style={[styles.footerNote, { color: colors.mutedForeground }]}>
              For medical education only · Not clinical advice
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Styles ──
const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  headerInner: {
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
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  clearBtn: { padding: 8 },
  scrollContent: { flexGrow: 1, padding: 16 },
  scrollCenter: { justifyContent: "center" },
  emptyWrap: { alignItems: "center", paddingVertical: 24 },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  emptySub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginBottom: 24,
    paddingHorizontal: 8,
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
    marginHorizontal: 8,
  },
  disclaimerText: { fontSize: 11.5, lineHeight: 16, flex: 1 },
  conversation: { paddingBottom: 8 },
  inputBar: { borderTopWidth: StyleSheet.hairlineWidth, padding: 12 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1,
    borderRadius: 18,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: { flex: 1, fontSize: 15, maxHeight: 100, lineHeight: 21, paddingVertical: 4 },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    flexShrink: 0,
  },
  footerNote: { fontSize: 10, textAlign: "center", marginTop: 6 },
});

const bubbleStyles = StyleSheet.create({
  userRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 14,
    paddingLeft: 56,
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
    paddingRight: 32,
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
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 12, fontWeight: "600" },
  dropdown: {
    position: "absolute",
    top: 38,
    right: 0,
    width: 220,
    borderRadius: 14,
    borderWidth: 1,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
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
