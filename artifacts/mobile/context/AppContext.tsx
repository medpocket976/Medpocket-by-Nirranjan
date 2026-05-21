import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Appearance, Platform, useColorScheme } from "react-native";

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
}

interface AppContextType extends AppState {
  resolvedTheme: "light" | "dark";
  updateUser: (user: Partial<UserProfile>) => void;
  setTheme: (theme: "system" | "light" | "dark") => void;
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
};

export const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "@medpocket_state_v3";

/** Safely call Appearance.setColorScheme — not supported on web */
function safeSetColorScheme(scheme: "light" | "dark" | null) {
  if (Platform.OS !== "web") {
    try {
      Appearance.setColorScheme(scheme);
    } catch {}
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  // Track the real system colour scheme via hook so we re-render when it changes
  const systemScheme = useColorScheme() ?? "light";

  // Resolved theme: user pref overrides system
  const resolvedTheme: "light" | "dark" =
    state.theme === "system" ? systemScheme : state.theme;

  // Keep a ref so we can apply native override once on load
  const didApplyNativeOverride = useRef(false);

  useEffect(() => {
    loadState();
  }, []);

  // Persist state whenever it changes (after initial load)
  const isFirstSave = useRef(true);
  useEffect(() => {
    if (!loaded) return;
    if (isFirstSave.current) { isFirstSave.current = false; return; }
    saveState(state);
  }, [state, loaded]);

  // Apply native colour scheme override whenever theme pref changes
  useEffect(() => {
    if (!loaded) return;
    if (state.theme === "system") {
      safeSetColorScheme(null);
    } else {
      safeSetColorScheme(state.theme);
    }
  }, [state.theme, loaded]);

  async function loadState() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppState>;
        setState({ ...defaultState, ...parsed });
      }
    } catch {}
    finally {
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
    safeSetColorScheme(null);
  }, []);

  const addBookmark = useCallback(
    (bookmark: Omit<Bookmark, "id" | "createdAt">) => {
      const newBookmark: Bookmark = {
        ...bookmark,
        id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        bookmarks: [newBookmark, ...prev.bookmarks],
      }));
    },
    []
  );

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

  const createNote = useCallback(
    (note: Omit<Note, "id" | "createdAt" | "updatedAt">): Note => {
      const now = new Date().toISOString();
      const newNote: Note = {
        ...note,
        id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
        createdAt: now,
        updatedAt: now,
      };
      setState((prev) => ({ ...prev, notes: [newNote, ...prev.notes] }));
      return newNote;
    },
    []
  );

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      ),
    }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
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
