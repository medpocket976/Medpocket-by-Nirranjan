import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassBackground } from "@/components/GlassBackground";
import { GlassView } from "@/components/GlassView";
import SkeletonLoader from "@/components/SkeletonLoader";
import { useColors } from "@/hooks/useColors";

const EXPLORE_SECTIONS = [
  {
    title: "Clinical Reference",
    updatedLabel: "Updated · Jun 2026",
    items: [
      {
        id: "drug-guide",
        label: "Drug Guide",
        icon: "tablet" as const,
        color: "#009DB5",
        description: "Searchable pharmacopeia with mechanisms, dosing, and clinical pearls",
        source: "BNF 86 · WHO · UpToDate",
      },
      {
        id: "lab-values",
        label: "Lab Values",
        icon: "bar-chart-2" as const,
        color: "#10B981",
        description: "Normal ranges, critical values, and interpretation guide",
        source: "Harrison's 21e · RCPA Guidelines",
      },
      {
        id: "emergency",
        label: "Emergency Protocols",
        icon: "alert-circle" as const,
        color: "#EF4444",
        description: "Step-by-step emergency management algorithms",
        source: "WHO · ACLS · AHA Guidelines 2023",
      },
    ],
  },
  {
    title: "Anaesthesia & OT",
    updatedLabel: "Updated · Jun 2026",
    items: [
      {
        id: "anaesthesia-equipment",
        label: "Anaesthesia Equipment & Airway",
        icon: "wind" as const,
        color: "#7C3AED",
        description: "100+ OT equipment, airway devices, scopes and monitoring — with viva questions, OSCE tips and mnemonics",
        source: "Miller's Anaesthesia 9e · DAS Guidelines",
      },
    ],
  },
  {
    title: "Clinical Skills",
    updatedLabel: "Updated · May 2026",
    items: [
      {
        id: "clinical-exam",
        label: "Clinical Examination",
        icon: "activity" as const,
        color: "#8B5CF6",
        description: "Systematic examination guides for all major systems",
        source: "Talley & O'Connor · Macleod's",
      },
    ],
  },
  {
    title: "Tools & Calculators",
    updatedLabel: "Updated · May 2026",
    items: [
      {
        id: "calculators",
        label: "Medical Calculators",
        icon: "sliders" as const,
        color: "#F59E0B",
        description: "BMI, GCS, CURB-65, APGAR, Wells score, CHADS₂-VASc and more",
        source: "NICE · ESC · RCOG Guidelines",
      },
    ],
  },
];

const TOTAL_ITEMS = EXPLORE_SECTIONS.reduce((s, sec) => s + sec.items.length, 0);

type ExploreItem = typeof EXPLORE_SECTIONS[number]["items"][number];

