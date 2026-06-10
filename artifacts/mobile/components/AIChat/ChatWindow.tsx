import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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
import ChatMessageItem from "./ChatMessage";
import ModelSelector from "./ModelSelector";
import TypingIndicator from "./TypingIndicator";

const { height: SCREEN_H } = Dimensions.get("window");

const WELCOME_MESSAGE = `👋 **Welcome to MedPocket AI**

I'm your medical education assistant. Ask me anything about:
• Clinical medicine & case discussions
• Drug information & pharmacology
• Anatomy, physiology, pathology
• OSCE preparation & exam tips
• Differential diagnosis

How can I help you today?`;

export default function ChatWindow() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    isOpen,
    isMinimized,
    messages,
    isLoading,
    loadingStatus,
    sendUserMessage,
    clearHistory,
    closeChat,
    toggleMinimize,
  } = useAIChat();

  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const minimizeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 70,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_H,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  useEffect(() => {
    Animated.spring(minimizeAnim, {
      toValue: isMinimized ? 0 : 1,
      tension: 80,
      friction: 12,
      useNativeDriver: false,
    }).start();
  }, [isMinimized]);

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages, isLoading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendUserMessage(text);
  }

  const chatH = minimizeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [56, Math.min(SCREEN_H * 0.78, 640)],
  });

  const contentOpacity = minimizeAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  if (!isOpen) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        { opacity: opacityAnim, transform: [{ translateY: slideAnim }] },
      ]}
      pointerEvents={isOpen ? "box-none" : "none"}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.kav}
        keyboardVerticalOffset={insets.bottom + 8}
      >
        <Animated.View
          style={[
            styles.window,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              height: chatH,
              bottom: insets.bottom + 84,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIcon, { backgroundColor: colors.primary }]}>
                <Feather name="activity" size={14} color="#fff" />
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
            <View style={styles.headerActions}>
              <ModelSelector />
              <Pressable style={styles.iconBtn} onPress={toggleMinimize}>
                <Feather
                  name={isMinimized ? "maximize-2" : "minus"}
                  size={16}
                  color={colors.mutedForeground}
                />
              </Pressable>
              <Pressable
                style={styles.iconBtn}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  closeChat();
                }}
              >
                <Feather name="x" size={17} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </View>

          {/* Body */}
          <Animated.View style={[styles.body, { opacity: contentOpacity }]}>
            <ScrollView
              ref={scrollRef}
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="on-drag"
            >
              {/* Welcome card */}
              {messages.length === 0 && (
                <View style={[styles.welcomeCard, { backgroundColor: colors.tealLight, borderColor: colors.border }]}>
                  <Text style={[styles.welcomeText, { color: colors.foreground }]}>
                    {WELCOME_MESSAGE}
                  </Text>
                </View>
              )}

              {messages.map((msg) => (
                <ChatMessageItem key={msg.id} message={msg} />
              ))}

              {isLoading && (
                <View>
                  <TypingIndicator />
                  {loadingStatus ? (
                    <Text style={[styles.loadingStatus, { color: colors.mutedForeground }]}>
                      {loadingStatus}
                    </Text>
                  ) : null}
                </View>
              )}
            </ScrollView>

            {/* Actions bar */}
            {messages.length > 0 && (
              <View style={[styles.actionsBar, { borderTopColor: colors.border }]}>
                <Pressable
                  style={styles.clearBtn}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    clearHistory();
                  }}
                >
                  <Feather name="trash-2" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.clearLabel, { color: colors.mutedForeground }]}>
                    Clear chat
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Input */}
            <View style={[styles.inputRow, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.muted,
                    color: colors.foreground,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Ask a medical question…"
                placeholderTextColor={colors.mutedForeground}
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={800}
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
              <Pressable
                style={[
                  styles.sendBtn,
                  {
                    backgroundColor:
                      input.trim() && !isLoading ? colors.primary : colors.muted,
                  },
                ]}
                onPress={handleSend}
                disabled={!input.trim() || isLoading}
              >
                <Feather
                  name="send"
                  size={16}
                  color={input.trim() && !isLoading ? "#fff" : colors.mutedForeground}
                />
              </Pressable>
            </View>

            {/* Disclaimer */}
            <View style={[styles.disclaimer, { backgroundColor: colors.muted }]}>
              <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
                For medical education purposes only. This AI does not replace professional
                medical advice, diagnosis, or clinical judgment.
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
    pointerEvents: "box-none",
  },
  kav: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 12,
  },
  window: {
    position: "absolute",
    left: 12,
    right: 12,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 14, fontWeight: "700" },
  headerSub: { fontSize: 10, marginTop: 1 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  iconBtn: { padding: 6 },
  body: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 6 },
  welcomeCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  welcomeText: { fontSize: 13, lineHeight: 20 },
  loadingStatus: {
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 6,
  },
  actionsBar: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderTopWidth: 1,
    flexDirection: "row",
  },
  clearBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  clearLabel: { fontSize: 12 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    maxHeight: 100,
    lineHeight: 20,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  disclaimer: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  disclaimerText: {
    fontSize: 9.5,
    textAlign: "center",
    lineHeight: 13,
  },
});
