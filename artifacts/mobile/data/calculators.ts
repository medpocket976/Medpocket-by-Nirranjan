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
  {
    id: "drug-dose",
    name: "Pediatric Drug Dose Calculator",
    abbreviation: "Drug Dose",
    description: "Calculates weight-based drug doses for common pediatric and adult drugs using mg/kg guidelines.",
    fields: [
      {
        id: "drug",
        label: "Select Drug",
        type: "select",
        options: [
          { label: "Paracetamol (15 mg/kg)", value: 0 },
          { label: "Ibuprofen (10 mg/kg)", value: 1 },
          { label: "Amoxicillin (25 mg/kg)", value: 2 },
          { label: "Amoxicillin-Clavulanate (25 mg/kg amox)", value: 3 },
          { label: "Cetirizine (0.25 mg/kg)", value: 4 },
          { label: "Salbutamol nebule (0.15 mg/kg, min 2.5 mg)", value: 5 },
          { label: "Prednisolone (1 mg/kg)", value: 6 },
          { label: "Dexamethasone croup (0.15 mg/kg)", value: 7 },
          { label: "Epinephrine IM anaphylaxis (0.01 mg/kg)", value: 8 },
          { label: "Diazepam rectal/IV (0.3 mg/kg)", value: 9 },
          { label: "Midazolam buccal (0.3 mg/kg)", value: 10 },
          { label: "Ceftriaxone IV (50 mg/kg)", value: 11 },
          { label: "Metronidazole (7.5 mg/kg)", value: 12 },
          { label: "Gentamicin (7.5 mg/kg)", value: 13 },
          { label: "Morphine IV (0.1 mg/kg)", value: 14 },
          { label: "Atropine IV (0.02 mg/kg)", value: 15 },
          { label: "Adenosine IV (0.1 mg/kg first dose)", value: 16 },
          { label: "Magnesium Sulfate IV (0.2 mL/kg of 50%)", value: 17 },
          { label: "Ondansetron (0.15 mg/kg)", value: 18 },
          { label: "Domperidone (0.25 mg/kg)", value: 19 },
        ],
        defaultValue: 0,
      },
      {
        id: "weight",
        label: "Patient Weight",
        type: "number",
        unit: "kg",
        min: 1,
        max: 150,
        placeholder: "e.g. 20",
      },
    ],
    calculate: (values) => {
      const weight = values.weight ?? 10;
      const drug = values.drug ?? 0;

      const drugs = [
        { name: "Paracetamol", dose: 15, unit: "mg", maxSingle: 1000, maxDaily: 4000, freq: "every 4–6h", route: "PO/IV/PR", info: "Max 1g per dose, 4g/day adults. Max 3g/day in liver disease." },
        { name: "Ibuprofen", dose: 10, unit: "mg", maxSingle: 400, maxDaily: 2400, freq: "every 6–8h", route: "PO", info: "Give with food. Avoid if < 3 months or renal impairment." },
        { name: "Amoxicillin", dose: 25, unit: "mg", maxSingle: 500, maxDaily: 1500, freq: "every 8h", route: "PO", info: "Standard dose. Double for severe/resistant infections (50 mg/kg/day)." },
        { name: "Amoxicillin-Clavulanate", dose: 25, unit: "mg", maxSingle: 875, maxDaily: 2625, freq: "every 8–12h", route: "PO", info: "Dose based on amoxicillin component. Use 7:1 or 14:1 ratio formulation." },
        { name: "Cetirizine", dose: 0.25, unit: "mg", maxSingle: 10, maxDaily: 10, freq: "OD", route: "PO", info: "For children 2–6: max 5mg/day. Over 6 years: max 10mg/day." },
        { name: "Salbutamol (nebulized)", dose: 0.15, unit: "mg", maxSingle: 5, maxDaily: 20, freq: "every 20 min x3 in acute attack", route: "Nebulized", info: "Minimum dose 2.5 mg. Max 5 mg per nebule. Dilute to 3–4 mL with NS." },
        { name: "Prednisolone", dose: 1, unit: "mg", maxSingle: 60, maxDaily: 60, freq: "OD in the morning", route: "PO", info: "Asthma: 1–2 mg/kg (max 40–60 mg). Nephrotic syndrome: 2 mg/kg/day for 4 weeks." },
        { name: "Dexamethasone (croup)", dose: 0.15, unit: "mg", maxSingle: 10, maxDaily: 10, freq: "Single dose", route: "PO/IM/IV", info: "Single dose for croup. Oral and IV equally effective." },
        { name: "Epinephrine IM (anaphylaxis)", dose: 0.01, unit: "mg", maxSingle: 0.5, maxDaily: 2, freq: "every 5–15 min PRN", route: "IM anterolateral thigh", info: "Use 1:1000 solution (1 mg/mL). Max dose 0.5 mg. Repeat every 5–15 min if needed." },
        { name: "Diazepam (seizure)", dose: 0.3, unit: "mg", maxSingle: 10, maxDaily: 30, freq: "Once; can repeat once", route: "IV/rectal", info: "IV: give slowly. Rectal: use 0.5 mg/kg. Monitor respiratory rate." },
        { name: "Midazolam (buccal)", dose: 0.3, unit: "mg", maxSingle: 10, maxDaily: 10, freq: "Once; can repeat once", route: "Buccal", info: "First-line for prolonged seizures. Place between cheek and gum. Onset 5–10 min." },
        { name: "Ceftriaxone IV", dose: 50, unit: "mg", maxSingle: 2000, maxDaily: 4000, freq: "OD (BD for meningitis)", route: "IV/IM", info: "Meningitis: 100 mg/kg/day divided BD (max 4g/day). Do NOT mix with calcium-containing fluids." },
        { name: "Metronidazole IV", dose: 7.5, unit: "mg", maxSingle: 500, maxDaily: 1500, freq: "every 8h", route: "IV/PO", info: "Anaerobic and protozoal infections. Max 500 mg per dose." },
        { name: "Gentamicin IV", dose: 7.5, unit: "mg", maxSingle: 480, maxDaily: 480, freq: "OD (extended interval)", route: "IV", info: "Once-daily dosing. Therapeutic drug monitoring required. Monitor renal function and levels." },
        { name: "Morphine IV", dose: 0.1, unit: "mg", maxSingle: 10, maxDaily: 40, freq: "every 2–4h PRN", route: "IV slow push", info: "Titrate to pain. Have naloxone ready. Monitor respiratory rate. Start lower in opioid-naive." },
        { name: "Atropine IV (bradycardia)", dose: 0.02, unit: "mg", maxSingle: 0.5, maxDaily: 3, freq: "every 3–5 min (ACLS)", route: "IV", info: "Minimum dose 0.1 mg (avoid paradoxical bradycardia). Max single dose: child 0.5 mg, adult 1 mg." },
        { name: "Adenosine IV", dose: 0.1, unit: "mg", maxSingle: 6, maxDaily: 30, freq: "Rapid IV bolus; may repeat 0.2 mg/kg", route: "Rapid IV + flush", info: "Give as rapid IV bolus in antecubital vein with 20 mL NS flush. Half-life < 10 seconds." },
        { name: "Magnesium Sulfate 50%", dose: 0.2, unit: "mL", maxSingle: 20, maxDaily: 60, freq: "As needed (eclampsia/status)", route: "IV over 20 min (diluted)", info: "0.2 mL/kg of 50% MgSO4 = ~0.1 mmol/kg. Dilute before giving. Monitor DTRs and RR." },
        { name: "Ondansetron IV", dose: 0.15, unit: "mg", maxSingle: 8, maxDaily: 32, freq: "every 8h", route: "IV/PO", info: "For CINV and post-op nausea. Monitor QTc interval." },
        { name: "Domperidone PO", dose: 0.25, unit: "mg", maxSingle: 10, maxDaily: 30, freq: "every 8h before meals", route: "PO", info: "Preferred prokinetic in Parkinson's patients. Avoid IV form. Max 80 mg/day in adults." },
      ];

      const d = drugs[drug];
      const rawDose = weight * d.dose;
      const calculatedDose = Math.round(Math.min(rawDose, d.maxSingle) * 100) / 100;
      const score = calculatedDose;

      let color = "#009DB5";
      let label = `${d.name}: ${calculatedDose} ${d.unit}`;
      let interpretation = `Dose: ${d.dose} ${d.unit}/kg × ${weight} kg = ${calculatedDose} ${d.unit} (capped at max ${d.maxSingle} ${d.unit}).\n\nFrequency: ${d.freq}\nRoute: ${d.route}\nMax daily: ${d.maxDaily} ${d.unit}`;
      let action = d.info;

      if (weight < 3) { color = "#EF4444"; label = "Weight too low — verify"; }
      else if (weight > 100) { color = "#F59E0B"; label = `${d.name}: ${calculatedDose} ${d.unit} (adult max applied)`; }

      return { score, label, interpretation, action, color };
    },
    reference: "BNF for Children, Harriet Lane Handbook, UpToDate Pediatric Dosing",
  },
  // ─────────────────── ANAESTHESIA CALCULATORS ───────────────────
  {
    id: "rsi-calculator",
    name: "RSI Drug Calculator",
    abbreviation: "RSI",
    description: "Calculates drug doses for Rapid Sequence Induction (RSI): induction agent + neuromuscular blocker based on patient weight.",
    fields: [
      {
        id: "weight",
        label: "Patient Weight",
        type: "number",
        unit: "kg",
        min: 3,
        max: 200,
        placeholder: "e.g. 70",
      },
      {
        id: "induction",
        label: "Induction Agent",
        type: "select",
        options: [
          { label: "Propofol (1.5–2.5 mg/kg)", value: 0 },
          { label: "Ketamine (1.5–2 mg/kg) — haemodynamic instability", value: 1 },
          { label: "Thiopentone (4–5 mg/kg) — raised ICP", value: 2 },
          { label: "Etomidate (0.3 mg/kg) — cardiac compromise", value: 3 },
        ],
        defaultValue: 0,
      },
      {
        id: "nmb",
        label: "Neuromuscular Blocker",
        type: "select",
        options: [
          { label: "Suxamethonium 1.5 mg/kg — standard RSI", value: 0 },
          { label: "Rocuronium 1.2 mg/kg — MH / sux CI (need sugammadex)", value: 1 },
          { label: "Suxamethonium 2 mg/kg — paediatric / laryngospasm", value: 2 },
        ],
        defaultValue: 0,
      },
      {
        id: "opioid",
        label: "Pre-intubation Opioid",
        type: "select",
        options: [
          { label: "Fentanyl 1.5 mcg/kg (blunt laryngoscopy response)", value: 0 },
          { label: "Fentanyl 2 mcg/kg (high-risk haemodynamics)", value: 1 },
          { label: "None (pure RSI — no opioid)", value: 2 },
        ],
        defaultValue: 0,
      },
    ],
    calculate: (values) => {
      const wt = values.weight ?? 70;

      const inductionAgents = [
        { name: "Propofol", dose: 2.0, unit: "mg", maxDose: 200, concentration: "10 mg/mL (1%)", note: "Reduce to 1–1.5 mg/kg in elderly, compromised, or if opioid given first. Pain on injection — use large vein." },
        { name: "Ketamine", dose: 1.5, unit: "mg", maxDose: 200, concentration: "10 mg/mL", note: "Co-administer midazolam 0.05 mg/kg to reduce emergence reactions. Preserves BP — ideal in shock/trauma." },
        { name: "Thiopentone", dose: 4.5, unit: "mg", maxDose: 500, concentration: "25 mg/mL (2.5%)", note: "Reduces ICP. ABSOLUTE CI in porphyria. Alkaline — give via large vein. Do NOT use in haemodynamic instability." },
        { name: "Etomidate", dose: 0.3, unit: "mg", maxDose: 60, concentration: "2 mg/mL", note: "Most haemodynamically stable. Adrenal suppression for 6–24h. Pre-treat with fentanyl to reduce myoclonic movements." },
      ];

      const nmbAgents = [
        { name: "Suxamethonium", dose: 1.5, unit: "mg", concentration: "50 mg/mL", note: "Onset 45–60 sec. Duration 10–15 min. NO antidote — wait for spontaneous recovery. CI: burns >24h, denervation, hyperkalaemia, MH susceptibility." },
        { name: "Rocuronium (RSI)", dose: 1.2, unit: "mg", concentration: "10 mg/mL", note: "Onset ~60 sec at 1.2 mg/kg. MUST have Sugammadex 16 mg/kg immediately available for reversal. Duration 60–90 min." },
        { name: "Suxamethonium (Paeds)", dose: 2.0, unit: "mg", concentration: "50 mg/mL", note: "Paediatric / laryngospasm dose. Pre-treat with atropine 20 mcg/kg IV to prevent bradycardia." },
      ];

      const opioids = [
        { name: "Fentanyl", dose: 1.5, unit: "mcg", concentration: "50 mcg/mL", note: "Give 90 sec before laryngoscopy. Blunts haemodynamic response to intubation. Causes slight apnoea." },
        { name: "Fentanyl", dose: 2.0, unit: "mcg", concentration: "50 mcg/mL", note: "Higher dose for haemodynamic blunting. Ensure BVM and airway adjuncts ready." },
        { name: "None", dose: 0, unit: "mcg", concentration: "—", note: "Pure RSI — opioid omitted (airway emergency, no time, or specific clinical decision)." },
      ];

      const ind = inductionAgents[values.induction ?? 0];
      const nmb = nmbAgents[values.nmb ?? 0];
      const op = opioids[values.opioid ?? 0];

      const indDose = Math.min(Math.round(wt * ind.dose * 10) / 10, ind.maxDose);
      const nmbDose = Math.round(wt * nmb.dose * 10) / 10;
      const opDose = Math.round(wt * op.dose * 10) / 10;
      const indVol = Math.round((indDose / (parseFloat(ind.concentration) || 1)) * 10) / 10;
      const nmbVol = Math.round((nmbDose / (parseFloat(nmb.concentration) || 1)) * 10) / 10;
      const opVol = op.dose > 0 ? Math.round((opDose / 50) * 10) / 10 : 0;

      const color = "#009DB5";
      const label = `RSI for ${wt} kg patient`;

      const interpretationLines = [
        op.dose > 0 ? `1. ${op.name} ${opDose} ${op.unit} (${opVol} mL of ${op.concentration}) — give 90 sec before intubation` : "1. No opioid selected",
        `2. ${ind.name} ${indDose} ${ind.unit} (${indVol} mL of ${ind.concentration}) — induction`,
        `3. ${nmb.name} ${nmbDose} ${nmb.unit} (${nmbVol} mL of ${nmb.concentration}) — immediately after loss of consciousness`,
      ].join("\n");

      const actionLines = [
        ind.note,
        nmb.note,
        "\nPost-intubation: Confirm ET tube with ETCO2. Start sedation + analgesia infusion. Monitor SpO2 and ETCO2.",
      ].join("\n\n");

      return {
        score: indDose,
        label,
        interpretation: interpretationLines,
        action: actionLines,
        color,
      };
    },
    reference: "RSI guidelines: RCEM, UpToDate, Miller's Anaesthesia",
  },
  {
    id: "local-anaesthetic-dose",
    name: "Local Anaesthetic Max Dose Calculator",
    abbreviation: "LA Dose",
    description: "Calculates maximum safe dose (mg and volume) for common local anaesthetics based on patient weight and whether adrenaline is added.",
    fields: [
      {
        id: "weight",
        label: "Patient Weight",
        type: "number",
        unit: "kg",
        min: 3,
        max: 200,
        placeholder: "e.g. 70",
      },
      {
        id: "agent",
        label: "Local Anaesthetic Agent",
        type: "select",
        options: [
          { label: "Lidocaine (Lignocaine) 1% — 10 mg/mL", value: 0 },
          { label: "Lidocaine (Lignocaine) 2% — 20 mg/mL", value: 1 },
          { label: "Bupivacaine 0.25% — 2.5 mg/mL", value: 2 },
          { label: "Bupivacaine 0.5% — 5 mg/mL", value: 3 },
          { label: "Ropivacaine 0.2% — 2 mg/mL", value: 4 },
          { label: "Ropivacaine 0.5% — 5 mg/mL", value: 5 },
          { label: "Ropivacaine 0.75% — 7.5 mg/mL", value: 6 },
        ],
        defaultValue: 0,
      },
      {
        id: "adrenaline",
        label: "With Adrenaline (1:200,000)?",
        type: "select",
        options: [
          { label: "Without Adrenaline (plain)", value: 0 },
          { label: "With Adrenaline 1:200,000 (5 mcg/mL)", value: 1 },
        ],
        defaultValue: 0,
      },
    ],
    calculate: (values) => {
      const wt = values.weight ?? 70;
      const withAdr = (values.adrenaline ?? 0) === 1;

      const agents = [
        { name: "Lidocaine 1%", conc: 10, maxPlain: 3, maxAdren: 7, absMaxPlain: 200, absMaxAdren: 500 },
        { name: "Lidocaine 2%", conc: 20, maxPlain: 3, maxAdren: 7, absMaxPlain: 200, absMaxAdren: 500 },
        { name: "Bupivacaine 0.25%", conc: 2.5, maxPlain: 2, maxAdren: 2.5, absMaxPlain: 150, absMaxAdren: 200 },
        { name: "Bupivacaine 0.5%", conc: 5, maxPlain: 2, maxAdren: 2.5, absMaxPlain: 150, absMaxAdren: 200 },
        { name: "Ropivacaine 0.2%", conc: 2, maxPlain: 3, maxAdren: 3, absMaxPlain: 200, absMaxAdren: 200 },
        { name: "Ropivacaine 0.5%", conc: 5, maxPlain: 3, maxAdren: 3, absMaxPlain: 200, absMaxAdren: 200 },
        { name: "Ropivacaine 0.75%", conc: 7.5, maxPlain: 3, maxAdren: 3, absMaxPlain: 200, absMaxAdren: 200 },
      ];

      const a = agents[values.agent ?? 0];
      const mgPerKg = withAdr ? a.maxAdren : a.maxPlain;
      const absMax = withAdr ? a.absMaxAdren : a.absMaxPlain;
      const maxMg = Math.min(wt * mgPerKg, absMax);
      const maxVol = Math.round((maxMg / a.conc) * 10) / 10;
      const adrLine = withAdr ? " WITH adrenaline 1:200,000" : " WITHOUT adrenaline";
      const color = maxVol > 40 ? "#F59E0B" : "#10B981";

      return {
        score: Math.round(maxMg),
        label: `Max ${a.name}${adrLine}`,
        interpretation: `Patient: ${wt} kg\nMax dose: ${mgPerKg} mg/kg × ${wt} kg = ${Math.round(maxMg)} mg\nCapped at absolute max: ${absMax} mg\n\nMax volume of ${a.name}: ${maxVol} mL\n\nAdrenaline concentration: ${withAdr ? "5 mcg/mL (1:200,000)" : "None (plain solution)"}`,
        action: `LAST (Local Anaesthetic Systemic Toxicity) warning signs:\n• CNS: perioral tingling → tinnitus → metallic taste → confusion → seizures → coma\n• CVS: arrhythmias → cardiac arrest\n\nTreatment: Stop injection. Call for help. Intralipid 20%: 1.5 mL/kg IV bolus then 0.25 mL/kg/min infusion. Start CPR if arrest. NEVER give bupivacaine for Bier's block.`,
        color,
      };
    },
    reference: "AAGBI/ASRA Local Anaesthetic Toxicity Guidelines 2023; BNF",
  },
  {
    id: "mac-calculator",
    name: "MAC Anaesthetic Depth Calculator",
    abbreviation: "MAC",
    description: "Calculates the age-adjusted MAC (Minimum Alveolar Concentration) for common volatile anaesthetic agents and estimates the required vaporiser dial setting.",
    fields: [
      {
        id: "agent",
        label: "Volatile Agent",
        type: "select",
        options: [
          { label: "Sevoflurane (MAC = 2.0%)", value: 0 },
          { label: "Isoflurane (MAC = 1.15%)", value: 1 },
          { label: "Desflurane (MAC = 6.0%)", value: 2 },
          { label: "Halothane (MAC = 0.77%)", value: 3 },
        ],
        defaultValue: 0,
      },
      {
        id: "age",
        label: "Patient Age",
        type: "number",
        unit: "years",
        min: 0,
        max: 100,
        placeholder: "e.g. 40",
      },
      {
        id: "n2o",
        label: "N₂O in Use?",
        type: "select",
        options: [
          { label: "No N₂O — air/oxygen carrier gas", value: 0 },
          { label: "Yes — 50% N₂O (reduces MAC by ~50%)", value: 1 },
          { label: "Yes — 66% N₂O (reduces MAC by ~60%)", value: 2 },
        ],
        defaultValue: 0,
      },
      {
        id: "target",
        label: "Target Depth (× MAC)",
        type: "select",
        options: [
          { label: "0.7 MAC — light anaesthesia (with opioids/regional)", value: 7 },
          { label: "1.0 MAC — surgical anaesthesia", value: 10 },
          { label: "1.3 MAC — deep anaesthesia / bronchospasm", value: 13 },
        ],
        defaultValue: 10,
      },
    ],
    calculate: (values) => {
      const baseMac = [2.0, 1.15, 6.0, 0.77][values.agent ?? 0];
      const agentName = ["Sevoflurane", "Isoflurane", "Desflurane", "Halothane"][values.agent ?? 0];
      const age = values.age ?? 40;
      const n2oReduction = [0, 0.5, 0.6][values.n2o ?? 0];
      const targetMultiple = (values.target ?? 10) / 10;

      let ageMac = baseMac;
      if (age < 1) ageMac = baseMac * 1.3;
      else if (age <= 5) ageMac = baseMac * 1.2;
      else if (age <= 10) ageMac = baseMac * 1.1;
      else if (age >= 80) ageMac = baseMac * 0.55;
      else if (age >= 60) ageMac = baseMac * (1 - (age - 40) * 0.006);
      else ageMac = baseMac;

      const macAfterN2o = ageMac * (1 - n2oReduction);
      const targetConc = Math.round(macAfterN2o * targetMultiple * 100) / 100;
      const score = Math.round(ageMac * 100) / 100;

      const n2oText = n2oReduction > 0 ? ` with ${n2oReduction * 100}% N₂O reduction` : "";
      const color = targetConc > ageMac * 1.2 ? "#F59E0B" : "#10B981";

      return {
        score,
        label: `${agentName} for ${age}yr patient`,
        interpretation: `Base MAC (${agentName}): ${baseMac}%\nAge-adjusted MAC (${age} years): ${score}%\n\nMAC after N₂O adjustment${n2oText}: ${Math.round(macAfterN2o * 100) / 100}%\n\nTarget (${targetMultiple}× MAC): ${targetConc}% end-tidal\n\nSet vaporiser dial slightly higher than target ETAG to allow for fresh gas flow uptake.`,
        action: `Key MAC facts:\n• 1.0 MAC = prevents movement in 50% of patients to surgical stimulus\n• Maintain > 0.7 MAC to prevent awareness\n• BIS target: 40–60 for surgical anaesthesia\n• MAC reducers: age, hypothermia, opioids, N₂O, pregnancy, acidosis, lithium\n• MAC increases: hyperthermia, hyperthyroidism, chronic alcohol/drug abuse, young children`,
        color,
      };
    },
    reference: "Miller's Anaesthesia 9th Ed; Eger EI (1984); AAGBI awareness guidelines",
  },
  {
    id: "sugammadex-dose",
    name: "NMB Reversal Calculator",
    abbreviation: "NMB Reversal",
    description: "Calculates doses for reversal of neuromuscular blockade using Sugammadex (for rocuronium/vecuronium) or Neostigmine + Glycopyrrolate (for all non-depolarising NMBs).",
    fields: [
      {
        id: "weight",
        label: "Patient Weight",
        type: "number",
        unit: "kg",
        min: 10,
        max: 200,
        placeholder: "e.g. 70",
      },
      {
        id: "agent",
        label: "Neuromuscular Blocker Used",
        type: "select",
        options: [
          { label: "Rocuronium (reversible with Sugammadex or Neostigmine)", value: 0 },
          { label: "Vecuronium (reversible with Sugammadex or Neostigmine)", value: 1 },
          { label: "Atracurium / Cisatracurium (Neostigmine only — NOT Sugammadex)", value: 2 },
        ],
        defaultValue: 0,
      },
      {
        id: "depth",
        label: "Block Depth at Time of Reversal (TOF monitoring)",
        type: "select",
        options: [
          { label: "Moderate block — TOF count 2–3 (T2/T3 present)", value: 0 },
          { label: "Deep block — TOF count 0, PTC 1–2 post-tetanic count", value: 1 },
          { label: "Immediate reversal (CICO emergency / RSI dose 1.2 mg/kg rocuronium)", value: 2 },
          { label: "TOF ratio ≥ 0.4–0.9 (partial recovery — neostigmine appropriate)", value: 3 },
        ],
        defaultValue: 0,
      },
    ],
    calculate: (values) => {
      const wt = values.weight ?? 70;
      const agent = values.agent ?? 0;
      const depth = values.depth ?? 0;

      const agentName = ["Rocuronium", "Vecuronium", "Atracurium/Cisatracurium"][agent];
      const isAminosteroid = agent <= 1;

      const neostigDose = Math.min(Math.round(wt * 0.05 * 10) / 10, 5);
      const glycoDose = Math.min(Math.round(wt * 0.01 * 10) / 10, 1);
      const glycoVolHalf = Math.round((glycoDose / 0.2) * 10) / 10;

      let color = "#009DB5";
      let label = "";
      let interpretation = "";
      let action = "";
      let score = 0;

      if (!isAminosteroid || depth === 3) {
        const sugaNote = isAminosteroid ? "\n\nAlternatively: Sugammadex 2 mg/kg IV for moderate block reversal." : "";
        score = neostigDose;
        label = `Neostigmine ${neostigDose} mg + Glycopyrrolate ${glycoDose} mg`;
        interpretation = `Patient: ${wt} kg\nBlock agent: ${agentName}\n\nNeostigmine: ${Math.round(wt * 50)} mcg (${neostigDose} mg) IV — max 5 mg\nGlycopyrrolate: ${Math.round(wt * 10)} mcg (${glycoDose} mg) IV — max 1 mg\n\nGlycopyrrolate volume (0.2 mg/mL): ${glycoVolHalf} mL${sugaNote}`;
        action = "Give simultaneously (or glycopyrrolate 1 min before). Only effective when TOF ≥ 2 twitches present. Confirm reversal: TOF ratio > 0.9 on quantitative monitor OR sustained 5-second head lift. Do NOT extubate with residual block.";
        color = "#10B981";
      } else if (depth === 0) {
        const sugaDose = Math.round(wt * 2);
        const sugaVol = Math.round((sugaDose / 200) * 10) / 10;
        score = sugaDose;
        label = `Sugammadex ${sugaDose} mg IV`;
        interpretation = `Patient: ${wt} kg | ${agentName} | Moderate block (TOF 2–3)\n\nSugammadex: 2 mg/kg = ${sugaDose} mg IV\nVolume (200 mg/2 mL): ${sugaVol} mL\n\nExpected full reversal within 2–3 minutes.\n\nAlternative: Neostigmine ${neostigDose} mg + Glycopyrrolate ${glycoDose} mg IV (if Sugammadex unavailable).`;
        action = "Give as IV bolus. Confirm TOF ratio > 0.9 before extubation. Do NOT re-dose rocuronium within 24h (sugammadex-complex still circulating) — use suxamethonium if re-intubation needed. Advise patients using hormonal contraceptives to use additional contraception for 7 days.";
        color = "#10B981";
      } else if (depth === 1) {
        const sugaDose = Math.round(wt * 4);
        const sugaVol = Math.round((sugaDose / 200) * 10) / 10;
        score = sugaDose;
        label = `Sugammadex ${sugaDose} mg IV`;
        interpretation = `Patient: ${wt} kg | ${agentName} | Deep block (PTC 1–2)\n\nSugammadex: 4 mg/kg = ${sugaDose} mg IV\nVolume (200 mg/2 mL): ${sugaVol} mL\n\nExpected full reversal within 3 minutes.\n\nNeostigmine is NOT effective at this depth of block.`;
        action = "Sugammadex ONLY at this depth — neostigmine is ineffective with PTC < 2. Confirm reversal with quantitative TOF monitor (ratio > 0.9). Monitor for re-curarisation if large residual drug load.";
        color = "#F59E0B";
      } else {
        const sugaDose = Math.round(wt * 16);
        const sugaVol = Math.round((sugaDose / 200) * 10) / 10;
        score = sugaDose;
        label = `Sugammadex ${sugaDose} mg IV — CICO EMERGENCY`;
        interpretation = `Patient: ${wt} kg | CICO Emergency Reversal\n\nSugammadex: 16 mg/kg = ${sugaDose} mg IV\nVolume (200 mg/2 mL): ${sugaVol} mL\n\nThis reverses RSI-dose rocuronium (1.2 mg/kg) within 3 minutes.\n\nThis is a LIFE-SAVING DOSE for cannot intubate cannot oxygenate (CICO) emergencies.`;
        action = "EMERGENCY: Give immediately as IV bolus. This is the CICO rescue dose. Simultaneously call for surgical airway help. Patient should recover adequate spontaneous ventilation within 3 minutes. Document the emergency and consider anaesthetic incident report.";
        color = "#EF4444";
      }

      return { score, label, interpretation, action, color };
    },
    reference: "AAGBI / DAS Guidelines; Bridion (Sugammadex) SPC; Miller's Anaesthesia",
  },
];

export function getCalculatorById(id: string): Calculator | undefined {
  return calculators.find((c) => c.id === id);
}
