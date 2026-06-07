import AsyncStorage from "@react-native-async-storage/async-storage";

export type ModelId =
  | "deepseek/deepseek-r1:free"
  | "qwen/qwen3-235b-a22b:free"
  | "meta-llama/llama-3.3-70b-instruct:free"
  | "mistralai/mistral-7b-instruct:free";

export interface ModelConfig {
  id: ModelId;
  label: string;
  description: string;
  icon: string;
}

export const MODELS: ModelConfig[] = [
  {
    id: "deepseek/deepseek-r1:free",
    label: "DeepSeek R1",
    description: "Clinical Reasoning",
    icon: "cpu",
  },
  {
    id: "qwen/qwen3-235b-a22b:free",
    label: "Qwen 3",
    description: "Medical Learning",
    icon: "book-open",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    label: "Llama 3.3",
    description: "General Study",
    icon: "layers",
  },
  {
    id: "mistralai/mistral-7b-instruct:free",
    label: "Mistral 7B",
    description: "Quick Lookups",
    icon: "zap",
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
  "surgery", "pediatric", "obstetric", "gynecology", "psychiatry", "emergency",
  "diagnosis", "differential", "treatment", "therapy", "patient", "hospital",
  "doctor", "nurse", "medical", "medicine", "health", "healthcare", "blood",
  "heart", "lung", "liver", "kidney", "brain", "nerve", "bone", "muscle",
  "cancer", "tumor", "infection", "antibiotic", "vaccine", "virus", "bacteria",
  "syndrome", "disorder", "condition", "chronic", "acute", "pain", "fever",
  "osce", "mbbs", "usmle", "mrcp", "medical exam", "case", "history",
  "examination", "investigation", "lab", "ecg", "x-ray", "mri", "ct scan",
  "ultrasound", "biopsy", "culture", "sensitivity", "sensitivity", "allergy",
  "immune", "inflammation", "platelet", "hemoglobin", "white blood cell",
  "red blood cell", "glucose", "insulin", "diabetes", "hypertension",
  "cholesterol", "lipid", "thyroid", "hormone", "enzyme", "receptor",
  "mechanism", "action", "side effect", "contraindication", "interaction",
  "prognosis", "mortality", "morbidity", "incidence", "prevalence",
  "anatomy", "biochemistry", "genetics", "epidemiology", "public health",
  "trauma", "fracture", "wound", "burn", "shock", "sepsis", "icu",
  "anesthesia", "analgesia", "sedation", "ventilation", "intubation",
  "what is", "how does", "explain", "describe", "causes", "signs",
  "management", "protocol", "guideline", "classify", "staging",
  "grading", "scoring", "gcs", "apache", "sofa", "curb", "wells",
];

export function isMedicalQuestion(question: string): boolean {
  const lower = question.toLowerCase();
  return MEDICAL_KEYWORDS.some((kw) => lower.includes(kw));
}

const SYSTEM_PROMPT = `You are MedPocket AI, an expert medical education assistant for medical students and healthcare professionals.

Your role is to help with:
- Anatomy, Physiology, Biochemistry, Pathology
- Pharmacology, Microbiology, Immunology
- Clinical Medicine (Internal Medicine, Surgery, Pediatrics, OBG, Psychiatry)
- Emergency Medicine and ICU protocols
- Medical Case Discussions and Differential Diagnosis
- OSCE Preparation and Medical Examinations
- Drug information, dosages, and interactions
- Medical Terminology and Concepts
- Healthcare Education

STRICT RULES:
1. Answer ONLY medical and healthcare-related questions.
2. If a question is not related to medicine, healthcare, or medical education, respond EXACTLY with: "OFF_TOPIC"
3. Always be accurate, educational, and evidence-based.
4. Format responses clearly with headings, bullet points when appropriate.
5. Include relevant clinical pearls when applicable.
6. Always remind users this is for educational purposes only for clinical questions.

Be concise but thorough. Prioritize clinical accuracy.`;

export async function sendMessage(
  messages: ChatMessage[],
  modelId: ModelId,
  onChunk?: (text: string) => void
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  const baseUrl =
    process.env.EXPO_PUBLIC_OPENROUTER_URL || "https://openrouter.ai/api/v1";

  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured.");
  }

  const formattedMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages
      .filter((m) => m.role !== "system")
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content })),
  ];

  const modelFallbacks: ModelId[] = [
    modelId,
    "meta-llama/llama-3.3-70b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "qwen/qwen3-235b-a22b:free",
    "deepseek/deepseek-r1:free",
  ].filter((v, i, arr) => arr.indexOf(v) === i) as ModelId[];

  let lastError: Error | null = null;

  for (const model of modelFallbacks) {
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://medpocket.app",
          "X-Title": "MedPocket AI Assistant",
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          max_tokens: 2048,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content ?? "";
      return content;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (model !== modelFallbacks[modelFallbacks.length - 1]) {
        continue;
      }
    }
  }

  throw lastError ?? new Error("All models failed. Please try again later.");
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
    return (raw as ModelId) ?? "meta-llama/llama-3.3-70b-instruct:free";
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
