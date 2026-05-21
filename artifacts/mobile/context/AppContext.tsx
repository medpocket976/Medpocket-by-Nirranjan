import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizResult {
  subject: string;
  score: number;
  total: number;
  date: string;
}

export interface Bookmark {
  id: string;
  type: "drug" | "lab" | "emergency" | "exam" | "question";
  itemId: string;
  name: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  year: string;
  college: string;
  interests: string[];
}

interface AppState {
  user: UserProfile;
  bookmarks: Bookmark[];
  notes: Note[];
  quizHistory: QuizResult[];
  streak: number;
  lastStudyDate: string;
  totalStudyDays: number;
  recentSearches: string[];
  isOnboarded: boolean;
  theme: "system" | "light" | "dark";
  studyReminders: boolean;
  reminderTime: string;
}

interface AppContextType extends AppState {
  resolvedTheme: "light" | "dark";
  updateUser: (user: Partial<UserProfile>) => void;
  setTheme: (theme: "system" | "light" | "dark") => void;
  setStudyReminders: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;
  addBookmark: (bookmark: Omit<Bookmark, "id" | "createdAt">) => void;
  removeBookmark: (itemId: string) => void;
  isBookmarked: (itemId: string) => boolean;
  createNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addQuizResult: (result: QuizResult) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  recordStudySession: () => void;
  completeOnboarding: (profile: Partial<UserProfile>) => void;
  signOut: () => void;
}

const defaultUser: UserProfile = {
  name: "Medical Student",
  year: "MBBS 3rd Year",
  college: "",
  interests: [],
};

const defaultState: AppState = {
  user: defaultUser,
  bookmarks: [],
  notes: [],
  quizHistory: [],
  streak: 0,
  lastStudyDate: "",
  totalStudyDays: 0,
  recentSearches: [],
  isOnboarded: false,
  theme: "system",
  studyReminders: false,
  reminderTime: "08:00",
};

export const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "@medpocket_state_v2";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [loaded, setLoaded] = useState(false);
  const [systemScheme, setSystemScheme] = useState<"light" | "dark">(
    Appearance.getColorScheme() === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    loadState();
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === "dark" ? "dark" : "light");
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (loaded) saveState(state);
  }, [state, loaded]);

  const resolvedTheme: "light" | "dark" =
    state.theme === "system" ? systemScheme : state.theme;

  async function loadState() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppState;
        setState({ ...defaultState, ...parsed });
      }
    } catch {
    } finally {
      setLoaded(true);
    }
  }

  async function saveState(data: AppState) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setState((prev) => ({ ...prev, user: { ...prev.user, ...updates } }));
  }, []);

  const setTheme = useCallback((theme: "system" | "light" | "dark") => {
    setState((prev) => ({ ...prev, theme }));
    if (theme !== "system") {
      Appearance.setColorScheme(theme);
    } else {
      Appearance.setColorScheme(null);
    }
  }, []);

  const setStudyReminders = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, studyReminders: enabled }));
  }, []);

  const setReminderTime = useCallback((time: string) => {
    setState((prev) => ({ ...prev, reminderTime: time }));
  }, []);

  const completeOnboarding = useCallback((profile: Partial<UserProfile>) => {
    setState((prev) => ({
      ...prev,
      isOnboarded: true,
      user: { ...prev.user, ...profile },
    }));
  }, []);

  const signOut = useCallback(() => {
    setState({ ...defaultState });
    Appearance.setColorScheme(null);
  }, []);

  const addBookmark = useCallback((bookmark: Omit<Bookmark, "id" | "createdAt">) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, bookmarks: [newBookmark, ...prev.bookmarks] }));
  }, []);

  const removeBookmark = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      bookmarks: prev.bookmarks.filter((b) => b.itemId !== itemId),
    }));
  }, []);

  const isBookmarked = useCallback(
    (itemId: string) => state.bookmarks.some((b) => b.itemId === itemId),
    [state.bookmarks]
  );

  const createNote = useCallback((note: Omit<Note, "id" | "createdAt" | "updatedAt">): Note => {
    const now = new Date().toISOString();
    const newNote: Note = {
      ...note,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      createdAt: now,
      updatedAt: now,
    };
    setState((prev) => ({ ...prev, notes: [newNote, ...prev.notes] }));
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      ),
    }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setState((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== id) }));
  }, []);

  const addQuizResult = useCallback((result: QuizResult) => {
    setState((prev) => ({
      ...prev,
      quizHistory: [result, ...prev.quizHistory].slice(0, 50),
    }));
  }, []);

  const addRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setState((prev) => {
      const filtered = prev.recentSearches.filter((s) => s !== query);
      return { ...prev, recentSearches: [query, ...filtered].slice(0, 10) };
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setState((prev) => ({ ...prev, recentSearches: [] }));
  }, []);

  const recordStudySession = useCallback(() => {
    const today = new Date().toDateString();
    setState((prev) => {
      if (prev.lastStudyDate === today) return prev;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = prev.lastStudyDate === yesterday.toDateString();
      return {
        ...prev,
        lastStudyDate: today,
        streak: isConsecutive ? prev.streak + 1 : 1,
        totalStudyDays: prev.totalStudyDays + 1,
      };
    });
  }, []);

  if (!loaded) return null;

  return (
    <AppContext.Provider
      value={{
        ...state,
        resolvedTheme,
        updateUser,
        setTheme,
        setStudyReminders,
        setReminderTime,
        addBookmark,
        removeBookmark,
        isBookmarked,
        createNote,
        updateNote,
        deleteNote,
        addQuizResult,
        addRecentSearch,
        clearRecentSearches,
        recordStudySession,
        completeOnboarding,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
