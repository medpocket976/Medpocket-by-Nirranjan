import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const SUBJECTS = ["General", "Anatomy", "Physiology", "Pathology", "Pharmacology", "Medicine", "Surgery", "Pediatrics", "OBGYN"];

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notes, updateNote } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const note = notes.find((n) => n.id === id);
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [subject, setSubject] = useState(note?.subject ?? "General");
  const [showSubjects, setShowSubjects] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!note) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateNote(note.id, { title: title || "Untitled", content, subject });
    }, 600);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, content, subject]);

  if (!note) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground }}>Note not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const styles = makeStyles(colors);
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => {
          updateNote(note.id, { title: title || "Untitled", content, subject });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>

        <Pressable
          style={styles.subjectBtn}
          onPress={() => setShowSubjects(!showSubjects)}
        >
          <View style={styles.subjectBadge}>
            <Text style={styles.subjectText}>{subject}</Text>
            <Feather name="chevron-down" size={12} color={colors.primary} />
          </View>
        </Pressable>

        <Pressable style={styles.pinBtn} onPress={() => {
          updateNote(note.id, { isPinned: !note.isPinned });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}>
          <Feather name="bookmark" size={18} color={note.isPinned ? colors.primary : colors.mutedForeground} />
        </Pressable>
      </View>

      {/* Subject Picker */}
      {showSubjects && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectPicker}
        >
          {SUBJECTS.map((s) => (
            <Pressable
              key={s}
              style={[styles.subjectOption, s === subject && styles.subjectOptionActive]}
              onPress={() => {
                setSubject(s);
                setShowSubjects(false);
              }}
            >
              <Text style={[styles.subjectOptionText, s === subject && { color: "#fff" }]}>{s}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Editor */}
      <ScrollView style={styles.editor} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Note title..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          returnKeyType="done"
        />
        <TextInput
          style={styles.contentInput}
          value={content}
          onChangeText={setContent}
          placeholder="Start writing... (Markdown supported)"
          placeholderTextColor={colors.mutedForeground}
          multiline
          textAlignVertical="top"
        />
        <View style={{ height: insets.bottom + 80 }} />
      </ScrollView>

      {/* Status bar */}
      <View style={[styles.statusBar, { paddingBottom: insets.bottom + 10 }]}>
        <Text style={styles.statusText}>
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </Text>
        <Text style={styles.statusText}>
          Saved {new Date(note.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 20, paddingVertical: 12, gap: 12,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.muted, alignItems: "center", justifyContent: "center",
    },
    subjectBtn: { flex: 1 },
    subjectBadge: {
      flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start",
      backgroundColor: colors.tealLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    },
    subjectText: { fontSize: 12, color: colors.primary, fontWeight: "700" },
    pinBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.muted, alignItems: "center", justifyContent: "center",
    },
    subjectPicker: { paddingHorizontal: 20, gap: 8, paddingBottom: 10 },
    subjectOption: {
      paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
      backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border,
    },
    subjectOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    subjectOptionText: { fontSize: 12, fontWeight: "600", color: colors.mutedForeground },
    editor: { flex: 1, paddingHorizontal: 20 },
    titleInput: {
      fontSize: 24, fontWeight: "800", color: colors.foreground,
      marginBottom: 16, lineHeight: 32,
    },
    contentInput: {
      fontSize: 15, color: colors.foreground,
      lineHeight: 26, minHeight: 300,
    },
    statusBar: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      paddingHorizontal: 20, paddingTop: 10,
      borderTopWidth: 1, borderTopColor: colors.border,
      backgroundColor: colors.card,
    },
    statusText: { fontSize: 11, color: colors.mutedForeground },
  });
}
