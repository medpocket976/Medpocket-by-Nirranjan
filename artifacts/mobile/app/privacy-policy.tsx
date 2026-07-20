import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Linking,
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

import { useColors } from "@/hooks/useColors";

const DEVELOPER_EMAIL = "medpocket.support@gmail.com";

const SECTIONS = [
  {
    icon: "info" as const,
    color: "#3B82F6",
    title: "About This Policy",
    body: "This Privacy Policy explains how MedPocket (\"the App\") collects, uses, and protects information when you use our mobile application. We are committed to protecting your privacy and ensuring transparency about our data practices.",
  },
  {
    icon: "database" as const,
    color: "#009DB5",
    title: "Information We Collect",
    body: "MedPocket does not collect or transmit any personal information to external servers.\n\nAll data you enter — including your name, institution, discipline, bookmarks, notes, and quiz results — is stored exclusively on your device using local storage (AsyncStorage). This data never leaves your device unless you explicitly back it up.",
  },
  {
    icon: "server" as const,
    color: "#10B981",
    title: "Local Storage Only",
    body: "The App operates entirely offline for its core features. Your study notes, bookmarks, quiz history, and profile information are saved locally on your device.\n\nWe do not maintain user accounts, cloud sync, or remote databases. Uninstalling the App permanently deletes all locally stored data.",
  },
  {
    icon: "wifi-off" as const,
    color: "#8B5CF6",
    title: "No Data Transmission",
    body: "MedPocket does not:\n\n• Send your personal information to third-party servers\n• Track your usage patterns or analytics\n• Use advertising networks or tracking SDKs\n• Access your contacts, camera, microphone, or location\n• Share data with any third parties",
  },
  {
    icon: "book-open" as const,
    color: "#F59E0B",
    title: "Medical Content & Disclaimer",
    body: "All drug information, clinical guidelines, and medical content in the App are sourced from established references including Harrison's Principles of Internal Medicine, British National Formulary (BNF), WHO Clinical Guidelines, UpToDate, Robbins & Cotran Pathology, and Miller's Anesthesia.\n\nThis content is provided for educational purposes only. It is NOT a substitute for professional clinical judgment, licensed healthcare provider advice, or official prescribing information. Always refer to current local guidelines and consult qualified professionals for patient care decisions.",
  },
  {
    icon: "shield" as const,
    color: "#EC4899",
    title: "Data Security",
    body: "Since all data is stored locally on your device, the security of your data depends on the security of your device. We recommend:\n\n• Using device-level encryption and screen lock\n• Keeping your device OS and the App updated\n• Using strong device passwords or biometric authentication\n\nIn the event of device theft or loss, locally stored App data may be accessible to whoever has access to your unlocked device.",
  },
  {
    icon: "user-x" as const,
    color: "#6366F1",
    title: "Children's Privacy",
    body: "MedPocket is designed for medical and paramedical students and healthcare professionals aged 18 and above. The App is not directed at children under the age of 13, and we do not knowingly collect information from children. If you believe a child has used this app, please note that no personal data is transmitted to us.",
  },
  {
    icon: "refresh-cw" as const,
    color: "#F97316",
    title: "Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Any changes will be reflected within the App with an updated effective date. Continued use of the App after changes are posted constitutes your acceptance of the revised policy.",
  },
  {
    icon: "mail" as const,
    color: "#009DB5",
    title: "Contact",
    body: `If you have any questions, concerns, or feedback about this Privacy Policy or the App, you may contact the developer:\n\nDeveloper: Nirranjan\nApp: MedPocket — Paramedical Reference\nEmail: ${DEVELOPER_EMAIL}\n\nAs this is an educational app with no data collection, most privacy concerns are addressed by the local-only architecture described above.`,
    email: DEVELOPER_EMAIL,
  },
];

