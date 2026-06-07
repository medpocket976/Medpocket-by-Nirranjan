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
import {
  BookmarkedAnswer,
  ChatMessage,
  MODELS,
} from "@/services/openRouterService";

const TAB_BAR_HEIGHT = 80;

const QUICK_PROMPTS = [
  { label: "Spinal anaesthesia mechanism", icon: "activity" as const },
  { label: "Chest pain differentials", icon: "heart" as const },
  { label: "Warfarin MOA & reversal", icon: "zap" as const },
  { label: "OSCE: Resp exam steps", icon: "wind" as const },
  { label: "Sepsis 3 criteria", icon: "alert-circle" as const },
  { label: "ECG interpretation guide", icon: "bar-chart-2" as const },
];

// ─── Inline bold parser ────────────────────────────────────────────────────
function parseInline(text: string, baseColor: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={i} style={{ fontWeight: "700", color: baseColor }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return (
          <Text key={i} style={{ color: baseColor }}>
            {part}
          </Text>
        );
      })}
    </>
  );
}

// ─── Markdown Renderer ─────────────────────────────────────────────────────
function MarkdownContent({
  content,
  textColor,
  colors,
}: {
  content: string;
  textColor: string;
  colors: ReturnType<typeof useColors>;
}) {
  const lines = content.split("\n");

  return (
    <View style={{ gap: 1 }}>
      {lines.map((line, i) => {
        // H2
        if (line.startsWith("## ")) {
          return (
            <Text
              key={i}
              style={{
                fontSize: 14.5,
                fontWeight: "800",
                color: textColor,
                marginTop: i > 0 ? 10 : 2,
                marginBottom: 2,
                letterSpacing: -0.2,
              }}
            >
              {line.slice(3)}
            </Text>
          );
        }
        // H1
        if (line.startsWith("# ")) {
          return (
            <Text
              key={i}
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: textColor,
                marginTop: i > 0 ? 12 : 2,
                marginBottom: 2,
              }}
            >
              {line.slice(2)}
            </Text>
          );
        }
        // Clinical Pearl
        if (line.startsWith("🔑")) {
          return (
            <View
              key={i}
              style={{
                backgroundColor: colors.primary + "18",
                borderRadius: 10,
                borderLeftWidth: 3,
                borderLeftColor: colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginTop: 10,
                marginBottom: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: textColor,
                  lineHeight: 20,
                  fontStyle: "italic",
                }}
              >
                {parseInline(line, textColor)}
              </Text>
            </View>
          );
        }
        // Bullet
        if (line.startsWith("- ") || line.startsWith("* ")) {
          const text = line.slice(2);
          return (
            <View
              key={i}
              style={{
                flexDirection: "row",
                gap: 8,
                paddingLeft: 4,
                marginTop: 2,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  lineHeight: 22,
                  fontWeight: "700",
                }}
              >
                •
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: textColor,
                  fontSize: 14,
                  lineHeight: 22,
                }}
              >
                {parseInline(text, textColor)}
              </Text>
            </View>
          );
        }
        // Sub-bullet
        if (line.startsWith("  - ") || line.startsWith("   - ")) {
          const text = line.trimStart().slice(2);
          return (
            <View
              key={i}
              style={{ flexDirection: "row", gap: 8, paddingLeft: 20, marginTop: 1 }}
            >
              <Text style={{ color: colors.mutedForeground, fontSize: 13, lineHeight: 21 }}>
                ›
              </Text>
              <Text
                style={{ flex: 1, color: textColor, fontSize: 13, lineHeight: 21 }}
              >
                {parseInline(text, textColor)}
              </Text>
            </View>
          );
        }
        // Empty line
        if (line.trim() === "") {
          return <View key={i} style={{ height: 5 }} />;
        }
        // Normal text
        return (
          <Text
            key={i}
            style={{ color: textColor, fontSize: 14, lineHeight: 22, marginTop: 1 }}
          >
            {parseInline(line, textColor)}
          </Text>
        );
      })}
    </View>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
  const colors = useColors();
  const { bookmarkMessage } = useAIChat();
  const [copied, setCopied] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const isUser = message.role === "user";
  const isError = message.content.startsWith("❌");
  const isOffTopic = message.content.startsWith("⚠️");
  const modelCfg = message.modelId
    ? MODELS.find((m) => m.id === message.modelId)
    : null;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 120,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  async function handleCopy() {
    await Clipboard.setStringAsync(message.content);
    setCopied(true);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setCopied(false), 1600);
  }

  if (isUser) {
    return (
      <Animated.View
        style={[
          bubbleStyles.userRow,
          { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View
          style={[bubbleStyles.userBubble, { backgroundColor: colors.primary }]}
        >
          <Text style={[bubbleStyles.userText, { color: "#fff" }]}>
            {message.content}
          </Text>
        </View>
      </Animated.View>
    );
  }

  const bubbleBg = isError
    ? `${colors.destructive}12`
    : isOffTopic
    ? `#F59E0B12`
    : colors.card;

  const bubbleBorder = isError
    ? colors.destructive + "40"
    : isOffTopic
    ? "#F59E0B40"
    : colors.border;

  const textColor = isError
    ? colors.destructive
    : isOffTopic
    ? "#B45309"
    : colors.foreground;

  return (
    <Animated.View
      style={[
        bubbleStyles.aiRow,
        { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View
        style={[bubbleStyles.aiAvatar, { backgroundColor: colors.primary + "20" }]}
      >
        <Feather name="cpu" size={12} color={colors.primary} />
      </View>
      <View style={bubbleStyles.aiContent}>
        {modelCfg && !isOffTopic && !isError && (
          <View style={bubbleStyles.modelTagRow}>
            <View
              style={[bubbleStyles.modelDot, { backgroundColor: modelCfg.color }]}
            />
            <Text style={[bubbleStyles.modelTag, { color: colors.mutedForeground }]}>
              {modelCfg.label}
            </Text>
          </View>
        )}
        <View
          style={[
            bubbleStyles.aiBubble,
            {
              backgroundColor: bubbleBg,
              borderColor: bubbleBorder,
            },
          ]}
        >
          {isError || isOffTopic ? (
            <Text style={[bubbleStyles.aiText, { color: textColor }]}>
              {message.content}
            </Text>
          ) : (
            <MarkdownContent
              content={message.content}
              textColor={textColor}
              colors={colors}
            />
          )}
        </View>
        {!isOffTopic && !isError && (
          <View style={bubbleStyles.actions}>
            <Pressable style={bubbleStyles.actionBtn} onPress={handleCopy}>
              <Feather
                name={copied ? "check" : "copy"}
                size={12}
                color={copied ? "#10B981" : colors.mutedForeground}
              />
              <Text style={[bubbleStyles.actionLabel, { color: colors.mutedForeground }]}>
                {copied ? "Copied" : "Copy"}
              </Text>
            </Pressable>
            <Pressable
              style={bubbleStyles.actionBtn}
              onPress={() => {
                bookmarkMessage(message.id);
                if (Platform.OS !== "web")
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <Feather
                name={message.bookmarked ? "bookmark" : "bookmark"}
                size={12}
                color={message.bookmarked ? "#F59E0B" : colors.mutedForeground}
              />
              <Text
                style={[
                  bubbleStyles.actionLabel,
                  {
                    color: message.bookmarked ? "#F59E0B" : colors.mutedForeground,
                    fontWeight: message.bookmarked ? "700" : "400",
                  },
                ]}
              >
                {message.bookmarked ? "Saved" : "Save"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Typing Dots ────────────────────────────────────────────────────────────
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
          Animated.delay(i * 150),
          Animated.timing(d, { toValue: 1, duration: 260, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0, duration: 260, useNativeDriver: true }),
          Animated.delay(450 - i * 150),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={bubbleStyles.aiRow}>
      <View style={[bubbleStyles.aiAvatar, { backgroundColor: colors.primary + "20" }]}>
        <Feather name="cpu" size={12} color={colors.primary} />
      </View>
      <View
        style={[
          bubbleStyles.typingBubble,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {dots.map((d, i) => (
          <Animated.View
            key={i}
            style={[
              bubbleStyles.dot,
              { backgroundColor: colors.primary },
              {
                opacity: d,
                transform: [
                  { translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) },
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
        style={[
          chipStyles.chip,
          { backgroundColor: colors.muted, borderColor: colors.border },
        ]}
        onPress={() => {
          setOpen((v) => !v);
          if (Platform.OS !== "web")
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <View style={[chipStyles.colorDot, { backgroundColor: current.color }]} />
        <Text
          style={[chipStyles.label, { color: colors.foreground }]}
          numberOfLines={1}
        >
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
                  sel && { backgroundColor: colors.primary + "14" },
                ]}
                onPress={() => {
                  setSelectedModel(m.id);
                  setOpen(false);
                  if (Platform.OS !== "web")
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View
                  style={[chipStyles.colorDot, { backgroundColor: m.color, width: 10, height: 10 }]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[chipStyles.dropLabel, { color: colors.foreground }]}>
                    {m.label}
                  </Text>
                  <Text
                    style={[chipStyles.dropDesc, { color: colors.mutedForeground }]}
                  >
                    {m.description}
                  </Text>
                </View>
                {sel && (
                  <Feather name="check" size={14} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ─── Saved Bookmarks View ───────────────────────────────────────────────────
function BookmarksView() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bookmarks, removeBookmark } = useAIChat();

  if (bookmarks.length === 0) {
    return (
      <View style={savedStyles.empty}>
        <View
          style={[savedStyles.emptyIcon, { backgroundColor: colors.muted }]}
        >
          <Feather name="bookmark" size={32} color={colors.mutedForeground} />
        </View>
        <Text style={[savedStyles.emptyTitle, { color: colors.foreground }]}>
          No saved answers yet
        </Text>
        <Text style={[savedStyles.emptySub, { color: colors.mutedForeground }]}>
          Tap "Save" on any AI response to keep it here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        savedStyles.list,
        { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 20 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[savedStyles.count, { color: colors.mutedForeground }]}>
        {bookmarks.length} saved answer{bookmarks.length !== 1 ? "s" : ""}
      </Text>
      {bookmarks.map((bk) => (
        <BookmarkCard
          key={bk.id}
          bookmark={bk}
          onDelete={() => {
            removeBookmark(bk.id);
            if (Platform.OS !== "web")
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          colors={colors}
        />
      ))}
    </ScrollView>
  );
}

function BookmarkCard({
  bookmark,
  onDelete,
  colors,
}: {
  bookmark: BookmarkedAnswer;
  onDelete: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const [expanded, setExpanded] = useState(false);
  const modelCfg = MODELS.find((m) => m.id === bookmark.modelId);
  const date = new Date(bookmark.timestamp);
  const dateStr = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <View
      style={[
        savedStyles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {/* Question */}
      <Pressable onPress={() => setExpanded((v) => !v)}>
        <View style={savedStyles.cardHeader}>
          <View
            style={[
              savedStyles.qIcon,
              { backgroundColor: colors.primary + "18" },
            ]}
          >
            <Text style={{ fontSize: 11, fontWeight: "800", color: colors.primary }}>
              Q
            </Text>
          </View>
          <Text
            style={[savedStyles.question, { color: colors.foreground }]}
            numberOfLines={expanded ? undefined : 2}
          >
            {bookmark.question}
          </Text>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.mutedForeground}
          />
        </View>
      </Pressable>

      {/* Answer preview / expanded */}
      {expanded && (
        <View
          style={[
            savedStyles.answerBox,
            { backgroundColor: colors.muted, borderColor: colors.border },
          ]}
        >
          <MarkdownContent
            content={bookmark.answer}
            textColor={colors.foreground}
            colors={colors}
          />
        </View>
      )}

      {/* Footer */}
      <View style={savedStyles.cardFooter}>
        {modelCfg && (
          <View style={savedStyles.modelBadge}>
            <View
              style={[savedStyles.modelDot, { backgroundColor: modelCfg.color }]}
            />
            <Text
              style={[savedStyles.modelLabel, { color: colors.mutedForeground }]}
            >
              {modelCfg.label}
            </Text>
          </View>
        )}
        <Text style={[savedStyles.dateLabel, { color: colors.mutedForeground }]}>
          {dateStr}
        </Text>
        <Pressable onPress={onDelete} style={savedStyles.deleteBtn}>
          <Feather name="trash-2" size={13} color={colors.destructive} />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AIChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { messages, isLoading, sendUserMessage, clearHistory, bookmarks } =
    useAIChat();

  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"chat" | "saved">("chat");
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const hasMessages = messages.length > 0;

  const bottomClearance = TAB_BAR_HEIGHT + insets.bottom;

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isLoading]);

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;
    setInput("");
    setTab("chat");
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
            paddingTop: insets.top + 8,
          },
        ]}
      >
        {/* Top row: logo + title + actions */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={[colors.primary, colors.primary + "CC"]}
              style={styles.headerIcon}
            >
              <Feather name="cpu" size={17} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                MedPocket AI
              </Text>
              <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
                Medical Education
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <ModelChip />
            {hasMessages && tab === "chat" && (
              <Pressable
                style={[styles.iconBtn, { backgroundColor: colors.muted }]}
                onPress={() => {
                  if (Platform.OS !== "web")
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  clearHistory();
                }}
              >
                <Feather name="trash-2" size={15} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Tab bar */}
        <View style={[styles.tabBar, { borderTopColor: colors.border }]}>
          {(["chat", "saved"] as const).map((t) => {
            const active = tab === t;
            const label = t === "chat" ? "Chat" : `Saved${bookmarks.length > 0 ? ` (${bookmarks.length})` : ""}`;
            const icon = t === "chat" ? "message-circle" : "bookmark";
            return (
              <Pressable
                key={t}
                style={[
                  styles.tabItem,
                  active && {
                    borderBottomColor: colors.primary,
                    borderBottomWidth: 2,
                  },
                ]}
                onPress={() => setTab(t)}
              >
                <Feather
                  name={icon}
                  size={13}
                  color={active ? colors.primary : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: active ? colors.primary : colors.mutedForeground },
                    active && { fontWeight: "700" },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Saved tab ── */}
      {tab === "saved" ? (
        <BookmarksView />
      ) : (
        /* ── Chat tab ── */
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
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
            keyboardShouldPersistTaps="handled"
          >
            {!hasMessages ? (
              <View style={styles.emptyWrap}>
                <LinearGradient
                  colors={[colors.primary + "30", colors.primary + "08"]}
                  style={styles.emptyIconBg}
                >
                  <Feather name="cpu" size={36} color={colors.primary} />
                </LinearGradient>

                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  Ask MedPocket AI
                </Text>
                <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                  Clinical Q&A · Drug Info · OSCE · Differentials
                </Text>

                <View style={styles.quickGrid}>
                  {QUICK_PROMPTS.map((q) => (
                    <Pressable
                      key={q.label}
                      style={({ pressed }) => [
                        styles.quickCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                      onPress={() => handleSend(q.label)}
                    >
                      <Feather name={q.icon} size={14} color={colors.primary} />
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
                    {
                      backgroundColor: colors.primary + "10",
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Feather name="shield" size={13} color={colors.primary} />
                  <Text
                    style={[styles.disclaimerText, { color: colors.mutedForeground }]}
                  >
                    For medical education only · Not a substitute for clinical judgment
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
                paddingBottom: bottomClearance + 6,
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
                placeholder="Ask a medical question…"
                placeholderTextColor={colors.mutedForeground}
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={800}
                blurOnSubmit={false}
                onSubmitEditing={() => handleSend()}
                editable={!isLoading}
              />
              <Pressable
                style={[
                  styles.sendBtn,
                  {
                    backgroundColor:
                      input.trim() && !isLoading
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => handleSend()}
                disabled={!input.trim() || isLoading}
              >
                <Feather
                  name={isLoading ? "loader" : "arrow-up"}
                  size={16}
                  color={input.trim() && !isLoading ? "#fff" : colors.mutedForeground}
                />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  headerSub: { fontSize: 11, marginTop: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
  },
  tabLabel: { fontSize: 13 },

  scrollContent: { flexGrow: 1, padding: 16 },
  scrollCenter: { justifyContent: "center" },

  emptyWrap: { alignItems: "center", paddingVertical: 12 },
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
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    justifyContent: "center",
    marginBottom: 20,
    width: "100%",
  },
  quickCard: {
    width: "46%",
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    gap: 8,
  },
  quickLabel: { fontSize: 12.5, fontWeight: "600", lineHeight: 17 },
  disclaimerCard: {
    flexDirection: "row",
    alignItems: "center",
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
    borderRadius: 22,
    paddingLeft: 16,
    paddingRight: 5,
    paddingVertical: 5,
    gap: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 110,
    lineHeight: 22,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});

const bubbleStyles = StyleSheet.create({
  userRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16,
    paddingLeft: 52,
  },
  userBubble: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 20,
    borderBottomRightRadius: 5,
  },
  userText: { fontSize: 14.5, lineHeight: 21 },

  aiRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginBottom: 16,
    paddingRight: 20,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  aiContent: { flex: 1 },
  modelTagRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 5 },
  modelDot: { width: 6, height: 6, borderRadius: 3 },
  modelTag: { fontSize: 10.5, fontWeight: "600", letterSpacing: 0.3 },
  aiBubble: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderTopLeftRadius: 5,
    borderWidth: 1,
  },
  aiText: { fontSize: 14, lineHeight: 22 },
  actions: { flexDirection: "row", gap: 18, marginTop: 7, paddingLeft: 6 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionLabel: { fontSize: 11.5 },

  typingBubble: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderTopLeftRadius: 5,
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
    top: 42,
    right: 0,
    width: 220,
    borderRadius: 14,
    borderWidth: 1,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 16,
    paddingVertical: 6,
  },
  dropItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  dropLabel: { fontSize: 13, fontWeight: "600" },
  dropDesc: { fontSize: 11, marginTop: 1 },
});

const savedStyles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  count: { fontSize: 12, fontWeight: "600", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.6 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySub: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14 },
  qIcon: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  question: { flex: 1, fontSize: 14, fontWeight: "600", lineHeight: 20 },
  answerBox: { marginHorizontal: 14, marginBottom: 12, borderRadius: 12, borderWidth: 1, padding: 12 },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingBottom: 12 },
  modelBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  modelDot: { width: 7, height: 7, borderRadius: 4 },
  modelLabel: { fontSize: 11, fontWeight: "600" },
  dateLabel: { flex: 1, fontSize: 11, textAlign: "right" },
  deleteBtn: { padding: 4 },
});
