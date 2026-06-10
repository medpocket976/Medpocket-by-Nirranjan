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

// Vision-capable models (support image_url content)
const VISION_CHAIN: string[] = [
  "meta-llama/llama-3.2-11b-vision-instruct:free",
  "qwen/qwen2.5-vl-72b-instruct:free",
  "qwen/qwen2.5-vl-7b-instruct:free",
  "google/gemma-3-12b-it:free",
];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  bookmarked?: boolean;
  modelId?: ModelId;
  /** Base64-encoded image (session-only, stripped before AsyncStorage) */
  imageBase64?: string;
  imageMimeType?: string;
  /** Persisted flag so old messages show an image indicator after reload */
  hasImage?: boolean;
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

  // Anaesthesiology (comprehensive)
  "anaesthesia","anesthesia","anaesthesiology","anesthesiology",
  "anaesthetist","anesthesiologist","anaesthetic","anesthetic",
  "analgesia","sedation","pre-medication","premedication",
  "general anaesthesia","general anesthesia","ga",
  "regional anaesthesia","regional anesthesia","regional block","nerve block",
  "local anaesthesia","local anesthesia","local infiltration",
  "spinal anaesthesia","spinal anesthesia","spinal block","subarachnoid block",
  "epidural","epidural anaesthesia","epidural anesthesia","caudal block",
  "brachial plexus","axillary block","femoral nerve block","sciatic block",
  "fascia iliaca","erector spinae","paravertebral block","truncal block",
  "tiva","total intravenous anaesthesia","total intravenous anesthesia",
  "rsi","rapid sequence induction","rapid sequence intubation",
  "lma","laryngeal mask airway","supraglottic airway","i-gel","igel",
  "endotracheal tube","ett","intubation","extubation","difficult airway",
  "airway management","airway assessment","mallampati","cormack lehane",
  "propofol","thiopental","ketamine","etomidate","midazolam","fentanyl",
  "morphine","remifentanil","alfentanil","sevoflurane","desflurane","isoflurane",
  "volatile agent","inhalational agent","nitrous oxide","n2o",
  "suxamethonium","succinylcholine","rocuronium","vecuronium","atracurium",
  "neostigmine","sugammadex","reversal","neuromuscular blockade","twitch",
  "train of four","tof","bispectral index","bis","depth of anaesthesia",
  "mac","minimum alveolar concentration","vapour","vaporiser",
  "ventilation","mechanical ventilation","controlled ventilation","spontaneous",
  "tidal volume","respiratory rate","peep","fio2","pip",
  "preoxygenation","denitrogenation","apnoeic oxygenation",
  "perioperative","intraoperative","post-operative","postoperative",
  "ponv","post-operative nausea","post-operative vomiting",
  "pain management","acute pain","chronic pain","pain score","vas","nrs",
  "multimodal analgesia","pca","patient controlled analgesia",
  "epidural analgesia","opioid","non-opioid","nsaid","paracetamol",
  "gabapentin","pregabalin","ketamine infusion","lidocaine infusion",
  "asa classification","asa grade","fitness for anaesthesia","pre-op assessment",
  "fasting guidelines","nil by mouth","nbm","fluid management intraoperative",
  "blood loss","transfusion trigger","cell salvage","massive transfusion",
  "hypothermia","temperature management","warming","fluid warmer",
  "anaesthesia machine","breathing circuit","circle system","bain circuit",

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

  // Medical terminology
  "medical terminology","term","terminology","eponym","abbreviation","acronym",
  "prefix","suffix","root word","medical word","anatomical term","clinical term",

  // Pain medicine & palliative care
  "palliative","palliative care","end of life","hospice","terminal",
  "cancer pain","neuropathic pain","nociceptive","visceral pain","somatic pain",
  "pain ladder","who pain ladder","opioid rotation","equianalgesic",
  "breakthrough pain","pain clinic","pain specialist","interventional pain",

  // Healthcare systems & education
  "healthcare system","health system","nhs","primary care","secondary care",
  "tertiary care","referral","triage","health policy","health economics",
  "health literacy","patient education","patient counselling","counseling",
  "interprofessional","multidisciplinary","mdt","handover","sbar",
  "clinical governance","audit","quality improvement","patient safety",
  "incident report","root cause analysis","near miss","never event",

  // Radiology extras
  "diagnostic imaging","ultrasound interpretation","chest x-ray interpretation",
  "ct interpretation","mri interpretation","abdominal x-ray","skull x-ray",
  "bone x-ray","ecg interpretation","echocardiography interpretation",
  "plain film","radiograph","hounsfield","density","lucency","opacity",
  "consolidation","effusion on x-ray","pneumothorax on x-ray",

  // Journal / EBM extras
  "journal article","article interpretation","study design","bias","confounding",
  "randomisation","blinding","intention to treat","per protocol",
  "hazard ratio","number needed to treat","nnt","nnh","absolute risk",
  "relative risk reduction","absolute risk reduction","likelihood ratio",

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

