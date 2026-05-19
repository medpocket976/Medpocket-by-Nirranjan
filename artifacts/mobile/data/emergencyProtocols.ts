export interface ProtocolStep {
  step: number;
  title: string;
  details: string;
  drugs?: string[];
  urgent?: boolean;
}

export interface EmergencyProtocol {
  id: string;
  name: string;
  abbreviation?: string;
  urgency: "critical" | "high" | "moderate";
  color: string;
  description: string;
  steps: ProtocolStep[];
  keyDrugs: { name: string; dose: string; route: string }[];
  keyPoints: string[];
}

export const emergencyProtocols: EmergencyProtocol[] = [
  {
    id: "anaphylaxis",
    name: "Anaphylaxis",
    urgency: "critical",
    color: "#EF4444",
    description:
      "Severe, life-threatening systemic hypersensitivity reaction. Can progress to anaphylactic shock within minutes.",
    steps: [
      {
        step: 1,
        title: "Recognize Anaphylaxis",
        details:
          "Sudden onset: Skin (urticaria, angioedema, flushing) + Respiratory (bronchospasm, stridor) and/or Cardiovascular (hypotension, shock). May occur without skin findings.",
        urgent: true,
      },
      {
        step: 2,
        title: "Call for Help — Lay Patient Flat",
        details:
          "Position: Supine with legs raised (unless vomiting/breathing difficulty — semi-recumbent). Pregnant: left lateral. Cardiac arrest: CPR position.",
      },
      {
        step: 3,
        title: "Epinephrine IM — IMMEDIATELY",
        details:
          "Epinephrine 1:1000 (1mg/mL) IM into anterolateral thigh. DO NOT DELAY. This is the cornerstone treatment.",
        drugs: ["Epinephrine 0.5 mg IM (adult) — Anterolateral thigh"],
        urgent: true,
      },
      {
        step: 4,
        title: "Call Emergency Services / Activate Code",
        details: "Dial emergency services. Alert resuscitation team if in hospital.",
      },
      {
        step: 5,
        title: "High-Flow Oxygen",
        details: "15 L/min via non-rebreather mask. Maintain SpO2 > 94%.",
        drugs: ["O2 15 L/min via non-rebreather mask"],
      },
      {
        step: 6,
        title: "IV Access + Fluids",
        details:
          "Large-bore IV access. IV fluid: 500–1000 mL 0.9% NaCl bolus. Repeat as needed for hypotension.",
        drugs: ["0.9% NaCl 500 mL IV bolus — repeat as needed"],
      },
      {
        step: 7,
        title: "Repeat Epinephrine if No Improvement",
        details: "If no improvement after 5 minutes: repeat epinephrine IM. Can give every 5–15 min.",
        drugs: ["Epinephrine 0.5 mg IM — repeat every 5–15 min"],
      },
      {
        step: 8,
        title: "Secondary Treatments",
        details:
          "After epinephrine and resuscitation: chlorphenamine (antihistamine), hydrocortisone IV. These are ADJUNCTS, not first-line.",
        drugs: [
          "Chlorphenamine 10 mg IV/IM",
          "Hydrocortisone 200 mg IV",
          "Salbutamol nebulization for bronchospasm",
        ],
      },
      {
        step: 9,
        title: "Monitor & Observe",
        details:
          "Observe minimum 6–12 hours (biphasic reaction risk). Prescribe self-injectable epinephrine (EpiPen). Refer to allergy specialist.",
      },
    ],
    keyDrugs: [
      { name: "Epinephrine (1:1000)", dose: "0.5 mg (adult), 0.01 mg/kg (child, max 0.5 mg)", route: "IM — anterolateral thigh" },
      { name: "0.9% NaCl", dose: "500–1000 mL bolus, repeat", route: "IV" },
      { name: "Chlorphenamine", dose: "10 mg adult, 5 mg child 6-12y", route: "IV/IM (adjunct)" },
      { name: "Hydrocortisone", dose: "200 mg adult", route: "IV (adjunct)" },
    ],
    keyPoints: [
      "Epinephrine IM is FIRST-LINE — never delay for antihistamines",
      "IM preferred over SC (faster absorption from deltoid/thigh)",
      "Biphasic reaction occurs in 5–20% — observe for minimum 6 hours",
      "Prescribe EpiPen and allergy referral on discharge",
      "Remove trigger if identifiable (stop IV drug, remove insect stinger)",
    ],
  },
  {
    id: "acls-vf",
    name: "Cardiac Arrest (VF/VT)",
    abbreviation: "ACLS",
    urgency: "critical",
    color: "#EF4444",
    description:
      "Shockable rhythm cardiac arrest management per ACLS guidelines. Time to defibrillation is critical.",
    steps: [
      {
        step: 1,
        title: "Confirm Unresponsiveness & No Pulse",
        details: "Check responsiveness. No normal breathing. No pulse for <10 seconds. Activate emergency response.",
        urgent: true,
      },
      {
        step: 2,
        title: "Start CPR Immediately",
        details:
          "High-quality CPR: Rate 100–120/min. Depth 5–6 cm (2–2.4 inches). Full chest recoil. Minimize interruptions. 30:2 ratio.",
        urgent: true,
      },
      {
        step: 3,
        title: "Attach Defibrillator",
        details: "Rhythm check: Shockable = VF or pulseless VT.",
        urgent: true,
      },
      {
        step: 4,
        title: "Defibrillate",
        details:
          "Biphasic: 200J (or manufacturer-recommended dose). Monophasic: 360J. Resume CPR immediately after shock.",
        urgent: true,
      },
      {
        step: 5,
        title: "IV/IO Access — Epinephrine",
        details:
          "After 2nd shock if VF/VT persists: Epinephrine 1 mg IV every 3–5 minutes. Continue CPR.",
        drugs: ["Epinephrine 1 mg IV every 3–5 min"],
      },
      {
        step: 6,
        title: "Advanced Airway",
        details: "Endotracheal intubation or supraglottic airway. Ventilate 10 breaths/min. Continuous chest compressions.",
      },
      {
        step: 7,
        title: "Antiarrhythmic (after 3rd shock)",
        details: "Amiodarone 300 mg IV bolus. Repeat 150 mg once if persistent VF/VT.",
        drugs: ["Amiodarone 300 mg IV — repeat 150 mg once"],
      },
      {
        step: 8,
        title: "Treat Reversible Causes (4Hs & 4Ts)",
        details:
          "4Hs: Hypoxia, Hypovolemia, Hypothermia, Hyper/Hypokalemia. 4Ts: Tension pneumothorax, Tamponade, Toxins, Thrombosis (PE/MI).",
      },
    ],
    keyDrugs: [
      { name: "Epinephrine", dose: "1 mg", route: "IV every 3–5 min" },
      { name: "Amiodarone", dose: "300 mg, repeat 150 mg", route: "IV bolus" },
      { name: "Lidocaine", dose: "1–1.5 mg/kg", route: "IV (alternative to amiodarone)" },
    ],
    keyPoints: [
      "Early defibrillation is the single most important intervention",
      "Minimize CPR interruptions — no pause >10 seconds",
      "Post-ROSC: targeted temperature management (32–36°C)",
      "Epinephrine every 3–5 min — do NOT give too frequently",
      "PEA/Asystole: Non-shockable — epinephrine only, treat reversible causes",
    ],
  },
  {
    id: "stroke",
    name: "Acute Ischemic Stroke",
    urgency: "critical",
    color: "#F97316",
    description:
      "Time-sensitive emergency. 'Time is Brain' — 1.9 million neurons lost per minute. Goal: IV thrombolysis within 4.5 hours of onset.",
    steps: [
      {
        step: 1,
        title: "Recognize Stroke — FAST",
        details: "F = Face drooping. A = Arm weakness. S = Speech difficulty. T = Time to call emergency. Also: sudden vision loss, headache, dizziness, loss of balance.",
        urgent: true,
      },
      {
        step: 2,
        title: "Activate Stroke Team — Time is Brain",
        details: "Activate code stroke. Target door-to-CT <25 min, door-to-needle <60 min.",
        urgent: true,
      },
      {
        step: 3,
        title: "ABCs — IV Access — Vitals",
        details: "Airway, breathing, circulation. Two large-bore IVs. Continuous monitoring: BP, ECG, SpO2.",
      },
      {
        step: 4,
        title: "Urgent CT Brain (Non-Contrast)",
        details: "Exclude hemorrhage before thrombolysis. CT takes priority over blood tests.",
        urgent: true,
      },
      {
        step: 5,
        title: "Blood Tests",
        details: "Glucose (critical: treat hypoglycemia immediately), CBC, coagulation, type & screen. Do NOT delay CT for bloods.",
      },
      {
        step: 6,
        title: "Thrombolysis if Eligible",
        details:
          "IV alteplase (tPA) 0.9 mg/kg (max 90 mg). 10% bolus, remainder over 60 min. Within 4.5 hours of onset (select patients up to 9h with perfusion imaging).",
        drugs: ["Alteplase (tPA) 0.9 mg/kg IV — max 90 mg"],
        urgent: true,
      },
      {
        step: 7,
        title: "Blood Pressure Management",
        details:
          "If NOT for thrombolysis: allow permissive hypertension up to 220/120 mmHg. If FOR thrombolysis: maintain <185/110 mmHg before and during.",
      },
      {
        step: 8,
        title: "Endovascular Thrombectomy if Eligible",
        details: "Large vessel occlusion (M1/M2 MCA, basilar, ICA): mechanical thrombectomy. Up to 24 hours with imaging selection.",
      },
    ],
    keyDrugs: [
      { name: "Alteplase (tPA)", dose: "0.9 mg/kg IV (max 90mg)", route: "IV — 10% bolus, 90% over 60 min" },
      { name: "Aspirin", dose: "300 mg (24h after tPA; immediately if no tPA)", route: "PO/NG" },
    ],
    keyPoints: [
      "Every 15 min delay in tPA = 1 month of healthy life lost",
      "Absolute contraindication to tPA: hemorrhagic stroke, BP >185/110 uncontrolled, platelets <100k, INR >1.7",
      "Do NOT lower BP aggressively (unless thrombolysis or hypertensive encephalopathy)",
      "Swallowing assessment before any oral intake",
      "Admit to stroke unit — reduces mortality by 20%",
    ],
  },
  {
    id: "dka",
    name: "Diabetic Ketoacidosis (DKA)",
    urgency: "high",
    color: "#F97316",
    description:
      "Life-threatening complication of diabetes characterized by hyperglycemia, ketonemia, and metabolic acidosis. Triad: Hyperglycemia + Ketonemia + Metabolic acidosis.",
    steps: [
      {
        step: 1,
        title: "Diagnose DKA",
        details:
          "Glucose > 11 mmol/L (200 mg/dL) + Blood ketones > 3 mmol/L (or urine 2+) + pH < 7.3 or HCO3 < 18. Severity: Mild (pH 7.25-7.30), Moderate (pH 7.0-7.24), Severe (pH < 7.0).",
      },
      {
        step: 2,
        title: "Bloods & Monitoring",
        details: "ABG, BMP (glucose, Na, K, Cl, HCO3, BUN, creatinine), CBC, urine ketones, ECG. Hourly glucose, 2-hourly electrolytes initially.",
      },
      {
        step: 3,
        title: "IV Fluid Resuscitation",
        details:
          "0.9% NaCl: 1 L in first hour. Then 250–500 mL/h based on clinical state. When glucose <14 mmol/L: switch to 5% dextrose + 0.45% NaCl.",
        drugs: ["0.9% NaCl — 1L over 1h, then 250-500mL/h"],
        urgent: true,
      },
      {
        step: 4,
        title: "Potassium Replacement",
        details:
          "CRITICAL: Check K+ before insulin. K+ <3.5: Replace K+ before insulin (give 40 mEq/h). K+ 3.5–5.5: Replace 20–40 mEq/h with insulin. K+ >5.5: No K+ — monitor. Never give insulin if K+ <3.5.",
        drugs: ["KCl IV — rate depends on serum K+"],
        urgent: true,
      },
      {
        step: 5,
        title: "Fixed Rate IV Insulin",
        details:
          "FRIII (Fixed Rate Intravenous Insulin Infusion): 0.1 units/kg/hour regular insulin. Do NOT give unless K+ >3.5 and fluid resuscitation started.",
        drugs: ["Regular insulin 0.1 units/kg/h IV infusion"],
      },
      {
        step: 6,
        title: "Identify & Treat Precipitant",
        details: "6 'I's: Infection, Infarction (MI), Inadequate insulin, Inflammatory (pancreatitis), Ischemia, Intoxication. Most common = infection.",
      },
      {
        step: 7,
        title: "Resolution Criteria",
        details: "pH >7.3 + HCO3 >15 + Blood ketones <0.6 mmol/L or urine negative. Transition to SC insulin only after oral intake resumed.",
      },
    ],
    keyDrugs: [
      { name: "0.9% NaCl", dose: "1L in 1h, then 250-500mL/h", route: "IV" },
      { name: "Regular Insulin", dose: "0.1 units/kg/hour", route: "IV infusion (FRIII)" },
      { name: "KCl (Potassium Chloride)", dose: "20–40 mEq/h", route: "IV (based on K+ level)" },
    ],
    keyPoints: [
      "NEVER give insulin before correcting K+ <3.5 (fatal hypokalemia)",
      "Do NOT target normal glucose immediately — risk of cerebral edema (esp. children)",
      "Bicarbonate RARELY indicated — only pH <6.9 with cardiac compromise",
      "Most common precipitant: infection (UTI, pneumonia)",
      "Watch for HONK (HHS): >600 mg/dL glucose, no/minimal ketones, profound dehydration — no insulin bolus",
    ],
  },
  {
    id: "sepsis",
    name: "Sepsis & Septic Shock",
    urgency: "critical",
    color: "#EF4444",
    description:
      "Life-threatening organ dysfunction caused by dysregulated host response to infection. Septic shock = sepsis + vasopressor requirement + lactate >2 mmol/L.",
    steps: [
      {
        step: 1,
        title: "Recognize Sepsis — qSOFA Screen",
        details:
          "qSOFA: RR ≥22, Altered mentation, SBP ≤100. ≥2 points = high risk. SOFA score for organ dysfunction. SIRS no longer used for diagnosis.",
        urgent: true,
      },
      {
        step: 2,
        title: "Hour-1 Bundle — Measure Lactate",
        details: "Serum lactate. Lactate >2 = sepsis. Lactate >4 mmol/L = severe (gives criteria for septic shock even without hypotension).",
        urgent: true,
      },
      {
        step: 3,
        title: "Blood Cultures Before Antibiotics",
        details: "Take 2 sets of blood cultures from 2 sites. Do NOT delay antibiotics more than 45 min for cultures.",
      },
      {
        step: 4,
        title: "Broad-Spectrum Antibiotics — Within 1 Hour",
        details:
          "Empirical antibiotics within 1 hour of recognition. Typical: piperacillin-tazobactam + gentamicin OR meropenem. Add vancomycin if MRSA suspected.",
        drugs: ["Piperacillin-Tazobactam 4.5g IV q8h", "Gentamicin 5 mg/kg IV q24h", "Meropenem 1g IV q8h (severe/resistant)"],
        urgent: true,
      },
      {
        step: 5,
        title: "IV Fluid Resuscitation",
        details: "30 mL/kg 0.9% NaCl or balanced crystalloid within 3 hours. Reassess with dynamic measures (SV variation, PLR test).",
        drugs: ["0.9% NaCl OR Hartmann's — 30 mL/kg over 3h"],
      },
      {
        step: 6,
        title: "Vasopressors if Hypotension Persists",
        details: "Start vasopressors if MAP <65 mmHg after fluids. Norepinephrine = FIRST-LINE vasopressor. Target MAP ≥65 mmHg.",
        drugs: ["Norepinephrine 0.01–0.5 mcg/kg/min IV infusion"],
      },
      {
        step: 7,
        title: "Source Control",
        details: "Remove source: drain abscess, remove infected catheter/device, treat infection focus. Critical within 6–12 hours.",
      },
      {
        step: 8,
        title: "Hydrocortisone in Refractory Shock",
        details: "If norepinephrine >0.25 mcg/kg/min: hydrocortisone 200 mg/day IV continuous or 50 mg q6h.",
        drugs: ["Hydrocortisone 200 mg/day IV"],
      },
    ],
    keyDrugs: [
      { name: "Broad-spectrum antibiotic", dose: "Per local protocol", route: "IV — within 1 hour" },
      { name: "Norepinephrine", dose: "0.01–0.5 mcg/kg/min", route: "IV infusion via central line" },
      { name: "Crystalloid (0.9% NaCl / Hartmann's)", dose: "30 mL/kg", route: "IV — within 3 hours" },
    ],
    keyPoints: [
      "1-hour bundle: Lactate, cultures, antibiotics, fluids",
      "Every hour delay in antibiotics increases mortality ~7%",
      "Norepinephrine first-line vasopressor (not dopamine)",
      "Avoid fluid overload — reassess after each bolus",
      "Screen all ICU patients daily with SOFA score",
    ],
  },
  {
    id: "acute-mi",
    name: "Acute Myocardial Infarction (STEMI)",
    urgency: "critical",
    color: "#EF4444",
    description:
      "STEMI = ST elevation MI. Time-sensitive emergency: door-to-balloon <90 min. Primary PCI is preferred reperfusion strategy.",
    steps: [
      {
        step: 1,
        title: "Recognize STEMI",
        details:
          "12-lead ECG: ST elevation ≥1 mm in 2+ contiguous limb leads, or ≥2 mm in V1-V6, or LBBB (new or presumed new). Symptoms: chest pain/pressure, radiation to jaw/arm, dyspnea, diaphoresis.",
        urgent: true,
      },
      {
        step: 2,
        title: "MONA-B — Initial Management",
        details:
          "M: Monitor (ECG, O2 sat, BP). O: Oxygen if SpO2 <94%. N: Nitrates (SL GTN) if not hypotensive. A: Aspirin 300 mg (chewed). B: Beta-blocker if no contraindication.",
        drugs: ["Aspirin 300 mg PO (chewed)", "GTN SL 0.4 mg — repeat every 5 min x3"],
        urgent: true,
      },
      {
        step: 3,
        title: "Dual Antiplatelet Therapy (DAPT)",
        details:
          "Aspirin 300mg PLUS P2Y12 inhibitor. For PCI: Ticagrelor 180 mg loading or Clopidogrel 600 mg. For thrombolysis: Clopidogrel 300 mg.",
        drugs: ["Ticagrelor 180 mg PO (preferred)", "OR Clopidogrel 600 mg PO"],
      },
      {
        step: 4,
        title: "Anticoagulation",
        details: "Unfractionated heparin (UFH) bolus + infusion. Or enoxaparin for thrombolysis-managed patients.",
        drugs: ["UFH 60 units/kg IV bolus (max 5000U)", "Enoxaparin 1mg/kg SC BD"],
      },
      {
        step: 5,
        title: "Primary PCI — Door-to-Balloon <90 min",
        details: "Activate cath lab immediately. Primary PCI preferred over thrombolysis if available within 120 min.",
        urgent: true,
      },
      {
        step: 6,
        title: "Thrombolysis if PCI Unavailable",
        details: "If primary PCI not available within 120 min: Tenecteplase IV (weight-based), or streptokinase. Contraindications: prior intracranial hemorrhage, stroke <3 months, active bleeding.",
        drugs: ["Tenecteplase IV (weight-based bolus)", "Streptokinase 1.5 million U over 60 min"],
      },
    ],
    keyDrugs: [
      { name: "Aspirin", dose: "300 mg loading, then 75 mg OD", route: "PO (chewed)" },
      { name: "Ticagrelor", dose: "180 mg loading, then 90 mg BD", route: "PO" },
      { name: "UFH", dose: "60 U/kg bolus + infusion", route: "IV" },
      { name: "Morphine", dose: "2–4 mg", route: "IV (for pain)" },
    ],
    keyPoints: [
      "Door-to-balloon time <90 min is the key quality metric",
      "AVOID oxygen if SpO2 ≥94% — hyperoxia worsens outcomes",
      "Posterior MI: ST depression in V1-V4 + ST elevation in V7-V9",
      "RV infarction: ST elevation in V4R — avoid nitrates (preload dependent)",
      "Post-MI: Start ACEi, beta-blocker, statin, DAPT, aldosterone antagonist",
    ],
  },
  {
    id: "status-epilepticus",
    name: "Status Epilepticus",
    urgency: "critical",
    color: "#EF4444",
    description:
      "Continuous seizure >5 minutes, or 2+ seizures without recovery. Treat as emergency — risk of permanent neurological injury after 30 min.",
    steps: [
      {
        step: 1,
        title: "Secure Safety & Time the Seizure",
        details: "Protect patient from injury. Position lateral (recovery). Note time of seizure start. Call for help.",
      },
      {
        step: 2,
        title: "ABCs — Oxygen",
        details: "Maintain airway. High-flow O2. Pulse oximetry. Prepare suction. IV/IO access. Glucose check — treat hypoglycemia immediately.",
        urgent: true,
      },
      {
        step: 3,
        title: "Phase 1 (0–5 min): Benzodiazepine — FIRST-LINE",
        details:
          "IV access available: Lorazepam 0.1 mg/kg IV (max 4 mg; can repeat once). No IV: Midazolam 10 mg buccal/IM, or Diazepam 10–20 mg PR.",
        drugs: [
          "Lorazepam 0.1 mg/kg IV (max 4 mg) — FIRST-LINE",
          "Midazolam 10 mg buccal/IM (if no IV)",
          "Diazepam 10 mg IV or PR",
        ],
        urgent: true,
      },
      {
        step: 4,
        title: "Phase 2 (5–30 min): Second-Line if Seizure Continues",
        details:
          "Levetiracetam 60 mg/kg IV over 10 min (max 4500 mg), OR Sodium Valproate 40 mg/kg IV over 10 min (max 3000 mg), OR Phenytoin 20 mg/kg IV at max 50 mg/min.",
        drugs: [
          "Levetiracetam 60 mg/kg IV over 10 min",
          "Sodium Valproate 40 mg/kg IV over 10 min",
          "Phenytoin 20 mg/kg IV (max 50 mg/min) + ECG monitor",
        ],
      },
      {
        step: 5,
        title: "Phase 3 (>30 min): Refractory — Anaesthesia",
        details: "RSI + general anaesthesia: propofol or thiopental. ICU admission. Continuous EEG monitoring.",
        drugs: ["Propofol infusion", "Thiopental 100–250 mg IV", "Midazolam infusion"],
        urgent: true,
      },
      {
        step: 6,
        title: "Identify & Treat Cause",
        details: "Common causes: low antiepileptic levels, alcohol withdrawal, CNS infection, metabolic (hypoglycemia, hyponatremia), stroke, tumour. CT brain + LP if indicated.",
      },
    ],
    keyDrugs: [
      { name: "Lorazepam", dose: "0.1 mg/kg IV (max 4 mg)", route: "IV — repeat once" },
      { name: "Levetiracetam", dose: "60 mg/kg IV (max 4500 mg)", route: "IV over 10 min" },
      { name: "Sodium Valproate", dose: "40 mg/kg IV (max 3000 mg)", route: "IV over 10 min" },
    ],
    keyPoints: [
      "Time counts: every minute of continuous seizure worsens prognosis",
      "Treat hypoglycemia IMMEDIATELY — glucose 50 mL 50% dextrose IV",
      "Lorazepam preferred over diazepam (longer duration of action)",
      "EEG monitoring mandatory in refractory status",
      "Causes: HIIT ME = Hypoglycemia, Infection, Ischemia, Trauma, Metabolic, Epilepsy (low levels)",
    ],
  },
  {
    id: "asthma-acute",
    name: "Acute Severe Asthma",
    urgency: "high",
    color: "#F97316",
    description:
      "Acute asthma exacerbation with features of severity. Life-threatening asthma can be fatal without aggressive treatment.",
    steps: [
      {
        step: 1,
        title: "Assess Severity",
        details:
          "Moderate: Increasing symptoms, PEFR 50-75%. Severe: Cannot complete sentence, RR>25, HR>110, PEFR 33-50%. Life-threatening: SpO2<92%, silent chest, cyanosis, bradycardia, PEFR<33%.",
        urgent: true,
      },
      {
        step: 2,
        title: "High-Flow Oxygen",
        details: "Target SpO2 94–98%. High-flow O2 via mask. Caution: only high SpO2 target in asthma (not COPD).",
        drugs: ["O2 — target SpO2 94-98%"],
        urgent: true,
      },
      {
        step: 3,
        title: "Back-to-Back SABA Nebulization",
        details: "Salbutamol 2.5–5 mg nebulized. Repeat every 20 min for 3 doses, then assess. Drive with O2 if possible.",
        drugs: ["Salbutamol 2.5–5 mg nebulized every 20 min x3"],
        urgent: true,
      },
      {
        step: 4,
        title: "Ipratropium Bromide",
        details: "Add ipratropium (anticholinergic) to nebulizer for severe/life-threatening asthma.",
        drugs: ["Ipratropium 0.5 mg nebulized — mix with salbutamol"],
      },
      {
        step: 5,
        title: "Systemic Corticosteroids",
        details: "Prednisolone 40–50 mg PO OR hydrocortisone 100 mg IV. Continue for 5 days.",
        drugs: ["Prednisolone 40 mg PO", "Hydrocortisone 100 mg IV (if unable to swallow)"],
      },
      {
        step: 6,
        title: "Magnesium Sulphate (Life-threatening)",
        details: "IV MgSO4 2g over 20 min. For life-threatening/inadequate response to bronchodilators.",
        drugs: ["Magnesium Sulphate 2g IV over 20 min"],
      },
      {
        step: 7,
        title: "Escalation",
        details: "No improvement after above: IV salbutamol, aminophylline IV, senior review. Consider ICU for intubation (last resort — high complication rate in asthma).",
      },
    ],
    keyDrugs: [
      { name: "Salbutamol", dose: "2.5–5 mg every 20 min x3", route: "Nebulization" },
      { name: "Ipratropium", dose: "0.5 mg with salbutamol", route: "Nebulization" },
      { name: "Prednisolone", dose: "40–50 mg OD x5 days", route: "PO" },
      { name: "MgSO4", dose: "2g over 20 min", route: "IV (life-threatening)" },
    ],
    keyPoints: [
      "PEFR is objective measure of severity — measure and record",
      "Silent chest = NO air movement = life-threatening emergency",
      "Intubation in asthma is high risk — exhaust medical management first",
      "O2 target 94-98% (NOT 88-92% like COPD)",
      "Discharge: only when PEFR >75%, SpO2 >94% on room air, symptoms minimal",
    ],
  },
];

export function getProtocolById(id: string): EmergencyProtocol | undefined {
  return emergencyProtocols.find((p) => p.id === id);
}
