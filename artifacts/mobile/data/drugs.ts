export interface Drug {
  id: string;
  name: string;
  brandNames: string[];
  drugClass: string;
  category: string;
  mechanism: string;
  indications: string[];
  contraindications: string[];
  sideEffects: string[];
  dosage: string;
  pregnancyCategory: string;
  interactions: string[];
  monitoring: string[];
  mnemonics?: string;
  clinicalPearls: string[];
}

export const DRUG_CATEGORIES = [
  "All",
  "Antibiotics",
  "Antihypertensives",
  "Antidiabetics",
  "Analgesics",
  "CNS Drugs",
  "Emergency",
  "Respiratory",
  "GI Drugs",
  "Diuretics",
  "Anticoagulants",
  "Corticosteroids",
  "Cardiovascular",
];

export const drugs: Drug[] = [
  {
    id: "amoxicillin",
    name: "Amoxicillin",
    brandNames: ["Amoxil", "Trimox", "Wymox"],
    drugClass: "Aminopenicillin",
    category: "Antibiotics",
    mechanism:
      "Inhibits bacterial cell wall synthesis by binding to penicillin-binding proteins (PBPs), leading to cell lysis and death.",
    indications: [
      "Respiratory tract infections (pneumonia, bronchitis)",
      "Urinary tract infections",
      "Ear, nose, and throat infections",
      "H. pylori eradication (triple therapy)",
      "Lyme disease (early stage)",
      "Dental infections",
    ],
    contraindications: [
      "Hypersensitivity to penicillins",
      "History of severe allergic reaction to cephalosporins",
      "Infectious mononucleosis (risk of rash)",
    ],
    sideEffects: [
      "Diarrhea, nausea, vomiting",
      "Skin rash (maculopapular)",
      "Urticaria, anaphylaxis",
      "Pseudomembranous colitis",
      "Elevated liver enzymes",
    ],
    dosage:
      "Adults: 250–500 mg PO TDS or 875 mg BD. Severe infections: up to 3g/day. Pediatric: 25–50 mg/kg/day in divided doses.",
    pregnancyCategory: "B",
    interactions: [
      "Warfarin: increased anticoagulant effect",
      "Methotrexate: decreased renal clearance",
      "Oral contraceptives: reduced efficacy",
      "Probenecid: increases amoxicillin levels",
    ],
    monitoring: ["Renal function in prolonged use", "Signs of superinfection", "Allergic reactions"],
    mnemonics: "AMOX = A Mild Or eXcellent antibiotic for common bugs",
    clinicalPearls: [
      "Use amoxicillin-clavulanate (Augmentin) for beta-lactamase producing organisms",
      "Maculopapular rash in mono ≠ penicillin allergy",
      "First-line for H. pylori triple therapy with clarithromycin + PPI",
      "Safe in pregnancy (Category B)",
    ],
  },
  {
    id: "metformin",
    name: "Metformin",
    brandNames: ["Glucophage", "Fortamet", "Glumetza"],
    drugClass: "Biguanide",
    category: "Antidiabetics",
    mechanism:
      "Decreases hepatic glucose production (gluconeogenesis), improves insulin sensitivity in peripheral tissues, and reduces intestinal glucose absorption.",
    indications: [
      "Type 2 diabetes mellitus (first-line)",
      "Pre-diabetes (prevention)",
      "PCOS (polycystic ovary syndrome)",
      "Metabolic syndrome",
    ],
    contraindications: [
      "eGFR < 30 mL/min (risk of lactic acidosis)",
      "Acute kidney injury",
      "Liver disease or alcohol use",
      "Iodinated contrast (hold 48 hrs before/after)",
      "Metabolic acidosis",
    ],
    sideEffects: [
      "GI: nausea, diarrhea, abdominal discomfort (most common)",
      "Vitamin B12 deficiency (long-term use)",
      "Lactic acidosis (rare but serious)",
      "Metallic taste",
    ],
    dosage:
      "Start 500 mg BD or 850 mg OD with meals. Increase gradually to max 2550 mg/day (850 mg TDS). XR formulation: 1000–2000 mg once daily with evening meal.",
    pregnancyCategory: "B",
    interactions: [
      "Alcohol: increased risk of lactic acidosis",
      "Iodinated contrast: nephrotoxicity risk",
      "Cimetidine: increases metformin levels",
      "Topiramate: increases lactic acidosis risk",
    ],
    monitoring: [
      "Renal function (eGFR) at baseline and annually",
      "Vitamin B12 levels every 1–2 years",
      "HbA1c every 3–6 months",
      "LFTs baseline",
    ],
    mnemonics: "METFORMIN: Must Eliminate Toxicity For Renal patients, Monitor In Nephropathy",
    clinicalPearls: [
      "Does NOT cause hypoglycemia as monotherapy",
      "Associated with weight loss or weight neutrality",
      "Hold before iodinated contrast and restart 48h after if renal function stable",
      "B12 monitoring important in long-term users",
      "Only oral antidiabetic with proven CV mortality benefit (UKPDS)",
    ],
  },
  {
    id: "amlodipine",
    name: "Amlodipine",
    brandNames: ["Norvasc", "Amlovas", "Stamlo"],
    drugClass: "Dihydropyridine Calcium Channel Blocker",
    category: "Antihypertensives",
    mechanism:
      "Blocks L-type calcium channels in vascular smooth muscle and cardiac muscle, causing vasodilation and reduced peripheral vascular resistance.",
    indications: [
      "Hypertension",
      "Stable angina",
      "Vasospastic (Prinzmetal) angina",
      "Coronary artery disease",
    ],
    contraindications: [
      "Severe hypotension",
      "Cardiogenic shock",
      "Severe aortic stenosis",
      "Hypersensitivity to dihydropyridines",
    ],
    sideEffects: [
      "Peripheral edema (ankle swelling) — most common",
      "Flushing, headache",
      "Palpitations, reflex tachycardia",
      "Gingival hyperplasia",
      "Dizziness",
    ],
    dosage:
      "Adults: 5–10 mg OD. Start with 2.5 mg in elderly or hepatic impairment. Max 10 mg/day.",
    pregnancyCategory: "C",
    interactions: [
      "Simvastatin: max simvastatin dose 20mg (amlodipine inhibits CYP3A4)",
      "Cyclosporine: increased cyclosporine levels",
      "Grapefruit juice: increased amlodipine levels",
      "CYP3A4 inhibitors: increased amlodipine effect",
    ],
    monitoring: ["Blood pressure", "Heart rate", "Edema", "Liver function in hepatic disease"],
    mnemonics: "Amlodipine: A-M-L-O = Always Makes Less Output (vasodilation)",
    clinicalPearls: [
      "Long half-life (~35-50 hours) allows once-daily dosing",
      "Preferred in black patients and elderly with isolated systolic hypertension",
      "Ankle edema: try switching to ACEI combination (Perindopril/Amlodipine)",
      "Safe in asthma unlike beta-blockers",
    ],
  },
  {
    id: "paracetamol",
    name: "Paracetamol (Acetaminophen)",
    brandNames: ["Calpol", "Panadol", "Tylenol", "Dolo"],
    drugClass: "Non-opioid Analgesic / Antipyretic",
    category: "Analgesics",
    mechanism:
      "Inhibits prostaglandin synthesis centrally in the CNS, raises pain threshold, and acts on hypothalamic heat-regulating center for antipyresis. Mechanism not fully established.",
    indications: [
      "Mild-to-moderate pain",
      "Fever",
      "Headache, dental pain",
      "Osteoarthritis",
      "Post-operative analgesia",
    ],
    contraindications: [
      "Severe hepatic impairment",
      "Hypersensitivity",
      "Regular alcohol use (relative contraindication)",
    ],
    sideEffects: [
      "Hepatotoxicity (overdose — most important)",
      "Rarely: skin reactions",
      "Thrombocytopenia (rare)",
      "Nephrotoxicity in overdose",
    ],
    dosage:
      "Adults: 500 mg–1 g every 4–6 hours. Max 4 g/day (3g in elderly, liver disease, alcohol use). IV: 1 g over 15 min. Pediatric: 10–15 mg/kg every 4–6 hours.",
    pregnancyCategory: "B",
    interactions: [
      "Warfarin: increased INR with regular use",
      "Isoniazid: increased hepatotoxicity risk",
      "Carbamazepine/phenytoin: increased hepatotoxicity",
      "Alcohol: increased hepatotoxicity",
    ],
    monitoring: ["Liver function tests in overdose or regular high-dose use", "Renal function"],
    mnemonics: "PARA = Pain And Remission of fever Always (safe analgesic choice)",
    clinicalPearls: [
      "N-Acetylcysteine (NAC) is the antidote for paracetamol overdose",
      "Hepatotoxicity occurs via toxic metabolite NAPQI — worsened by CYP450 inducers",
      "Rumack-Matthew nomogram used to assess overdose severity",
      "Safest analgesic in pregnancy",
      "Max 3g/day in elderly or liver disease",
    ],
  },
  {
    id: "atorvastatin",
    name: "Atorvastatin",
    brandNames: ["Lipitor", "Torvast", "Atorva"],
    drugClass: "HMG-CoA Reductase Inhibitor (Statin)",
    category: "Cardiovascular",
    mechanism:
      "Competitively inhibits HMG-CoA reductase, the rate-limiting enzyme in cholesterol synthesis. Reduces LDL-C, VLDL-C, and triglycerides; increases HDL-C.",
    indications: [
      "Hypercholesterolemia",
      "Prevention of cardiovascular events (primary and secondary)",
      "Acute coronary syndrome (high-intensity statin)",
      "Diabetic patients with CV risk factors",
      "Stroke prevention",
    ],
    contraindications: [
      "Active liver disease",
      "Pregnancy and breastfeeding",
      "Hypersensitivity",
      "Unexplained persistent elevated transaminases",
    ],
    sideEffects: [
      "Myopathy, myalgia (muscle pain)",
      "Rhabdomyolysis (rare, severe)",
      "Elevated liver enzymes",
      "New-onset diabetes",
      "GI symptoms",
      "Cognitive effects (rare)",
    ],
    dosage:
      "10–80 mg OD. High-intensity: 40–80 mg. Moderate-intensity: 10–20 mg. Take at any time (unlike other statins).",
    pregnancyCategory: "X",
    interactions: [
      "Fibrates: increased rhabdomyolysis risk",
      "Cyclosporine: increased statin levels",
      "Macrolide antibiotics: increased myopathy risk",
      "Grapefruit juice: significantly increases levels",
      "Rifampicin: decreases statin levels",
    ],
    monitoring: ["CK levels if myopathy suspected", "LFTs at baseline", "HbA1c/fasting glucose"],
    mnemonics: "STATIN = Stop The Atherosclerosis, Treat Inflammation Now",
    clinicalPearls: [
      "Stop immediately if CK > 10x ULN (rhabdomyolysis risk)",
      "Atorvastatin: most potent statin, can be taken any time of day",
      "Category X in pregnancy — counsel women of childbearing age",
      "Grapefruit juice can increase levels 2-3 fold",
    ],
  },
  {
    id: "salbutamol",
    name: "Salbutamol (Albuterol)",
    brandNames: ["Ventolin", "Proventil", "Asthalin"],
    drugClass: "Short-Acting Beta-2 Agonist (SABA)",
    category: "Respiratory",
    mechanism:
      "Selective agonist at beta-2 adrenergic receptors in bronchial smooth muscle, causing bronchodilation. Also used in hyperkalemia to shift K+ into cells.",
    indications: [
      "Acute bronchospasm (asthma, COPD)",
      "Exercise-induced bronchoconstriction (prevention)",
      "Hyperkalemia (adjunct treatment)",
      "Premature labor (tocolysis — limited use)",
    ],
    contraindications: [
      "Hypersensitivity",
      "Tachyarrhythmias (relative)",
      "Hypertrophic obstructive cardiomyopathy",
    ],
    sideEffects: [
      "Tremor (most common)",
      "Tachycardia, palpitations",
      "Hypokalemia (with high doses)",
      "Headache",
      "Paradoxical bronchospasm (rare)",
    ],
    dosage:
      "Inhaler: 100–200 mcg (1–2 puffs) PRN. Nebulization: 2.5 mg in 3 mL NS every 20 min x3 in acute attack. IV: 250 mcg for acute severe asthma.",
    pregnancyCategory: "C",
    interactions: [
      "Non-selective beta blockers: antagonism",
      "Digoxin: reduced digoxin levels",
      "Loop diuretics: additive hypokalemia",
      "MAOIs: risk of hypertension",
    ],
    monitoring: [
      "Serum potassium (high doses)",
      "Heart rate",
      "Peak flow / FEV1",
      "Blood glucose in diabetics",
    ],
    mnemonics: "SALBUTAMOL = Sudden Airway Loudness But Usual Treatment And Management Of Lungs",
    clinicalPearls: [
      "Rescue inhaler — not for regular maintenance (use LABA/ICS for maintenance)",
      "Frequent use (>2x/week) indicates poor asthma control",
      "In acute severe asthma: back-to-back nebulizations every 20 min",
      "Lowers K+ — useful in hyperkalemia, but monitor closely",
    ],
  },
  {
    id: "morphine",
    name: "Morphine",
    brandNames: ["MS Contin", "Oramorph", "Morphgesic"],
    drugClass: "Opioid Analgesic",
    category: "Analgesics",
    mechanism:
      "Agonist at mu (μ), kappa (κ), and delta (δ) opioid receptors in the CNS and periphery, reducing pain perception and transmission.",
    indications: [
      "Severe acute pain (post-operative, trauma)",
      "Chronic cancer pain",
      "Acute pulmonary edema (reduces preload)",
      "Acute MI pain",
      "Palliative care",
    ],
    contraindications: [
      "Respiratory depression",
      "Raised intracranial pressure (relative)",
      "Paralytic ileus",
      "Acute abdomen (use with caution)",
      "MAOIs within 14 days",
    ],
    sideEffects: [
      "Respiratory depression (life-threatening, dose-dependent)",
      "Nausea, vomiting",
      "Constipation (prescribe laxative routinely)",
      "Sedation, confusion",
      "Urinary retention",
      "Pruritus (histamine release)",
      "Dependence and tolerance",
    ],
    dosage:
      "IV: 2–4 mg every 5–15 min PRN. SC/IM: 5–10 mg every 4 hours. PO: 5–30 mg every 4 hours. Modified release: 12-hourly.",
    pregnancyCategory: "C (D near term)",
    interactions: [
      "CNS depressants: additive respiratory depression",
      "MAOIs: life-threatening serotonin syndrome",
      "Naloxone: reverses morphine effects",
      "Rifampicin: decreased morphine levels",
    ],
    monitoring: [
      "Respiratory rate (keep >12/min)",
      "GCS/sedation score",
      "Pain score",
      "Bowel function",
      "Urine output",
    ],
    mnemonics: "MORPHINE = My Old Reliable Pain Helper, Inhibits Nociceptive Excitation",
    clinicalPearls: [
      "Naloxone (Narcan) is the antidote — 0.4–2 mg IV, may repeat every 2–3 min",
      "Always prescribe a laxative (e.g., lactulose) with regular morphine",
      "Equianalgesic doses: morphine 10mg IV = 30mg PO",
      "Avoid in renal failure — active metabolite M6G accumulates",
      "In acute pulmonary edema: reduces anxiety and cardiac preload",
    ],
  },
  {
    id: "epinephrine",
    name: "Epinephrine (Adrenaline)",
    brandNames: ["EpiPen", "Adrenalin", "Anapen"],
    drugClass: "Catecholamine / Sympathomimetic",
    category: "Emergency",
    mechanism:
      "Non-selective adrenergic agonist acting on alpha-1, alpha-2, beta-1, and beta-2 receptors. Causes vasoconstriction, increased HR, bronchodilation, and reduced mast cell degranulation.",
    indications: [
      "Anaphylaxis (FIRST-LINE treatment)",
      "Cardiac arrest (ACLS protocol)",
      "Severe bronchospasm",
      "Septic shock (vasopressor)",
      "As adjunct with local anesthetics (prolongs effect)",
    ],
    contraindications: [
      "No absolute contraindications in anaphylaxis",
      "Relative: hypertensive crisis, ischemic heart disease",
      "Avoid in cocaine intoxication",
    ],
    sideEffects: [
      "Hypertension, tachycardia",
      "Arrhythmias (ventricular)",
      "Anxiety, tremor",
      "Headache",
      "Pulmonary edema (high doses)",
      "Tissue necrosis (extravasation)",
    ],
    dosage:
      "Anaphylaxis: 0.3–0.5 mg IM (1:1000) anterolateral thigh. Repeat every 5–15 min. Cardiac arrest: 1 mg IV (1:10,000) every 3–5 min. Pediatric anaphylaxis: 0.01 mg/kg IM (max 0.5 mg).",
    pregnancyCategory: "C",
    interactions: [
      "Beta-blockers: reduced effect, unopposed alpha (hypertension)",
      "TCAs and MAOIs: enhanced cardiovascular effects",
      "Digoxin: increased arrhythmia risk",
      "Cocaine: additive cardiovascular effects",
    ],
    monitoring: ["Heart rate, BP", "ECG monitoring during IV infusion", "Blood glucose"],
    mnemonics: "EPINEPHRINE = Emergency Protocol, Immediately Needed in anaphylaxis, Emergency Halt of Reactions, INJEct without delay",
    clinicalPearls: [
      "IM is ALWAYS preferred over SC in anaphylaxis (faster absorption)",
      "Anterolateral thigh is preferred injection site (vastus lateralis)",
      "In anaphylaxis: do NOT delay epinephrine for antihistamines",
      "1:1000 = 1 mg/mL for IM; 1:10,000 = 0.1 mg/mL for IV",
      "Patient should be supine with legs elevated unless breathing difficulty",
    ],
  },
  {
    id: "warfarin",
    name: "Warfarin",
    brandNames: ["Coumadin", "Warfin", "Warf"],
    drugClass: "Vitamin K Antagonist (VKA) Anticoagulant",
    category: "Anticoagulants",
    mechanism:
      "Inhibits vitamin K epoxide reductase, preventing activation of vitamin K-dependent clotting factors (II, VII, IX, X) and protein C and S.",
    indications: [
      "Atrial fibrillation (stroke prevention)",
      "Deep vein thrombosis (DVT) and pulmonary embolism (PE)",
      "Mechanical heart valves (preferred over DOACs)",
      "Antiphospholipid syndrome",
    ],
    contraindications: [
      "Active bleeding",
      "Pregnancy (1st trimester & near term — teratogenic)",
      "Severe hepatic disease",
      "Uncontrolled hypertension",
      "Recent CNS surgery",
    ],
    sideEffects: [
      "Bleeding (major risk — GI, intracranial)",
      "Warfarin skin necrosis (protein C deficiency)",
      "Purple toe syndrome",
      "Teratogenicity (Category X in 1st trimester)",
      "Drug interactions (extremely numerous)",
    ],
    dosage:
      "Individualized. Start 5 mg OD; adjust by INR. Target INR: AF/DVT/PE = 2–3; mechanical mitral valve = 2.5–3.5.",
    pregnancyCategory: "X (Category D in 2nd trimester only)",
    interactions: [
      "Aspirin/NSAIDs: increased bleeding risk",
      "Antibiotics (metronidazole, fluoroquinolones): increase INR",
      "Rifampicin: dramatically reduces warfarin effect",
      "Vitamin K: reverses anticoagulation",
      "Amiodarone: doubles warfarin effect",
    ],
    monitoring: [
      "INR at baseline, then 3-4 days after initiation, then weekly until stable, then monthly",
      "Signs of bleeding",
      "Dietary vitamin K intake (consistency key)",
    ],
    mnemonics: "WARFARIN: Watch And Regularly Follow-up And Recheck INR Now",
    clinicalPearls: [
      "Vitamin K (phytonadione) reverses anticoagulation in 12–24h",
      "FFP/PCC for immediate reversal in major bleeding",
      "Antidote: Vitamin K, FFP, Prothrombin Complex Concentrate (PCC)",
      "Highly protein-bound — interactions via protein binding displacement",
      "Narrow therapeutic index — even small changes in diet affect INR",
    ],
  },
  {
    id: "lisinopril",
    name: "Lisinopril",
    brandNames: ["Zestril", "Prinivil", "Lisoril"],
    drugClass: "ACE Inhibitor (ACEI)",
    category: "Antihypertensives",
    mechanism:
      "Inhibits ACE, reducing conversion of angiotensin I to angiotensin II. Decreases vasoconstriction and aldosterone secretion. Increases bradykinin levels.",
    indications: [
      "Hypertension (first-line)",
      "Heart failure with reduced ejection fraction (HFrEF)",
      "Post-MI cardioprotection",
      "Diabetic nephropathy (renoprotective)",
      "CKD with proteinuria",
    ],
    contraindications: [
      "Bilateral renal artery stenosis",
      "Pregnancy (fetotoxic in 2nd and 3rd trimester)",
      "History of ACE inhibitor-induced angioedema",
      "Hyperkalemia",
      "eGFR < 30 (relative)",
    ],
    sideEffects: [
      "Dry cough (15–20% — bradykinin-mediated) — most common reason to stop",
      "Angioedema (life-threatening, rare)",
      "Hyperkalemia",
      "Hypotension (first-dose effect)",
      "Acute kidney injury (especially in volume depletion)",
      "Teratogenicity",
    ],
    dosage:
      "Hypertension: 10–40 mg OD. Start 2.5–5 mg. Heart failure: Start 2.5–5 mg, target 20–35 mg OD.",
    pregnancyCategory: "D (2nd/3rd trimester)",
    interactions: [
      "NSAIDs: reduced antihypertensive effect + AKI risk",
      "Potassium supplements/spironolactone: hyperkalemia",
      "Aliskiren: contraindicated in diabetics (AKI risk)",
      "Lithium: increased lithium toxicity",
    ],
    monitoring: [
      "Blood pressure",
      "Renal function and potassium at baseline, 1-2 weeks, then periodically",
      "Cough",
      "Angioedema",
    ],
    mnemonics: "ACE inhibitors: A Cough Emerges (due to bradykinin). CAPTOPRIL = Cough, Angioedema, Proteinuria resolved, Teratogen, Others (hyperkalemia), Pruritis, Rash, Increased K+, Lowered BP",
    clinicalPearls: [
      "Switch to ARB if cough is intolerable (same efficacy, no cough)",
      "Renoprotective in diabetic nephropathy — reduces proteinuria",
      "Causes initial rise in creatinine (<25% acceptable) — do not stop",
      "Angioedema can occur weeks to years after starting treatment",
    ],
  },
  {
    id: "dexamethasone",
    name: "Dexamethasone",
    brandNames: ["Decadron", "Dexona", "Dexamethasone Intensol"],
    drugClass: "Corticosteroid (Glucocorticoid)",
    category: "Corticosteroids",
    mechanism:
      "Binds glucocorticoid receptors, inhibiting phospholipase A2 and COX enzymes. Reduces cytokine production, suppresses inflammatory and immune responses.",
    indications: [
      "Cerebral edema (tumors, meningitis)",
      "Croup (laryngotracheobronchitis)",
      "Anaphylaxis (adjunct — after epinephrine)",
      "Severe asthma (acute exacerbation)",
      "COVID-19 (hospitalized, requiring oxygen — RECOVERY trial)",
      "Adrenal insufficiency (supraphysiological doses)",
      "Anti-emetic (chemotherapy-induced nausea)",
    ],
    contraindications: [
      "Active systemic fungal infections",
      "Live vaccines during immunosuppressive doses",
      "Hypersensitivity",
    ],
    sideEffects: [
      "Hyperglycemia (diabetogenic)",
      "Immunosuppression, infection risk",
      "Hypertension, fluid retention",
      "Osteoporosis (long-term)",
      "Cushing syndrome features",
      "Peptic ulcer disease",
      "Adrenal suppression (on stopping)",
      "Psychosis, mood changes",
    ],
    dosage:
      "Cerebral edema: 10 mg IV loading, then 4 mg IV every 6h. Croup: 0.15 mg/kg (max 10 mg) single dose. COVID-19: 6 mg OD for 10 days.",
    pregnancyCategory: "C",
    interactions: [
      "NSAIDs: increased GI bleeding risk",
      "Antidiabetics: reduced glucose-lowering effect",
      "Rifampicin: reduced dexamethasone levels",
      "Live vaccines: contraindicated",
    ],
    monitoring: [
      "Blood glucose (especially in diabetics)",
      "Blood pressure",
      "Signs of infection",
      "Bone density (long-term use)",
    ],
    mnemonics: "DEXAMETHASONE: Do EXamine And Monitor Every Toxicity — Hyperglycemia, Adrenal suppression, Steroid-induced Osteoporosis, Nausea Eased",
    clinicalPearls: [
      "Most potent and longest-acting glucocorticoid",
      "No mineralocorticoid activity — does not cause hypernatremia/hypokalemia like hydrocortisone",
      "RECOVERY trial: 6mg OD dexamethasone reduced COVID-19 mortality in ventilated patients",
      "Give with PPI if on concurrent NSAIDs",
      "Taper slowly if used >1–2 weeks to prevent adrenal crisis",
    ],
  },
  {
    id: "furosemide",
    name: "Furosemide",
    brandNames: ["Lasix", "Frusemide", "Frusol"],
    drugClass: "Loop Diuretic",
    category: "Diuretics",
    mechanism:
      "Inhibits Na-K-2Cl co-transporter (NKCC2) in the ascending loop of Henle, preventing reabsorption of sodium, potassium, and chloride.",
    indications: [
      "Acute pulmonary edema (IV — urgent)",
      "Heart failure (fluid overload)",
      "Hypertension resistant to other agents",
      "Nephrotic syndrome, cirrhosis (edema/ascites)",
      "Hypercalcemia (with IV saline)",
      "Hyperkalemia (promotes K+ excretion)",
    ],
    contraindications: [
      "Anuria",
      "Pre-coma or coma from hepatic failure",
      "Hypovolemia",
      "Hypokalemia, hyponatremia",
      "Hypersensitivity (sulfonamide allergy — cross-reactivity possible)",
    ],
    sideEffects: [
      "Hypokalemia (most common — monitor K+)",
      "Hyponatremia, hypomagnesemia",
      "Metabolic alkalosis",
      "Ototoxicity (high IV doses — tinnitus, deafness)",
      "Hyperuricemia, gout",
      "Dehydration, hypotension",
      "Hyperglycemia",
    ],
    dosage:
      "Acute pulmonary edema: 40–80 mg IV bolus. Chronic heart failure: 20–80 mg PO OD–BD. Ascites: 40–160 mg PO.",
    pregnancyCategory: "C",
    interactions: [
      "Aminoglycosides: additive ototoxicity",
      "NSAIDs: reduced diuretic effect",
      "Digoxin: hypokalemia increases toxicity risk",
      "ACE inhibitors: first-dose hypotension",
      "Lithium: increased lithium toxicity",
    ],
    monitoring: [
      "Serum electrolytes (K+, Na+, Mg2+) regularly",
      "Renal function",
      "Blood pressure",
      "Urine output / fluid balance",
      "Weight daily (in acute heart failure)",
    ],
    mnemonics: "FUROSEMIDE = Flushes Urine Rapidly, Outputs Sodium, Eliminates fluid, Makes Inner ear Damage possible, Empties body",
    clinicalPearls: [
      "Onset IV: 5–15 min; Peak: 30 min; Duration: 2 hours",
      "Replace potassium in all patients on loop diuretics",
      "In pulmonary edema: give IV, not oral (erratic absorption)",
      "Avoid rapid IV injection to reduce ototoxicity risk",
      "Furosemide is 'ceiling dose' dependent: double the dose if inadequate response",
    ],
  },
  {
    id: "omeprazole",
    name: "Omeprazole",
    brandNames: ["Losec", "Prilosec", "Omez"],
    drugClass: "Proton Pump Inhibitor (PPI)",
    category: "GI Drugs",
    mechanism:
      "Irreversibly inhibits the H+/K+-ATPase (proton pump) in gastric parietal cells, suppressing acid secretion regardless of stimulus.",
    indications: [
      "GERD (gastroesophageal reflux disease)",
      "Peptic ulcer disease (gastric and duodenal ulcers)",
      "H. pylori eradication (with antibiotics)",
      "NSAID-induced GI prophylaxis",
      "Zollinger-Ellison syndrome",
      "Stress ulcer prophylaxis in ICU",
    ],
    contraindications: [
      "Hypersensitivity",
      "Use with clopidogrel (controversial — reduces antiplatelet effect)",
      "Hypomagnesemia (existing)",
    ],
    sideEffects: [
      "Headache, GI symptoms (generally well tolerated)",
      "C. difficile infection (long-term)",
      "Hypomagnesemia (long-term >1 year)",
      "Vitamin B12 deficiency (long-term)",
      "Osteoporosis / hip fractures (long-term)",
      "Community-acquired pneumonia risk",
    ],
    dosage:
      "GERD: 20–40 mg OD 30 min before breakfast. Ulcers: 20–40 mg OD. H. pylori: 20 mg BD with antibiotics for 7–14 days.",
    pregnancyCategory: "C",
    interactions: [
      "Clopidogrel: reduced antiplatelet effect (via CYP2C19 inhibition)",
      "Methotrexate: increased toxicity",
      "Ketoconazole/itraconazole: reduced absorption",
      "Warfarin: possible increased INR",
    ],
    monitoring: ["Symptom response", "Magnesium if long-term", "B12 if long-term"],
    mnemonics: "PPI = Prevents Pump Inhibition (acid secretion). 5 PPIs: OPEN = Omeprazole, Pantoprazole, Esomeprazole, rabeNicole (rabeprazole), lansoprazole",
    clinicalPearls: [
      "Take 30 min before meals for maximum efficacy",
      "Not all patients with GERD symptoms need PPIs — try lifestyle changes first",
      "Review and de-prescribe if no clear indication (overused)",
      "H. pylori triple therapy: PPI + amoxicillin + clarithromycin for 7–14 days",
    ],
  },
];

export function searchDrugs(query: string, category?: string): Drug[] {
  const q = query.toLowerCase().trim();
  return drugs.filter((d) => {
    const matchesCategory =
      !category || category === "All" || d.category === category;
    if (!q) return matchesCategory;
    return (
      matchesCategory &&
      (d.name.toLowerCase().includes(q) ||
        d.brandNames.some((b) => b.toLowerCase().includes(q)) ||
        d.drugClass.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q))
    );
  });
}

export function getDrugById(id: string): Drug | undefined {
  return drugs.find((d) => d.id === id);
}