ALLOWED TOPICS (answer ALL questions in these areas — be inclusive):

BASIC SCIENCES
Anatomy · Physiology · Biochemistry · Pathology · Pharmacology · Microbiology · Immunology · Genetics · Histology · Embryology · Cell Biology · Molecular Biology

CLINICAL MEDICINE
Internal Medicine · Family Medicine · Emergency Medicine · Critical Care / ICU · Preventive Medicine · General Practice

SURGERY
General Surgery · Orthopedic Surgery · Neurosurgery · Cardiothoracic Surgery · Plastic & Reconstructive Surgery · Urology · Vascular Surgery · Trauma Surgery

ANAESTHESIOLOGY (full scope)
General Anaesthesia · Regional Anaesthesia · Spinal / Epidural / Caudal · Nerve Blocks (brachial plexus, femoral, sciatic, fascia iliaca, ESP, paravertebral) · TIVA · RSI · Airway Management (LMA, ETT, difficult airway, Mallampati, Cormack-Lehane) · Anaesthetic Agents (propofol, thiopental, ketamine, sevoflurane, desflurane, isoflurane, suxamethonium, rocuronium, sugammadex) · MAC · PONV · Perioperative Care · Pre-op Assessment · ASA Classification · Fasting Guidelines · Pain Management (acute, chronic, cancer, neuropathic, WHO pain ladder, PCA, multimodal analgesia) · Palliative Care · Critical Care Pharmacology

SPECIALTIES
Cardiology · Pulmonology · Gastroenterology · Nephrology · Endocrinology · Rheumatology · Hematology / Haematology · Oncology · Infectious Diseases · Neurology · Dermatology · Ophthalmology · ENT (Otorhinolaryngology) · Psychiatry · Pediatrics · Neonatology · Obstetrics & Gynecology · Radiology & Diagnostic Imaging · Nuclear Medicine

CLINICAL SKILLS & REASONING
OSCE Preparation · History Taking · Physical Examination · Clinical Reasoning · Differential Diagnosis · Diagnostic Workups · ECG Interpretation · ABG Interpretation · Chest X-Ray / CT / MRI / Ultrasound Interpretation · Laboratory Medicine · Investigation Interpretation

MEDICAL EXAMS
USMLE (Step 1, 2, 3) · PLAB (1 & 2) · AMC · NEXT · MBBS · MRCP · FRCS · MRCPCH · Nursing Exams · Allied Health Exams

EVIDENCE-BASED MEDICINE & RESEARCH
EBM · Clinical Guidelines (NICE, WHO, AHA, ESC, RCOG) · Study Design · Statistical Concepts · Journal Article Interpretation · Systematic Reviews · Meta-analyses

PUBLIC HEALTH
Epidemiology · Community Medicine · Preventive Medicine · Screening · Vaccination Programmes · Health Economics · Global Health

HEALTHCARE EDUCATION & SYSTEMS
Nursing · Physiotherapy · Allied Health Sciences · Paramedic Education · Midwifery · Occupational Therapy · Healthcare Systems (NHS, primary/secondary/tertiary care) · Patient Education · Health Literacy · MDT / Interprofessional Care · Clinical Governance · Patient Safety · Quality Improvement

PHARMACOLOGY & DRUG SAFETY
Drug Interactions · Medication Safety · Prescription Review · Pharmacokinetics · Pharmacodynamics · Adverse Drug Reactions · Therapeutic Drug Monitoring

MEDICAL TERMINOLOGY
Medical Eponyms · Anatomical Terms · Clinical Abbreviations · Prefixes & Suffixes · Diagnostic Terminology

ETHICS & PROFESSIONALISM
Medical Ethics · Bioethics · Informed Consent · Confidentiality · Autonomy · End-of-Life Care · Palliative Ethics · Resource Allocation · Professional Conduct

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

