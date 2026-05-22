import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

import SkeletonLoader from "@/components/SkeletonLoader";
import { useColors } from "@/hooks/useColors";

const EXPLORE_SECTIONS = [
  {
    title: "Clinical Reference",
    updatedLabel: "Updated · Jan 2026",
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
    title: "Clinical Skills",
    updatedLabel: "Updated · Jan 2026",
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
    updatedLabel: "Updated · Jan 2026",
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

function ExploreCard({
  item,
  entranceAnim,
  colors,
  styles,
}: {
  item: (typeof EXPLORE_SECTIONS)[number]["items"][number];
  entranceAnim: { opacity: Animated.Value; translateY: Animated.Value };
  colors: ReturnType<typeof useColors>;
  styles: ReturnType<typeof makeStyles>;
}) {
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const chevronAnim = useRef(new Animated.Value(0)).current;

  function pressIn() {
    Animated.parallel([
      Animated.spring(scaleAnim,  { toValue: 0.97, tension: 160, friction: 8, useNativeDriver: true }),
      Animated.spring(chevronAnim, { toValue: 5, tension: 120, friction: 8, useNativeDriver: true }),
    ]).start();
  }

  function pressOut() {
    Animated.parallel([
      Animated.spring(scaleAnim,  { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
      Animated.spring(chevronAnim, { toValue: 0, tension: 80, friction: 7, useNativeDriver: true }),
    ]).start();
  }

  return (
    <Pressable onPressIn={pressIn} onPressOut={pressOut} onPress={() => router.push(`/${item.id}` as any)}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
          {
            opacity: entranceAnim.opacity,
            transform: [{ translateY: entranceAnim.translateY }, { scale: scaleAnim }],
          },
        ]}
      >
        <View style={[styles.iconWrapper, { backgroundColor: item.color + "15" }]}>
          <Feather name={item.icon} size={24} color={item.color} />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.label}</Text>
          <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{item.description}</Text>
          <View style={styles.sourceRow}>
            <Feather name="book-open" size={9} color={colors.mutedForeground} />
            <Text style={[styles.sourceText, { color: colors.mutedForeground }]}>{item.source}</Text>
          </View>
        </View>
        <Animated.View style={{ transform: [{ translateX: chevronAnim }] }}>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

function SkeletonSection({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <SkeletonLoader width={120} height={12} borderRadius={6} style={{ marginHorizontal: 20, marginBottom: 12 }} />
      {[1, 2].map((i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            backgroundColor: colors.card,
            marginHorizontal: 20,
            marginBottom: 8,
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <SkeletonLoader width={52} height={52} borderRadius={14} />
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonLoader width={100} height={13} borderRadius={6} />
            <SkeletonLoader width="90%" height={10} borderRadius={5} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function ExploreScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const styles  = makeStyles(colors);

  const [skeletonVisible, setSkeletonVisible] = useState(true);

  const headerOpacity  = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-14)).current;

  const itemAnims = useRef(
    Array.from({ length: TOTAL_ITEMS }, () => ({
      opacity:    new Animated.Value(0),
      translateY: new Animated.Value(28),
    }))
  ).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSkeletonVisible(false);

      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(headerTranslateY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]).start();

      Animated.stagger(
        65,
        itemAnims.map((a) =>
          Animated.parallel([
            Animated.timing(a.opacity, { toValue: 1, duration: 360, useNativeDriver: true }),
            Animated.spring(a.translateY, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
          ])
        )
      ).start();
    }, 260);

    return () => clearTimeout(timer);
  }, []);

  let idx = 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {skeletonVisible ? (
        <>
          <View style={styles.header}>
            <SkeletonLoader width={140} height={28} borderRadius={8} style={{ marginBottom: 8 }} />
            <SkeletonLoader width={200} height={14} borderRadius={6} />
          </View>
          <SkeletonSection colors={colors} />
          <SkeletonSection colors={colors} />
        </>
      ) : (
        <>
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] },
            ]}
          >
            <Text style={styles.title}>Explore</Text>
            <Text style={styles.subtitle}>Your medical reference library</Text>
            <View style={[styles.verifiedBadge, { backgroundColor: "#10B98112", borderColor: "#10B98130" }]}>
              <Feather name="shield" size={11} color="#10B981" />
              <Text style={[styles.verifiedText, { color: "#10B981" }]}>
                Evidence-based content · Verified Jan 2026
              </Text>
            </View>
          </Animated.View>

          {/* Sections */}
          {EXPLORE_SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <View style={styles.sectionMeta}>
                <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
                  {section.title}
                </Text>
                <Text style={[styles.sectionUpdated, { color: colors.mutedForeground }]}>
                  {section.updatedLabel}
                </Text>
              </View>
              {section.items.map((item) => (
                <ExploreCard
                  key={item.id}
                  item={item}
                  entranceAnim={itemAnims[idx++]}
                  colors={colors}
                  styles={styles}
                />
              ))}
            </View>
          ))}

          {/* Disclaimer */}
          <View style={[styles.disclaimer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="shield" size={13} color={colors.primary} />
            <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
              MedPocket by Nirranjan — For educational purposes only. Clinical decisions should always involve professional medical judgment.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container:     { flex: 1, backgroundColor: colors.background },
    header:        { paddingHorizontal: 20, marginBottom: 24, gap: 4 },
    title:         { fontSize: 28, fontWeight: "800", color: colors.foreground },
    subtitle:      { fontSize: 14, color: colors.mutedForeground, marginTop: 2 },
    verifiedBadge: {
      flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8,
      alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5,
      borderRadius: 20, borderWidth: 1,
    },
    verifiedText:  { fontSize: 11, fontWeight: "600" },
    section:       { marginBottom: 24 },
    sectionMeta:   {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 20, marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 12, fontWeight: "700",
      textTransform: "uppercase", letterSpacing: 0.8,
    },
    sectionUpdated: { fontSize: 10 },
    card: {
      flexDirection: "row", alignItems: "center",
      marginHorizontal: 20, marginBottom: 10,
      padding: 16, borderRadius: 18,
      borderWidth: 1, gap: 14,
    },
    iconWrapper:   { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    cardContent:   { flex: 1, gap: 3 },
    cardTitle:     { fontSize: 15, fontWeight: "700" },
    cardDesc:      { fontSize: 13, lineHeight: 19 },
    sourceRow:     { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
    sourceText:    { fontSize: 10 },
    disclaimer: {
      flexDirection: "row", alignItems: "flex-start",
      gap: 8, marginHorizontal: 20, marginTop: 4,
      padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8,
    },
    disclaimerText: { flex: 1, fontSize: 12, lineHeight: 18 },
  });
}
