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
  // Basic sciences
  "anatomy","physiology","biochemistry","pathology","pharmacology",
  "microbiology","immunology","genetics","histology","embryology",
  "cell biology","molecular biology","genomics","proteomics",

  // Core clinical
  "disease","disorder","syndrome","condition","symptom","sign","diagnosis",
  "differential","treatment","therapy","management","protocol","guideline",
  "prognosis","complication","etiology","aetiology","pathogenesis",
  "clinical","medicine","medical","healthcare","health",
  "patient","doctor","physician","nurse","surgeon","specialist",
  "hospital","clinic","ward","icu","emergency","casualty",

  // Drugs & pharmacology
  "drug","medication","medicine","dose","dosage","prescription",
  "antibiotic","antifungal","antiviral","analgesic","anaesthetic","anesthetic",
  "antihypertensive","anticoagulant","antiplatelet","antidiabetic",
  "chemotherapy","immunosuppressant","steroid","corticosteroid","vaccine",
  "side effect","adverse effect","contraindication","interaction",
  "drug interaction","medication safety","pharmacokinetics","pharmacodynamics",
  "mechanism of action","half life","bioavailability","receptor",
  "agonist","antagonist","enzyme","inhibitor","prescription review",

  // Clinical medicine & specialties
  "internal medicine","family medicine","general practice","primary care",
  "emergency medicine","critical care","intensive care","icu",
  "preventive medicine","community medicine","public health","epidemiology",

  // Surgery
  "surgery","surgical","operation","operative","perioperative",
  "general surgery","orthopedic","orthopaedic","neurosurgery","neurosurgical",
  "cardiothoracic","cardiothoracic surgery","plastic surgery","urology","urological",
  "laparoscopic","minimally invasive","wound","suture","incision","trauma",
  "fracture","dislocation","amputation","transplant","graft","biopsy",
  "burn","laceration","hemorrhage","haemorrhage",

  // Pediatrics & neonatology
  "pediatric","paediatric","child","infant","newborn","neonatal","neonatology",
  "growth","development","immunisation","vaccination","birth","congenital",
  "apgar","preterm","premature",

  // OBG
  "obstetric","obstetrics","gynaecology","gynecology","pregnancy","antenatal",
  "prenatal","postnatal","postpartum","labour","labor","delivery","cesarean",
  "menstrual","menopause","contraception","fertility","ivf","abortion",
  "eclampsia","preeclampsia","gestational",

  // Psychiatry
  "psychiatry","psychiatric","mental health","mental illness","depression",
  "anxiety","schizophrenia","bipolar","psychosis","neurosis","phobia",
  "ocd","ptsd","adhd","autism","dementia","cognitive","behavioural","behavioral",
  "psychotherapy","antidepressant","antipsychotic","mood stabiliser",

  // Dermatology
  "dermatology","skin","rash","lesion","eczema","psoriasis","acne",
  "melanoma","dermatitis","urticaria","cellulitis","tinea","alopecia",
  "wound healing","ulcer","sore","blister","papule","macule","pustule",
  "plaque","vesicle","erythema","jaundice","cyanosis","pallor","pruritus",

  // Ophthalmology
  "ophthalmology","eye","vision","visual","retina","cornea","glaucoma",
  "cataract","optic","conjunctivitis","uveitis","strabismus","amblyopia",
  "fundus","intraocular","slit lamp","refraction","myopia","hyperopia",

  // ENT
  "ent","otorhinolaryngology","ear","nose","throat","hearing","deafness",
  "tonsil","sinusitis","otitis","rhinitis","larynx","laryngitis","vertigo",
  "tympanic","cochlea","epistaxis","nasal","pharynx","pharyngitis","laryngoscopy",

  // Radiology & imaging
  "radiology","radiological","imaging","x-ray","xray","ct scan","mri",
  "ultrasound","sonography","pet scan","nuclear medicine","fluoroscopy",
  "mammography","angiography","doppler","echocardiography","echo",
  "diagnostic imaging","radiograph","contrast","shadow","opacity",

  // Anesthesiology
  "anesthesia","anaesthesia","analgesia","sedation","intubation","airway",
  "ventilation","spinal anesthesia","epidural","general anesthesia",
  "regional anesthesia","local anesthesia","neuromuscular blockade",
  "anesthesiologist","anaesthetist","perioperative","post-operative","preoxygenation",

  // Cardiology
  "cardiology","cardiac","heart","ecg","ekg","electrocardiogram",
  "myocardial","infarction","angina","arrhythmia","atrial fibrillation",
  "heart failure","hypertension","hypotension","blood pressure","valve",
  "aorta","coronary","pericardium","endocarditis","murmur","pulse",
  "cardiac arrest","cpr","acls","defibrillation","pacemaker","stent",

  // Pulmonology
  "pulmonology","respiratory","lung","breath","breathing","asthma","copd",
  "pneumonia","tuberculosis","tb","pleuritis","pleural effusion",
  "pneumothorax","bronchitis","bronchiectasis","pulmonary embolism","pe",
  "spirometry","peak flow","oxygen","hypoxia","hypoxemia","abg",
  "arterial blood gas","ventilator","intubation","tracheostomy",

  // Gastroenterology
  "gastroenterology","gastro","gi","gastrointestinal","stomach","intestine",
  "bowel","colon","rectum","liver","hepatic","hepatitis","cirrhosis",
  "pancreatitis","pancreas","gallbladder","biliary","jaundice","ascites",
  "peptic ulcer","gerd","crohn","colitis","ibs","constipation","diarrhea",
  "diarrhoea","haematemesis","hematemesis","melena","endoscopy","colonoscopy",

  // Nephrology
  "nephrology","kidney","renal","urinary","urine","glomerular","tubular",
  "ckd","acute kidney injury","aki","dialysis","hemodialysis","haemodialysis",
  "proteinuria","hematuria","haematuria","creatinine","gfr","electrolytes",
  "sodium","potassium","fluid balance","nephrotic","nephritic","uremia","uraemia",

  // Endocrinology
  "endocrinology","hormone","endocrine","diabetes","insulin","glucose",
  "thyroid","hypothyroid","hyperthyroid","adrenal","cortisol","pituitary",
  "growth hormone","parathyroid","calcium","bone density","osteoporosis",
  "metabolic","obesity","bmi","dka","hba1c","polycystic","pcos",

  // Rheumatology
  "rheumatology","rheumatoid","arthritis","joint","autoimmune","lupus","sle",
  "sjogren","vasculitis","gout","fibromyalgia","ankylosing spondylitis",
  "psoriatic arthritis","inflammatory","connective tissue","ana","esr","crp",

  // Hematology
  "hematology","haematology","blood","anemia","anaemia","hemoglobin","haemoglobin",
  "platelet","white cell","red cell","leukemia","leukaemia","lymphoma",
  "coagulation","bleeding","clotting","dvt","thrombosis","thrombocytopenia",
  "bone marrow","transfusion","cbc","full blood count","iron deficiency",
  "sickle cell","thalassemia","anticoagulation","warfarin","heparin",

  // Oncology
  "oncology","cancer","tumor","tumour","malignant","benign","metastasis",
  "chemotherapy","radiotherapy","targeted therapy","immunotherapy",
  "carcinoma","sarcoma","lymphoma","staging","grading","palliative",
  "biopsy","histopathology","tumor marker","ca 125","psa","cea",

  // Infectious diseases
  "infectious disease","infection","sepsis","bacteremia","bacteraemia",
  "antibiotic resistance","mrsa","hiv","aids","malaria","dengue","typhoid",
  "cholera","meningitis","encephalitis","tuberculosis","covid","influenza",
  "hepatitis","sexually transmitted","sti","std","fever of unknown origin",

  // Neurology
  "neurology","neurological","brain","neuron","nerve","stroke","tia",
  "seizure","epilepsy","parkinson","alzheimer","multiple sclerosis","ms",
  "guillain barre","motor neuron","peripheral neuropathy","headache","migraine",
  "lumbar puncture","eeg","nerve conduction","reflex","cranial nerve",
  "coma","consciousness","glasgow coma","gcs","encephalopathy",

  // Lab & investigations
  "lab","laboratory","investigation","blood test","urine test","culture",
  "sensitivity","crp","esr","lft","rft","tft","cbc","fbc","abg","ecg",
  "echo","mri","ct","chest x-ray","biopsy","aspirate","smear","culture",
  "pcr","elisa","western blot","sensitivity","specificity","ppv","npv",
  "interpretation","result","report","normal range","reference range",

  // Clinical reasoning & exams
  "osce","clinical skills","history taking","physical examination","auscultation",
  "palpation","percussion","inspection","clinical reasoning","case",
  "differential diagnosis","diagnostic workup","investigation",
  "usmle","plab","amc","next exam","mbbs","mrcpch","mrcp","frcs",
  "nursing exam","allied health","physiotherapy","paramedic",
  "medical exam","viva","clinical viva","mcq","sba",

  // EBM & research
  "evidence based","clinical guideline","nice guideline","who guideline",
  "randomised controlled trial","rct","systematic review","meta analysis",
  "cohort study","case control","cross sectional","journal","research",
  "p value","confidence interval","odds ratio","relative risk","number needed",
  "publication bias","forest plot","funnel plot",

  // Public health
  "public health","epidemiology","incidence","prevalence","mortality",
  "morbidity","screening","prevention","vaccination programme","herd immunity",
  "outbreak","surveillance","community","social determinants","disability",

  // Ethics & communication
  "medical ethics","bioethics","informed consent","autonomy","beneficence",
  "non maleficence","justice","confidentiality","end of life","palliative care",
  "do not resuscitate","dnr","advance directive","euthanasia","allocation",
  "healthcare system","patient education","health literacy",

  // Nursing & allied health
  "nursing","nurse","allied health","physiotherapy","occupational therapy",
  "speech therapy","dietitian","paramedic","midwifery","midwife",
  "radiographer","pharmacist","optometrist","audiologist",

  // Generic clinical question starters
  "what is","what are","how does","how do","explain","describe",
  "causes of","signs of","symptoms of","treatment of","management of",
  "classify","staging","grading","scoring","mechanism","complications",
  "compare","difference between","define","outline","discuss",
];


