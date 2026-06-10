export type MedCalcCategory = "blood" | "fluid" | "electrolyte" | "renal";

export interface MedCalcField {
  id: string;
  label: string;
  type: "number" | "select";
  unit?: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  placeholder?: string;
  options?: { label: string; value: number }[];
}

export interface MedCalcResultRow {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface MedCalcResult {
  rows: MedCalcResultRow[];
  formula: string;
  normalRange?: string;
  interpretation: string;
  clinicalPearl: string;
  warning?: string;
}

export interface MedCalculator {
  id: string;
  name: string;
  abbreviation?: string;
  description: string;
  category: MedCalcCategory;
  color: string;
  icon: string;
  fields: MedCalcField[];
  calculate: (values: Record<string, number>) => MedCalcResult;
}

// ─── BLOOD CALCULATORS ────────────────────────────────────────────────────────

const ebv: MedCalculator = {
  id: "ebv",
  name: "Estimated Blood Volume",
  abbreviation: "EBV",
  description: "Estimates total blood volume based on weight and patient category.",
  category: "blood",
  color: "#EF4444",
  icon: "droplet",
  fields: [
    { id: "weight", label: "Body Weight", type: "number", unit: "kg", min: 0.5, max: 300, placeholder: "e.g. 70" },
    {
      id: "category",
      label: "Patient Category",
      type: "select",
      options: [
        { label: "Adult Male", value: 0 },
        { label: "Adult Female", value: 1 },
        { label: "Pediatric (>1 yr)", value: 2 },
        { label: "Neonatal (<28 days)", value: 3 },
      ],
      defaultValue: 0,
    },
  ],
  calculate: (v) => {
    const w = v.weight;
    const cat = v.category;
    const factors: Record<number, { factor: number; label: string }> = {
      0: { factor: 70, label: "Adult Male (70 mL/kg)" },
      1: { factor: 65, label: "Adult Female (65 mL/kg)" },
      2: { factor: 80, label: "Pediatric (80 mL/kg)" },
      3: { factor: 87, label: "Neonatal (85–90 mL/kg)" },
    };
    const { factor, label } = factors[cat] ?? factors[0];
    const ebv = Math.round(w * factor);
    return {
      rows: [
        { label: "Estimated Blood Volume", value: `${ebv} mL`, highlight: true },
        { label: "Factor Used", value: label },
        { label: "Weight", value: `${w} kg` },
      ],
      formula: "EBV = Weight (kg) × Volume Factor (mL/kg)",
      normalRange: "Adult Male: ~5 L | Adult Female: ~4.5 L",
      interpretation:
        ebv < 2000
          ? "Low EBV — ensure careful fluid and blood management."
          : "EBV within expected range for given patient category.",
      clinicalPearl:
        "🔑 EBV is the foundation for calculating MABL and transfusion requirements. Always recalculate for each patient.",
    };
  },
};

const mabl: MedCalculator = {
  id: "mabl",
  name: "Maximum Allowable Blood Loss",
  abbreviation: "MABL",
  description: "Calculates the maximum blood loss tolerable before transfusion is required.",
  category: "blood",
  color: "#EF4444",
  icon: "activity",
  fields: [
    { id: "weight", label: "Body Weight", type: "number", unit: "kg", min: 1, max: 300, placeholder: "e.g. 70" },
    {
      id: "category",
      label: "Patient Category",
      type: "select",
      options: [
        { label: "Adult Male", value: 0 },
        { label: "Adult Female", value: 1 },
        { label: "Pediatric", value: 2 },
        { label: "Neonatal", value: 3 },
      ],
      defaultValue: 0,
    },
    { id: "hct_start", label: "Starting Haematocrit", type: "number", unit: "%", min: 10, max: 70, placeholder: "e.g. 40", defaultValue: 40 },
    { id: "hct_target", label: "Target Haematocrit", type: "number", unit: "%", min: 10, max: 70, placeholder: "e.g. 30", defaultValue: 30 },
  ],
  calculate: (v) => {
    const factors: Record<number, number> = { 0: 70, 1: 65, 2: 80, 3: 87 };
    const ebv = v.weight * (factors[v.category] ?? 70);
    const mabl = Math.round(ebv * (v.hct_start - v.hct_target) / v.hct_start);
    const pct = Math.round((mabl / ebv) * 100);
    return {
      rows: [
        { label: "MABL", value: `${mabl} mL`, highlight: true },
        { label: "EBV Used", value: `${Math.round(ebv)} mL` },
        { label: "% of EBV", value: `${pct}%` },
        { label: "Starting Hct", value: `${v.hct_start}%` },
        { label: "Target Hct", value: `${v.hct_target}%` },
      ],
      formula: "MABL = EBV × (Hct_start − Hct_target) / Hct_start",
      interpretation:
        mabl < 500
          ? "Low MABL — this patient can tolerate minimal blood loss. High vigilance required intraoperatively."
          : mabl < 1500
          ? "Moderate MABL — plan for potential transfusion if blood loss approaches this threshold."
          : "Adequate MABL — standard precautions apply.",
      clinicalPearl:
        "🔑 Target Hct of 30% is commonly used in adults. In elderly or cardiac patients, consider triggering transfusion at Hct >30%.",
    };
  },
};

const prbc: MedCalculator = {
  id: "prbc",
  name: "pRBC Volume Calculator",
  abbreviation: "pRBC",
  description: "Calculates the volume of packed red blood cells needed to achieve a target Hb rise.",
  category: "blood",
  color: "#EF4444",
  icon: "plus-circle",
  fields: [
    { id: "weight", label: "Body Weight", type: "number", unit: "kg", min: 1, max: 300, placeholder: "e.g. 70" },
    { id: "current_hb", label: "Current Haemoglobin", type: "number", unit: "g/dL", min: 1, max: 20, placeholder: "e.g. 7", defaultValue: 7 },
    { id: "target_hb", label: "Target Haemoglobin", type: "number", unit: "g/dL", min: 1, max: 20, placeholder: "e.g. 10", defaultValue: 10 },
  ],
  calculate: (v) => {
    const delta = v.target_hb - v.current_hb;
    const vol = Math.round(v.weight * delta * 3);
    const units = Math.round(vol / 250);
    return {
      rows: [
        { label: "pRBC Volume Required", value: `${vol} mL`, highlight: true },
        { label: "Approximate Units", value: `~${units} unit(s) of pRBC` },
        { label: "Hb Rise Expected", value: `${delta.toFixed(1)} g/dL` },
        { label: "Weight", value: `${v.weight} kg` },
      ],
      formula: "Volume (mL) = Weight (kg) × ΔHb (g/dL) × 3",
      normalRange: "1 unit pRBC (~250 mL) raises Hb by ~1 g/dL in a 70 kg adult",
      interpretation:
        delta <= 0
          ? "⚠️ Target Hb is not higher than current Hb. Check values."
          : `${vol} mL of pRBC should raise Hb by approximately ${delta.toFixed(1)} g/dL.`,
      clinicalPearl:
        "🔑 Each unit of pRBC (~250 mL) typically raises Hb by 1 g/dL in a 70 kg adult. Reassess Hb 1 hour post-transfusion.",
    };
  },
};

const shockIndex: MedCalculator = {
  id: "shock-index",
  name: "Shock Index",
  abbreviation: "SI",
  description: "Rapidly identifies haemodynamic instability using heart rate and systolic BP.",
  category: "blood",
  color: "#DC2626",
  icon: "alert-triangle",
  fields: [
    { id: "hr", label: "Heart Rate", type: "number", unit: "bpm", min: 20, max: 300, placeholder: "e.g. 110", defaultValue: 80 },
    { id: "sbp", label: "Systolic Blood Pressure", type: "number", unit: "mmHg", min: 40, max: 300, placeholder: "e.g. 90", defaultValue: 120 },
  ],
  calculate: (v) => {
    const si = v.hr / v.sbp;
    const siStr = si.toFixed(2);
    let interp: string;
    let severity: string;
    if (si < 0.7) { interp = "Normal — no haemodynamic compromise."; severity = "Normal"; }
    else if (si < 0.9) { interp = "Borderline — monitor closely."; severity = "Borderline"; }
    else if (si < 1.0) { interp = "Mild shock — early intervention may be needed."; severity = "Mild Shock"; }
    else if (si < 1.2) { interp = "Moderate shock — urgent resuscitation required."; severity = "Moderate Shock"; }
    else { interp = "Severe shock — immediate resuscitation and senior review."; severity = "Severe Shock"; }
    return {
      rows: [
        { label: "Shock Index", value: siStr, highlight: true },
        { label: "Severity", value: severity },
        { label: "HR", value: `${v.hr} bpm` },
        { label: "Systolic BP", value: `${v.sbp} mmHg` },
      ],
      formula: "Shock Index = Heart Rate / Systolic BP",
      normalRange: "Normal: 0.5–0.7 | Mild Shock: 0.9–1.0 | Severe Shock: ≥1.2",
      interpretation: interp,
      clinicalPearl:
        "🔑 SI >1.0 in trauma is associated with significant haemorrhage and predicts need for massive transfusion. Act early.",
    };
  },
};

const bloodReplacement: MedCalculator = {
  id: "blood-replacement",
  name: "Blood Replacement Volume",
  abbreviation: "BRV",
  description: "Estimates blood volume needed to correct haematocrit using the Gross formula.",
  category: "blood",
  color: "#B91C1C",
  icon: "thermometer",
  fields: [
    { id: "weight", label: "Body Weight", type: "number", unit: "kg", min: 1, max: 300, placeholder: "e.g. 70" },
    {
      id: "category",
      label: "Patient Category",
      type: "select",
      options: [
        { label: "Adult Male", value: 0 },
        { label: "Adult Female", value: 1 },
        { label: "Pediatric", value: 2 },
        { label: "Neonatal", value: 3 },
      ],
      defaultValue: 0,
    },
    { id: "current_hct", label: "Current Haematocrit", type: "number", unit: "%", min: 5, max: 70, placeholder: "e.g. 25", defaultValue: 25 },
    { id: "desired_hct", label: "Desired Haematocrit", type: "number", unit: "%", min: 5, max: 70, placeholder: "e.g. 35", defaultValue: 35 },
    { id: "transfused_hct", label: "Haematocrit of pRBC", type: "number", unit: "%", min: 30, max: 100, placeholder: "e.g. 60", defaultValue: 60 },
  ],
  calculate: (v) => {
    const factors: Record<number, number> = { 0: 70, 1: 65, 2: 80, 3: 87 };
    const ebv = v.weight * (factors[v.category] ?? 70);
    const vol = Math.round(ebv * (v.desired_hct - v.current_hct) / v.transfused_hct);
    const units = Math.max(0, Math.round(vol / 250));
    return {
      rows: [
        { label: "Replacement Volume", value: `${vol} mL`, highlight: true },
        { label: "Approximate Units pRBC", value: `~${units}` },
        { label: "EBV", value: `${Math.round(ebv)} mL` },
        { label: "Current Hct", value: `${v.current_hct}%` },
        { label: "Target Hct", value: `${v.desired_hct}%` },
      ],
      formula: "BRV = EBV × (desired Hct − current Hct) / Hct of transfused blood",
      interpretation:
        vol <= 0
          ? "⚠️ No replacement needed — check values (current Hct may already meet target)."
          : `Approximately ${vol} mL of packed RBCs are needed to correct haematocrit.`,
      clinicalPearl:
        "🔑 Packed RBCs typically have a Hct of 55–70%. Always reassess Hct 1–4 hours after transfusion before giving further units.",
    };
  },
};

// ─── FLUID CALCULATORS ────────────────────────────────────────────────────────

const hollidaySegar: MedCalculator = {
  id: "holliday-segar",
  name: "Maintenance Fluid",
  abbreviation: "Holliday-Segar",
  description: "Calculates daily and hourly maintenance fluid requirements using the 100-50-20 rule.",
  category: "fluid",
  color: "#3B82F6",
  icon: "droplet",
  fields: [
    { id: "weight", label: "Body Weight", type: "number", unit: "kg", min: 0.5, max: 150, placeholder: "e.g. 20" },
  ],
  calculate: (v) => {
    const w = v.weight;
    let daily: number;
    if (w <= 10) daily = w * 100;
    else if (w <= 20) daily = 1000 + (w - 10) * 50;
    else daily = 1500 + (w - 20) * 20;
    const hourly = Math.round(daily / 24);
    const fourTwoOne = w <= 10 ? w * 4 : w <= 20 ? 40 + (w - 10) * 2 : 60 + (w - 20) * 1;
    return {
      rows: [
        { label: "Daily Fluid Requirement", value: `${Math.round(daily)} mL/day`, highlight: true },
        { label: "Hourly Rate (24hr)", value: `${hourly} mL/hr`, highlight: true },
        { label: "4-2-1 Hourly Rate", value: `${Math.round(fourTwoOne)} mL/hr` },
        { label: "Weight", value: `${w} kg` },
      ],
      formula: "<10 kg: 100 mL/kg/day | 10–20 kg: +50 mL/kg | >20 kg: +20 mL/kg",
      normalRange: "4-2-1 Rule: 4 mL/kg/hr (first 10 kg) + 2 (next 10) + 1 (each kg >20)",
      interpretation: `A ${w} kg patient requires ~${Math.round(daily)} mL of maintenance fluid per day.`,
      clinicalPearl:
        "🔑 The 4-2-1 rule gives the intraoperative hourly rate. Always adjust for fever (+12% per °C above 37°C), losses, or dehydration.",
    };
  },
};

const parkland: MedCalculator = {
  id: "parkland",
  name: "Parkland Burn Formula",
  abbreviation: "Parkland",
  description: "Calculates IV fluid resuscitation volumes for burn patients in the first 24 hours.",
  category: "fluid",
  color: "#F97316",
  icon: "zap",
  fields: [
    { id: "weight", label: "Body Weight", type: "number", unit: "kg", min: 1, max: 300, placeholder: "e.g. 70" },
    { id: "tbsa", label: "Total Burn Surface Area (TBSA)", type: "number", unit: "%", min: 1, max: 100, placeholder: "e.g. 30" },
  ],
  calculate: (v) => {
    const total = 4 * v.weight * v.tbsa;
    const first8h = total / 2;
    const next16h = total / 2;
    const rate8h = Math.round(first8h / 8);
    const rate16h = Math.round(next16h / 16);
    return {
      rows: [
        { label: "Total 24-hr Fluid", value: `${Math.round(total)} mL`, highlight: true },
        { label: "First 8 hrs", value: `${Math.round(first8h)} mL  (${rate8h} mL/hr)`, highlight: true },
        { label: "Next 16 hrs", value: `${Math.round(next16h)} mL  (${rate16h} mL/hr)` },
        { label: "TBSA Burned", value: `${v.tbsa}%` },
      ],
      formula: "4 mL × Weight (kg) × TBSA (%) = Total 24-hr Ringer's Lactate",
      normalRange: "Burns ≥15–20% TBSA in adults require IV resuscitation",
      interpretation: `Total 24-hr Ringer's Lactate: ${Math.round(total)} mL. First half in 8 hrs, second half over 16 hrs.`,
      clinicalPearl:
        "🔑 Timing starts from the time of burn, not time of admission. Target urine output: 0.5–1 mL/kg/hr adults, 1 mL/kg/hr children.",
      warning: "Parkland formula is a starting point only. Titrate to urine output and clinical response.",
    };
  },
};

const ivDripRate: MedCalculator = {
  id: "iv-drip-rate",
  name: "IV Drip Rate Calculator",
  abbreviation: "DPM",
  description: "Calculates drops per minute and mL/hr for manual IV infusion.",
  category: "fluid",
  color: "#3B82F6",
  icon: "sliders",
  fields: [
    { id: "volume", label: "Volume to Infuse", type: "number", unit: "mL", min: 1, max: 10000, placeholder: "e.g. 500" },
    { id: "time_hrs", label: "Infusion Time", type: "number", unit: "hours", min: 0.25, max: 48, placeholder: "e.g. 4", defaultValue: 4 },
    {
      id: "drop_factor",
      label: "Drop Factor",
      type: "select",
      options: [
        { label: "15 drops/mL (Standard)", value: 15 },
        { label: "20 drops/mL (Paediatric)", value: 20 },
        { label: "60 drops/mL (Micro-drip)", value: 60 },
      ],
      defaultValue: 15,
    },
  ],
  calculate: (v) => {
    const mlPerHr = v.volume / v.time_hrs;
    const dpm = (v.volume * v.drop_factor) / (v.time_hrs * 60);
    return {
      rows: [
        { label: "Drip Rate", value: `${Math.round(dpm)} drops/min`, highlight: true },
        { label: "Flow Rate", value: `${Math.round(mlPerHr)} mL/hr` },
        { label: "Volume", value: `${v.volume} mL` },
        { label: "Duration", value: `${v.time_hrs} hr` },
        { label: "Drop Factor", value: `${v.drop_factor} drops/mL` },
      ],
      formula: "DPM = (Volume × Drop Factor) / (Time in hrs × 60)",
      interpretation: `Set the infusion at ${Math.round(dpm)} drops per minute (${Math.round(mlPerHr)} mL/hr).`,
      clinicalPearl:
        "🔑 Count drops for 15 seconds and multiply by 4 to verify rate at the bedside. Gravity-fed sets vary — always check for free flow.",
    };
  },
};

const fluidDeficit: MedCalculator = {
  id: "fluid-deficit",
  name: "Fluid Deficit Calculator",
  abbreviation: "FD",
  description: "Estimates fluid deficit in dehydrated patients based on body weight and dehydration percentage.",
  category: "fluid",
  color: "#06B6D4",
  icon: "bar-chart-2",
  fields: [
    { id: "weight", label: "Body Weight", type: "number", unit: "kg", min: 0.5, max: 300, placeholder: "e.g. 10" },
    {
      id: "dehydration_pct",
      label: "Dehydration Severity",
      type: "select",
      options: [
        { label: "Mild (3%)", value: 3 },
        { label: "Moderate (6%)", value: 6 },
        { label: "Severe (9%)", value: 9 },
        { label: "Critical (12%)", value: 12 },
      ],
      defaultValue: 6,
    },
  ],
  calculate: (v) => {
    const deficit = Math.round(v.weight * v.dehydration_pct * 10);
    const half = Math.round(deficit / 2);
    const rate8 = Math.round(half / 8);
    const rate16 = Math.round(half / 16);
    return {
      rows: [
        { label: "Total Fluid Deficit", value: `${deficit} mL`, highlight: true },
        { label: "First 8 hrs (50%)", value: `${half} mL  (~${rate8} mL/hr)` },
        { label: "Next 16 hrs (50%)", value: `${half} mL  (~${rate16} mL/hr)` },
        { label: "Dehydration", value: `${v.dehydration_pct}%` },
      ],
      formula: "Deficit (mL) = Weight (kg) × % Dehydration × 10",
      normalRange: "Mild: <5% | Moderate: 5–9% | Severe: ≥10%",
      interpretation: `Total estimated fluid deficit is ${deficit} mL. Replace over 24 hours in addition to maintenance fluids.`,
      clinicalPearl:
        "🔑 In severe dehydration with shock, give 20 mL/kg NS bolus immediately, then reassess before starting deficit replacement.",
    };
  },
};

const freeWaterDeficit: MedCalculator = {
  id: "free-water-deficit",
  name: "Free Water Deficit",
  abbreviation: "FWD",
  description: "Calculates free water deficit in hypernatraemia based on serum sodium and TBW.",
  category: "fluid",
  color: "#0EA5E9",
  icon: "wind",
  fields: [
    { id: "weight", label: "Body Weight", type: "number", unit: "kg", min: 1, max: 300, placeholder: "e.g. 70" },
    {
      id: "sex",
      label: "Sex",
      type: "select",
      options: [
        { label: "Male (TBW 60%)", value: 0 },
        { label: "Female (TBW 50%)", value: 1 },
        { label: "Elderly Male (TBW 50%)", value: 2 },
        { label: "Elderly Female (TBW 45%)", value: 3 },
      ],
      defaultValue: 0,
    },
    { id: "na", label: "Serum Sodium", type: "number", unit: "mEq/L", min: 100, max: 200, placeholder: "e.g. 155", defaultValue: 155 },
  ],
  calculate: (v) => {
    const tbwFactors: Record<number, number> = { 0: 0.6, 1: 0.5, 2: 0.5, 3: 0.45 };
    const tbwFactor = tbwFactors[v.sex] ?? 0.6;
    const tbw = v.weight * tbwFactor;
    const fwd = Math.round(tbw * (v.na / 140 - 1) * 1000) / 1000;
    const correctRate = Math.round((fwd / 48) * 10) / 10;
    return {
      rows: [
        { label: "Free Water Deficit", value: `${fwd.toFixed(1)} L`, highlight: true },
        { label: "TBW", value: `${tbw.toFixed(1)} L` },
        { label: "Serum Sodium", value: `${v.na} mEq/L` },
        { label: "Correction Rate", value: `~${correctRate} L/hr (over 48 hrs)` },
      ],
      formula: "FWD = TBW × (Serum Na / 140 − 1)   |   TBW = Weight × Sex Factor",
      normalRange: "Serum Na: 135–145 mEq/L",
      interpretation:
        v.na <= 145
          ? "Serum sodium is within normal range. Free water deficit is minimal."
          : `Hypernatraemia detected. Replace ${fwd.toFixed(1)} L of free water over 48+ hours.`,
      clinicalPearl:
        "🔑 Correct hypernatraemia slowly — max 10 mEq/L/day — to prevent cerebral oedema. Use D5W or hypotonic saline.",
      warning:
        v.na > 160
          ? "⚠️ Severe hypernatraemia — urgent senior input and ICU review required."
          : undefined,
    };
  },
};

const urineOutput: MedCalculator = {
  id: "urine-output",
  name: "Urine Output Calculator",
  abbreviation: "UO",
  description: "Calculates urine output rate in mL/kg/hr to assess renal perfusion.",
  category: "fluid",
  color: "#FBBF24",
  icon: "activity",
  fields: [
    { id: "volume", label: "Urine Volume", type: "number", unit: "mL", min: 0, max: 10000, placeholder: "e.g. 200" },
    { id: "weight", label: "Body Weight", type: "number", unit: "kg", min: 0.5, max: 300, placeholder: "e.g. 70" },
    { id: "time_hrs", label: "Collection Period", type: "number", unit: "hours", min: 0.5, max: 24, placeholder: "e.g. 2", defaultValue: 2 },
  ],
  calculate: (v) => {
    const uo = v.volume / (v.weight * v.time_hrs);
    const uoStr = uo.toFixed(2);
    let interp: string;
    if (uo < 0.5) interp = "Oliguria — suspect inadequate renal perfusion or AKI. Review fluid status, BP, and medications.";
    else if (uo < 1.0) interp = "Acceptable urine output in adults. Continue monitoring.";
    else if (uo < 2.0) interp = "Good urine output. Continue current management.";
    else interp = "High urine output — consider polyuria, DI, or osmotic diuresis. Review clinical context.";
    return {
      rows: [
        { label: "Urine Output", value: `${uoStr} mL/kg/hr`, highlight: true },
        { label: "Volume Collected", value: `${v.volume} mL` },
        { label: "Collection Period", value: `${v.time_hrs} hr` },
        { label: "Body Weight", value: `${v.weight} kg` },
      ],
      formula: "UO (mL/kg/hr) = Volume (mL) / [Weight (kg) × Time (hr)]",
      normalRange: "Adult: 0.5–1 mL/kg/hr | Pediatric: 1–2 mL/kg/hr | Oliguria: <0.5 mL/kg/hr",
      interpretation: interp,
      clinicalPearl:
        "🔑 Sustained oliguria (<0.5 mL/kg/hr for >2 hrs) meets KDIGO criteria for Stage 1 AKI. Act early.",
    };
  },
};

const pediatricFluid: MedCalculator = {
  id: "pediatric-fluid",
  name: "Paediatric Fluid (4-2-1 Rule)",
  abbreviation: "4-2-1",
  description: "Calculates intraoperative hourly fluid requirements in children using the 4-2-1 rule.",
  category: "fluid",
  color: "#8B5CF6",
  icon: "heart",
  fields: [
    { id: "weight", label: "Body Weight", type: "number", unit: "kg", min: 0.5, max: 70, placeholder: "e.g. 15" },
  ],
  calculate: (v) => {
    const w = v.weight;
    let rate: number;
    if (w <= 10) rate = w * 4;
    else if (w <= 20) rate = 40 + (w - 10) * 2;
    else rate = 60 + (w - 20) * 1;
    const daily = rate * 24;
    return {
      rows: [
        { label: "Hourly Fluid Rate", value: `${Math.round(rate)} mL/hr`, highlight: true },
        { label: "Daily Equivalent", value: `${Math.round(daily)} mL/day` },
        { label: "Weight", value: `${w} kg` },
      ],
      formula: "4 mL/kg/hr (first 10 kg) + 2 mL/kg/hr (next 10 kg) + 1 mL/kg/hr (>20 kg)",
      normalRange: "4-2-1 rule provides maintenance intraoperative fluid in mL/hr",
      interpretation: `A ${w} kg child requires ${Math.round(rate)} mL/hr of maintenance intraoperative fluids.`,
      clinicalPearl:
        "🔑 Add deficit (fasting time × maintenance rate) and replace 50% in first hour, then 25% each subsequent hour for surgical patients.",
    };
  },
};

// ─── ELECTROLYTE CALCULATORS ─────────────────────────────────────────────────

const correctedSodium: MedCalculator = {
  id: "corrected-sodium",
  name: "Corrected Sodium",
  abbreviation: "Corrected Na",
  description: "Corrects measured sodium for hyperglycaemia to identify true serum sodium status.",
  category: "electrolyte",
  color: "#F59E0B",
  icon: "zap",
  fields: [
    { id: "measured_na", label: "Measured Sodium", type: "number", unit: "mEq/L", min: 100, max: 180, placeholder: "e.g. 130", defaultValue: 130 },
    { id: "glucose", label: "Blood Glucose", type: "number", unit: "mg/dL", min: 50, max: 2000, placeholder: "e.g. 400", defaultValue: 400 },
  ],
  calculate: (v) => {
    const corrected = v.measured_na + 1.6 * ((v.glucose - 100) / 100);
    let interp: string;
    if (corrected < 135) interp = "Corrected sodium is low — hyponatraemia (not masked by hyperglycaemia).";
    else if (corrected <= 145) interp = "Corrected sodium is normal. Measured low Na is due to hyperglycaemia (pseudohyponatraemia).";
    else interp = "Corrected sodium is elevated — true hypernatraemia despite measured value.";
    return {
      rows: [
        { label: "Corrected Sodium", value: `${corrected.toFixed(1)} mEq/L`, highlight: true },
        { label: "Measured Sodium", value: `${v.measured_na} mEq/L` },
        { label: "Blood Glucose", value: `${v.glucose} mg/dL` },
        { label: "Correction Applied", value: `+${(corrected - v.measured_na).toFixed(1)} mEq/L` },
      ],
      formula: "Corrected Na = Measured Na + 1.6 × [(Glucose − 100) / 100]",
      normalRange: "Normal Na: 135–145 mEq/L",
      interpretation: interp,
      clinicalPearl:
        "🔑 In severe hyperglycaemia (>400 mg/dL), use correction factor of 2.4 instead of 1.6 for greater accuracy (Hillier 1999).",
    };
  },
};

const correctedCalcium: MedCalculator = {
  id: "corrected-calcium",
  name: "Corrected Calcium",
  abbreviation: "Corrected Ca",
  description: "Adjusts total serum calcium for low albumin to identify true calcium status.",
  category: "electrolyte",
  color: "#10B981",
  icon: "shield",
  fields: [
    { id: "calcium", label: "Measured Total Calcium", type: "number", unit: "mg/dL", min: 1, max: 20, placeholder: "e.g. 7.5", defaultValue: 7 },
    { id: "albumin", label: "Serum Albumin", type: "number", unit: "g/dL", min: 0.5, max: 6, placeholder: "e.g. 2.5", defaultValue: 2 },
  ],
  calculate: (v) => {
    const corrected = v.calcium + 0.8 * (4 - v.albumin);
    let interp: string;
    if (corrected < 8.5) interp = "True hypocalcaemia — symptoms may include tetany, QT prolongation. Treat accordingly.";
    else if (corrected <= 10.5) interp = "Corrected calcium is normal. Low measured Ca is due to hypoalbuminaemia.";
    else interp = "True hypercalcaemia — investigate for primary hyperparathyroidism, malignancy, or granulomatous disease.";
    return {
      rows: [
        { label: "Corrected Calcium", value: `${corrected.toFixed(1)} mg/dL`, highlight: true },
        { label: "Measured Calcium", value: `${v.calcium} mg/dL` },
        { label: "Serum Albumin", value: `${v.albumin} g/dL` },
      ],
      formula: "Corrected Ca = Measured Ca + 0.8 × (4 − Albumin)",
      normalRange: "Normal Ca: 8.5–10.5 mg/dL | Normal Albumin: 3.5–5 g/dL",
      interpretation: interp,
      clinicalPearl:
        "🔑 For every 1 g/dL drop in albumin below 4, total calcium drops ~0.8 mg/dL. Use ionised calcium in critically ill patients for accuracy.",
    };
  },
};

const anionGap: MedCalculator = {
  id: "anion-gap",
  name: "Anion Gap",
  abbreviation: "AG",
  description: "Calculates anion gap to aid metabolic acidosis diagnosis. Includes albumin correction.",
  category: "electrolyte",
  color: "#6366F1",
  icon: "bar-chart-2",
  fields: [
    { id: "na", label: "Sodium (Na)", type: "number", unit: "mEq/L", min: 100, max: 180, placeholder: "e.g. 140", defaultValue: 140 },
    { id: "cl", label: "Chloride (Cl)", type: "number", unit: "mEq/L", min: 50, max: 150, placeholder: "e.g. 102", defaultValue: 102 },
    { id: "hco3", label: "Bicarbonate (HCO₃)", type: "number", unit: "mEq/L", min: 5, max: 40, placeholder: "e.g. 24", defaultValue: 24 },
    { id: "albumin", label: "Albumin (optional)", type: "number", unit: "g/dL", min: 0, max: 6, placeholder: "e.g. 4", defaultValue: 4 },
  ],
  calculate: (v) => {
    const ag = v.na - (v.cl + v.hco3);
    const correctedAg = ag + 2.5 * (4 - v.albumin);
    let interp: string;
    let corrInterp: string;
    if (ag <= 12) interp = "Normal anion gap (≤12). Non-AG metabolic acidosis or normal.";
    else interp = "Elevated anion gap (>12). Consider MUDPILES: Methanol, Uraemia, DKA, Propylene glycol, Isoniazid, Lactic acidosis, Ethylene glycol, Salicylates.";
    if (correctedAg <= 12) corrInterp = "Corrected AG normal — true normal after albumin correction.";
    else corrInterp = `Corrected AG elevated (${correctedAg.toFixed(1)}) — high AG acidosis present even accounting for hypoalbuminaemia.`;
    return {
      rows: [
        { label: "Anion Gap", value: `${ag.toFixed(1)} mEq/L`, highlight: true },
        { label: "Albumin-Corrected AG", value: `${correctedAg.toFixed(1)} mEq/L`, highlight: v.albumin < 3.5 },
        { label: "Na", value: `${v.na} mEq/L` },
        { label: "Cl + HCO₃", value: `${v.cl + v.hco3} mEq/L` },
      ],
      formula: "AG = Na − (Cl + HCO₃) | Corrected AG = AG + 2.5 × (4 − Albumin)",
      normalRange: "Normal AG: 8–12 mEq/L (with albumin correction)",
      interpretation: `${interp} ${corrInterp}`,
      clinicalPearl:
        "🔑 Always correct the AG for albumin — hypoalbuminaemia lowers the AG and can mask a high-AG acidosis in critically ill patients.",
    };
  },
};

const serumOsmolality: MedCalculator = {
  id: "serum-osmolality",
  name: "Serum Osmolality",
  abbreviation: "Osm",
  description: "Estimates serum osmolality and calculates osmolar gap to detect unmeasured osmoles.",
  category: "electrolyte",
  color: "#EC4899",
  icon: "cpu",
  fields: [
    { id: "na", label: "Sodium (Na)", type: "number", unit: "mEq/L", min: 100, max: 180, placeholder: "e.g. 140", defaultValue: 140 },
    { id: "bun", label: "BUN (Blood Urea Nitrogen)", type: "number", unit: "mg/dL", min: 0, max: 200, placeholder: "e.g. 14", defaultValue: 14 },
    { id: "glucose", label: "Blood Glucose", type: "number", unit: "mg/dL", min: 50, max: 2000, placeholder: "e.g. 90", defaultValue: 90 },
    { id: "measured_osm", label: "Measured Osmolality (optional)", type: "number", unit: "mOsm/kg", min: 200, max: 500, placeholder: "e.g. 295", defaultValue: 295 },
  ],
  calculate: (v) => {
    const calculated = 2 * v.na + v.bun / 2.8 + v.glucose / 18;
    const gap = v.measured_osm - calculated;
    let interp: string;
    if (calculated < 275) interp = "Calculated osmolality low — consider hyponatraemia.";
    else if (calculated <= 295) interp = "Normal serum osmolality.";
    else interp = "Elevated osmolality — check for hypernatraemia, hyperglycaemia, or renal failure.";
    const gapInterp =
      gap > 10
        ? `Osmolar gap elevated (${gap.toFixed(1)} mOsm/kg) — consider toxic alcohol ingestion (methanol, ethylene glycol, isopropanol).`
        : `Osmolar gap normal (${gap.toFixed(1)} mOsm/kg).`;
    return {
      rows: [
        { label: "Calculated Osmolality", value: `${calculated.toFixed(1)} mOsm/kg`, highlight: true },
        { label: "Osmolar Gap", value: `${gap.toFixed(1)} mOsm/kg`, highlight: gap > 10 },
        { label: "Measured Osmolality", value: `${v.measured_osm} mOsm/kg` },
        { label: "2×Na", value: `${2 * v.na}` },
        { label: "BUN/2.8", value: `${(v.bun / 2.8).toFixed(1)}` },
        { label: "Glucose/18", value: `${(v.glucose / 18).toFixed(1)}` },
      ],
      formula: "Osm = 2×Na + BUN/2.8 + Glucose/18 | Osmolar Gap = Measured − Calculated",
      normalRange: "Normal: 285–295 mOsm/kg | Osmolar Gap: <10 mOsm/kg",
      interpretation: `${interp} ${gapInterp}`,
      clinicalPearl:
        "🔑 An elevated osmolar gap with high AG metabolic acidosis strongly suggests toxic alcohol poisoning — call Toxicology immediately.",
    };
  },
};

// ─── RENAL CALCULATORS ────────────────────────────────────────────────────────

const cockcroft: MedCalculator = {
  id: "cockcroft-gault",
  name: "Creatinine Clearance",
  abbreviation: "Cockcroft-Gault",
  description: "Estimates creatinine clearance and renal function for drug dosing adjustments.",
  category: "renal",
  color: "#14B8A6",
  icon: "filter",
  fields: [
    { id: "age", label: "Age", type: "number", unit: "years", min: 1, max: 120, placeholder: "e.g. 65" },
    { id: "weight", label: "Body Weight", type: "number", unit: "kg", min: 1, max: 300, placeholder: "e.g. 70" },
    { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL", min: 0.1, max: 20, placeholder: "e.g. 1.2", defaultValue: 1 },
    {
      id: "sex",
      label: "Sex",
      type: "select",
      options: [
        { label: "Male", value: 0 },
        { label: "Female", value: 1 },
      ],
      defaultValue: 0,
    },
  ],
  calculate: (v) => {
    let crcl = ((140 - v.age) * v.weight) / (72 * v.creatinine);
    if (v.sex === 1) crcl *= 0.85;
    let stage: string;
    if (crcl >= 90) stage = "Normal / G1";
    else if (crcl >= 60) stage = "Mildly reduced (G2)";
    else if (crcl >= 30) stage = "Moderately reduced (G3)";
    else if (crcl >= 15) stage = "Severely reduced (G4)";
    else stage = "Kidney failure (G5) — consider renal replacement therapy";
    return {
      rows: [
        { label: "CrCl (Cockcroft-Gault)", value: `${crcl.toFixed(1)} mL/min`, highlight: true },
        { label: "CKD Stage", value: stage },
        { label: "Sex Correction", value: v.sex === 1 ? "× 0.85 applied" : "No correction (male)" },
      ],
      formula: "CrCl = [(140 − Age) × Weight] / (72 × Cr) × 0.85 (if female)",
      normalRange: "Normal: ≥90 mL/min | CKD G3: 30–59 | G4: 15–29 | G5: <15",
      interpretation: `Estimated CrCl: ${crcl.toFixed(1)} mL/min. ${stage}.`,
      clinicalPearl:
        "🔑 Use ideal body weight in obese patients. CrCl by Cockcroft-Gault is preferred for drug dosing; eGFR (CKD-EPI) for staging CKD.",
    };
  },
};

const egfr: MedCalculator = {
  id: "egfr-mdrd",
  name: "eGFR (MDRD Formula)",
  abbreviation: "eGFR",
  description: "Estimates glomerular filtration rate for CKD staging using the MDRD equation.",
  category: "renal",
  color: "#0891B2",
  icon: "shield",
  fields: [
    { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL", min: 0.1, max: 20, placeholder: "e.g. 1.5", defaultValue: 1.5 },
    { id: "age", label: "Age", type: "number", unit: "years", min: 18, max: 120, placeholder: "e.g. 55" },
    {
      id: "sex",
      label: "Sex",
      type: "select",
      options: [
        { label: "Male", value: 0 },
        { label: "Female", value: 1 },
      ],
      defaultValue: 0,
    },
    {
      id: "race",
      label: "Race (MDRD adjustment)",
      type: "select",
      options: [
        { label: "Non-African American", value: 0 },
        { label: "African American", value: 1 },
      ],
      defaultValue: 0,
    },
  ],
  calculate: (v) => {
    let egfr = 175 * Math.pow(v.creatinine, -1.154) * Math.pow(v.age, -0.203);
    if (v.sex === 1) egfr *= 0.742;
    if (v.race === 1) egfr *= 1.212;
    let stage: string;
    let action: string;
    if (egfr >= 90) { stage = "G1 — Normal or High"; action = "Monitor annually if risk factors present."; }
    else if (egfr >= 60) { stage = "G2 — Mildly Decreased"; action = "Monitor every 6–12 months. Manage risk factors."; }
    else if (egfr >= 45) { stage = "G3a — Mildly-Moderately Decreased"; action = "Nephrology referral consider. Review medications."; }
    else if (egfr >= 30) { stage = "G3b — Moderately-Severely Decreased"; action = "Nephrology review. Restrict nephrotoxins."; }
    else if (egfr >= 15) { stage = "G4 — Severely Decreased"; action = "Nephrology follow-up. Plan for RRT."; }
    else { stage = "G5 — Kidney Failure"; action = "Consider dialysis or transplant listing."; }
    return {
      rows: [
        { label: "eGFR (MDRD)", value: `${egfr.toFixed(1)} mL/min/1.73m²`, highlight: true },
        { label: "CKD Stage", value: stage },
        { label: "Recommended Action", value: action },
      ],
      formula: "eGFR = 175 × Cr^(−1.154) × Age^(−0.203) × [0.742 if female] × [1.212 if Black]",
      normalRange: "Normal: ≥60 mL/min/1.73m² (≥90 for G1)",
      interpretation: `eGFR: ${egfr.toFixed(1)} mL/min/1.73m². ${stage}. ${action}`,
      clinicalPearl:
        "🔑 eGFR underestimates true GFR at high values (>60). The CKD-EPI equation is more accurate across the full range — preferred in clinical guidelines.",
    };
  },
};

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export const medicalCalculators: MedCalculator[] = [
  // Blood
  ebv, mabl, prbc, shockIndex, bloodReplacement,
  // Fluid
  hollidaySegar, pediatricFluid, parkland, ivDripRate, fluidDeficit, freeWaterDeficit, urineOutput,
  // Electrolyte
  correctedSodium, correctedCalcium, anionGap, serumOsmolality,
  // Renal
  cockcroft, egfr,
];

export const CATEGORIES: { id: MedCalcCategory; label: string; icon: string; color: string }[] = [
  { id: "blood", label: "Blood Calculators", icon: "droplet", color: "#EF4444" },
  { id: "fluid", label: "Fluid Calculators", icon: "activity", color: "#3B82F6" },
  { id: "electrolyte", label: "Electrolyte Calculators", icon: "zap", color: "#F59E0B" },
  { id: "renal", label: "Renal Calculators", icon: "shield", color: "#14B8A6" },
];

export function getMedCalculatorById(id: string): MedCalculator | undefined {
  return medicalCalculators.find((c) => c.id === id);
}

export function getMedCalculatorsByCategory(category: MedCalcCategory): MedCalculator[] {
  return medicalCalculators.filter((c) => c.category === category);
}
