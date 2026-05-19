export interface CalculatorField {
  id: string;
  label: string;
  type: "number" | "select" | "checkbox";
  unit?: string;
  min?: number;
  max?: number;
  options?: { label: string; value: number }[];
  defaultValue?: number;
  placeholder?: string;
}

export interface CalculatorResult {
  score: number;
  label: string;
  interpretation: string;
  action?: string;
  color: string;
}

export interface Calculator {
  id: string;
  name: string;
  abbreviation?: string;
  description: string;
  fields: CalculatorField[];
  calculate: (values: Record<string, number>) => CalculatorResult;
  reference: string;
}

export const calculators: Calculator[] = [
  {
    id: "bmi",
    name: "Body Mass Index",
    abbreviation: "BMI",
    description: "Calculates BMI from weight and height to categorize weight status.",
    fields: [
      { id: "weight", label: "Weight", type: "number", unit: "kg", min: 20, max: 300, placeholder: "e.g. 70" },
      { id: "height", label: "Height", type: "number", unit: "cm", min: 100, max: 250, placeholder: "e.g. 175" },
    ],
    calculate: (values) => {
      const bmi = values.weight / Math.pow(values.height / 100, 2);
      const score = Math.round(bmi * 10) / 10;
      if (bmi < 18.5)
        return { score, label: "Underweight", interpretation: "BMI < 18.5: Underweight. Consider nutritional assessment.", action: "Nutritional support recommended", color: "#3B82F6" };
      if (bmi < 25)
        return { score, label: "Normal Weight", interpretation: "BMI 18.5–24.9: Normal weight. Maintain healthy lifestyle.", action: "Maintain current weight", color: "#10B981" };
      if (bmi < 30)
        return { score, label: "Overweight", interpretation: "BMI 25–29.9: Overweight. Lifestyle modifications recommended.", action: "Lifestyle modification advised", color: "#F59E0B" };
      if (bmi < 35)
        return { score, label: "Obese Class I", interpretation: "BMI 30–34.9: Obese Class I. Weight management program.", action: "Weight management program", color: "#F97316" };
      if (bmi < 40)
        return { score, label: "Obese Class II", interpretation: "BMI 35–39.9: Obese Class II. Consider pharmacotherapy.", action: "Pharmacotherapy ± bariatric evaluation", color: "#EF4444" };
      return { score, label: "Obese Class III", interpretation: "BMI ≥ 40: Morbid Obesity. Bariatric surgery evaluation.", action: "Bariatric surgery evaluation", color: "#DC2626" };
    },
    reference: "WHO BMI Classification",
  },
  {
    id: "gcs",
    name: "Glasgow Coma Scale",
    abbreviation: "GCS",
    description: "Assesses level of consciousness based on eye, verbal, and motor responses.",
    fields: [
      {
        id: "eye",
        label: "Eye Opening (E)",
        type: "select",
        options: [
          { label: "Spontaneous (4)", value: 4 },
          { label: "To voice (3)", value: 3 },
          { label: "To pain (2)", value: 2 },
          { label: "None (1)", value: 1 },
        ],
        defaultValue: 4,
      },
      {
        id: "verbal",
        label: "Verbal Response (V)",
        type: "select",
        options: [
          { label: "Oriented (5)", value: 5 },
          { label: "Confused (4)", value: 4 },
          { label: "Words only (3)", value: 3 },
          { label: "Sounds (2)", value: 2 },
          { label: "None (1)", value: 1 },
        ],
        defaultValue: 5,
      },
      {
        id: "motor",
        label: "Motor Response (M)",
        type: "select",
        options: [
          { label: "Obeys commands (6)", value: 6 },
          { label: "Localizes pain (5)", value: 5 },
          { label: "Withdraws from pain (4)", value: 4 },
          { label: "Flexion / Decorticate (3)", value: 3 },
          { label: "Extension / Decerebrate (2)", value: 2 },
          { label: "None (1)", value: 1 },
        ],
        defaultValue: 6,
      },
    ],
    calculate: (values) => {
      const score = (values.eye ?? 4) + (values.verbal ?? 5) + (values.motor ?? 6);
      if (score >= 13)
        return { score, label: "Mild Brain Injury", interpretation: "GCS 13–15: Mild. Monitor closely.", action: "Monitor, CT if indicated", color: "#10B981" };
      if (score >= 9)
        return { score, label: "Moderate Brain Injury", interpretation: "GCS 9–12: Moderate. Hospital admission required.", action: "Admit to hospital, neurosurgery review", color: "#F59E0B" };
      return { score, label: "Severe Brain Injury", interpretation: "GCS ≤ 8: Severe. Intubation likely required. 'Eight, intubate!'", action: "Intubation, ICU admission, urgent CT head", color: "#EF4444" };
    },
    reference: "Teasdale & Jennett, Lancet 1974",
  },
  {
    id: "curb65",
    name: "Community-Acquired Pneumonia",
    abbreviation: "CURB-65",
    description: "Predicts mortality in community-acquired pneumonia and guides site of care.",
    fields: [
      { id: "confusion", label: "Confusion (new onset)", type: "checkbox", defaultValue: 0 },
      { id: "urea", label: "Urea > 7 mmol/L (BUN > 20 mg/dL)", type: "checkbox", defaultValue: 0 },
      { id: "rr", label: "Respiratory Rate ≥ 30/min", type: "checkbox", defaultValue: 0 },
      { id: "bp", label: "Low BP (SBP < 90 or DBP ≤ 60 mmHg)", type: "checkbox", defaultValue: 0 },
      { id: "age", label: "Age ≥ 65 years", type: "checkbox", defaultValue: 0 },
    ],
    calculate: (values) => {
      const score = (values.confusion ?? 0) + (values.urea ?? 0) + (values.rr ?? 0) + (values.bp ?? 0) + (values.age ?? 0);
      if (score <= 1)
        return { score, label: "Low Risk", interpretation: "CURB-65 0–1: 30-day mortality ~2%. Outpatient treatment appropriate.", action: "Home treatment with oral antibiotics", color: "#10B981" };
      if (score === 2)
        return { score, label: "Moderate Risk", interpretation: "CURB-65 2: 30-day mortality ~9%. Consider hospital admission.", action: "Consider short hospital stay", color: "#F59E0B" };
      return { score, label: "High Risk", interpretation: `CURB-65 ${score}: 30-day mortality ${score === 3 ? "~17%" : score === 4 ? "~41%" : "~57%"}. Severe pneumonia.`, action: "Hospital admission required. ICU if score ≥4", color: "#EF4444" };
    },
    reference: "Lim et al, Thorax 2003",
  },
  {
    id: "chads2vasc",
    name: "Stroke Risk in AF",
    abbreviation: "CHA₂DS₂-VASc",
    description: "Calculates stroke risk in atrial fibrillation to guide anticoagulation.",
    fields: [
      { id: "chf", label: "Congestive Heart Failure / LV dysfunction (1 pt)", type: "checkbox", defaultValue: 0 },
      { id: "htn", label: "Hypertension (1 pt)", type: "checkbox", defaultValue: 0 },
      { id: "age75", label: "Age ≥ 75 years (2 pts)", type: "checkbox", defaultValue: 0 },
      { id: "dm", label: "Diabetes Mellitus (1 pt)", type: "checkbox", defaultValue: 0 },
      { id: "stroke", label: "Prior Stroke / TIA / Thromboembolism (2 pts)", type: "checkbox", defaultValue: 0 },
      { id: "vascular", label: "Vascular Disease (MI, PAD, aortic plaque) (1 pt)", type: "checkbox", defaultValue: 0 },
      { id: "age65", label: "Age 65–74 years (1 pt)", type: "checkbox", defaultValue: 0 },
      { id: "sex", label: "Female Sex (1 pt)", type: "checkbox", defaultValue: 0 },
    ],
    calculate: (values) => {
      const score =
        (values.chf ?? 0) +
        (values.htn ?? 0) +
        (values.age75 ?? 0) * 2 +
        (values.dm ?? 0) +
        (values.stroke ?? 0) * 2 +
        (values.vascular ?? 0) +
        (values.age65 ?? 0) +
        (values.sex ?? 0);
      if (score === 0)
        return { score, label: "Low Risk (Males) / No score (Females)", interpretation: "No anticoagulation needed for males. Female sex alone is NOT an indication.", action: "No anticoagulation", color: "#10B981" };
      if (score === 1)
        return { score, label: "Low-Moderate Risk", interpretation: "Score 1: Consider anticoagulation. Annual stroke risk ~1.3%.", action: "Consider anticoagulation (DOAC preferred)", color: "#F59E0B" };
      return { score, label: "High Risk", interpretation: `Score ${score}: Anticoagulation recommended. Annual stroke risk ≥2.2%.`, action: "Anticoagulation recommended (DOAC > warfarin)", color: "#EF4444" };
    },
    reference: "Lip et al, Chest 2010 / ESC Guidelines",
  },
  {
    id: "qsofa",
    name: "Quick Sepsis Score",
    abbreviation: "qSOFA",
    description: "Rapid bedside scoring tool to identify patients with suspected infection at risk of poor outcomes.",
    fields: [
      { id: "rr", label: "Respiratory Rate ≥ 22 breaths/min", type: "checkbox", defaultValue: 0 },
      { id: "gcs", label: "Altered Mentation (GCS < 15)", type: "checkbox", defaultValue: 0 },
      { id: "sbp", label: "Systolic BP ≤ 100 mmHg", type: "checkbox", defaultValue: 0 },
    ],
    calculate: (values) => {
      const score = (values.rr ?? 0) + (values.gcs ?? 0) + (values.sbp ?? 0);
      if (score < 2)
        return { score, label: "Low Risk", interpretation: "qSOFA < 2: Low risk of sepsis-related poor outcomes outside ICU.", action: "Continue monitoring, apply clinical judgment", color: "#10B981" };
      return { score, label: "High Risk — Suspect Sepsis", interpretation: `qSOFA ≥ 2: High risk of in-hospital mortality (3-14x increased risk). Sepsis likely.`, action: "Full sepsis workup: lactate, cultures, antibiotics, fluid resuscitation", color: "#EF4444" };
    },
    reference: "Seymour et al, JAMA 2016",
  },
  {
    id: "map",
    name: "Mean Arterial Pressure",
    abbreviation: "MAP",
    description: "Calculates mean arterial pressure from systolic and diastolic blood pressure.",
    fields: [
      { id: "sbp", label: "Systolic BP", type: "number", unit: "mmHg", min: 50, max: 300, placeholder: "e.g. 120" },
      { id: "dbp", label: "Diastolic BP", type: "number", unit: "mmHg", min: 30, max: 200, placeholder: "e.g. 80" },
    ],
    calculate: (values) => {
      const map = values.dbp + (values.sbp - values.dbp) / 3;
      const score = Math.round(map);
      if (score < 60)
        return { score, label: "Low MAP — Inadequate Perfusion", interpretation: `MAP ${score} mmHg: Below critical threshold. Organ perfusion compromised.`, action: "IV fluids, vasopressors if refractory. ICU assessment.", color: "#EF4444" };
      if (score <= 100)
        return { score, label: "Normal MAP", interpretation: `MAP ${score} mmHg: Normal perfusion pressure (target: 65–100 mmHg).`, action: "Adequate perfusion. Monitor for trends.", color: "#10B981" };
      return { score, label: "Hypertension", interpretation: `MAP ${score} mmHg: Elevated. Risk of hypertensive emergency if >130 mmHg.`, action: "Antihypertensive therapy. Assess for target organ damage.", color: "#F97316" };
    },
    reference: "MAP = DBP + (SBP - DBP) / 3",
  },
  {
    id: "wells-dvt",
    name: "DVT Clinical Probability",
    abbreviation: "Wells DVT",
    description: "Pre-test probability of deep vein thrombosis to guide D-dimer testing and imaging.",
    fields: [
      { id: "cancer", label: "Active cancer (treatment or palliative within 6 months) (1 pt)", type: "checkbox", defaultValue: 0 },
      { id: "paralysis", label: "Paralysis / paresis / plaster immobilization of lower extremity (1 pt)", type: "checkbox", defaultValue: 0 },
      { id: "bedridden", label: "Bedridden >3 days OR major surgery within 12 weeks (1 pt)", type: "checkbox", defaultValue: 0 },
      { id: "tenderness", label: "Localized tenderness along deep venous system (1 pt)", type: "checkbox", defaultValue: 0 },
      { id: "swollen", label: "Entire leg swollen (1 pt)", type: "checkbox", defaultValue: 0 },
      { id: "calf", label: "Calf swelling >3 cm compared to asymptomatic leg (1 pt)", type: "checkbox", defaultValue: 0 },
      { id: "pitting", label: "Pitting edema (in symptomatic leg only) (1 pt)", type: "checkbox", defaultValue: 0 },
      { id: "collateral", label: "Dilated superficial veins (non-varicose) (1 pt)", type: "checkbox", defaultValue: 0 },
      { id: "alternative", label: "Alternative diagnosis at least as likely as DVT (-2 pts)", type: "checkbox", defaultValue: 0 },
    ],
    calculate: (values) => {
      const score =
        (values.cancer ?? 0) +
        (values.paralysis ?? 0) +
        (values.bedridden ?? 0) +
        (values.tenderness ?? 0) +
        (values.swollen ?? 0) +
        (values.calf ?? 0) +
        (values.pitting ?? 0) +
        (values.collateral ?? 0) -
        (values.alternative ?? 0) * 2;
      if (score <= 0)
        return { score, label: "Low Probability", interpretation: "Wells ≤0: DVT unlikely (~5%). D-dimer: if negative, DVT excluded.", action: "D-dimer test — if negative, DVT excluded. If positive, ultrasound.", color: "#10B981" };
      if (score <= 2)
        return { score, label: "Moderate Probability", interpretation: "Wells 1–2: Moderate probability (~17%). D-dimer then ultrasound.", action: "D-dimer. If elevated, compression ultrasound.", color: "#F59E0B" };
      return { score, label: "High Probability", interpretation: `Wells ≥3: High probability (~53%). Proceed directly to imaging.`, action: "Proceed to compression ultrasound. If negative, repeat in 1 week.", color: "#EF4444" };
    },
    reference: "Wells et al, Lancet 1997",
  },
  {
    id: "apgar",
    name: "APGAR Score",
    abbreviation: "APGAR",
    description: "Assesses newborn health at 1 and 5 minutes after delivery.",
    fields: [
      {
        id: "appearance",
        label: "Appearance (Skin Color)",
        type: "select",
        options: [
          { label: "Blue/pale all over (0)", value: 0 },
          { label: "Body pink, extremities blue (1)", value: 1 },
          { label: "Completely pink (2)", value: 2 },
        ],
        defaultValue: 2,
      },
      {
        id: "pulse",
        label: "Pulse (Heart Rate)",
        type: "select",
        options: [
          { label: "Absent (0)", value: 0 },
          { label: "< 100 bpm (1)", value: 1 },
          { label: "≥ 100 bpm (2)", value: 2 },
        ],
        defaultValue: 2,
      },
      {
        id: "grimace",
        label: "Grimace (Reflex Irritability)",
        type: "select",
        options: [
          { label: "No response (0)", value: 0 },
          { label: "Grimace only (1)", value: 1 },
          { label: "Cough/sneeze/cry (2)", value: 2 },
        ],
        defaultValue: 2,
      },
      {
        id: "activity",
        label: "Activity (Muscle Tone)",
        type: "select",
        options: [
          { label: "Limp (0)", value: 0 },
          { label: "Some flexion (1)", value: 1 },
          { label: "Active motion (2)", value: 2 },
        ],
        defaultValue: 2,
      },
      {
        id: "respiration",
        label: "Respiration",
        type: "select",
        options: [
          { label: "Absent (0)", value: 0 },
          { label: "Weak/irregular (1)", value: 1 },
          { label: "Strong cry (2)", value: 2 },
        ],
        defaultValue: 2,
      },
    ],
    calculate: (values) => {
      const score = (values.appearance ?? 2) + (values.pulse ?? 2) + (values.grimace ?? 2) + (values.activity ?? 2) + (values.respiration ?? 2);
      if (score >= 7)
        return { score, label: "Normal Newborn", interpretation: `APGAR ${score}/10: Normal. Routine newborn care.`, action: "Routine care, breastfeeding support", color: "#10B981" };
      if (score >= 4)
        return { score, label: "Moderate Depression", interpretation: `APGAR ${score}/10: Moderate neonatal depression. Active stimulation and oxygen needed.`, action: "Stimulate, supplemental O2, reassess at 5 minutes", color: "#F59E0B" };
      return { score, label: "Severe Depression", interpretation: `APGAR ${score}/10: Severe neonatal depression. Immediate resuscitation.`, action: "Immediate neonatal resuscitation (NRP protocol)", color: "#EF4444" };
    },
    reference: "Virginia Apgar, 1952",
  },
];

export function getCalculatorById(id: string): Calculator | undefined {
  return calculators.find((c) => c.id === id);
}
