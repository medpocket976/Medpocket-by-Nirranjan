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
  "Lipids",
  "Glucose",
  "Iron Studies",
  "Inflammatory",
  "Tumour Markers",
  "Urine",
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
  // Lipids
  { id: "total-cholesterol", name: "Total Cholesterol", abbreviation: "TC", group: "Lipids", normalRangeAdult: "<200 mg/dL (desirable)", criticalHigh: ">300 mg/dL", unit: "mg/dL", interpretation: "<200: Desirable. 200–239: Borderline high. ≥240: High. Low HDL (<40 mg/dL men, <50 women) = independent CV risk factor.", clinicalSignificance: "Primary CV risk assessment. Statin therapy target: LDL <70 mg/dL in high risk, <100 in moderate risk." },
  { id: "ldl", name: "LDL Cholesterol", abbreviation: "LDL-C", group: "Lipids", normalRangeAdult: "<100 mg/dL (optimal)", criticalHigh: ">190 mg/dL", unit: "mg/dL", interpretation: "<100 optimal; <70 for very high CV risk; 100-129 near optimal; 130-159 borderline; ≥160 high.", clinicalSignificance: "Primary target for statin therapy. FH: LDL >190 without secondary cause. Calculated: TC - HDL - (TG/5)." },
  { id: "hdl", name: "HDL Cholesterol", abbreviation: "HDL-C", group: "Lipids", normalRangeAdult: "Male: >40 mg/dL | Female: >50 mg/dL", unit: "mg/dL", interpretation: "<40 (men)/<50 (women): Low — CV risk factor. ≥60 mg/dL: Protective against CAD. Raised by: exercise, alcohol (moderate), statins (small).", clinicalSignificance: "Reverse cholesterol transport. Low HDL = independent risk factor for CAD even with normal LDL." },
  { id: "triglycerides", name: "Triglycerides", abbreviation: "TG", group: "Lipids", normalRangeAdult: "<150 mg/dL", criticalHigh: ">500 mg/dL (pancreatitis risk)", unit: "mg/dL", interpretation: "<150: Normal. 150-199: Borderline. 200-499: High. ≥500: Very high — acute pancreatitis risk. Raised by: DM, alcohol, obesity, hypothyroidism, nephrotic syndrome.", clinicalSignificance: "TG >500 mg/dL → aggressive treatment (fibrate, omega-3) to prevent pancreatitis." },
  // Glucose
  { id: "fasting-glucose", name: "Fasting Blood Glucose", abbreviation: "FBG", group: "Glucose", normalRangeAdult: "70–99 mg/dL (3.9–5.5 mmol/L)", normalRangePediatric: "60–100 mg/dL", criticalLow: "<50 mg/dL (symptomatic hypoglycaemia)", criticalHigh: ">400 mg/dL", unit: "mg/dL", interpretation: "Normal: <100. Impaired fasting: 100–125 (prediabetes). Diabetes: ≥126 mg/dL on two occasions. Random ≥200 + symptoms = DM.", clinicalSignificance: "Diagnostic for diabetes. Whipple's triad for hypoglycaemia: symptoms + low glucose + relief with glucose." },
  { id: "hba1c", name: "Glycated Haemoglobin", abbreviation: "HbA1c", group: "Glucose", normalRangeAdult: "<5.7% (non-diabetic)", unit: "%", interpretation: "<5.7%: Normal. 5.7–6.4%: Prediabetes. ≥6.5%: Diabetes (on two occasions). Reflects average blood glucose over 2–3 months. Target in DM: <7% (ADA) or <6.5% (AACE).", clinicalSignificance: "Gold standard for long-term glycaemic control. Not affected by recent meals. Falsely low in haemolytic anaemia, sickle cell. Falsely high in iron deficiency." },
  { id: "random-glucose", name: "Random Blood Glucose", abbreviation: "RBG", group: "Glucose", normalRangeAdult: "<140 mg/dL (2h post-prandial)", criticalHigh: ">600 mg/dL (HHS risk)", unit: "mg/dL", interpretation: "≥200 mg/dL with symptoms = diabetes. 140–199 = impaired glucose tolerance. Post-prandial target in DM: <180 mg/dL.", clinicalSignificance: "OGTT: 75g glucose, measure at 0 and 2h. 2h ≥200 = DM; 140–199 = IGT." },
  // Iron Studies
  { id: "serum-iron", name: "Serum Iron", abbreviation: "Fe", group: "Iron Studies", normalRangeAdult: "60–170 µg/dL", unit: "µg/dL", interpretation: "Low: Iron deficiency, anemia of chronic disease, pregnancy. High: Haemochromatosis, liver disease, haemolysis, sideroblastic anaemia.", clinicalSignificance: "Must interpret with TIBC and ferritin for full picture. Serum iron alone is unreliable — affected by recent meals, diurnal variation." },
  { id: "tibc", name: "Total Iron Binding Capacity", abbreviation: "TIBC", group: "Iron Studies", normalRangeAdult: "250–370 µg/dL", unit: "µg/dL", interpretation: "High TIBC + low ferritin + low Fe = iron deficiency anaemia. Low TIBC = anemia of chronic disease (ferritin normal/high). TIBC = transferrin x 2.5.", clinicalSignificance: "Transferrin saturation = (Fe/TIBC) x 100. Normal 20–50%. <16% = iron deficiency; >60% = iron overload." },
  { id: "ferritin", name: "Serum Ferritin", abbreviation: "Ferritin", group: "Iron Studies", normalRangeAdult: "Male: 12–300 ng/mL | Female: 12–150 ng/mL", criticalLow: "<12 ng/mL (depleted stores)", unit: "ng/mL", interpretation: "Best single test for iron deficiency. Low = depleted iron stores. High = iron overload (haemochromatosis), acute phase reactant (infection, inflammation), liver disease, malignancy.", clinicalSignificance: "Ferritin is an acute-phase protein — can be normal/high in iron deficiency with concurrent inflammation. Low ferritin is virtually diagnostic of iron deficiency." },
  { id: "b12", name: "Vitamin B12", abbreviation: "B12", group: "Iron Studies", normalRangeAdult: "200–900 pg/mL", criticalLow: "<100 pg/mL (deficiency)", unit: "pg/mL", interpretation: "Low: Pernicious anaemia (anti-IF antibodies), vegan diet, gastric surgery, metformin use, ileal disease (Crohn's). High: liver disease, myeloproliferative disorders.", clinicalSignificance: "Deficiency causes macrocytic anaemia + subacute combined degeneration of spinal cord (dorsal columns + corticospinal tract). Treat with IM B12 if malabsorption." },
  { id: "folate", name: "Serum Folate", abbreviation: "Folate", group: "Iron Studies", normalRangeAdult: "2.7–17 ng/mL", unit: "ng/mL", interpretation: "Low: Dietary deficiency, alcohol, methotrexate, trimethoprim, coeliac disease, pregnancy. Causes megaloblastic anaemia without neurological features.", clinicalSignificance: "Neural tube defects prevented by folic acid supplementation periconceptionally (5 mg if high risk). Always check B12 first — treating folate deficiency alone can worsen B12 neuropathy." },
  // Inflammatory
  { id: "crp", name: "C-Reactive Protein", abbreviation: "CRP", group: "Inflammatory", normalRangeAdult: "<5 mg/L (some labs <10 mg/L)", criticalHigh: ">200 mg/L (severe sepsis)", unit: "mg/L", interpretation: "Rises within 6 hours of inflammation, peaks at 48h. >200: severe bacterial infection/sepsis. 10–200: bacterial infection, major surgery, AMI. <10: viral infection, SLE (often low despite activity).", clinicalSignificance: "More sensitive and faster-rising than ESR. Serial measurements track treatment response. hsCRP (<3 mg/L) used for CV risk stratification." },
  { id: "esr", name: "Erythrocyte Sedimentation Rate", abbreviation: "ESR", group: "Inflammatory", normalRangeAdult: "Male: <15 mm/h | Female: <20 mm/h (higher in elderly)", unit: "mm/h", interpretation: "Elevated: Infection, inflammation, malignancy, anaemia, pregnancy, renal failure. Very high (>100): TB, malignancy, giant cell arteritis, multiple myeloma, SBE.", clinicalSignificance: "Non-specific but valuable. Giant cell arteritis: ESR >50 (often >100) + headache = empiric steroids before biopsy. Westergren method standard." },
  { id: "procalcitonin", name: "Procalcitonin", abbreviation: "PCT", group: "Inflammatory", normalRangeAdult: "<0.1 ng/mL", criticalHigh: ">2 ng/mL (likely bacterial sepsis)", unit: "ng/mL", interpretation: "<0.1: bacterial infection unlikely. 0.1–0.25: bacterial infection unlikely (consider antibiotic discontinuation). 0.25–0.5: possible. >0.5: likely bacterial infection. >2: probable sepsis.", clinicalSignificance: "Better than CRP for guiding antibiotic therapy (antibiotic stewardship). PCT-guided protocols reduce antibiotic duration in RTI and sepsis." },
  // Cardiac
  { id: "bnp", name: "B-Type Natriuretic Peptide", abbreviation: "BNP / NT-proBNP", group: "Cardiac", normalRangeAdult: "BNP: <100 pg/mL | NT-proBNP: <300 pg/mL", criticalHigh: "BNP >400: Heart failure likely", unit: "pg/mL", interpretation: "BNP 100–400: Grey zone. >400: Heart failure very likely. NT-proBNP age-adjusted. Elevated in: heart failure, PE, pulmonary hypertension, RV strain, renal failure.", clinicalSignificance: "Best test for diagnosing dyspnoea due to heart failure. Normal BNP virtually excludes HF. Used for risk stratification and monitoring treatment." },
  { id: "ddimer", name: "D-Dimer", abbreviation: "D-Dimer", group: "Cardiac", normalRangeAdult: "<500 ng/mL FEU (lab-specific)", unit: "ng/mL FEU", interpretation: "Normal D-dimer in low/intermediate probability = excellent NPV for VTE. Elevated in: PE, DVT, DIC, post-surgery, pregnancy, infection, malignancy, trauma. Not specific.", clinicalSignificance: "Highly sensitive (>95%) but not specific. Use only to RULE OUT PE/DVT in low/intermediate probability. Do NOT use to diagnose. Age-adjusted threshold = age × 10 µg/L (>50 years)." },
  { id: "ck", name: "Creatine Kinase", abbreviation: "CK / CPK", group: "Cardiac", normalRangeAdult: "Male: 38–174 U/L | Female: 26–140 U/L", criticalHigh: ">10,000 U/L (rhabdomyolysis)", unit: "U/L", interpretation: "CK-MB >6% total CK = cardiac. Total CK elevated in: MI (CK-MB), muscle disease (CK-MM), brain injury (CK-BB). Rhabdomyolysis: >10x ULN — risk of AKI.", clinicalSignificance: "CK-MB used before troponin era for MI. Now troponin preferred. CK monitoring in statin myopathy: withhold statin if >4x ULN." },
  // Tumour Markers
  { id: "psa", name: "Prostate-Specific Antigen", abbreviation: "PSA", group: "Tumour Markers", normalRangeAdult: "<4 ng/mL (age-dependent)", unit: "ng/mL", interpretation: "<4: Normal (consider age-adjusted). 4–10: Grey zone (free:total PSA ratio helpful). >10: High suspicion for prostate Ca. Elevated also in: BPH, prostatitis, DRE, UTI.", clinicalSignificance: "Not a perfect cancer marker. PSA velocity (rise >0.75 ng/mL/year) and free:total ratio (<10% = cancer) improve specificity. PSA <0.1 after radical prostatectomy = remission." },
  { id: "cea", name: "Carcinoembryonic Antigen", abbreviation: "CEA", group: "Tumour Markers", normalRangeAdult: "<2.5 ng/mL (non-smoker) | <5 ng/mL (smoker)", unit: "ng/mL", interpretation: "Elevated in: colorectal Ca, gastric Ca, pancreatic Ca, breast Ca, lung Ca, smoking, liver disease, IBD. Not diagnostic — used for monitoring.", clinicalSignificance: "Post-operative surveillance for colorectal cancer recurrence. Rising CEA = recurrence until proven otherwise. Not a screening tool." },
  { id: "ca125", name: "Cancer Antigen 125", abbreviation: "CA-125", group: "Tumour Markers", normalRangeAdult: "<35 U/mL", unit: "U/mL", interpretation: "Elevated in: Ovarian Ca, endometriosis, PID, liver disease, heart failure, pregnancy, menstruation. Sensitivity 80% for advanced ovarian Ca; lower for early disease.", clinicalSignificance: "Used with USS for ovarian Ca monitoring. RMI (Risk of Malignancy Index) = USS + CA-125 + menopausal status. Not recommended for screening in general population." },
  { id: "afp", name: "Alpha-Fetoprotein", abbreviation: "AFP", group: "Tumour Markers", normalRangeAdult: "<10 ng/mL (adults)", unit: "ng/mL", interpretation: "Elevated in: HCC (hepatocellular carcinoma), testicular germ cell tumours (non-seminoma), liver disease (hepatitis, cirrhosis), pregnancy (neural tube defects if low; Down syndrome if low).", clinicalSignificance: "HCC screening in cirrhosis (AFP + USS 6-monthly). Testicular cancer: AFP elevated in non-seminomatous GCT (NOT pure seminoma). Maternal: MSAFP screening at 15-20 weeks." },
  // Urine
  { id: "urine-protein", name: "Urine Protein / Albumin-Creatinine Ratio", abbreviation: "ACR / PCR", group: "Urine", normalRangeAdult: "ACR: <3 mg/mmol (<30 mg/g)", unit: "mg/mmol", interpretation: "3–30: Moderately increased (microalbuminuria). >30: Severely increased (macroalbuminuria/proteinuria). Dipstick detects >300 mg/L. 24h protein >3.5g/day = nephrotic range.", clinicalSignificance: "ACR is the preferred test for CKD monitoring and diabetic nephropathy screening. First morning urine preferred. Rising ACR = renal disease progression." },
  { id: "urine-dipstick", name: "Urine Dipstick Analysis", abbreviation: "UA Dipstick", group: "Urine", normalRangeAdult: "Negative for blood, protein, glucose, ketones, nitrites, leukocytes", unit: "qualitative", interpretation: "Nitrites + leukocytes = UTI. Blood: haematuria (stone, UTI, malignancy) or myoglobinuria. Glucose: DM (renal threshold 180 mg/dL). Ketones: DKA, starvation.", clinicalSignificance: "Haematuria: any blood on dipstick must be confirmed by microscopy. Persistent unexplained haematuria needs cystoscopy to exclude bladder cancer." },
  { id: "urine-creatinine", name: "Urine Creatinine Clearance / eGFR", abbreviation: "CrCl / eGFR", group: "Urine", normalRangeAdult: "eGFR: >60 mL/min/1.73m² (CKD staged below)", unit: "mL/min/1.73m²", interpretation: "CKD staging: G1 ≥90, G2 60-89, G3a 45-59, G3b 30-44, G4 15-29, G5 <15 (renal failure). Cockroft-Gault: CrCl = (140-age) × weight / (72 × SCr) [× 0.85 for females].", clinicalSignificance: "CKD-EPI equation preferred for eGFR calculation. Drug dosing adjusted based on eGFR (e.g., metformin: stop if eGFR <30; LMWH: adjust if <30)." },
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