const ExploreCard = memo(function ExploreCard({
  item, entranceAnim, colors, styles,
}: {
  item: ExploreItem;
  entranceAnim: { opacity: Animated.Value; translateY: Animated.Value };
  colors: ReturnType<typeof useColors>;
  styles: ReturnType<typeof makeStyles>;
}) {
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const chevronAnim = useRef(new Animated.Value(0)).current;

  const pressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim,   { toValue: 0.97, tension: 160, friction: 8, useNativeDriver: true }),
      Animated.spring(chevronAnim, { toValue: 5, tension: 120, friction: 8, useNativeDriver: true }),
    ]).start();
    if (Platform.OS !== "web") import("expo-haptics").then((h) => h.impactAsync(h.ImpactFeedbackStyle.Light));
  }, []);

  const pressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim,   { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
      Animated.spring(chevronAnim, { toValue: 0, tension: 80, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePress = useCallback(() => router.push(`/${item.id}` as any), [item.id]);

  return (
    <Pressable onPressIn={pressIn} onPressOut={pressOut} onPress={handlePress} accessibilityRole="button" accessibilityLabel={item.label}>
      <Animated.View style={{
        opacity: entranceAnim.opacity,
        transform: [{ translateY: entranceAnim.translateY }, { scale: scaleAnim }],
        marginBottom: 10,
      }}>
        <GlassView style={styles.exploreCard} radius={22}>
          <View style={[styles.exploreIcon, { backgroundColor: item.color + "1E" }]}>
            <Feather name={item.icon} size={22} color={item.color} />
          </View>
          <View style={styles.exploreContent}>
            <Text style={[styles.exploreLabel, { color: colors.foreground }]}>{item.label}</Text>
            <Text style={[styles.exploreDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={[styles.sourceTag, { backgroundColor: item.color + "14" }]}>
              <Text style={[styles.sourceText, { color: item.color }]}>{item.source}</Text>
            </View>
          </View>
          <Animated.View style={{ transform: [{ translateX: chevronAnim }] }}>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Animated.View>
        </GlassView>
      </Animated.View>
    </Pressable>
  );
});

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 16 : insets.top;
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [ready, setReady] = useState(false);
  const entranceAnims = useRef(
    Array.from({ length: TOTAL_ITEMS }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(16),
    }))
  ).current;

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start();
    let globalIdx = 0;
    EXPLORE_SECTIONS.forEach((sec) => {
      sec.items.forEach((_, j) => {
        const anim = entranceAnims[globalIdx++];
        const delay = 120 + j * 70;
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: 360, delay, useNativeDriver: true }),
          Animated.spring(anim.translateY, { toValue: 0, tension: 100, friction: 10, delay, useNativeDriver: true }),
        ]).start();
      });
    });
  }, [ready]);

  let globalIdx = 0;

  return (
    <GlassBackground>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 12, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Library</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Clinical reference & tools</Text>
          </View>
          <Pressable onPress={() => router.push("/search" as any)} accessibilityLabel="Search">
            <GlassView style={styles.searchBtn} radius={14}>
              <Feather name="search" size={18} color={colors.primary} />
            </GlassView>
          </Pressable>
        </Animated.View>

        {/* Sections */}
        {!ready
          ? Array.from({ length: 3 }).map((_, i) => (
              <View key={i} style={{ marginHorizontal: 20, marginBottom: 12 }}>
                <SkeletonLoader width="50%" height={14} borderRadius={8} style={{ marginBottom: 12 }} />
                <SkeletonLoader width="100%" height={80} borderRadius={20} />
              </View>
            ))
          : EXPLORE_SECTIONS.map((section) => (
              <View key={section.title} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
                  <View style={[styles.updatedBadge, { backgroundColor: colors.primary + "14" }]}>
                    <Text style={[styles.updatedText, { color: colors.primary }]}>{section.updatedLabel}</Text>
                  </View>
                </View>
                {section.items.map((item) => {
                  const anim = entranceAnims[globalIdx++];
                  return <ExploreCard key={item.id} item={item} entranceAnim={anim} colors={colors} styles={styles} />;
                })}
              </View>
            ))}
      </ScrollView>
    </GlassBackground>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  const shadow = Platform.OS === "ios"
    ? { shadowColor: colors.glassShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16 }
    : { elevation: 3 };
  return StyleSheet.create({
    header:       { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 20 },
    title:        { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
    subtitle:     { fontSize: 14, marginTop: 4, fontWeight: "500" },
    searchBtn:    { width: 42, height: 42, alignItems: "center", justifyContent: "center" },

    section:      { paddingHorizontal: 20, marginBottom: 6 },
    sectionHeader:{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
    sectionTitle: { fontSize: 17, fontWeight: "800", letterSpacing: -0.2 },
    updatedBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    updatedText:  { fontSize: 10, fontWeight: "700" },

    exploreCard:    { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, ...shadow },
    exploreIcon:    { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    exploreContent: { flex: 1, minWidth: 0 },
    exploreLabel:   { fontSize: 15, fontWeight: "700", marginBottom: 3 },
    exploreDesc:    { fontSize: 12, lineHeight: 18, marginBottom: 7 },
    sourceTag:      { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    sourceText:     { fontSize: 10, fontWeight: "700" },
  });
}