function AnimatedCard({
  section,
  index,
  colors,
  s,
}: {
  section: (typeof SECTIONS)[number];
  index: number;
  colors: ReturnType<typeof useColors>;
  s: ReturnType<typeof styles>;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        delay: index * 55,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 60,
        friction: 10,
        delay: index * 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        s.card,
        { backgroundColor: colors.glassBg },
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={s.cardHeader}>
        <View style={[s.cardIcon, { backgroundColor: section.color + "18" }]}>
          <Feather name={section.icon} size={16} color={section.color} />
        </View>
        <Text style={[s.cardTitle, { color: colors.foreground }]}>{section.title}</Text>
      </View>
      <Text style={[s.cardBody, { color: colors.mutedForeground }]}>{section.body}</Text>

      {section.email && (
        <Pressable
          style={({ pressed }) => [
            s.emailBtn,
            { backgroundColor: section.color + "14", opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => Linking.openURL(`mailto:${section.email}`)}
        >
          <Feather name="send" size={13} color={section.color} />
          <Text style={[s.emailBtnText, { color: section.color }]}>{section.email}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

export default function PrivacyPolicyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isIOS = Platform.OS === "ios";
  const s = styles(colors, insets, isIOS);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-16)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.spring(headerY, { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
    ]).start();
    Animated.parallel([
      Animated.timing(badgeOpacity, { toValue: 1, duration: 400, delay: 120, useNativeDriver: true }),
      Animated.spring(badgeScale, { toValue: 1, tension: 60, friction: 10, delay: 120, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <GlassBackground style={s.container}>
      {/* Header */}
      <Animated.View
        style={[s.header, { opacity: headerOpacity, transform: [{ translateY: headerY }] }]}
      >
        <Pressable
          style={({ pressed }) => [s.backBtn, { opacity: pressed ? 0.5 : 1 }]}
          onPress={() => router.back()}
        >
          <Feather name="chevron-left" size={24} color={colors.primary} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Privacy Policy</Text>
          <Text style={s.headerSub}>Effective: May 2026</Text>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Badge */}
        <Animated.View
          style={[
            s.badge,
            { backgroundColor: colors.tealLight },
            { opacity: badgeOpacity, transform: [{ scale: badgeScale }] },
          ]}
        >
          <Feather name="lock" size={16} color={colors.primary} />
          <Text style={[s.badgeText, { color: colors.primary }]}>
            No data is collected or transmitted. Everything stays on your device.
          </Text>
        </Animated.View>

        {/* Sections — each animates in with staggered delay */}
        {SECTIONS.map((sec, idx) => (
          <AnimatedCard key={sec.title} section={sec} index={idx} colors={colors} s={s} />
        ))}

        {/* Footer disclaimer */}
        <Animated.View
          style={[
            s.disclaimer,
            { backgroundColor: "#F59E0B10", borderColor: "#F59E0B30" },
            {
              opacity: headerOpacity,
              transform: [{ translateY: useRef(new Animated.Value(0)).current }],
            },
          ]}
        >
          <Feather name="alert-triangle" size={14} color="#F59E0B" style={{ marginTop: 1 }} />
          <Text style={s.disclaimerText}>
            <Text style={{ fontWeight: "700", color: "#F59E0B" }}>Medical Disclaimer: </Text>
            <Text style={{ color: colors.mutedForeground }}>
              Content in this app is for educational reference only. It does not constitute medical advice and must not replace clinical judgment or professional consultation.
            </Text>
          </Text>
        </Animated.View>

        <Text style={[s.footer, { color: colors.mutedForeground }]}>
          MedPocket by Nirranjan · v1.3.0{"\n"}© 2026 All rights reserved
        </Text>
      </ScrollView>
    </GlassBackground>
  );
}

function styles(
  colors: ReturnType<typeof useColors>,
  insets: { top: number; bottom: number },
  isIOS: boolean
) {
  const cardShadow = isIOS
    ? { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6 }
    : { elevation: 2 };
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: "transparent" },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 8,
      paddingBottom: 12,
      backgroundColor: colors.glassBg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.glassBorder,
    },
    backBtn:      { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle:  { fontSize: 17, fontWeight: "700", color: colors.foreground },
    headerSub:    { fontSize: 11, color: colors.mutedForeground, marginTop: 1 },
    scroll:       { flex: 1 },
    content:      { padding: 16, paddingBottom: insets.bottom + 40 },
    badge: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      padding: 14,
      borderRadius: 14,
      marginBottom: 16,
    },
    badgeText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: "600" },
    card: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      ...cardShadow,
    },
    cardHeader:   { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    cardIcon:     { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    cardTitle:    { fontSize: 15, fontWeight: "700", flex: 1 },
    cardBody:     { fontSize: 13, lineHeight: 21 },
    emailBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginTop: 12,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 10,
      alignSelf: "flex-start",
    },
    emailBtnText: { fontSize: 13, fontWeight: "600" },
    disclaimer: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      marginTop: 4,
      marginBottom: 16,
    },
    disclaimerText: { flex: 1, fontSize: 12, lineHeight: 18 },
    footer:         { fontSize: 11, textAlign: "center", lineHeight: 18 },
  });
}
