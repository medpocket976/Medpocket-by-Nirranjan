import AsyncStorage from "@react-native-async-storage/async-storage";

export type ModelId =
  | "google/gemma-3-27b-it:free"
  | "qwen/qwen3-235b-a22b:free"
  | "meta-llama/llama-3.3-70b-instruct:free"
  | "mistralai/mistral-7b-instruct:free";

export interface ModelConfig {
  id: ModelId;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const MODELS: ModelConfig[] = [
  {
    id: "google/gemma-3-27b-it:free",
    label: "Gemma 3",
    description: "Clinical Reasoning",
    icon: "cpu",
    color: "#4285F4",
  },
  {
    id: "qwen/qwen3-235b-a22b:free",
    label: "Qwen 3",
    description: "Medical Learning",
    icon: "book-open",
    color: "#8B5CF6",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    label: "Llama 3.3",
    description: "General Study",
    icon: "layers",
    color: "#009DB5",
  },
  {
    id: "mistralai/mistral-7b-instruct:free",
    label: "Mistral 7B",
    description: "Quick Lookups",
    icon: "zap",
    color: "#F59E0B",
  },
];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  bookmarked?: boolean;
  modelId?: ModelId;
}

export interface BookmarkedAnswer {
  id: string;
  question: string;
  answer: string;
  modelId: ModelId;
  timestamp: number;
}

const STORAGE_KEYS = {
  CHAT_HISTORY: "@medpocket_ai_chat_v1",
  SELECTED_MODEL: "@medpocket_ai_model_v1",
  BOOKMARKS: "@medpocket_ai_bookmarks_v1",
};

const MEDICAL_KEYWORDS = [
  "disease", "symptom", "drug", "medication", "dose", "dosage", "anatomy",
  "physiology", "pathology", "pharmacology", "microbiology", "clinical",
  "surgery", "pediatric", "paediatric", "obstetric", "gynaecology", "gynecology",
  "psychiatry", "emergency", "diagnosis", "differential", "treatment", "therapy",
  "patient", "hospital", "doctor", "nurse", "medical", "medicine", "health",
  "healthcare", "blood", "heart", "lung", "liver", "kidney", "brain", "nerve",
  "bone", "muscle", "cancer", "tumor", "tumour", "infection", "antibiotic",
  "vaccine", "virus", "bacteria", "syndrome", "disorder", "condition", "chronic",
  "acute", "pain", "fever", "osce", "mbbs", "usmle", "mrcp", "plab", "medical exam",
  "case", "history", "examination", "investigation", "lab", "ecg", "x-ray",
  "mri", "ct scan", "ultrasound", "biopsy", "allergy", "immune", "inflammation",
  "platelet", "hemoglobin", "haemoglobin", "glucose", "insulin", "diabetes",
  "hypertension", "cholesterol", "lipid", "thyroid", "hormone", "enzyme",
  "receptor", "mechanism", "action", "side effect", "contraindication",
  "interaction", "prognosis", "mortality", "morbidity", "incidence", "prevalence",
  "biochemistry", "genetics", "epidemiology", "public health", "trauma",
  "fracture", "wound", "burn", "shock", "sepsis", "icu", "anesthesia",
  "anaesthesia", "analgesia", "sedation", "ventilation", "intubation",
  "what is", "how does", "explain", "describe", "causes", "signs",
  "management", "protocol", "guideline", "classify", "staging", "grading",
  "scoring", "gcs", "apache", "sofa", "curb", "wells", "spinal", "epidural",
  "nerve block", "regional", "local anaesthetic", "cardiac", "respiratory",
  "renal", "hepatic", "neurological", "musculoskeletal", "dermatology",
  "ophthalmology", "ent", "ear", "nose", "throat", "skin", "rash",
];

export function isMedicalQuestion(question: string): boolean {
  const lower = question.toLowerCase();
  return MEDICAL_KEYWORDS.some((kw) => lower.includes(kw));
}

const SYSTEM_PROMPT = `You are MedPocket AI, a precise medical education assistant for MBBS students and healthcare professionals. Your role is strictly medical education.

Answer questions about: Anatomy, Physiology, Biochemistry, Pathology, Pharmacology, Microbiology, Clinical Medicine, Surgery, Pediatrics, OBG, Psychiatry, Emergency Medicine, Medical Cases, Differential Diagnosis, OSCE, Drug information, Medical Exams.

FORMAT RULES:
- Use clear headings with ## for sections
- Use bullet points for lists
- Include clinical pearls where relevant
- Be concise but complete
- For drug questions: include class, mechanism, dose, side effects, contraindications
- For anatomy: be precise with terminology
- Always end clinical answers with a brief "Clinical Pearl" if applicable

STRICT RULES:
- Answer ONLY medical/healthcare questions
- If non-medical: respond with exactly "OFF_TOPIC" (nothing else)
- Never give personal medical advice ("see a doctor for your symptoms")
- State: educational purpose only when appropriate`;

const FALLBACK_ORDER: ModelId[] = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "qwen/qwen3-235b-a22b:free",
  "google/gemma-3-27b-it:free",
];

export async function sendMessage(
  messages: ChatMessage[],
  modelId: ModelId
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  const baseUrl =
    process.env.EXPO_PUBLIC_OPENROUTER_URL || "https://openrouter.ai/api/v1";

  if (!apiKey) {
    throw new Error(
      "OpenRouter API key is not configured. Please add EXPO_PUBLIC_OPENROUTER_API_KEY."
    );
  }

  const formattedMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages
      .filter((m) => m.role !== "system")
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content })),
  ];

  // Build fallback chain: selected model first, then the rest in priority order
  const chain: ModelId[] = [
    modelId,
    ...FALLBACK_ORDER.filter((m) => m !== modelId),
  ];

  for (let i = 0; i < chain.length; i++) {
    const model = chain[i];
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://medpocket.app",
          "X-Title": "MedPocket AI",
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          max_tokens: 2048,
          temperature: 0.6,
        }),
      });

      // 404 = model not available → try next silently
      if (response.status === 404) {
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        // Rate limit or quota → try next
        if (response.status === 429 || response.status === 503) {
          continue;
        }
        throw new Error(`Request failed (${response.status}). Please try again.`);
      }

      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content ?? "";
      return content;
    } catch (err) {
      // Network errors → try next model
      if (i < chain.length - 1) continue;
      throw err;
    }
  }

  throw new Error(
    "All AI models are temporarily busy. Please try again in a moment."
  );
}

export async function loadChatHistory(): Promise<ChatMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveChatHistory(messages: ChatMessage[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.CHAT_HISTORY,
      JSON.stringify(messages.slice(-100))
    );
  } catch {}
}

export async function loadSelectedModel(): Promise<ModelId> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_MODEL);
    if (raw && MODELS.find((m) => m.id === raw)) return raw as ModelId;
    return "meta-llama/llama-3.3-70b-instruct:free";
  } catch {
    return "meta-llama/llama-3.3-70b-instruct:free";
  }
}

export async function saveSelectedModel(modelId: ModelId): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, modelId);
  } catch {}
}

export async function loadBookmarks(): Promise<BookmarkedAnswer[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveBookmarks(
  bookmarks: BookmarkedAnswer[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.BOOKMARKS,
      JSON.stringify(bookmarks)
    );
  } catch {}
}
