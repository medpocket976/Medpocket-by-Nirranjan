export interface LabValue {
  id: string;
  name: string;
  abbreviation: string;
  group: string;
  normalRangeAdult: string;
  normalRangePediatric?: string;
  criticalLow?: string;
  criticalHigh?: string;
  unit: string;
  interpretation: string;
  clinicalSignificance: string;
}

export const LAB_GROUPS = [
  "All",
  "CBC",
  "Electrolytes",
  "LFT",
  "RFT",
  "ABG",
  "Coagulation",
  "Cardiac",
  "Thyroid",
];

export const labValues: LabValue[] = [
  // CBC
  {
    id: "hb",
    name: "Hemoglobin",
    abbreviation: "Hb",
    group: "CBC",
    normalRangeAdult: "Male: 13.5–17.5 g/dL | Female: 12–15.5 g/dL",
    normalRangePediatric: "Neonates: 14–24 g/dL | Children: 11–16 g/dL",
    criticalLow: "< 7 g/dL",
    criticalHigh: "> 20 g/dL",
    unit: "g/dL",
    interpretation:
      "Low: Anemia (classify by MCV/MCH). High: Polycythemia vera, dehydration, COPD.",
    clinicalSignificance:
      "Essential for oxygen-carrying capacity assessment. Guides transfusion decisions (transfuse if Hb <7 or <8 in cardiac patients).",
  },
  {
    id: "wbc",
    name: "White Blood Cell Count",
    abbreviation: "WBC / TLC",
    group: "CBC",
    normalRangeAdult: "4,000–11,000 /µL",
    normalRangePediatric: "Neonates: 9,000–30,000 | Children: 6,000–17,000 /µL",
    criticalLow: "< 2,000 /µL",
    criticalHigh: "> 30,000 /µL",
    unit: "/µL (cells/mm³)",
    interpretation:
      "Leukocytosis: Infection, inflammation, leukemia, steroids. Leukopenia: Viral infection, aplastic anemia, chemotherapy.",
    clinicalSignificance:
      "Differential count (neutrophils, lymphocytes, monocytes, eosinophils, basophils) helps identify infection type and immune status.",
  },
  {
    id: "platelets",
    name: "Platelets",
    abbreviation: "PLT",
    group: "CBC",
    normalRangeAdult: "150,000–400,000 /µL",
    criticalLow: "< 50,000 /µL (bleeding risk); < 10,000 /µL (spontaneous bleeding)",
    criticalHigh: "> 1,000,000 /µL",
    unit: "/µL",
    interpretation:
      "Thrombocytopenia: ITP, DIC, heparin-induced, aplastic anemia. Thrombocytosis: Reactive (infection, iron deficiency), essential thrombocythemia.",
    clinicalSignificance:
      "Platelet count <50,000: avoid elective surgery. <10,000: prophylactic transfusion recommended.",
  },
  {
    id: "mcv",
    name: "Mean Corpuscular Volume",
    abbreviation: "MCV",
    group: "CBC",
    normalRangeAdult: "80–100 fL",
    unit: "fL",
    interpretation:
      "Microcytic (<80): Iron deficiency, thalassemia, anemia of chronic disease. Normocytic (80–100): Blood loss, hemolysis, early deficiency. Macrocytic (>100): B12/folate deficiency, hypothyroidism, alcohol.",
    clinicalSignificance: "Key index for classifying anemia etiology.",
  },
  {
    id: "hematocrit",
    name: "Hematocrit",
    abbreviation: "Hct / PCV",
    group: "CBC",
    normalRangeAdult: "Male: 41–53% | Female: 36–46%",
    unit: "%",
    interpretation: "Parallels hemoglobin. Hematocrit ≈ 3× Hb value. High in polycythemia, dehydration.",
    clinicalSignificance: "PCV >50% increases thrombosis risk.",
  },
  // Electrolytes
  {
    id: "sodium",
    name: "Sodium",
    abbreviation: "Na+",
    group: "Electrolytes",
    normalRangeAdult: "135–145 mEq/L",
    criticalLow: "< 120 mEq/L",
    criticalHigh: "> 160 mEq/L",
    unit: "mEq/L (mmol/L)",
    interpretation:
      "Hyponatremia (<135): SIADH, hypothyroidism, heart failure, cirrhosis, adrenal insufficiency. Hypernatremia (>145): Dehydration, diabetes insipidus.",
    clinicalSignificance:
      "Hyponatremia correction: max 8–10 mEq/L per day to prevent osmotic demyelination syndrome.",
  },
  {
    id: "potassium",
    name: "Potassium",
    abbreviation: "K+",
    group: "Electrolytes",
    normalRangeAdult: "3.5–5.0 mEq/L",
    criticalLow: "< 2.5 mEq/L",
    criticalHigh: "> 6.5 mEq/L",
    unit: "mEq/L",
    interpretation:
      "Hypokalemia (<3.5): Vomiting, diuretics, diarrhea (U waves on ECG, weakness). Hyperkalemia (>5.0): AKI, K+ sparing diuretics, ACEi/ARB, Addison's (peaked T waves, then PR prolongation, QRS widening).",
    clinicalSignificance:
      "Critical hyperkalemia: Calcium gluconate IV (membrane stabilization), insulin+dextrose (intracellular shift), salbutamol nebulization, furosemide, sodium bicarbonate, kayexalate, dialysis.",
  },
  {
    id: "chloride",
    name: "Chloride",
    abbreviation: "Cl-",
    group: "Electrolytes",
    normalRangeAdult: "96–106 mEq/L",
    unit: "mEq/L",
    interpretation:
      "Hypochloremia: Vomiting, NG tube drainage, metabolic alkalosis. Hyperchloremia: Metabolic acidosis, dehydration.",
    clinicalSignificance: "Used to calculate anion gap and diagnose acid-base disorders.",
  },
  {
    id: "bicarbonate",
    name: "Bicarbonate (Serum)",
    abbreviation: "HCO3-",
    group: "Electrolytes",
    normalRangeAdult: "22–28 mEq/L",
    unit: "mEq/L",
    interpretation:
      "Low: Metabolic acidosis (DKA, lactic acidosis, AKI, diarrhea). High: Metabolic alkalosis (vomiting, diuretics).",
    clinicalSignificance: "Key parameter in acid-base interpretation alongside pH, pCO2.",
  },
  // LFT
  {
    id: "alt",
    name: "Alanine Aminotransferase",
    abbreviation: "ALT (SGPT)",
    group: "LFT",
    normalRangeAdult: "7–56 U/L",
    criticalHigh: "> 1000 U/L",
    unit: "U/L",
    interpretation:
      "Most liver-specific enzyme. Elevated in: hepatitis (viral, autoimmune, drug-induced), alcoholic liver disease, NAFLD. Very high (>1000): viral hepatitis, ischemic hepatitis.",
    clinicalSignificance: "ALT > AST suggests non-alcoholic cause. AST:ALT >2:1 suggests alcoholic hepatitis.",
  },
  {
    id: "ast",
    name: "Aspartate Aminotransferase",
    abbreviation: "AST (SGOT)",
    group: "LFT",
    normalRangeAdult: "10–40 U/L",
    unit: "U/L",
    interpretation:
      "Less liver-specific (also in muscle, heart). Elevated in: liver disease, myocardial infarction, muscle disease.",
    clinicalSignificance: "AST:ALT ratio >2:1 with absolute values <300 → alcoholic hepatitis.",
  },
  {
    id: "bilirubin",
    name: "Total Bilirubin",
    abbreviation: "T.Bili",
    group: "LFT",
    normalRangeAdult: "0.2–1.2 mg/dL",
    normalRangePediatric: "Neonates: up to 15 mg/dL (physiological jaundice)",
    criticalHigh: "> 12 mg/dL in neonates",
    unit: "mg/dL",
    interpretation:
      "Pre-hepatic (unconjugated): Hemolysis, G6PD deficiency. Hepatic: Hepatitis, cirrhosis. Post-hepatic (conjugated): Obstructive jaundice (stones, cancer).",
    clinicalSignificance:
      "Direct bilirubin (conjugated) >50%: obstructive or hepatocellular cause. Indirect (unconjugated) elevated: hemolytic or Gilbert syndrome.",
  },
  {
    id: "albumin",
    name: "Albumin",
    abbreviation: "Alb",
    group: "LFT",
    normalRangeAdult: "3.5–5.0 g/dL",
    criticalLow: "< 2.0 g/dL",
    unit: "g/dL",
    interpretation:
      "Low: Liver disease (reduced synthesis), nephrotic syndrome (loss), malnutrition, inflammatory states.",
    clinicalSignificance:
      "Corrected calcium = Ca + 0.8 × (4 - Albumin). Low albumin increases drug activity of highly protein-bound drugs.",
  },
  {
    id: "alp",
    name: "Alkaline Phosphatase",
    abbreviation: "ALP",
    group: "LFT",
    normalRangeAdult: "44–147 U/L",
    unit: "U/L",
    interpretation:
      "Elevated in: Cholestatic liver disease, bone disease (Paget's, osteomalacia), pregnancy. Moderate elevation: Hepatic metastases.",
    clinicalSignificance:
      "ALP + GGT elevated: suggests biliary obstruction. ALP elevated alone: bone disease likely.",
  },
  // RFT
  {
    id: "creatinine",
    name: "Serum Creatinine",
    abbreviation: "SCr",
    group: "RFT",
    normalRangeAdult: "Male: 0.7–1.3 mg/dL | Female: 0.6–1.1 mg/dL",
    criticalHigh: "> 10 mg/dL",
    unit: "mg/dL",
    interpretation:
      "Elevated in AKI, CKD, dehydration, rhabdomyolysis. May be normal despite 50% renal function loss (low sensitivity early).",
    clinicalSignificance:
      "Used to calculate eGFR (CKD-EPI). Creatinine doubles when GFR halves. eGFR < 15: dialysis needed.",
  },
  {
    id: "urea",
    name: "Blood Urea Nitrogen / Urea",
    abbreviation: "BUN / Urea",
    group: "RFT",
    normalRangeAdult: "BUN: 7–20 mg/dL | Urea: 15–45 mg/dL",
    unit: "mg/dL",
    interpretation:
      "Elevated (azotemia): Pre-renal (dehydration, GI bleed), renal (AKI/CKD), post-renal (obstruction). BUN:Creatinine ratio >20:1 → pre-renal.",
    clinicalSignificance: "BUN:Creatinine >20:1 = pre-renal; 10-20:1 = renal; <10:1 = post-hepatic or dialysis.",
  },
  // ABG
  {
    id: "ph",
    name: "Arterial pH",
    abbreviation: "pH",
    group: "ABG",
    normalRangeAdult: "7.35–7.45",
    criticalLow: "< 7.20",
    criticalHigh: "> 7.60",
    unit: "units",
    interpretation:
      "< 7.35: Acidosis. > 7.45: Alkalosis. pH 7.35–7.45 with abnormal PCO2/HCO3: compensated disorder.",
    clinicalSignificance: "Step 1 of ABG interpretation: determine acidosis or alkalosis.",
  },
  {
    id: "pco2",
    name: "Partial Pressure CO2 (Arterial)",
    abbreviation: "PaCO2",
    group: "ABG",
    normalRangeAdult: "35–45 mmHg",
    criticalLow: "< 20 mmHg",
    criticalHigh: "> 70 mmHg",
    unit: "mmHg",
    interpretation:
      "High (>45): Respiratory acidosis (hypoventilation, COPD, sedation). Low (<35): Respiratory alkalosis (hyperventilation, anxiety, PE).",
    clinicalSignificance: "Step 2 of ABG: determines respiratory component.",
  },
  {
    id: "po2",
    name: "Partial Pressure O2 (Arterial)",
    abbreviation: "PaO2",
    group: "ABG",
    normalRangeAdult: "80–100 mmHg",
    criticalLow: "< 60 mmHg",
    unit: "mmHg",
    interpretation:
      "< 80: Hypoxemia. < 60: Respiratory failure (Type 1 = low PaO2, normal PaCO2; Type 2 = low PaO2, high PaCO2).",
    clinicalSignificance: "A-a gradient = PAO2 - PaO2. Normal <15 mmHg. Elevated in V/Q mismatch, shunt, diffusion impairment.",
  },
  // Coagulation
  {
    id: "pt",
    name: "Prothrombin Time",
    abbreviation: "PT / INR",
    group: "Coagulation",
    normalRangeAdult: "PT: 11–13.5 seconds | INR: 0.8–1.2",
    criticalHigh: "INR > 5 (bleeding risk)",
    unit: "seconds / ratio",
    interpretation:
      "Prolonged PT/INR: Liver disease (reduced factor synthesis), warfarin, vitamin K deficiency, DIC, factor VII deficiency.",
    clinicalSignificance:
      "Warfarin target INR: 2–3 for most indications; 2.5–3.5 for mechanical mitral valve. INR >1.5 before procedures: correct with Vitamin K or FFP.",
  },
  {
    id: "aptt",
    name: "Activated Partial Thromboplastin Time",
    abbreviation: "APTT / PTT",
    group: "Coagulation",
    normalRangeAdult: "25–35 seconds",
    unit: "seconds",
    interpretation:
      "Prolonged: Heparin therapy, Hemophilia A & B, von Willebrand disease (severe), lupus anticoagulant, DIC.",
    clinicalSignificance:
      "Heparin monitoring: target APTT 60–100 seconds (1.5–2.5x control). If prolonged without anticoagulants: mixing study to differentiate factor deficiency vs inhibitor.",
  },
  // Cardiac
  {
    id: "troponin",
    name: "Troponin I/T (High Sensitivity)",
    abbreviation: "hsTnI / hsTnT",
    group: "Cardiac",
    normalRangeAdult: "hsTnI: <52 ng/L (male) / <16 ng/L (female)",
    criticalHigh: "> 5x URL (strongly suggests MI)",
    unit: "ng/L",
    interpretation:
      "Elevated in: MI, myocarditis, PE, sepsis, cardiomyopathy, cardiac contusion. Rise and fall pattern = acute MI.",
    clinicalSignificance:
      "High-sensitivity assay detects MI earlier (1-3 hours). Serial measurements at 0h and 1–3h rule in/out NSTEMI.",
  },
  // Thyroid
  {
    id: "tsh",
    name: "Thyroid Stimulating Hormone",
    abbreviation: "TSH",
    group: "Thyroid",
    normalRangeAdult: "0.4–4.0 mIU/L",
    unit: "mIU/L",
    interpretation:
      "High TSH: Primary hypothyroidism. Low TSH: Hyperthyroidism, secondary hypothyroidism, exogenous thyroid hormone.",
    clinicalSignificance:
      "Best initial test for thyroid disorders. TSH is very sensitive — even minor thyroid dysfunction detected early.",
  },
];

export function searchLabValues(query: string, group?: string): LabValue[] {
  const q = query.toLowerCase().trim();
  return labValues.filter((lv) => {
    const matchesGroup = !group || group === "All" || lv.group === group;
    if (!q) return matchesGroup;
    return (
      matchesGroup &&
      (lv.name.toLowerCase().includes(q) ||
        lv.abbreviation.toLowerCase().includes(q) ||
        lv.group.toLowerCase().includes(q))
    );
  });
}
