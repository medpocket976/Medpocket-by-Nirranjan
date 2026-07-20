import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { GlassBackground } from "@/components/GlassBackground";
import { GlassView } from "@/components/GlassView";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface DrugDose {
  name: string;
  category: string;
  color: string;
  route: string;
  dose: string;
  volume: string;
  notes: string;
  reference: string;
}

interface CategoryGroup {
  title: string;
  color: string;
  icon: keyof typeof Feather.glyphMap;
  drugs: DrugDose[];
}

function calculateDoses(weightKg: number, ageYears: number, isElderly: boolean, isPediatric: boolean): CategoryGroup[] {
  const w = weightKg;

  const propofol_ind = isElderly ? w * 1.0 : isPediatric ? w * 2.5 : w * 1.75;
  const propofol_maint_low = w * 4;
  const propofol_maint_high = w * 12;

  const ketamine_iv = w * 1.5;
  const ketamine_im = w * 5;
  const ketamine_anal = w * 0.5;

  const thiopental = isElderly ? w * 3 : w * 5;
  const etomidate = w * 0.3;

  const fentanyl_ind = w * 2;
  const fentanyl_maint = w * 1.5;
  const morphine = w * 0.1;
  const pethidine = w * 1;

  const sux = w * 1.5;
  const roc_int = w * 1.0;
  const roc_maint = w * 0.6;
  const vec = w * 0.1;
  const atrac = w * 0.5;

  const midaz_pre = w * 0.03;
  const midaz_iv = w * 0.05;
  const atropine_pre = Math.max(0.1, w * 0.02);
  const glyco = w * 0.005;

  const neostig = Math.min(5, w * 0.06);
  const atropine_rev = Math.min(2.4, w * 0.02 * 2);
  const sugammadex_mod = w * 2;
  const sugammadex_deep = w * 4;

  const ligno_infl = w * 3;
  const ligno_ep = w * 7;
  const bupiv_spinal = 0;

  return [
    {
      title: "Induction Agents",
      color: "#6366F1",
      icon: "zap",
      drugs: [
        {
          name: "Propofol",
          category: "Induction",
          color: "#6366F1",
          route: "IV (slow bolus)",
          dose: `${propofol_ind.toFixed(1)} mg`,
          volume: `${(propofol_ind / 10).toFixed(1)} mL (10 mg/mL)`,
          notes: isElderly ? "Elderly/ASA III-IV: 1 mg/kg. Titrate slowly." : isPediatric ? "Paediatric: 2.5 mg/kg" : "1.5–2.5 mg/kg. Titrate to effect.",
          reference: "Miller's Anesthesia 9e",
        },
        {
          name: "Propofol (Maintenance)",
          category: "Induction",
          color: "#6366F1",
          route: "IV infusion (TIVA)",
          dose: `${propofol_maint_low.toFixed(0)}–${propofol_maint_high.toFixed(0)} mg/hr`,
          volume: `${(propofol_maint_low / 10).toFixed(1)}–${(propofol_maint_high / 10).toFixed(1)} mL/hr`,
          notes: "4–12 mg/kg/hr. Titrate to BIS 40–60.",
          reference: "Miller's Anesthesia 9e",
        },
        {
          name: "Ketamine",
          category: "Induction",
          color: "#6366F1",
          route: "IV / IM",
          dose: `IV: ${ketamine_iv.toFixed(1)} mg | IM: ${ketamine_im.toFixed(1)} mg`,
          volume: `IV: ${(ketamine_iv / 50).toFixed(1)} mL (50 mg/mL)`,
          notes: "Bronchodilator. Use in haemodynamic instability. Analgesic: 0.5 mg/kg IV.",
          reference: "Miller's Anesthesia 9e; Ketamine: 50 years",
        },
        {
          name: "Thiopentone",
          category: "Induction",
          color: "#6366F1",
          route: "IV",
          dose: `${thiopental.toFixed(1)} mg`,
          volume: `${(thiopental / 25).toFixed(1)} mL (2.5% = 25 mg/mL)`,
          notes: isElderly ? "Reduce to 3–4 mg/kg in elderly." : "3–7 mg/kg. Avoid in porphyria.",
          reference: "Stoelting's Pharmacology & Physiology 5e",
        },
        {
          name: "Etomidate",
          category: "Induction",
          color: "#6366F1",
          route: "IV",
          dose: `${etomidate.toFixed(1)} mg`,
          volume: `${(etomidate / 2).toFixed(1)} mL (2 mg/mL)`,
          notes: "0.3 mg/kg. Minimal haemodynamic effects. Single dose only (adrenal suppression).",
          reference: "Miller's Anesthesia 9e",
        },
      ],
    },
    {
      title: "Opioid Analgesics",
      color: "#EF4444",
      icon: "activity",
      drugs: [
        {
          name: "Fentanyl",
          category: "Opioid",
          color: "#EF4444",
          route: "IV",
          dose: `Induction: ${fentanyl_ind.toFixed(0)} mcg | Maint: ${fentanyl_maint.toFixed(0)} mcg/hr`,
          volume: `${(fentanyl_ind / 50).toFixed(1)} mL (50 mcg/mL)`,
          notes: "1–3 mcg/kg induction; 1–2 mcg/kg/hr maintenance. Reduce in elderly.",
          reference: "BNF 86; Miller's Anesthesia 9e",
        },
        {
          name: "Morphine",
          category: "Opioid",
          color: "#EF4444",
          route: "IV (slow)",
          dose: `${morphine.toFixed(1)} mg`,
          volume: `${(morphine / 10).toFixed(2)} mL (10 mg/mL)`,
          notes: "0.1–0.2 mg/kg IV. Titrate slowly. Use for postoperative analgesia.",
          reference: "BNF 86",
        },
        {
          name: "Pethidine (Meperidine)",
          category: "Opioid",
          color: "#EF4444",
          route: "IV / IM",
          dose: `${pethidine.toFixed(0)} mg`,
          volume: `${(pethidine / 50).toFixed(1)} mL (50 mg/mL)`,
          notes: "1 mg/kg IM/IV. Avoid in renal failure (norpethidine accumulation).",
          reference: "BNF 86; Miller's Anesthesia 9e",
        },
      ],
    },
    {
      title: "Neuromuscular Blocking Agents",
      color: "#F59E0B",
      icon: "slash",
      drugs: [
        {
          name: "Succinylcholine (Suxamethonium)",
          category: "NMB",
          color: "#F59E0B",
          route: "IV",
          dose: `${sux.toFixed(1)} mg`,
          volume: `${(sux / 50).toFixed(1)} mL (50 mg/mL)`,
          notes: "1–2 mg/kg. RSI only. C/I: burns, crush injuries, hyperkalaemia, family Hx MH.",
          reference: "Miller's Anesthesia 9e; BNF 86",
        },
        {
          name: "Rocuronium",
          category: "NMB",
          color: "#F59E0B",
          route: "IV",
          dose: `RSI: ${roc_int.toFixed(1)} mg | Maint: ${roc_maint.toFixed(1)} mg`,
          volume: `RSI: ${(roc_int / 10).toFixed(1)} mL (10 mg/mL)`,
          notes: "RSI 1.2 mg/kg; intubation 0.6 mg/kg. Reversible with sugammadex.",
          reference: "Miller's Anesthesia 9e",
        },
        {
          name: "Vecuronium",
          category: "NMB",
          color: "#F59E0B",
          route: "IV",
          dose: `${vec.toFixed(2)} mg`,
          volume: `${(vec / 1).toFixed(2)} mL (1 mg/mL)`,
          notes: "0.1 mg/kg. Intermediate acting. No histamine release.",
          reference: "Stoelting's Pharmacology 5e",
        },
        {
          name: "Atracurium",
          category: "NMB",
          color: "#F59E0B",
          route: "IV",
          dose: `${atrac.toFixed(1)} mg`,
          volume: `${(atrac / 10).toFixed(1)} mL (10 mg/mL)`,
          notes: "0.5 mg/kg. Hoffman elimination — safe in hepatic/renal failure.",
          reference: "Miller's Anesthesia 9e",
        },
      ],
    },
    {
      title: "Premedication",
      color: "#10B981",
      icon: "clock",
      drugs: [
        {
          name: "Midazolam (Premedication)",
          category: "Premed",
          color: "#10B981",
          route: "IV / IM / PO",
          dose: `IV: ${midaz_iv.toFixed(1)} mg | IM: ${(midaz_pre).toFixed(1)} mg`,
          volume: `IV: ${(midaz_iv / 5).toFixed(1)} mL (5 mg/mL)`,
          notes: "0.05 mg/kg IV sedation; 0.3 mg/kg PO (pre-op 30 min). Titrate to sedation.",
          reference: "BNF 86; Miller's Anesthesia 9e",
        },
        {
          name: "Atropine (Premedication)",
          category: "Premed",
          color: "#10B981",
          route: "IV / IM",
          dose: `${atropine_pre.toFixed(2)} mg`,
          volume: `${(atropine_pre / 0.6).toFixed(1)} mL (0.6 mg/mL)`,
          notes: "0.02 mg/kg (min 0.1 mg, max 0.6 mg). Dries secretions, prevents bradycardia.",
          reference: "BNF 86",
        },
        {
          name: "Glycopyrrolate",
          category: "Premed",
          color: "#10B981",
          route: "IV / IM",
          dose: `${glyco.toFixed(3)} mg`,
          volume: `${(glyco / 0.2).toFixed(2)} mL (0.2 mg/mL)`,
          notes: "0.005 mg/kg. Preferred over atropine — less CNS effect, longer action.",
          reference: "BNF 86",
        },
      ],
    },
    {
      title: "Reversal Agents",
      color: "#009DB5",
      icon: "rotate-ccw",
      drugs: [
        {
          name: "Neostigmine",
          category: "Reversal",
          color: "#009DB5",
          route: "IV (slow)",
          dose: `${neostig.toFixed(2)} mg (max 5 mg)`,
          volume: `${(neostig / 2.5).toFixed(2)} mL (2.5 mg/mL)`,
          notes: "0.04–0.08 mg/kg. Always give with atropine ${atropine_rev.toFixed(2)} mg or glycopyrrolate. Use only when TOF ratio ≥ 0.1.",
          reference: "Miller's Anesthesia 9e; BNF 86",
        },
        {
          name: "Sugammadex",
          category: "Reversal",
          color: "#009DB5",
          route: "IV (bolus)",
          dose: `Moderate: ${sugammadex_mod.toFixed(0)} mg | Deep: ${sugammadex_deep.toFixed(0)} mg`,
          volume: `Moderate: ${(sugammadex_mod / 200).toFixed(1)} mL (200 mg/mL)`,
          notes: "2 mg/kg for moderate block (T2 reappeared); 4 mg/kg for deep block (1–2 PTC). Reverses rocuronium/vecuronium.",
          reference: "Miller's Anesthesia 9e",
        },
      ],
    },
    {
      title: "Local Anaesthetics",
      color: "#8B5CF6",
      icon: "map-pin",
      drugs: [
        {
          name: "Lidocaine (Lignocaine)",
          category: "Local",
          color: "#8B5CF6",
          route: "Infiltration / IV",
          dose: `Without adrenaline: max ${ligno_infl.toFixed(0)} mg | With adrenaline: max ${ligno_ep.toFixed(0)} mg`,
          volume: `1% = 10 mg/mL | 2% = 20 mg/mL`,
          notes: "Plain: 3 mg/kg max. With adrenaline (1:200,000): 7 mg/kg max. IV lidocaine: 1.5 mg/kg bolus.",
          reference: "Miller's Anesthesia 9e; BNF 86",
        },
        {
          name: "Bupivacaine",
          category: "Local",
          color: "#8B5CF6",
          route: "Regional / Spinal",
          dose: `Max: ${(w * 2).toFixed(0)} mg (2 mg/kg)`,
          volume: `0.5% = 5 mg/mL | Spinal: 2–3 mL heavy (0.5%)`,
          notes: "2 mg/kg max (never IV — cardiotoxic). Spinal (heavy): T10 level ~2.5 mL. Epidural: 10–20 mL (0.25–0.5%).",
          reference: "Miller's Anesthesia 9e; BNF 86",
        },
      ],
    },
  ];
}

