import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { GlassBackground } from "@/components/GlassBackground";
import { GlassView } from "@/components/GlassView";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { anaesthesiaEquipment } from "@/data/anaesthesiaEquipment";
import { useColors } from "@/hooks/useColors";

const CATEGORY_COLORS: Record<string, string> = {
  "Airway Devices": "#EF4444",
  "Laryngoscopes": "#8B5CF6",
  "Scopes": "#10B981",
  "Anaesthesia Workstation": "#F59E0B",
  "Monitoring Devices": "#3B82F6",
  "Vascular Access": "#EC4899",
  "Regional Anaesthesia": "#6366F1",
  "Surgical Instruments": "#64748B",
};

type SectionKey =
  | "overview"
  | "clinical"
  | "procedure"
  | "education"
  | "viva";

const SECTION_TABS: { key: SectionKey; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: "overview", label: "Overview", icon: "info" },
  { key: "clinical", label: "Clinical", icon: "activity" },
  { key: "procedure", label: "Procedure", icon: "list" },
  { key: "education", label: "Education", icon: "book-open" },
  { key: "viva", label: "Viva", icon: "help-circle" },
];

function InfoChip({ text, color }: { text: string; color: string }) {
  return (
    <View style={[chipStyles.chip, { backgroundColor: color + "15", borderColor: color + "30" }]}>
      <Text style={[chipStyles.text, { color }]}>{text}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  text: { fontSize: 11, fontWeight: "600" },
});