export function isMedicalQuestion(question: string): boolean {
  const lower = question.toLowerCase();
  return MEDICAL_KEYWORDS.some((kw) => lower.includes(kw));
}

const SYSTEM_PROMPT = `You are MedPocket AI, a comprehensive medical education assistant for medical students, nurses, allied health professionals, and healthcare workers.

ALLOWED TOPICS (answer all questions in these areas):
Basic Sciences: Anatomy, Physiology, Biochemistry, Pathology, Pharmacology, Microbiology, Immunology, Genetics, Histology, Embryology
Clinical Medicine: Internal Medicine, Family Medicine, Emergency Medicine, Critical Care, Preventive Medicine
Surgery: General Surgery, Orthopedic, Neurosurgery, Cardiothoracic, Plastic Surgery, Urology
Specialties: Pediatrics, Neonatology, Obstetrics & Gynecology, Psychiatry, Dermatology, Ophthalmology, ENT, Anesthesiology, Radiology
Systems: Cardiology, Pulmonology, Gastroenterology, Nephrology, Endocrinology, Rheumatology, Hematology, Oncology, Infectious Diseases, Neurology
Clinical Skills: OSCE, History Taking, Physical Examination, Clinical Reasoning, Differential Diagnosis, Diagnostic Workups, ECG, ABG, Lab Interpretation
Medical Exams: USMLE, PLAB, AMC, NEXT, MBBS, MRCP, Nursing Exams, Allied Health Exams
Evidence & Research: EBM, Clinical Guidelines, Research Methods, Journal Interpretation
Public Health: Epidemiology, Community Medicine, Preventive Medicine, Screening
Healthcare: Nursing, Physiotherapy, Allied Health, Paramedic Education, Patient Education
Pharmacology: Drug Interactions, Medication Safety, Prescription Review (educational)
Ethics: Medical Ethics, Bioethics, Informed Consent, End-of-Life Care

FORMAT RULES:
- Use ## for section headings (e.g. ## Mechanism, ## Clinical Features)
- Use bullet points (- ) for lists
- Use **bold** for key terms, drug names, and important values
- For drug questions: ## Drug Class → ## Mechanism → ## Dose → ## Side Effects → ## Contraindications
- For clinical questions: ## Definition → ## Causes → ## Features → ## Investigations → ## Management
- End every clinical answer with: 🔑 **Clinical Pearl:** [one high-yield exam tip]
- Keep answers concise, structured, and evidence-based

RULES:
- Answer ALL questions within the allowed topics above — be inclusive, not restrictive
- For anything clearly unrelated to medicine/healthcare/biology, reply EXACTLY with: OFF_TOPIC
- Never refuse a legitimate medical education question
- Cite guidelines where relevant (NICE, WHO, AHA, etc.)`;

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