export default function AnaesthesiaCalcScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [isElderly, setIsElderly] = useState(false);
  const [isPediatric, setIsPediatric] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const resultAnim = useRef(new Animated.Value(0)).current;

  function calculate() {
    const w = parseFloat(weight);
    const a = parseFloat(age) || 30;
    if (isNaN(w) || w <= 0 || w > 300) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const elderly = isElderly || a >= 65;
    const peds = isPediatric || a < 12;
    const result = calculateDoses(w, a, elderly, peds);
    setGroups(result);
    setCalculated(true);
    setExpandedGroups(new Set([result[0].title]));
    resultAnim.setValue(0);
    Animated.spring(resultAnim, { toValue: 1, useNativeDriver: true, tension: 55, friction: 8 }).start();
  }

  function toggleGroup(title: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const styles = makeStyles(colors);
  const w = parseFloat(weight);
  const isValid = !isNaN(w) && w > 0 && w <= 300;

  return (
    <GlassBackground style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#6366F1", "#4F46E5"]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Anaesthesia Dose Calculator</Text>
            <Text style={styles.headerSub}>Weight-based drug dosing guide</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Input Card */}
        <View style={styles.inputCard}>
          <Text style={styles.inputTitle}>Patient Parameters</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>WEIGHT</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={[styles.inputText, { color: colors.foreground }]}
                  value={weight}
                  onChangeText={(t) => { setWeight(t); setCalculated(false); }}
                  keyboardType="numeric"
                  placeholder="e.g. 70"
                  placeholderTextColor={colors.mutedForeground}
                />
                <Text style={styles.inputUnit}>kg</Text>
              </View>
            </View>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>AGE</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={[styles.inputText, { color: colors.foreground }]}
                  value={age}
                  onChangeText={(t) => { setAge(t); setCalculated(false); }}
                  keyboardType="numeric"
                  placeholder="e.g. 45"
                  placeholderTextColor={colors.mutedForeground}
                />
                <Text style={styles.inputUnit}>yrs</Text>
              </View>
            </View>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleItem}>
              <View>
                <Text style={styles.toggleLabel}>Elderly Patient</Text>
                <Text style={styles.toggleSub}>Age ≥65 or frail — reduces doses</Text>
              </View>
              <Switch
                value={isElderly}
                onValueChange={(v) => { setIsElderly(v); setCalculated(false); }}
                trackColor={{ false: colors.glassBorder, true: "#6366F1" }}
                thumbColor="#fff"
              />
            </View>
            <View style={[styles.toggleItem, { borderTopWidth: 1, borderTopColor: colors.glassBorder }]}>
              <View>
                <Text style={styles.toggleLabel}>Paediatric Patient</Text>
                <Text style={styles.toggleSub}>Age &lt;12 — adjusts paediatric doses</Text>
              </View>
              <Switch
                value={isPediatric}
                onValueChange={(v) => { setIsPediatric(v); setCalculated(false); }}
                trackColor={{ false: colors.glassBorder, true: "#6366F1" }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.calcBtn,
              !isValid && styles.calcBtnDisabled,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={calculate}
            disabled={!isValid}
          >
            <Feather name="zap" size={18} color="#fff" />
            <Text style={styles.calcBtnText}>Calculate Doses</Text>
          </Pressable>
        </View>

        {/* Disclaimer */}
        <View style={[styles.warningBox, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B30" }]}>
          <Feather name="alert-triangle" size={14} color="#92400E" />
          <Text style={styles.warningText}>
            Doses are guides only. Always verify against current BNF/local formulary and adjust for individual patient factors. Not for clinical use without qualified anaesthetist supervision.
          </Text>
        </View>

        {/* Results */}
        {calculated && (
          <Animated.View
            style={{
              opacity: resultAnim,
              transform: [{ translateY: resultAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            }}
          >
            <View style={styles.resultHeader}>
              <Feather name="check-circle" size={16} color="#10B981" />
              <Text style={styles.resultHeaderText}>
                Doses for {weight} kg{isElderly ? " (elderly)" : isPediatric ? " (paediatric)" : ""}
              </Text>
            </View>

            {groups.map((group) => {
              const expanded = expandedGroups.has(group.title);
              return (
                <View key={group.title} style={[styles.groupCard, { borderColor: group.color + "40" }]}>
                  <Pressable
                    style={styles.groupHeader}
                    onPress={() => toggleGroup(group.title)}
                  >
                    <View style={[styles.groupIconWrap, { backgroundColor: group.color + "20" }]}>
                      <Feather name={group.icon} size={16} color={group.color} />
                    </View>
                    <Text style={[styles.groupTitle, { color: group.color }]}>{group.title}</Text>
                    <Feather
                      name={expanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={colors.mutedForeground}
                    />
                  </Pressable>

                  {expanded && group.drugs.map((drug, di) => (
                    <View
                      key={drug.name}
                      style={[
                        styles.drugRow,
                        di > 0 && { borderTopWidth: 1, borderTopColor: colors.glassBorder },
                      ]}
                    >
                      <View style={styles.drugTop}>
                        <Text style={styles.drugName}>{drug.name}</Text>
                        <View style={[styles.routeBadge, { backgroundColor: drug.color + "15" }]}>
                          <Text style={[styles.routeText, { color: drug.color }]}>{drug.route}</Text>
                        </View>
                      </View>
                      <Text style={styles.drugDose}>{drug.dose}</Text>
                      <Text style={styles.drugVolume}>Volume: {drug.volume}</Text>
                      <Text style={styles.drugNotes}>{drug.notes}</Text>
                      <View style={styles.refRow}>
                        <Feather name="book-open" size={10} color={colors.mutedForeground} />
                        <Text style={styles.refText}>{drug.reference}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}
          </Animated.View>
        )}

        {/* Source */}
        <View style={styles.sourceCard}>
          <Text style={styles.sourceTitle}>References</Text>
          <Text style={styles.sourceItem}>• Miller's Anesthesia, 9th Edition</Text>
          <Text style={styles.sourceItem}>• Stoelting's Pharmacology & Physiology in Anaesthetic Practice, 5e</Text>
          <Text style={styles.sourceItem}>• British National Formulary (BNF) 86</Text>
          <Text style={styles.sourceItem}>• Morgan & Mikhail's Clinical Anesthesiology, 6e</Text>
        </View>
      </ScrollView>
    </GlassBackground>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: "transparent" },
    header: { paddingHorizontal: 20, paddingBottom: 20 },
    headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    backBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center", justifyContent: "center", marginTop: 2,
    },
    headerText: { flex: 1 },
    headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
    headerSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 3 },
    inputCard: {
      backgroundColor: colors.glassBg,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      marginBottom: 14,
      gap: 14,
    },
    inputTitle: { fontSize: 15, fontWeight: "700", color: colors.foreground },
    inputRow: { flexDirection: "row", gap: 12 },
    inputField: { flex: 1, gap: 6 },
    inputLabel: { fontSize: 10, fontWeight: "700", color: colors.mutedForeground, letterSpacing: 0.8 },
    inputBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      gap: 8,
    },
    inputText: { flex: 1, fontSize: 18, fontWeight: "700" },
    inputUnit: { fontSize: 12, color: colors.mutedForeground, fontWeight: "600" },
    toggleRow: {
      backgroundColor: colors.muted,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      overflow: "hidden",
    },
    toggleItem: { flexDirection: "row", alignItems: "center", padding: 12, gap: 12 },
    toggleLabel: { fontSize: 13, fontWeight: "600", color: colors.foreground },
    toggleSub: { fontSize: 11, color: colors.mutedForeground, marginTop: 1 },
    calcBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#6366F1",
      borderRadius: 12,
      paddingVertical: 14,
      gap: 8,
    },
    calcBtnDisabled: { opacity: 0.4 },
    calcBtnText: { fontSize: 15, fontWeight: "800", color: "#fff" },
    warningBox: {
      flexDirection: "row",
      gap: 8,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 18,
      alignItems: "flex-start",
    },
    warningText: { flex: 1, fontSize: 11, color: "#92400E", lineHeight: 16 },
    resultHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    resultHeaderText: { fontSize: 14, fontWeight: "700", color: colors.foreground },
    groupCard: {
      backgroundColor: colors.glassBg,
      borderRadius: 14,
      borderWidth: 1,
      overflow: "hidden",
      marginBottom: 10,
    },
    groupHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      gap: 10,
    },
    groupIconWrap: {
      width: 32, height: 32, borderRadius: 9,
      alignItems: "center", justifyContent: "center",
    },
    groupTitle: { flex: 1, fontSize: 14, fontWeight: "800" },
    drugRow: { padding: 14, gap: 5 },
    drugTop: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
    drugName: { fontSize: 13, fontWeight: "700", color: colors.foreground, flex: 1 },
    routeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    routeText: { fontSize: 10, fontWeight: "700" },
    drugDose: { fontSize: 16, fontWeight: "800", color: colors.foreground },
    drugVolume: { fontSize: 12, color: colors.mutedForeground },
    drugNotes: { fontSize: 12, color: colors.foreground, lineHeight: 18 },
    refRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
    refText: { fontSize: 10, color: colors.mutedForeground, fontStyle: "italic" },
    sourceCard: {
      backgroundColor: colors.glassBg,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      marginTop: 8,
      gap: 5,
    },
    sourceTitle: { fontSize: 12, fontWeight: "700", color: colors.foreground, marginBottom: 4 },
    sourceItem: { fontSize: 11, color: colors.mutedForeground, lineHeight: 17 },
  });
}
