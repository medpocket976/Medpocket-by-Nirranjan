import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
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

import { GlassBackground } from "@/components/GlassBackground";
import { GlassView } from "@/components/GlassView";
import { useApp } from "@/context/AppContext";
import { QuizQuestion, getDailyChallenge, getQuizBySubject } from "@/data/quizData";
import { getExpandedQuizBySubject } from "@/data/quizDataExpanded";
import { useColors } from "@/hooks/useColors";

function getAllQuestions(subject: string): QuizQuestion[] {
  if (subject === "All") return getDailyChallenge();
  const core = getQuizBySubject(subject);
  const expanded = getExpandedQuizBySubject(subject);
  const combined = [...core, ...expanded];
  return combined.length > 0 ? combined : [];
}

const OPTION_LETTERS = ["A", "B", "C", "D"];

export default function QuizPlayScreen() {
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const decodedSubject = decodeURIComponent(subject ?? "All");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addQuizResult } = useApp();
  const topPad = Platform.OS === "web" ? 16 : insets.top;
  const styles = makeStyles(colors);

  const [questions] = useState<QuizQuestion[]>(() => {
    const qs = getAllQuestions(decodedSubject);
    return [...qs].sort(() => Math.random() - 0.5).slice(0, 10);
  });

  const [current,  setCurrent]  = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score,    setScore]    = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers,  setAnswers]  = useState<(number | null)[]>([]);

  const fadeAnim     = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim    = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [current]);

  useEffect(() => {
    if (finished && questions.length > 0) {
      addQuizResult({ subject: decodedSubject, score, total: questions.length, date: new Date().toISOString() });
    }
  }, [finished]);

  useEffect(() => {
    const target = questions.length > 0 ? (current / questions.length) * 100 : 0;
    Animated.timing(progressAnim, { toValue: target, duration: 400, useNativeDriver: false }).start();
  }, [current, questions.length]);

  const question = questions[current];
  const progress = questions.length > 0 ? (current / questions.length) * 100 : 0;

  if (questions.length === 0) {
    return (
      <GlassBackground>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
          <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: colors.primary + "18", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Feather name="inbox" size={32} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: "800", color: colors.foreground, marginBottom: 8, textAlign: "center" }}>No questions yet</Text>
          <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: "center", lineHeight: 22 }}>
            Questions for {decodedSubject} are coming soon. Check back later!
          </Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: 28 }}>
            <LinearGradient colors={["#009DB5", "#00C6D8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16 }}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>Go Back</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </GlassBackground>
    );
  }

  // ── Results screen ──
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const resultColor = pct >= 70 ? colors.success : pct >= 50 ? colors.warning : colors.critical;
    const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "🎯" : pct >= 40 ? "📚" : "💪";

    return (
      <GlassBackground>
        <ScrollView contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {/* Result hero */}
          <View style={{ alignItems: "center", paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{emoji}</Text>
            <View style={[styles.resultCircle, { borderColor: resultColor }]}>
              <Text style={[styles.resultPct, { color: resultColor }]}>{pct}%</Text>
              <Text style={[styles.resultScore, { color: colors.mutedForeground }]}>{score}/{questions.length}</Text>
            </View>
            <Text style={[styles.resultTitle, { color: colors.foreground }]}>
              {pct >= 80 ? "Excellent!" : pct >= 60 ? "Good job!" : pct >= 40 ? "Keep studying" : "More practice needed"}
            </Text>
            <Text style={[styles.resultSubtitle, { color: colors.mutedForeground }]}>
              {decodedSubject} · {questions.length} questions
            </Text>
          </View>

          {/* Action buttons */}
          <View style={{ paddingHorizontal: 20, gap: 10, marginBottom: 24 }}>
            <Pressable onPress={() => router.back()}>
              <LinearGradient colors={["#009DB5", "#00C6D8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.doneBtn}>
                <Feather name="arrow-left" size={18} color="#fff" />
                <Text style={styles.doneBtnText}>Back to Quiz</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Review */}
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={[styles.reviewHeader, { color: colors.foreground }]}>Answer Review</Text>
            {questions.map((q, i) => {
              const userAns   = answers[i] ?? null;
              const isCorrect = userAns === q.correct;
              return (
                <GlassView key={q.id} style={[styles.reviewCard, { borderLeftColor: isCorrect ? colors.success : colors.critical }]} radius={16}>
                  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                    <View style={[styles.reviewBadge, { backgroundColor: isCorrect ? colors.success + "18" : colors.critical + "18" }]}>
                      <Feather name={isCorrect ? "check" : "x"} size={14} color={isCorrect ? colors.success : colors.critical} />
                    </View>
                    <Text style={[styles.reviewQuestion, { color: colors.foreground }]}>{q.question}</Text>
                  </View>
                  {!isCorrect && userAns !== null && (
                    <Text style={[styles.reviewWrong, { color: colors.critical }]}>
                      ✗ Your answer: {q.options[userAns]}
                    </Text>
                  )}
                  <Text style={[styles.reviewCorrect, { color: colors.success }]}>
                    ✓ {q.options[q.correct]}
                  </Text>
                  <Text style={[styles.reviewExplanation, { color: colors.mutedForeground }]}>
                    {q.explanation}
                  </Text>
                </GlassView>
              );
            })}
          </View>
        </ScrollView>
      </GlassBackground>
    );
  }

  function handleSelect(optionIndex: number) {
    if (revealed) return;
    setSelected(optionIndex);
    setRevealed(true);
    const isCorrect = optionIndex === question.correct;
    if (isCorrect) {
      setScore((s) => s + 1);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function handleNext() {
    setAnswers((prev) => [...prev, selected]);
    if (current + 1 >= questions.length) { setFinished(true); return; }
    scaleAnim.setValue(0.96);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    setCurrent((c) => c + 1);
    setSelected(null);
    setRevealed(false);
  }

  const diffColor = question.difficulty === "easy" ? colors.success : question.difficulty === "medium" ? colors.warning : colors.critical;

  return (
    <GlassBackground>
      {/* Header / progress bar */}
      <View style={[styles.quizHeader, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <GlassView style={styles.backBtnInner} radius={12}>
            <Feather name="x" size={18} color={colors.foreground} />
          </GlassView>
        </Pressable>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
            {current + 1} / {questions.length}
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: colors.glassBorder }]}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </View>

        <View style={[styles.scoreBadge, { backgroundColor: colors.primary + "14" }]}>
          <Text style={[styles.scoreBadgeText, { color: colors.primary }]}>{score} ✓</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.quizContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          {/* Subject + difficulty */}
          <View style={styles.metaRow}>
            <GlassView style={styles.subjectPill} radius={20}>
              <Text style={[styles.subjectPillText, { color: colors.primary }]}>{decodedSubject}</Text>
            </GlassView>
            {question.topic && (
              <Text style={[styles.topicText, { color: colors.mutedForeground }]}>{question.topic}</Text>
            )}
            <View style={[styles.diffBadge, { backgroundColor: diffColor + "18" }]}>
              <Text style={[styles.diffText, { color: diffColor }]}>
                {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
              </Text>
            </View>
          </View>

          {/* Question */}
          <GlassView style={styles.questionCard} radius={22}>
            <Text style={[styles.questionText, { color: colors.foreground }]}>{question.question}</Text>
          </GlassView>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {question.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect  = question.correct === i;
              let bgColor   = colors.glassBg;
              let borderCol = colors.glassBorder;
              let textColor = colors.foreground;
              let letterBg  = colors.glassBg;

              if (revealed) {
                if (isCorrect) {
                  bgColor   = colors.success + "14";
                  borderCol = colors.success;
                  textColor = colors.success;
                  letterBg  = colors.success + "22";
                } else if (isSelected && !isCorrect) {
                  bgColor   = colors.critical + "10";
                  borderCol = colors.critical;
                  textColor = colors.critical;
                  letterBg  = colors.critical + "18";
                }
              } else if (isSelected) {
                bgColor   = colors.primary + "14";
                borderCol = colors.primary;
                textColor = colors.primary;
                letterBg  = colors.primary + "22";
              }

              return (
                <Pressable key={i} onPress={() => handleSelect(i)} disabled={revealed} accessibilityRole="button" accessibilityLabel={`Option ${OPTION_LETTERS[i]}: ${opt}`}>
                  <View style={[styles.option, { backgroundColor: bgColor, borderColor: borderCol }]}>
                    <View style={[styles.optionLetter, { backgroundColor: letterBg }]}>
                      <Text style={[styles.optionLetterText, { color: textColor }]}>{OPTION_LETTERS[i]}</Text>
                    </View>
                    <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                    {revealed && isCorrect && <Feather name="check-circle" size={18} color={colors.success} />}
                    {revealed && isSelected && !isCorrect && <Feather name="x-circle" size={18} color={colors.critical} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Explanation */}
          {revealed && (
            <GlassView style={styles.explanationCard} radius={18} bgColor={colors.primary + "10"} borderColor={colors.primary + "30"}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Feather name="zap" size={13} color={colors.primary} />
                <Text style={[styles.explanationTitle, { color: colors.primary }]}>Explanation</Text>
              </View>
              <Text style={[styles.explanationText, { color: colors.foreground }]}>{question.explanation}</Text>
            </GlassView>
          )}
        </Animated.View>
      </ScrollView>

      {/* Next button */}
      {revealed && (
        <View style={[styles.nextContainer, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
          <Pressable onPress={handleNext} accessibilityLabel={current + 1 >= questions.length ? "Finish quiz" : "Next question"}>
            <LinearGradient colors={["#009DB5", "#00C6D8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtn}>
              <Text style={styles.nextBtnText}>
                {current + 1 >= questions.length ? "View Results" : "Next Question"}
              </Text>
              <Feather name={current + 1 >= questions.length ? "award" : "arrow-right"} size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      )}
    </GlassBackground>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    quizHeader:    { paddingHorizontal: 16, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 12 },
    backBtn:       {},
    backBtnInner:  { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    progressLabel: { fontSize: 12, fontWeight: "700", marginBottom: 5 },
    progressTrack: { height: 5, borderRadius: 3, width: 160, overflow: "hidden" },
    progressBar:   { height: "100%", borderRadius: 3 },
    scoreBadge:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    scoreBadgeText:{ fontSize: 13, fontWeight: "800" },

    quizContent:   { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 120 },
    metaRow:       { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" },
    subjectPill:   { paddingHorizontal: 12, paddingVertical: 5 },
    subjectPillText:{ fontSize: 12, fontWeight: "700" },
    topicText:     { fontSize: 12, fontWeight: "500", flex: 1 },
    diffBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    diffText:      { fontSize: 11, fontWeight: "800" },

    questionCard:  { padding: 20, marginBottom: 16, shadowColor: colors.glassShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16, elevation: 3 },
    questionText:  { fontSize: 17, fontWeight: "700", color: colors.foreground, lineHeight: 26 },

    optionsContainer: { gap: 10, marginBottom: 16 },
    option:        { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, padding: 14, borderWidth: 1.5 },
    optionLetter:  { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    optionLetterText: { fontSize: 14, fontWeight: "800" },
    optionText:    { flex: 1, fontSize: 14, lineHeight: 21, fontWeight: "500" },

    explanationCard:  { padding: 16, marginBottom: 10 },
    explanationTitle: { fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.8 },
    explanationText:  { fontSize: 14, lineHeight: 22, fontWeight: "500" },

    nextContainer: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.glassBorder + "50", backgroundColor: "transparent" + "E0" },
    nextBtn:       { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 18, paddingVertical: 16, gap: 10, shadowColor: "#009DB5", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 6 },
    nextBtnText:   { fontSize: 16, fontWeight: "800", color: "#fff" },

    // Results
    resultCircle:  { width: 130, height: 130, borderRadius: 65, borderWidth: 4, alignItems: "center", justifyContent: "center", marginBottom: 16, shadowColor: "#009DB5", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.20, shadowRadius: 20, elevation: 6 },
    resultPct:     { fontSize: 34, fontWeight: "900" },
    resultScore:   { fontSize: 14, fontWeight: "600" },
    resultTitle:   { fontSize: 24, fontWeight: "800", color: colors.foreground, marginBottom: 4, letterSpacing: -0.4 },
    resultSubtitle:{ fontSize: 13, color: colors.mutedForeground },
    doneBtn:       { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 18, paddingVertical: 16, shadowColor: "#009DB5", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 5 },
    doneBtnText:   { fontSize: 16, fontWeight: "800", color: "#fff" },

    reviewHeader:  { fontSize: 18, fontWeight: "800", color: colors.foreground, marginBottom: 14, letterSpacing: -0.3 },
    reviewCard:    { padding: 14, marginBottom: 10, borderLeftWidth: 4, shadowColor: colors.glassShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
    reviewBadge:   { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
    reviewQuestion: { flex: 1, fontSize: 13, fontWeight: "700", color: colors.foreground, lineHeight: 20 },
    reviewWrong:   { fontSize: 12, color: colors.critical, marginBottom: 4, paddingLeft: 36, fontWeight: "500" },
    reviewCorrect: { fontSize: 12, color: colors.success, marginBottom: 8, paddingLeft: 36, fontWeight: "700" },
    reviewExplanation: { fontSize: 12, color: colors.mutedForeground, lineHeight: 18, paddingLeft: 36 },
  });
}
