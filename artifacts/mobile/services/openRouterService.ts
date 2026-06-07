import AsyncStorage from "@react-native-async-storage/async-storage";

export type ModelId =
  | "meta-llama/llama-3.3-70b-instruct:free"
  | "mistralai/mistral-7b-instruct:free"
  | "qwen/qwen3-8b:free"
  | "google/gemma-3-27b-it:free";

export interface ModelConfig {
  id: ModelId;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const MODELS: ModelConfig[] = [
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
  {
    id: "qwen/qwen3-8b:free",
    label: "Qwen 3",
    description: "Medical Learning",
    icon: "book-open",
    color: "#8B5CF6",
  },
  {
    id: "google/gemma-3-27b-it:free",
    label: "Gemma 3",
    description: "Clinical Reasoning",
    icon: "cpu",
    color: "#4285F4",
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
  CHAT_HISTORY: "@medpocket_ai_chat_v2",
  SELECTED_MODEL: "@medpocket_ai_model_v2",
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
  "acute","pain","fever","osce","mbbs","usmle","mrcp","plab","medical exam",
  "case","history","examination","investigation","lab","ecg","x-ray",
  "mri","ct scan","ultrasound","biopsy","allergy","immune","inflammation",
  "platelet","hemoglobin","haemoglobin","glucose","insulin","diabetes",
  "hypertension","cholesterol","lipid","thyroid","hormone","enzyme",
  "receptor","mechanism","action","side effect","contraindication",
  "interaction","prognosis","mortality","morbidity","incidence","prevalence",
  "biochemistry","genetics","epidemiology","public health","trauma",
  "fracture","wound","burn","shock","sepsis","icu","anesthesia",
  "anaesthesia","analgesia","sedation","ventilation","intubation",
  "what is","how does","explain","describe","causes","signs",
  "management","protocol","guideline","classify","staging","grading",
  "scoring","gcs","apache","sofa","curb","wells","spinal","epidural",
  "cardiac","respiratory","renal","hepatic","neurological","dermatology",
  "ophthalmology","ent","skin","rash","nerve block","regional",
];

export function isMedicalQuestion(question: string): boolean {
  const lower = question.toLowerCase();
  return MEDICAL_KEYWORDS.some((kw) => lower.includes(kw));
}

const SYSTEM_PROMPT = `You are MedPocket AI, a precise medical education assistant for MBBS students and healthcare professionals.

Answer ONLY questions about: Anatomy, Physiology, Biochemistry, Pathology, Pharmacology, Microbiology, Clinical Medicine, Surgery, Pediatrics, OBG, Psychiatry, Emergency Medicine, Medical Cases, Differential Diagnosis, OSCE, Drug information, Medical Exams.

FORMAT:
- Use ## for section headings
- Use bullet points for lists
- For drugs: class, mechanism, dose, side effects, contraindications
- End clinical answers with a "Clinical Pearl" if applicable
- Be concise but complete

RULES:
- Answer ONLY medical/healthcare questions
- For non-medical questions respond with exactly: OFF_TOPIC
- State educational purpose for clinical questions`;

export async function sendMessage(
  messages: ChatMessage[],
  modelId: ModelId
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  const baseUrl =
    process.env.EXPO_PUBLIC_OPENROUTER_URL || "https://openrouter.ai/api/v1";

  if (!apiKey) {
    throw new Error("API key not configured. Add EXPO_PUBLIC_OPENROUTER_API_KEY.");
  }

  const formattedMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages
      .filter((m) => m.role !== "system")
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content })),
  ];

  // Try selected model first, then fall back in order of reliability
  const RELIABLE_FALLBACK: ModelId[] = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "qwen/qwen3-8b:free",
    "google/gemma-3-27b-it:free",
  ];

  const chain: ModelId[] = [
    modelId,
    ...RELIABLE_FALLBACK.filter((m) => m !== modelId),
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
          max_tokens: 1500,
          temperature: 0.6,
        }),
      });

      // Model not available → try next silently
      if (response.status === 404 || response.status === 503) {
        continue;
      }

      // Rate limited → try next silently
      if (response.status === 429) {
        continue;
      }

      if (!response.ok) {
        // For other errors (auth, bad request), throw immediately
        throw new Error(`The AI service returned an error (${response.status}). Please try again.`);
      }

      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content?.trim() ?? "";
      if (!content) continue;
      return content;

    } catch (err) {
      const isNetworkErr =
        err instanceof TypeError && err.message.includes("fetch");
      if (isNetworkErr && i < chain.length - 1) continue;
      if (i < chain.length - 1) continue;
      throw err;
    }
  }

  throw new Error(
    "All AI models are currently busy. Please wait a moment and try again."
  );
}

export async function loadChatHistory(): Promise<ChatMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    if (!raw) return [];
    const parsed: ChatMessage[] = JSON.parse(raw);
    // Filter out old error messages from broken API responses
    return parsed.filter((m) => !m.content.startsWith("❌ API error"));
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

export async function saveBookmarks(bookmarks: BookmarkedAnswer[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  } catch {}
}
