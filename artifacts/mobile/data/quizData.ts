export interface QuizQuestion {
  id: string;
  subject: string;
  topic?: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export const QUIZ_SUBJECTS = [
  "All",
  "Anatomy",
  "Physiology",
  "Pathology",
  "Pharmacology",
  "Medicine",
  "Surgery",
  "Pediatrics",
  "OBGYN",
];

export const quizQuestions: QuizQuestion[] = [
  // Anatomy
  {
    id: "a1",
    subject: "Anatomy",
    topic: "Cardiac",
    question:
      "Which of the following structures forms the posterior wall of the pericardial sac?",
    options: [
      "Right atrium and right ventricle",
      "Left atrium and left ventricle",
      "Aorta and pulmonary trunk",
      "Superior vena cava and azygos vein",
    ],
    correct: 1,
    explanation:
      "The posterior wall of the pericardial sac (oblique sinus) is formed mainly by the left atrium and the roots of the pulmonary veins. The right atrium forms part of the posterior wall, but the primary posterior structure is the left atrium.",
    difficulty: "medium",
  },
  {
    id: "a2",
    subject: "Anatomy",
    topic: "Neuroanatomy",
    question:
      "A patient presents with inability to abduct the arm beyond 90°, loss of sensation over the 'regimental badge' area, and wasting of the deltoid. Which nerve is injured?",
    options: ["Radial nerve", "Musculocutaneous nerve", "Axillary nerve", "Suprascapular nerve"],
    correct: 2,
    explanation:
      "The axillary nerve (C5, C6) supplies the deltoid muscle (abduction 0–90°) and teres minor, and gives the upper lateral cutaneous nerve of arm supplying the 'regimental badge' area (lateral shoulder). It's commonly injured in anterior shoulder dislocation or surgical neck of humerus fracture.",
    difficulty: "easy",
  },
  {
    id: "a3",
    subject: "Anatomy",
    topic: "Abdominal",
    question: "The transpyloric plane (L1) passes through all EXCEPT:",
    options: [
      "Pylorus of stomach",
      "Fundus of gallbladder",
      "Hilum of kidneys",
      "Origin of superior mesenteric artery",
    ],
    correct: 1,
    explanation:
      "The transpyloric plane (L1 vertebra) passes through: pylorus, fundus of gallbladder, tips of 9th costal cartilages, hilum of kidneys, origin of SMA, head of pancreas, duodenojejunal junction (DJ flexure), and termination of spinal cord (L1–L2). The fundus of the gallbladder lies at the intersection of the 9th costal cartilage and right lateral plane, not at L1.",
    difficulty: "hard",
  },
  // Physiology
  {
    id: "p1",
    subject: "Physiology",
    topic: "Cardiac",
    question:
      "The second heart sound (S2) is caused by:",
    options: [
      "Closure of mitral and tricuspid valves",
      "Closure of aortic and pulmonary valves",
      "Opening of mitral and tricuspid valves",
      "Ventricular filling in early diastole",
    ],
    correct: 1,
    explanation:
      "S2 is caused by the closure of the aortic (A2) and pulmonary (P2) semilunar valves at the end of ventricular systole. S2 is normally split on inspiration (A2 before P2). S1 is caused by closure of the mitral and tricuspid valves at the beginning of systole.",
    difficulty: "easy",
  },
  {
    id: "p2",
    subject: "Physiology",
    topic: "Renal",
    question:
      "The countercurrent multiplier system in the loop of Henle is responsible for:",
    options: [
      "Secretion of hydrogen ions into the tubule",
      "Creating the corticomedullary osmotic gradient",
      "Reabsorbing bicarbonate in the proximal tubule",
      "ADH-mediated water reabsorption in the collecting duct",
    ],
    correct: 1,
    explanation:
      "The countercurrent multiplier in the loop of Henle creates the hyperosmotic medullary gradient (300–1200 mOsm/kg from cortex to medulla). The descending limb is permeable to water but not solutes, while the ascending limb actively transports NaCl but is impermeable to water. This mechanism enables the kidney to concentrate urine when ADH is present.",
    difficulty: "medium",
  },
  {
    id: "p3",
    subject: "Physiology",
    topic: "Respiratory",
    question:
      "What is the normal A-a (alveolar-arterial) oxygen gradient and what causes an elevated A-a gradient?",
    options: [
      "Normal <5 mmHg; elevated in hypoventilation only",
      "Normal <15 mmHg; elevated in V/Q mismatch, shunt, diffusion impairment",
      "Normal <20 mmHg; elevated in all causes of hypoxemia",
      "Normal <10 mmHg; elevated in high altitude only",
    ],
    correct: 1,
    explanation:
      "Normal A-a gradient is <15 mmHg (increases with age: ~2.5 + 0.21 × age). An elevated A-a gradient indicates intrinsic lung disease: V/Q mismatch (PE, pneumonia, COPD), intracardiac or intrapulmonary shunt (ASD, AVM), or diffusion impairment (pulmonary fibrosis). Pure hypoventilation has a NORMAL A-a gradient (both PaO2 and PAO2 decrease proportionately).",
    difficulty: "medium",
  },
  // Pharmacology
  {
    id: "ph1",
    subject: "Pharmacology",
    topic: "Antibiotics",
    question:
      "A 25-year-old woman is prescribed trimethoprim for a UTI. She mentions she is taking methotrexate for psoriasis. The most significant concern with this combination is:",
    options: [
      "Reduced trimethoprim efficacy",
      "Increased risk of folate deficiency and bone marrow suppression",
      "Nephrotoxicity",
      "QT prolongation",
    ],
    correct: 1,
    explanation:
      "Both trimethoprim and methotrexate inhibit dihydrofolate reductase (DHFR), which is essential for tetrahydrofolate synthesis. Combined use can cause severe folate deficiency leading to megaloblastic anemia, neutropenia, and thrombocytopenia. This is a significant drug-drug interaction requiring close monitoring or dose adjustment of methotrexate.",
    difficulty: "hard",
  },
  {
    id: "ph2",
    subject: "Pharmacology",
    topic: "Cardiovascular",
    question:
      "Which of the following beta-blockers is cardioselective (beta-1 selective) and would be safest in a patient with asthma?",
    options: [
      "Propranolol",
      "Carvedilol",
      "Metoprolol",
      "Sotalol",
    ],
    correct: 2,
    explanation:
      "Metoprolol is a selective beta-1 blocker (cardioselective). While still relatively contraindicated in severe asthma, it is safer than non-selective beta-blockers like propranolol, carvedilol (alpha+beta), or sotalol. Other cardioselective beta-blockers: atenolol, bisoprolol, esmolol. Mnemonic: 'A BEAM' = Atenolol, Bisoprolol, Esmolol, Acebutolol, Metoprolol.",
    difficulty: "easy",
  },
  {
    id: "ph3",
    subject: "Pharmacology",
    topic: "CNS",
    question:
      "A patient on lithium for bipolar disorder presents with tremor, polyuria, ataxia, and confusion. Serum lithium is 2.1 mmol/L. What is the next most appropriate step?",
    options: [
      "Increase fluid intake and monitor",
      "Add carbamazepine to reduce lithium dose",
      "Stop lithium and consider hemodialysis",
      "Reduce lithium dose by 50%",
    ],
    correct: 2,
    explanation:
      "Therapeutic lithium range: 0.6–1.0 mmol/L. Toxic level >1.5 mmol/L. Level 2.1 mmol/L with severe toxicity symptoms (ataxia, confusion) requires immediate cessation and hemodialysis, which is the most effective way to remove lithium. Mild toxicity (<1.5) can be managed with IV fluids and stopping lithium. Severe/neurological toxicity mandates dialysis.",
    difficulty: "hard",
  },
  // Pathology
  {
    id: "pt1",
    subject: "Pathology",
    topic: "Cell Injury",
    question:
      "In myocardial infarction, which type of necrosis characteristically occurs?",
    options: [
      "Caseous necrosis",
      "Coagulative necrosis",
      "Liquefactive necrosis",
      "Fat necrosis",
    ],
    correct: 1,
    explanation:
      "Coagulative necrosis is the hallmark of MI. The cell architecture is preserved (due to protein denaturation) but the cells are dead. It is characteristic of ischemic infarcts in most solid organs (heart, kidney, spleen, liver) EXCEPT the brain, which undergoes liquefactive necrosis. Caseous necrosis = TB. Fat necrosis = pancreatitis. Liquefactive = brain, abscesses.",
    difficulty: "easy",
  },
  {
    id: "pt2",
    subject: "Pathology",
    topic: "Inflammation",
    question:
      "Which cytokine is primarily responsible for fever, acute phase protein synthesis, and neutrophilia during acute inflammation?",
    options: ["TNF-α", "IL-4", "IL-1β and IL-6", "IL-10"],
    correct: 2,
    explanation:
      "IL-1β and IL-6 (along with TNF-α) are the primary pro-inflammatory cytokines mediating systemic effects of acute inflammation: fever (via PGE2 in hypothalamus), acute phase protein synthesis in liver (CRP, fibrinogen, serum amyloid A, complement), and neutrophilia. IL-4 is anti-inflammatory/Th2. IL-10 is anti-inflammatory.",
    difficulty: "medium",
  },
  // Medicine
  {
    id: "m1",
    subject: "Medicine",
    topic: "Cardiology",
    question:
      "A 55-year-old hypertensive patient presents with severe tearing chest pain radiating to the back, BP difference of 30 mmHg between arms, and aortic regurgitation murmur. The most likely diagnosis is:",
    options: [
      "Acute myocardial infarction",
      "Aortic dissection (Type A)",
      "Pulmonary embolism",
      "Unstable angina",
    ],
    correct: 1,
    explanation:
      "The classic triad of aortic dissection: sudden severe tearing/ripping chest pain radiating to the back, pulse/BP differential (>20 mmHg between arms), and signs of involvement (AR, tamponade, stroke). Type A (ascending aorta — Stanford) is a surgical emergency. Type B (descending) is managed medically. CT angiography is diagnostic. Immediate beta-blockade to reduce HR and BP.",
    difficulty: "medium",
  },
  {
    id: "m2",
    subject: "Medicine",
    topic: "Nephrology",
    question:
      "A 45-year-old man has eGFR 25 mL/min, proteinuria 3.5 g/day, and HTN. Which treatment has the BEST evidence for slowing progression of diabetic nephropathy?",
    options: [
      "Calcium channel blocker (amlodipine)",
      "ACE inhibitor (lisinopril) or ARB",
      "Loop diuretic (furosemide)",
      "Beta-blocker (metoprolol)",
    ],
    correct: 1,
    explanation:
      "ACE inhibitors and ARBs are the most evidence-based drugs for slowing CKD progression in diabetic nephropathy. They reduce intraglomerular pressure by dilating the efferent arteriole (via blocking angiotensin II), reducing proteinuria, and slowing GFR decline — independent of blood pressure reduction. ONTARGET trial showed combination ACEi+ARB is NOT superior and may harm. SGLT2 inhibitors (empagliflozin) are now also proven to be renoprotective.",
    difficulty: "medium",
  },
  {
    id: "m3",
    subject: "Medicine",
    topic: "Gastroenterology",
    question:
      "Which one of the following is NOT a feature of ulcerative colitis (in contrast to Crohn's disease)?",
    options: [
      "Rectal involvement",
      "Continuous lesions",
      "Transmural inflammation",
      "Risk of toxic megacolon",
    ],
    correct: 2,
    explanation:
      "Transmural inflammation (full-thickness) is characteristic of Crohn's disease (hence fistulae, strictures, skip lesions). Ulcerative colitis has mucosal and submucosal involvement only. UC features: continuous, starts rectum, bloody diarrhea, pseudopolyps, crypt abscesses. Crohn's: skip lesions, transmural, terminal ileum, cobblestone, fistulae, granulomas, smoking worsens.",
    difficulty: "easy",
  },
  // Surgery
  {
    id: "s1",
    subject: "Surgery",
    topic: "GI",
    question:
      "A 70-year-old man presents with sudden onset abdominal pain, absent bowel sounds, and a rigid abdomen. Erect AXR shows free gas under the diaphragm. What is the most appropriate next step?",
    options: [
      "CT abdomen with contrast",
      "Upper GI endoscopy",
      "Emergency laparotomy",
      "IV PPI and observation",
    ],
    correct: 2,
    explanation:
      "Free gas under the diaphragm (pneumoperitoneum) with peritonitis = perforated viscus requiring emergency surgery. The classic presentation is perforated peptic ulcer. While CT can confirm and localize the perforation, in a hemodynamically compromised patient with obvious peritonitis, direct laparotomy is indicated. Delay for CT only if diagnosis is uncertain and patient is stable.",
    difficulty: "medium",
  },
  {
    id: "s2",
    subject: "Surgery",
    topic: "Vascular",
    question:
      "A 65-year-old smoker with claudication has an ABI (ankle-brachial index) of 0.45. This indicates:",
    options: [
      "Normal arterial flow",
      "Mild PAD",
      "Severe PAD (critical limb ischemia risk)",
      "DVT",
    ],
    correct: 2,
    explanation:
      "ABI interpretation: >0.9 = normal; 0.7–0.9 = mild PAD; 0.5–0.7 = moderate PAD (claudication); <0.5 = severe PAD/critical limb ischemia; >1.3 = non-compressible vessels (calcified, as in diabetes). ABI 0.45 indicates severe peripheral arterial disease with significant risk of critical limb ischemia. Management: risk factor modification, antiplatelet therapy, cilostazol, revascularization.",
    difficulty: "medium",
  },
  // Pediatrics
  {
    id: "ped1",
    subject: "Pediatrics",
    topic: "Neonatology",
    question: "The APGAR score is assessed at 1 and 5 minutes. Which of the following is NOT included in the APGAR score?",
    options: ["Heart rate", "Respiratory effort", "Blood pressure", "Muscle tone"],
    correct: 2,
    explanation:
      "APGAR mnemonic: Appearance (skin color), Pulse (heart rate), Grimace (reflex irritability), Activity (muscle tone), Respiration. Each scored 0–2. Total 0–10. Score ≥7 = normal; 4–6 = moderate depression (stimulate, O2); <4 = severe (resuscitation needed). Blood pressure is NOT part of the APGAR score.",
    difficulty: "easy",
  },
  {
    id: "ped2",
    subject: "Pediatrics",
    topic: "Development",
    question:
      "A 15-month-old child cannot walk without support, has no words, and cannot wave bye-bye. This child is:",
    options: [
      "Developmentally normal",
      "Delayed in gross motor only",
      "Globally developmentally delayed",
      "Normal — milestones vary widely",
    ],
    correct: 2,
    explanation:
      "Expected milestones at 15 months: walking independently (12–15 months), 1–5 words (12–18 months), waves bye-bye (9–12 months). This child fails all three domains: gross motor (walking), language (words), and social (waving). This suggests global developmental delay, warranting thorough evaluation including vision/hearing testing, thyroid function, genetic karyotype, and developmental pediatrics referral.",
    difficulty: "medium",
  },
  // OBGYN
  {
    id: "ob1",
    subject: "OBGYN",
    topic: "Obstetrics",
    question:
      "A 32-week pregnant woman presents with painless bright red vaginal bleeding. She is hemodynamically stable. The most likely diagnosis and immediate management are:",
    options: [
      "Placental abruption — immediate caesarean section",
      "Placenta previa — immediate resuscitation, DO NOT perform vaginal examination",
      "Vasa previa — immediate delivery",
      "Show (bloody show) — reassure and monitor",
    ],
    correct: 1,
    explanation:
      "Painless bright red antepartum hemorrhage in late pregnancy is PLACENTA PREVIA until proven otherwise. NEVER perform a vaginal examination (risk of catastrophic hemorrhage by disrupting the placenta). Management: IV access, crossmatch, obstetric team. Diagnosis: ultrasound (transabdominal then transvaginal). Placental abruption = painful, concealed/revealed bleeding, tense uterus. Vasa previa = rare, fetal bleeding through ruptured fetal vessels.",
    difficulty: "medium",
  },
  {
    id: "ob2",
    subject: "OBGYN",
    topic: "Gynecology",
    question:
      "Which tumor marker is most useful in monitoring treatment response and recurrence in epithelial ovarian cancer?",
    options: ["AFP (Alpha-fetoprotein)", "hCG", "CA-125", "CEA"],
    correct: 2,
    explanation:
      "CA-125 is the primary tumor marker for epithelial ovarian cancer (serous adenocarcinoma — most common). It's used for monitoring treatment response and detecting recurrence (not primarily for screening, as it's not sufficiently sensitive/specific). AFP = germ cell tumors (yolk sac tumor). hCG = choriocarcinoma, gestational trophoblastic disease. LDH = dysgerminoma. CEA = colorectal, endocervical adenocarcinoma.",
    difficulty: "medium",
  },
  {
    id: "m4",
    subject: "Medicine",
    topic: "Neurology",
    question:
      "A 35-year-old woman presents with optic neuritis, numbness in her left arm, and ataxia. Symptoms resolve partially after steroids. MRI shows periventricular white matter lesions. The most likely diagnosis is:",
    options: [
      "Acute disseminated encephalomyelitis (ADEM)",
      "Multiple sclerosis (MS)",
      "Neuromyelitis optica (NMO)",
      "Cerebral vasculitis",
    ],
    correct: 1,
    explanation:
      "Multiple sclerosis (MS) classically presents with 'dissemination in time and space' — multiple episodes involving different CNS areas. Classic features: optic neuritis, internuclear ophthalmoplegia, Lhermitte's sign, spastic paraparesis, bladder dysfunction. McDonald criteria 2017 requires demonstration of DIS (different CNS areas) and DIT (different time). MRI: periventricular, juxtacortical, infratentorial, spinal cord lesions.",
    difficulty: "medium",
  },
  {
    id: "ph4",
    subject: "Pharmacology",
    topic: "Adverse Effects",
    question:
      "Which of the following drugs is correctly matched with its most serious adverse effect?",
    options: [
      "Amiodarone — Aplastic anemia",
      "Carbimazole — Agranulocytosis",
      "Metformin — Lactic alkalosis",
      "Digoxin — Ototoxicity",
    ],
    correct: 1,
    explanation:
      "Carbimazole (antithyroid drug) can cause agranulocytosis — a life-threatening drop in neutrophils. Patients must be warned to report sore throat/fever immediately and stop the drug. Amiodarone causes pulmonary toxicity, thyroid dysfunction, corneal microdeposits, photosensitivity, and hepatotoxicity. Metformin causes lactic ACIDOSIS (not alkalosis). Digoxin causes arrhythmias (bradycardia, AV block) and visual disturbances (xanthopsia).",
    difficulty: "medium",
  },
];

export function getQuizBySubject(subject: string): QuizQuestion[] {
  if (subject === "All") return quizQuestions;
  return quizQuestions.filter((q) => q.subject === subject);
}

export function getDailyChallenge(): QuizQuestion[] {
  const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 10);
}