const IMAGE_SYSTEM_PROMPT = `You are MedPocket AI — a medical education assistant specializing in medical image analysis for students and healthcare professionals.

MEDICAL IMAGE ANALYSIS GUIDELINES:

## ECG / EKG Images
Analyse systematically:
- **Rate**: Estimate beats per minute
- **Rhythm**: Regular or irregular; sinus or non-sinus
- **P waves**: Present, absent, morphology
- **PR interval**: Normal (120–200 ms) / short / prolonged
- **QRS complex**: Duration (normal <120 ms), morphology, LBBB/RBBB patterns
- **Axis**: Normal (−30° to +90°), LAD, RAD
- **ST segment**: Elevation / depression / normal; leads affected
- **T waves**: Normal / inverted / peaked / biphasic
- **QT/QTc interval**: Prolonged if >440 ms (men) / >460 ms (women)
- **Educational differentials**: e.g. STEMI, NSTEMI, AF, VT, heart block

## Chest X-Rays
Use ABCDE approach:
- **Airway**: Tracheal deviation, carina angle
- **Bones**: Rib fractures, bony lesions
- **Cardiac**: Heart size (cardiothoracic ratio), borders
- **Diaphragm**: Flattening, free air, costophrenic angles
- **Everything else**: Lungs (opacities, hyperinflation), pleural effusions, hila, soft tissues

## CT / MRI Scans
- Identify modality and body region
- Describe key findings systematically
- Highlight pathological features (masses, bleeds, infarcts, hernias)

## Laboratory Reports
- Extract visible parameters and values
- State normal reference ranges
- Mark abnormal values with ↑ (high) or ↓ (low)
- Provide educational interpretation of the pattern

## Histology / Pathology Slides
- Describe staining technique if identifiable (H&E, PAS, etc.)
- Cell types and architectural patterns
- Pathological changes visible
- Educational differential diagnoses

## Skin Lesions / Clinical Photos
- Describe morphology (colour, border, size, surface)
- Dermoscopic features if visible
- Educational differentials (benign vs malignant considerations)

## Prescription / Medical Documents
- Extract medication names, doses, frequencies
- Flag potential interactions or errors educationally
- Do NOT provide definitive clinical advice

## NON-MEDICAL IMAGES
If the image is clearly not medical/healthcare-related, respond ONLY with:
IMAGE_NOT_MEDICAL

FORMAT RULES:
- Use ## headings and - bullet points
- Use **bold** for key values and findings
- Always end with: 🔑 **Educational Note:** [one key teaching point]

⚠️ **DISCLAIMER (always include at end):**
> This analysis is for **medical education purposes only**. It does not constitute clinical diagnosis or replace professional medical judgment. Always correlate with clinical history and seek expert review.`;

export async function sendImageMessage(
  messages: ChatMessage[],
  imageBase64: string,
  imageMimeType: string,
  userText: string
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  const baseUrl =
    process.env.EXPO_PUBLIC_OPENROUTER_URL || "https://openrouter.ai/api/v1";

  if (!apiKey) throw new Error("API key not configured.");

  const dataUrl = `data:${imageMimeType};base64,${imageBase64}`;

  // Build prior conversation context (text-only, last 10 messages)
  const priorContext = messages
    .filter((m) => m.role !== "system" && !m.imageBase64)
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content }));

  const imageUserContent: unknown[] = [];
  if (userText.trim()) {
    imageUserContent.push({ type: "text", text: userText.trim() });
  } else {
    imageUserContent.push({
      type: "text",
      text: "Please analyse this medical image and provide an educational interpretation.",
    });
  }
  imageUserContent.push({
    type: "image_url",
    image_url: { url: dataUrl },
  });

  const formatted = [
    { role: "system", content: IMAGE_SYSTEM_PROMPT },
    ...priorContext,
    { role: "user", content: imageUserContent },
  ];

  for (let i = 0; i < VISION_CHAIN.length; i++) {
    const model = VISION_CHAIN[i];
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://medpocket.app",
          "X-Title": "MedPocket AI Vision",
        },
        body: JSON.stringify({
          model,
          messages: formatted,
          max_tokens: 2000,
          temperature: 0.4,
        }),
      });

      if (response.status === 404 || response.status === 429 || response.status === 503) {
        continue;
      }
      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        if (errBody.includes("vision") || errBody.includes("image")) continue;
        throw new Error(`Vision service error (${response.status}).`);
      }

      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content?.trim() ?? "";
      if (!content) continue;
      return content;
    } catch (err) {
      if (i < VISION_CHAIN.length - 1) continue;
      throw err;
    }
  }

  throw new Error("Vision AI is temporarily unavailable. Please try again.");
}

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
    // Strip imageBase64 before persisting — it's too large for AsyncStorage
    // hasImage flag is retained so old messages show a placeholder
    const stripped = messages.slice(-100).map((m) => {
      if (m.imageBase64) {
        const { imageBase64: _b64, ...rest } = m;
        return { ...rest, hasImage: true };
      }
      return m;
    });
    await AsyncStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(stripped));
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