function BulletList({
  items,
  color,
  colors,
}: {
  items: string[];
  color: string;
  colors: ReturnType<typeof useColors>;
}) {
  if (!items || items.length === 0) return null;
  return (
    <View style={{ gap: 6 }}>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginTop: 5, flexShrink: 0 }} />
          <Text style={{ fontSize: 13, color: colors.foreground, flex: 1, lineHeight: 19 }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function NumberedList({
  items,
  color,
  colors,
}: {
  items: string[];
  color: string;
  colors: ReturnType<typeof useColors>;
}) {
  if (!items || items.length === 0) return null;
  return (
    <View style={{ gap: 8 }}>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: color + "20", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color }}>{i + 1}</Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.foreground, flex: 1, lineHeight: 19 }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function SectionCard({
  title,
  icon,
  color,
  colors,
  children,
}: {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  colors: ReturnType<typeof useColors>;
  children: React.ReactNode;
}) {
  return (
    <View style={[detailStyles.sectionCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
      <View style={detailStyles.sectionHeader}>
        <View style={[detailStyles.sectionIcon, { backgroundColor: color + "15" }]}>
          <Feather name={icon} size={14} color={color} />
        </View>
        <Text style={[detailStyles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const detailStyles = StyleSheet.create({
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
});

export default function AnaesthesiaEquipmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isBookmarked, addBookmark, removeBookmark } = useApp();
  const [activeTab, setActiveTab] = useState<SectionKey>("overview");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const item = anaesthesiaEquipment.find((e) => e.id === id);

  if (!item) {
    return (
      <View style={{ flex: 1, backgroundColor: "transparent", alignItems: "center", justifyContent: "center" }}>
        <Feather name="alert-circle" size={48} color={colors.glassBorder} />
        <Text style={{ color: colors.mutedForeground, marginTop: 12, fontSize: 16 }}>Equipment not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const accent = CATEGORY_COLORS[item.category] || colors.primary;
  const bmed = isBookmarked(item.id);

  function toggleBookmark() {
    if (bmed) {
      removeBookmark(item.id);
    } else {
      addBookmark({ type: "drug", itemId: item.id, name: item.name });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  return (
    <GlassBackground>
      {/* Hero Header */}
      <View style={[styles.hero, { paddingTop: topPad + 12, backgroundColor: accent + "12" }]}>
        <View style={styles.heroNav}>
          <Pressable
            style={[styles.navBtn, { backgroundColor: "transparent" + "CC" }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Pressable
            style={[styles.navBtn, { backgroundColor: bmed ? accent + "20" : colors.background + "CC" }]}
            onPress={toggleBookmark}
          >
            <Feather name="bookmark" size={18} color={bmed ? accent : colors.foreground} />
          </Pressable>
        </View>

        <View style={[styles.heroIcon, { backgroundColor: accent + "20" }]}>
          <Feather name="tool" size={32} color={accent} />
        </View>

        <Text style={[styles.heroName, { color: colors.foreground }]}>{item.name}</Text>

        {item.alternativeNames.length > 0 && (
          <Text style={[styles.heroAlt, { color: colors.mutedForeground }]}>
            {item.alternativeNames.slice(0, 3).join(" · ")}
          </Text>
        )}

        <View style={styles.heroBadges}>
          <View style={[styles.heroBadge, { backgroundColor: accent + "20" }]}>
            <Text style={[styles.heroBadgeText, { color: accent }]}>{item.category}</Text>
          </View>
          <View style={[styles.heroBadge, { backgroundColor: colors.muted }]}>
            <Text style={[styles.heroBadgeText, { color: colors.mutedForeground }]}>{item.subcategory}</Text>
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
        style={{ flexGrow: 0, backgroundColor: colors.glassBg, borderBottomWidth: 1, borderBottomColor: colors.glassBorder }}
      >
        {SECTION_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { borderBottomColor: accent, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Feather
              name={tab.icon}
              size={13}
              color={activeTab === tab.key ? accent : colors.mutedForeground}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab.key ? accent : colors.mutedForeground },
                activeTab === tab.key && { fontWeight: "700" },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 14, paddingBottom: insets.bottom + 60 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "overview" && (
          <>
            {/* Description */}
            <SectionCard title="Description" icon="info" color={accent} colors={colors}>
              <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 20 }}>
                {item.description}
              </Text>
            </SectionCard>

            {/* Sizes */}
            <SectionCard title="Sizes Available" icon="layers" color={accent} colors={colors}>
              <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 20 }}>
                {item.sizes}
              </Text>
            </SectionCard>

            {/* Components */}
            {item.components.length > 0 && (
              <SectionCard title="Components" icon="box" color={accent} colors={colors}>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {item.components.map((c, i) => (
                    <InfoChip key={i} text={c} color={accent} />
                  ))}
                </View>
              </SectionCard>
            )}

            {/* Sterilization */}
            <SectionCard title="Sterilization" icon="shield" color={accent} colors={colors}>
              <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 20 }}>
                {item.sterilization}
              </Text>
            </SectionCard>

            {/* Comparison */}
            {item.comparisonWith && (
              <SectionCard title="Comparison" icon="git-branch" color={accent} colors={colors}>
                <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 20 }}>
                  {item.comparisonWith}
                </Text>
              </SectionCard>
            )}
          </>
        )}

        {activeTab === "clinical" && (
          <>
            {/* Indications */}
            <SectionCard title="Indications" icon="check-circle" color="#10B981" colors={colors}>
              <BulletList items={item.indications} color="#10B981" colors={colors} />
            </SectionCard>

            {/* Contraindications */}
            {item.contraindications.length > 0 && (
              <SectionCard title="Contraindications" icon="x-circle" color="#EF4444" colors={colors}>
                <BulletList items={item.contraindications} color="#EF4444" colors={colors} />
              </SectionCard>
            )}

            {/* Advantages */}
            <SectionCard title="Advantages" icon="thumbs-up" color="#10B981" colors={colors}>
              <BulletList items={item.advantages} color="#10B981" colors={colors} />
            </SectionCard>

            {/* Disadvantages */}
            <SectionCard title="Disadvantages" icon="thumbs-down" color="#F59E0B" colors={colors}>
              <BulletList items={item.disadvantages} color="#F59E0B" colors={colors} />
            </SectionCard>

            {/* Complications */}
            <SectionCard title="Complications" icon="alert-triangle" color="#EF4444" colors={colors}>
              <BulletList items={item.complications} color="#EF4444" colors={colors} />
            </SectionCard>

            {/* Troubleshooting */}
            {item.troubleshooting.length > 0 && (
              <SectionCard title="Troubleshooting" icon="tool" color="#F97316" colors={colors}>
                <BulletList items={item.troubleshooting} color="#F97316" colors={colors} />
              </SectionCard>
            )}
          </>
        )}

        {activeTab === "procedure" && (
          <>
            {/* Procedure Steps */}
            <SectionCard title="Procedure / Usage Steps" icon="list" color={accent} colors={colors}>
              <NumberedList items={item.procedureSteps} color={accent} colors={colors} />
            </SectionCard>

            {/* Clinical Pearls */}
            <SectionCard title="Clinical Pearls" icon="star" color="#F59E0B" colors={colors}>
              <BulletList items={item.clinicalPearls} color="#F59E0B" colors={colors} />
            </SectionCard>
          </>
        )}

        {activeTab === "education" && (
          <>
            {/* Mnemonic */}
            {item.mnemonics && (
              <SectionCard title="Mnemonic" icon="zap" color="#8B5CF6" colors={colors}>
                <View style={[{ backgroundColor: "#8B5CF620", borderRadius: 8, padding: 12 }]}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#8B5CF6", lineHeight: 22 }}>
                    {item.mnemonics}
                  </Text>
                </View>
              </SectionCard>
            )}

            {/* Did You Know */}
            {item.didYouKnow && (
              <SectionCard title="Did You Know?" icon="lightbulb" color="#F59E0B" colors={colors}>
                <View style={[{ backgroundColor: "#F59E0B15", borderRadius: 8, padding: 12 }]}>
                  <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 20 }}>
                    💡 {item.didYouKnow}
                  </Text>
                </View>
              </SectionCard>
            )}

            {/* OSCE Tips */}
            {item.osceTips && item.osceTips.length > 0 && (
              <SectionCard title="OSCE Tips" icon="award" color="#10B981" colors={colors}>
                <BulletList items={item.osceTips} color="#10B981" colors={colors} />
              </SectionCard>
            )}

            {/* Comparison */}
            {item.comparisonWith && (
              <SectionCard title="Compare With" icon="git-branch" color="#6366F1" colors={colors}>
                <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 20 }}>
                  {item.comparisonWith}
                </Text>
              </SectionCard>
            )}
          </>
        )}

        {activeTab === "viva" && (
          <>
            <SectionCard title="Viva Questions" icon="help-circle" color={accent} colors={colors}>
              <NumberedList items={item.vivaQuestions} color={accent} colors={colors} />
            </SectionCard>

            {/* Clinical Pearls again for quick revision */}
            <SectionCard title="Key Points (Rapid Revision)" icon="star" color="#F59E0B" colors={colors}>
              <BulletList items={item.clinicalPearls} color="#F59E0B" colors={colors} />
            </SectionCard>
          </>
        )}
      </ScrollView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: "center",
    gap: 6,
  },
  heroNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroName: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 26,
  },
  heroAlt: {
    fontSize: 12,
    textAlign: "center",
  },
  heroBadges: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 4,
  },
  heroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  heroBadgeText: { fontSize: 11, fontWeight: "600" },
  tabBar: {
    paddingHorizontal: 8,
    paddingVertical: 0,
    gap: 0,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: { fontSize: 12, fontWeight: "600" },
});
