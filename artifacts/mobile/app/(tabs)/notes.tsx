import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

const SUBJECTS = ["All", "Anatomy", "Physiology", "Pathology", "Pharmacology", "Medicine", "Surgery", "General"];

export default function NotesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notes, createNote, deleteNote, updateNote } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const styles = makeStyles(colors);

  const filteredNotes = notes.filter((n) => {
    const matchSubject = selectedSubject === "All" || n.subject === selectedSubject;
    const matchSearch =
      !searchQuery ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchSearch;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  function handleCreateNote() {
    const note = createNote({
      title: "New Note",
      content: "",
      subject: "General",
      tags: [],
      isPinned: false,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/notes/${note.id}`);
  }

  function handleDeleteNote(id: string, title: string) {
    Alert.alert("Delete Note", `Delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteNote(id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  }

  function handleTogglePin(id: string, isPinned: boolean) {
    updateNote(id, { isPinned: !isPinned });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <View style={[styles.container]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Notes</Text>
            <Text style={styles.subtitle}>{notes.length} note{notes.length !== 1 ? "s" : ""}</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Subject filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {SUBJECTS.map((s) => (
            <Pressable
              key={s}
              style={[styles.filterChip, selectedSubject === s && styles.filterChipActive]}
              onPress={() => setSelectedSubject(s)}
            >
              <Text style={[styles.filterChipText, selectedSubject === s && styles.filterChipTextActive]}>
                {s}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Pinned */}
        {pinnedNotes.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Pinned</Text>
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                colors={colors}
                onPress={() => router.push(`/notes/${note.id}`)}
                onDelete={() => handleDeleteNote(note.id, note.title)}
                onTogglePin={() => handleTogglePin(note.id, note.isPinned)}
              />
            ))}
          </>
        )}

        {/* All notes */}
        {otherNotes.length > 0 && (
          <>
            {pinnedNotes.length > 0 && <Text style={styles.sectionLabel}>All Notes</Text>}
            {otherNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                colors={colors}
                onPress={() => router.push(`/notes/${note.id}`)}
                onDelete={() => handleDeleteNote(note.id, note.title)}
                onTogglePin={() => handleTogglePin(note.id, note.isPinned)}
              />
            ))}
          </>
        )}

        {/* Empty state */}
        {filteredNotes.length === 0 && (
          <View style={styles.empty}>
            <Feather name="file-text" size={48} color={colors.border} />
            <Text style={styles.emptyTitle}>No notes yet</Text>
            <Text style={styles.emptyDesc}>Tap + to create your first note</Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 90 }]}
        onPress={handleCreateNote}
      >
        <Feather name="plus" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}

function NoteCard({
  note, colors, onPress, onDelete, onTogglePin,
}: {
  note: ReturnType<typeof useApp>["notes"][0];
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const preview = note.content.replace(/[#*_`]/g, "").trim().slice(0, 80);
  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: colors.card,
          marginHorizontal: 20,
          marginBottom: 10,
          padding: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground, flex: 1 }} numberOfLines={1}>
          {note.title}
        </Text>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <Pressable onPress={onTogglePin} hitSlop={8}>
            <Feather name="bookmark" size={15} color={note.isPinned ? colors.primary : colors.mutedForeground} />
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={8}>
            <Feather name="trash-2" size={15} color={colors.destructive} />
          </Pressable>
        </View>
      </View>
      {preview.length > 0 && (
        <Text style={{ fontSize: 12, color: colors.mutedForeground, lineHeight: 18, marginBottom: 8 }} numberOfLines={2}>
          {preview}
        </Text>
      )}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ backgroundColor: colors.tealLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
          <Text style={{ fontSize: 10, color: colors.primary, fontWeight: "600" }}>{note.subject}</Text>
        </View>
        <Text style={{ fontSize: 10, color: colors.mutedForeground }}>
          {new Date(note.updatedAt).toLocaleDateString()}
        </Text>
      </View>
    </Pressable>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    title: { fontSize: 28, fontWeight: "800", color: colors.foreground },
    subtitle: { fontSize: 13, color: colors.mutedForeground, marginTop: 4 },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      marginHorizontal: 20,
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    searchInput: { flex: 1, fontSize: 14, color: colors.foreground },
    filterRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 16 },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: { fontSize: 12, fontWeight: "600", color: colors.mutedForeground },
    filterChipTextActive: { color: "#fff" },
    sectionLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    empty: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      gap: 8,
    },
    emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.mutedForeground },
    emptyDesc: { fontSize: 13, color: colors.mutedForeground },
    fab: {
      position: "absolute",
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 8,
    },
  });
}
