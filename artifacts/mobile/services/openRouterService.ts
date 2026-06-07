import AsyncStorage from "@react-native-async-storage/async-storage";

export type ModelId =
  | "openai/gpt-oss-120b:free"
  | "google/gemma-4-31b-it:free"
  | "meta-llama/llama-3.3-70b-instruct:free"
  | "qwen/qwen3-next-80b-a3b-instruct:free";

export interface ModelConfig {
  id: ModelId;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const MODELS: ModelConfig[] = [
  {
    id: "openai/gpt-oss-120b:free",
    label: "GPT-OSS 120B",
    description: "Clinical Reasoning",
    icon: "cpu",
    color: "#10A37F",
  },
  {
    id: "google/gemma-4-31b-it:free",
    label: "Gemma 4",
    description: "Medical Learning",
    icon: "book-open",
    color: "#4285F4",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    label: "Llama 3.3",
    description: "General Study",
    icon: "layers",
    color: "#009DB5",
  },
  {
    id: "qwen/qwen3-next-80b-a3b-instruct:free",
    label: "Qwen 3",
    description: "Quick Lookups",
    icon: "zap",
    color: "#8B5CF6",
  },
];

// Internal-only fallback chain of confirmed-working models
// Always ends with the tiny but reliable LFM as absolute last resort
const FALLBACK_CHAIN: string[] = [
  "openai/gpt-oss-120b:free",
  "google/gemma-4-31b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "liquid/lfm-2.5-1.2b-instruct:free",   // last resort — small but responds
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
  CHAT_HISTORY: "@medpocket_ai_chat_v3",
  SELECTED_MODEL: "@medpocket_ai_model_v3",
  BOOKMARKS: "@medpocket_ai_bookmarks_v1",
};

const MEDICAL_KEYWORDS = [
  "disease","symptom","drug","medication","dose","dosage","anatomy",
  "physiology","pathology","pharmacology","microbiology","clinical",
  "surgery","pediatric","paediatric","obstetric","gynaecology","gynecology",
  "psychiatry","emergency","diagnosis","differential","treatment","therapy",
  "patient","hospital","doctor","nurse","medical","medicine","health",
  "healthcare","blood","heart","lung","liver","kidney","brain","nerve",
  "bone","muscle","cancer","tumor","tumour","infection","antibiotic",
  "vaccine","virus","bacteria","syndrome","disorder","condition","chronic",
  "acute","pain","fever","osce","mbbs","usmle","mrcp","plab",
  "case","history","examination","investigation","lab","ecg","x-ray",
  "mri","ct scan","ultrasound","biopsy","allergy","immune","inflammation",
  "platelet","hemoglobin","haemoglobin","glucose","insulin","diabetes",
  "hypertension","cholesterol","lipid","thyroid","hormone","enzyme",
  "receptor","mechanism","action","side effect","contraindication",
  "interaction","prognosis","mortality","morbidity","incidence","prevalence",
  "biochemistry","genetics","epidemiology","trauma","fracture","wound",
  "burn","shock","sepsis","icu","anesthesia","anaesthesia","analgesia",
  "ventilation","intubation","what is","how does","explain","describe",
  "causes","signs","management","protocol","guideline","classify",
  "staging","grading","scoring","gcs","apache","sofa","curb","wells",
  "spinal","epidural","cardiac","respiratory","renal","hepatic",
  "neurological","dermatology","ophthalmology","ent","skin","rash",
];

export function isMedicalQuestion(question: string): boolean {
  const lower = question.toLowerCase();
  return MEDICAL_KEYWORDS.some((kw) => lower.includes(kw));
}

const SYSTEM_PROMPT = `You are MedPocket AI, a medical education assistant for MBBS students and healthcare professionals.

Answer ONLY questions about: Anatomy, Physiology, Biochemistry, Pathology, Pharmacology, Microbiology, Clinical Medicine, Surgery, Pediatrics, OBG, Psychiatry, Emergency Medicine, Medical Cases, Differential Diagnosis, OSCE, Drug information, Medical Exams.

FORMAT:
- Use ## for section headings
- Bullet points for lists
- For drugs: class, mechanism, dose, side effects, contraindications
- End clinical answers with a "🔑 Clinical Pearl" tip
- Be concise but complete

RULES:
- Answer ONLY medical/healthcare questions
- For anything unrelated to medicine, reply EXACTLY with: OFF_TOPIC
- Keep responses educational and evidence-based`;

export async function sendMessage(
  messages: ChatMessage[],
  modelId: ModelId
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  const baseUrl =
    process.env.EXPO_PUBLIC_OPENROUTER_URL || "https://openrouter.ai/api/v1";

  if (!apiKey) {
    throw new Error("API key not configured.");
  }

  const formatted = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages
      .filter((m) => m.role !== "system")
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content })),
  ];

  // Build chain: selected model first, then the confirmed fallbacks
  const chain: string[] = [
    modelId,
    ...FALLBACK_CHAIN.filter((m) => m !== modelId),
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
          messages: formatted,
          max_tokens: 1500,
          temperature: 0.6,
        }),
      });

      // Not available or rate-limited → try next silently
      if (response.status === 404 || response.status === 429 || response.status === 503) {
        continue;
      }

      if (!response.ok) {
        throw new Error(`Service error (${response.status}). Please try again.`);
      }

      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content?.trim() ?? "";
      if (!content) continue;
      return content;

    } catch (err) {
      // Network errors → try next
      if (i < chain.length - 1) continue;
      throw err;
    }
  }

  throw new Error(
    "AI service is temporarily unavailable. Please try again in a moment."
  );
}

export async function loadChatHistory(): Promise<ChatMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    if (!raw) return [];
    const parsed: ChatMessage[] = JSON.parse(raw);
    // Strip stale error messages from old broken versions
    return parsed.filter(
      (m) =>
        !m.content.startsWith("❌ API error") &&
        !m.content.includes("No endpoints found")
    );
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
    return "openai/gpt-oss-120b:free";
  } catch {
    return "openai/gpt-oss-120b:free";
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

export async function saveBookmarks(bookmarks: BookmarkedAnswer[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.BOOKMARKS,
      JSON.stringify(bookmarks)
    );
  } catch {}
}
