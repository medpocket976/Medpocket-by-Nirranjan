import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  BookmarkedAnswer,
  ChatMessage,
  ModelId,
  isMedicalQuestion,
  loadBookmarks,
  loadChatHistory,
  loadSelectedModel,
  saveBookmarks,
  saveChatHistory,
  saveSelectedModel,
  sendMessage,
  sendImageMessage,
} from "@/services/openRouterService";

interface AIChatContextType {
  isOpen: boolean;
  isMinimized: boolean;
  messages: ChatMessage[];
  selectedModel: ModelId;
  bookmarks: BookmarkedAnswer[];
  isLoading: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleMinimize: () => void;
  sendUserMessage: (
    text: string,
    imageBase64?: string,
    imageMimeType?: string
  ) => Promise<void>;
  setSelectedModel: (id: ModelId) => void;
  clearHistory: () => void;
  bookmarkMessage: (messageId: string) => void;
  removeBookmark: (bookmarkId: string) => void;
}

const AIChatContext = createContext<AIChatContextType | null>(null);

const OFF_TOPIC_MESSAGE =
  "⚠️ MedPocket AI is designed exclusively for medical education and healthcare-related learning. Please ask a medical or clinical question.";

const IMAGE_NOT_MEDICAL_MESSAGE =
  "⚠️ MedPocket AI accepts only medical and healthcare-related images for educational purposes. Please upload an ECG, X-ray, lab report, histology slide, clinical photograph, or other medical image.";

const IMAGE_DISCLAIMER =
  "\n\n---\n⚕️ *For medical education purposes only. This AI analysis does not replace professional medical advice, diagnosis, or clinical judgment.*";

export function AIChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedModel, setSelectedModelState] =
    useState<ModelId>("meta-llama/llama-3.3-70b-instruct:free");
  const [bookmarks, setBookmarks] = useState<BookmarkedAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    (async () => {
      const [history, model, bmarks] = await Promise.all([
        loadChatHistory(),
        loadSelectedModel(),
        loadBookmarks(),
      ]);
      setMessages(history);
      setSelectedModelState(model);
      setBookmarks(bmarks);
    })();
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const setSelectedModel = useCallback((id: ModelId) => {
    setSelectedModelState(id);
    saveSelectedModel(id);
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    saveChatHistory([]);
  }, []);

  const bookmarkMessage = useCallback(
    (messageId: string) => {
      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === messageId ? { ...m, bookmarked: !m.bookmarked } : m
        );
        saveChatHistory(updated);

        const msg = updated.find((m) => m.id === messageId);
        if (msg?.bookmarked && msg.role === "assistant") {
          const userMsg = prev[prev.findIndex((m) => m.id === messageId) - 1];
          const newBookmark: BookmarkedAnswer = {
            id: Date.now().toString(),
            question: userMsg?.content ?? (userMsg?.hasImage ? "📷 Image analysis" : ""),
            answer: msg.content,
            modelId: msg.modelId ?? ("meta-llama/llama-3.3-70b-instruct:free" as ModelId),
            timestamp: Date.now(),
          };
          setBookmarks((bks) => {
            const updated = [newBookmark, ...bks];
            saveBookmarks(updated);
            return updated;
          });
        }
        return updated;
      });
    },
    []
  );

  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarks((prev) => {
      const updated = prev.filter((b) => b.id !== bookmarkId);
      saveBookmarks(updated);
      return updated;
    });
  }, []);

  const sendUserMessage = useCallback(
    async (text: string, imageBase64?: string, imageMimeType?: string) => {
      const hasImage = !!imageBase64;
      const textTrimmed = text.trim();

      if (!textTrimmed && !hasImage) return;
      if (isLoading) return;

      const userMsg: ChatMessage = {
        id: `u_${Date.now()}`,
        role: "user",
        content: textTrimmed || (hasImage ? "Please analyse this medical image." : ""),
        timestamp: Date.now(),
        imageBase64: imageBase64,
        imageMimeType: imageMimeType,
        hasImage: hasImage,
      };

      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setIsLoading(true);

      try {
        if (hasImage) {
          // ── Image path: use vision model ─────────────────────────────
          const reply = await sendImageMessage(
            messages,
            imageBase64!,
            imageMimeType ?? "image/jpeg",
            textTrimmed
          );

          let content: string;
          if (reply.trim() === "IMAGE_NOT_MEDICAL") {
            content = IMAGE_NOT_MEDICAL_MESSAGE;
          } else {
            content = reply + IMAGE_DISCLAIMER;
          }

          const assistantMsg: ChatMessage = {
            id: `a_${Date.now()}`,
            role: "assistant",
            content,
            timestamp: Date.now(),
            modelId: "meta-llama/llama-3.2-11b-vision-instruct:free" as ModelId,
          };
          const withResponse = [...newMessages, assistantMsg];
          setMessages(withResponse);
          saveChatHistory(withResponse);
        } else {
          // ── Text-only path: existing logic unchanged ─────────────────
          if (!isMedicalQuestion(textTrimmed)) {
            const offTopicMsg: ChatMessage = {
              id: `a_${Date.now()}`,
              role: "assistant",
              content: OFF_TOPIC_MESSAGE,
              timestamp: Date.now(),
              modelId: selectedModel,
            };
            const withResponse = [...newMessages, offTopicMsg];
            setMessages(withResponse);
            saveChatHistory(withResponse);
            return;
          }

          const reply = await sendMessage(newMessages, selectedModel);
          const content =
            reply.trim() === "OFF_TOPIC" ? OFF_TOPIC_MESSAGE : reply;

          const assistantMsg: ChatMessage = {
            id: `a_${Date.now()}`,
            role: "assistant",
            content,
            timestamp: Date.now(),
            modelId: selectedModel,
          };
          const withResponse = [...newMessages, assistantMsg];
          setMessages(withResponse);
          saveChatHistory(withResponse);
        }
      } catch (err) {
        const errMsg: ChatMessage = {
          id: `e_${Date.now()}`,
          role: "assistant",
          content: `❌ ${err instanceof Error ? err.message : "Something went wrong. Please try again."}`,
          timestamp: Date.now(),
          modelId: selectedModel,
        };
        const withError = [...newMessages, errMsg];
        setMessages(withError);
        saveChatHistory(withError);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, selectedModel]
  );

  return (
    <AIChatContext.Provider
      value={{
        isOpen,
        isMinimized,
        messages,
        selectedModel,
        bookmarks,
        isLoading,
        openChat,
        closeChat,
        toggleMinimize,
        sendUserMessage,
        setSelectedModel,
        clearHistory,
        bookmarkMessage,
        removeBookmark,
      }}
    >
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChat() {
  const ctx = useContext(AIChatContext);
  if (!ctx) throw new Error("useAIChat must be used within AIChatProvider");
  return ctx;
}
