/**
 * Shared discipline / year-of-study data used by the onboarding flow
 * and the profile settings screen.
 *
 * Single source of truth — edit here and both screens stay in sync.
 */
import { Feather } from "@expo/vector-icons";

export interface DisciplineCategory {
  key: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  years: string[];
}

export const DISCIPLINE_CATEGORIES: DisciplineCategory[] = [
  {
    key: "medical",
    label: "Medical",
    icon: "activity",
    color: "#009DB5",
    years: [
      "MBBS 1st Year", "MBBS 2nd Year", "MBBS 3rd Year",
      "MBBS 4th Year", "MBBS Final Year", "MBBS Intern",
    ],
  },
  {
    key: "nursing",
    label: "Nursing",
    icon: "heart",
    color: "#EC4899",
    years: [
      "GNM 1st Year", "GNM 2nd Year", "GNM 3rd Year",
      "BSc Nursing 1st Year", "BSc Nursing 2nd Year",
      "BSc Nursing 3rd Year", "BSc Nursing 4th Year",
      "Post Basic BSc Nursing", "MSc Nursing",
    ],
  },
  {
    key: "pharmacy",
    label: "Pharmacy",
    icon: "tablet",
    color: "#8B5CF6",
    years: [
      "D.Pharm 1st Year", "D.Pharm 2nd Year",
      "B.Pharm 1st Year", "B.Pharm 2nd Year",
      "B.Pharm 3rd Year", "B.Pharm 4th Year",
      "M.Pharm", "Pharm.D",
    ],
  },
  {
    key: "physio",
    label: "Physiotherapy",
    icon: "zap",
    color: "#F59E0B",
    years: ["BPT 1st Year", "BPT 2nd Year", "BPT 3rd Year", "BPT 4th Year", "MPT"],
  },
  {
    key: "dental",
    label: "Dental",
    icon: "smile",
    color: "#10B981",
    years: [
      "BDS 1st Year", "BDS 2nd Year", "BDS 3rd Year",
      "BDS 4th Year", "BDS Intern", "MDS",
    ],
  },
  {
    key: "allied",
    label: "Allied Health",
    icon: "layers",
    color: "#F97316",
    years: [
      "MLT 1st Year", "MLT 2nd Year", "BMLT 3rd Year", "BMLT 4th Year",
      "OTAT 1st Year", "OTAT 2nd Year", "OTAT 3rd Year",
      "PA 1st Year", "PA 2nd Year", "PA 3rd Year",
      "CLP 1st Year", "CLP 2nd Year", "CLP 3rd Year",
      "CPPT 1st Year", "CPPT 2nd Year", "CPPT 3rd Year",
      "CVT 1st Year", "CVT 2nd Year", "CVT 3rd Year",
      "CT 1st Year", "CT 2nd Year", "CT 3rd Year",
      "RIT 1st Year", "RIT 2nd Year", "RIT 3rd Year",
      "OPTOM 1st Year", "OPTOM 2nd Year", "OPTOM 3rd Year", "OPTOM 4th Year",
      "DT 1st Year", "DT 2nd Year", "DT 3rd Year",
      "AECT 1st Year", "AECT 2nd Year", "AECT 3rd Year",
      "CCT 1st Year", "CCT 2nd Year", "CCT 3rd Year",
      "RT 1st Year", "RT 2nd Year", "RT 3rd Year",
      "NEP 1st Year", "NEP 2nd Year", "NEP 3rd Year",
      "BSc Dietetics", "BSc Audiology", "BSc MLT", "BSc Radiology",
      "BSc OT", "BSc PT", "BSc Perfusion Technology",
    ],
  },
  {
    key: "pg",
    label: "PG / Consultant",
    icon: "award",
    color: "#6366F1",
    years: [
      "Resident (PG Year 1)", "Resident (PG Year 2)", "Resident (PG Year 3)",
      "Fellow", "Consultant / Specialist",
    ],
  },
];

/** Given a year string, returns the key of the matching discipline category. */
export function findCategoryKeyForYear(year: string): string {
  return DISCIPLINE_CATEGORIES.find((c) => c.years.includes(year))?.key ?? "medical";
}
