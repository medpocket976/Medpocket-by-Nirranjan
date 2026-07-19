import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, {
  memo, useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassBackground } from "@/components/GlassBackground";
import { GlassView } from "@/components/GlassView";
import { useApp } from "@/context/AppContext";
import type { Note } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const SUBJECTS = ["All", "Anatomy", "Physiology", "Pathology", "Pharmacology", "Medicine", "Surgery", "General"];

const SUBJECT_COLORS: Record<string, string> = {
  Anatomy: "#EF4444",
  Physiology: "#3B82F6",
  Pathology: "#8B5CF6",
  Pharmacology: "#F59E0B",
  Medicine: "#10B981",
  Surgery: "#EC4899",
  General: "#6366F1",
};

// ── Note Card ────────────────────────────────────────────────────────────────
const NoteCard = memo(function NoteCard({
  note, colors, onPress, onDelete, onTogglePin,
}: {
  note: Note;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const preview = note.content.replace(/[#*_`]/g, "").trim().slice(0, 90);
  const accentColor = SUBJECT_COLORS[note.subject] ?? colors.primary;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, tension: 300, friction: 20, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 300, friction: 20, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, { marginHorizontal: 16, marginBottom: 10 }]}>
      <GlassView radius={20} style={{ overflow: "hidden" }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={note.title}
          style={{ padding: 16 }}
        >
          {/* Top accent bar */}
          <View style={[cardStyles.accentBar, { backgroundColor: accentColor }]} />

          <View style={cardStyles.topRow}>
            <Text style={[cardStyles.title, { color: colors.foreground }]} numberOfLines={1}>
              {note.title}
            </Text>
            <View style={cardStyles.actions}>
              <Pressable
                onPress={onTogglePin}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={note.isPinned ? "Unpin note" : "Pin note"}
              >
                <View style={[cardStyles.actionBtn, note.isPinned && { backgroundColor: colors.primary + "20" }]}>
                  <Feather
                    name={note.isPinned ? "bookmark" : "bookmark"}
                    size={14}
                    color={note.isPinned ? colors.primary : colors.mutedForeground}
                  />
                </View>
              </Pressable>
              <Pressable
                onPress={onDelete}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Delete note"
              >
                <View style={[cardStyles.actionBtn, { backgroundColor: "#EF444414" }]}>
                  <Feather name="trash-2" size={14} color="#EF4444" />
                </View>
              </Pressable>
            </View>
          </View>

          {preview.length > 0 && (
            <Text style={[cardStyles.preview, { color: colors.mutedForeground }]} numberOfLines={2}>
              {preview}
            </Text>
          )}

          <View style={cardStyles.footer}>
            <View style={[cardStyles.subjectTag, { backgroundColor: accentColor + "18", borderColor: accentColor + "30", borderWidth: 1 }]}>
              <View style={[cardStyles.subjectDot, { backgroundColor: accentColor }]} />
              <Text style={[cardStyles.subjectText, { color: accentColor }]}>{note.subject}</Text>
            </View>
            <Text style={[cardStyles.dateText, { color: colors.mutedForeground }]}>
              {new Date(note.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        </Pressable>
      </GlassView>
    </Animated.View>
  );
});

const cardStyles = StyleSheet.create({
  accentBar: { position: "absolute", top: 0, left: 0, right: 0, height: 3, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingTop: 4 },
  title: { fontSize: 15, fontWeight: "700", flex: 1, paddingRight: 8 },
  actions: { flexDirection: "row", gap: 8, alignItems: "center" },
  actionBtn: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  preview: { fontSize: 12, lineHeight: 18, marginBottom: 10 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  subjectTag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  subjectDot: { width: 5, height: 5, borderRadius: 3 },
  subjectText: { fontSize: 10, fontWeight: "700" },
  dateText: { fontSize: 10 },
});

// ── Undo Snackbar ─────────────────────────────────────────────────────────────
function UndoSnackbar({
  visible,
  noteTitle,
  onUndo,
  onDismiss,
  colors,
  bottomInset,
}: {
  visible: boolean;
  noteTitle: string;
  onUndo: () => void;
  onDismiss: () => void;
  colors: ReturnType<typeof useColors>;
  bottomInset: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(anim, { toValue: 1, tension: 180, friction: 16, useNativeDriver: true }).start();
    } else {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [80, 0] });

  return (
    <Animated.View
      style={[
        snackStyles.container,
        {
          bottom: bottomInset + 96,
          opacity: anim,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <GlassView radius={16} style={{ overflow: "hidden" }}>
        <View style={snackStyles.inner}>
          <Feather name="trash-2" size={14} color="#EF4444" />
          <Text style={[snackStyles.text, { color: colors.foreground }]} numberOfLines={1}>
            "{noteTitle}" deleted
          </Text>
          <Pressable onPress={onUndo} style={snackStyles.undoBtn} accessibilityLabel="Undo delete">
            <Text style={[snackStyles.undoText, { color: colors.primary }]}>Undo</Text>
          </Pressable>
        </View>
      </GlassView>
    </Animated.View>
  );
}

const snackStyles = StyleSheet.create({
  container: { position: "absolute", left: 16, right: 16, zIndex: 100 },
  inner: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12 },
  text: { flex: 1, fontSize: 13, fontWeight: "500" },
  undoBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  undoText: { fontSize: 13, fontWeight: "700" },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function NotesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notes, createNote, deleteNote, updateNote } = useApp();
  const topPad = Platform.OS === "web" ? 16 : insets.top;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");

  // ── Pending delete (undo) ────────────────────────────────────────────────
  const [pendingDelete, setPendingDelete] = useState<Note | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingDelete = useCallback((doDelete: boolean) => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    if (doDelete && pendingDelete) {
      deleteNote(pendingDelete.id);
    }
    setPendingDelete(null);
  }, [pendingDelete, deleteNote]);

  const handleUndo = useCallback(() => {
    clearPendingDelete(false); // restore: don't delete
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [clearPendingDelete]);

  // ── Filtered notes (exclude pending-delete note from display) ─────────────
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (pendingDelete && n.id === pendingDelete.id) return false;
      const matchSubject = selectedSubject === "All" || n.subject === selectedSubject;
      const matchSearch =
        !searchQuery ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchSearch;
    });
  }, [notes, selectedSubject, searchQuery, pendingDelete]);

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.isPinned), [filteredNotes]);
  const otherNotes  = useMemo(() => filteredNotes.filter((n) => !n.isPinned), [filteredNotes]);

  const displayedCount = notes.length - (pendingDelete ? 1 : 0);

  const handleCreateNote = useCallback(() => {
    // Commit any pending delete first
    clearPendingDelete(true);
    const note = createNote({ title: "New Note", content: "", subject: "General", tags: [], isPinned: false });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/notes/${note.id}`);
  }, [createNote, clearPendingDelete]);

  const handleDeleteNote = useCallback((note: Note) => {
    // Commit any previously pending delete
    if (pendingDelete) {
      if (undoTimer.current) clearTimeout(undoTimer.current);
      deleteNote(pendingDelete.id);
    }

    const doDelete = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setPendingDelete(note);
      // Auto-commit after 5 seconds
      undoTimer.current = setTimeout(() => {
        deleteNote(note.id);
        setPendingDelete(null);
      }, 5000);
    };

    if (Platform.OS === "web") {
      // Alert works on web but confirm is instant; just do it directly with undo
      doDelete();
    } else {
      Alert.alert(
        "Delete Note",
        `Delete "${note.title}"?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: doDelete },
        ],
      );
    }
  }, [pendingDelete, deleteNote]);

  const handleTogglePin = useCallback((id: string, isPinned: boolean) => {
    updateNote(id, { isPinned: !isPinned });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [updateNote]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
      if (pendingDelete) deleteNote(pendingDelete.id);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearSearch = useCallback(() => setSearchQuery(""), []);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <GlassBackground>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.foreground }]}>Notes</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                {displayedCount} note{displayedCount !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          {/* ── Search bar ── */}
          <GlassView radius={16} style={styles.searchBar}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Search notes…"
              placeholderTextColor={colors.mutedForeground}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={clearSearch} hitSlop={8}>
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </Pressable>
            )}
          </GlassView>

          {/* ── Subject filter pills ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            keyboardShouldPersistTaps="handled"
          >
            {SUBJECTS.map((s) => {
              const active = selectedSubject === s;
              const color = s === "All" ? colors.primary : (SUBJECT_COLORS[s] ?? colors.primary);
              return (
                <Pressable
                  key={s}
                  onPress={() => setSelectedSubject(s)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <GlassView
                    radius={20}
                    bgColor={active ? color : undefined}
                    borderColor={active ? color + "60" : undefined}
                    style={styles.filterChip}
                  >
                    <Text style={[styles.filterChipText, { color: active ? "#fff" : colors.mutedForeground }]}>
                      {s}
                    </Text>
                  </GlassView>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* ── Pinned notes ── */}
          {pinnedNotes.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Feather name="bookmark" size={12} color={colors.primary} />
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Pinned</Text>
              </View>
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  colors={colors}
                  onPress={() => router.push(`/notes/${note.id}`)}
                  onDelete={() => handleDeleteNote(note)}
                  onTogglePin={() => handleTogglePin(note.id, note.isPinned)}
                />
              ))}
            </>
          )}

          {/* ── All notes ── */}
          {otherNotes.length > 0 && (
            <>
              {pinnedNotes.length > 0 && (
                <View style={styles.sectionHeader}>
                  <Feather name="file-text" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>All Notes</Text>
                </View>
              )}
              {otherNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  colors={colors}
                  onPress={() => router.push(`/notes/${note.id}`)}
                  onDelete={() => handleDeleteNote(note)}
                  onTogglePin={() => handleTogglePin(note.id, note.isPinned)}
                />
              ))}
            </>
          )}

          {/* ── Empty state ── */}
          {filteredNotes.length === 0 && (
            <View style={styles.empty}>
              <GlassView radius={32} style={styles.emptyIcon}>
                <Feather name="file-text" size={36} color={colors.mutedForeground} />
              </GlassView>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {searchQuery || selectedSubject !== "All" ? "No matching notes" : "No notes yet"}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
                {searchQuery || selectedSubject !== "All"
                  ? "Try a different search or filter"
                  : "Tap + to create your first note"}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* ── FAB ── */}
        <Pressable
          style={[styles.fab, { bottom: insets.bottom + 90, backgroundColor: colors.primary }]}
          onPress={handleCreateNote}
          accessibilityRole="button"
          accessibilityLabel="Create new note"
        >
          <Feather name="plus" size={24} color="#fff" />
        </Pressable>

        {/* ── Undo Snackbar ── */}
        <UndoSnackbar
          visible={!!pendingDelete}
          noteTitle={pendingDelete?.title ?? ""}
          onUndo={handleUndo}
          onDismiss={() => clearPendingDelete(true)}
          colors={colors}
          bottomInset={insets.bottom}
        />
      </Animated.View>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title:    { fontSize: 32, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 2 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 16 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7 },
  filterChipText: { fontSize: 12, fontWeight: "600" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  emptyIcon: { width: 72, height: 72, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyDesc:  { fontSize: 13 },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
});
