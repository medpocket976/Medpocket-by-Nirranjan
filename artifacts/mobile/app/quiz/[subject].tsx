import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

import { useApp } from "@/context/AppContext";
import { QuizQuestion, getDailyChallenge, getQuizBySubject } from "@/data/quizData";
import { useColors } from "@/hooks/useColors";

export default function QuizPlayScreen() {
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const decodedSubject = decodeURIComponent(subject ?? "All");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addQuizResult } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [questions] = useState<QuizQuestion[]>(() => {
    const qs = decodedSubject === "All" ? getDailyChallenge() : getQuizBySubject(decodedSubject);
    return qs.slice(0, 10);
  });

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (finished && questions.length > 0) {
      addQuizResult({
        subject: decodedSubject,
        score,
        total: questions.length,
        date: new Date().toISOString(),
      });
    }
  }, [finished]);

  const question = questions[current];
  const styles = makeStyles(colors);
  const progress = (current / questions.length) * 100;

  if (questions.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: 40 }}>
        <Feather name="inbox" size={48} color={colors.border} />
        <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginTop: 16 }}>No questions yet</Text>
        <Text style={{ fontSize: 13, color: colors.mutedForeground, textAlign: "center", marginTop: 8 }}>
          Questions for {decodedSubject} are coming soon.
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 24, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  function handleSelect(optionIndex: number) {
    if (revealed) return;
    setSelected(optionIndex);
    setRevealed(true);
    const isCorrect = optionIndex === question.correct;
    if (isCorrect) {
      setScore((s) => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function handleNext() {
    setAnswers((prev) => [...prev, selected]);
    if (current + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setCurrent((c) => c + 1);
    setSelected(null);
    setRevealed(false);
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const resultColor = pct >= 70 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444";
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingTop: topPad + 20, paddingBottom: insets.bottom + 40, padding: 20 }}>
        <View style={styles.resultHeader}>
          <View style={[styles.resultCircle, { borderColor: resultColor }]}>
            <Text style={[styles.resultPct, { color: resultColor }]}>{pct}%</Text>
            <Text style={[styles.resultScore, { color: resultColor }]}>{score}/{questions.length}</Text>
          </View>
          <Text style={styles.resultTitle}>
            {pct >= 70 ? "Excellent!" : pct >= 50 ? "Good effort!" : "Keep practicing!"}
          </Text>
          <Text style={styles.resultSubtitle}>{decodedSubject} Quiz</Text>
        </View>

        {questions.map((q, i) => {
          const ans = answers[i];
          const correct = ans === q.correct;
          return (
            <View key={q.id} style={[styles.reviewCard, { borderLeftColor: correct ? "#10B981" : "#EF4444" }]}>
              <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                <Feather name={correct ? "check-circle" : "x-circle"} size={16} color={correct ? "#10B981" : "#EF4444"} style={{ marginTop: 2 }} />
                <Text style={styles.reviewQuestion}>{q.question}</Text>
              </View>
              {ans !== null && ans !== q.correct && (
                <Text style={styles.reviewWrong}>Your answer: {q.options[ans]}</Text>
              )}
              <Text style={styles.reviewCorrect}>Correct: {q.options[q.correct]}</Text>
              <Text style={styles.reviewExplanation}>{q.explanation}</Text>
            </View>
          );
        })}

        <Pressable
          style={[styles.doneBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="x" size={20} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSubject}>{decodedSubject}</Text>
          <Text style={styles.headerProgress}>{current + 1} / {questions.length}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Difficulty */}
          <View style={styles.diffRow}>
            <View style={[styles.diffBadge, {
              backgroundColor: question.difficulty === "easy" ? "#D1FAE5" : question.difficulty === "medium" ? "#FEF3C7" : "#FEE2E2"
            }]}>
              <Text style={[styles.diffText, {
                color: question.difficulty === "easy" ? "#10B981" : question.difficulty === "medium" ? "#F59E0B" : "#EF4444"
              }]}>
                {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
              </Text>
            </View>
            {question.topic && (
              <View style={[styles.diffBadge, { backgroundColor: colors.tealLight }]}>
                <Text style={[styles.diffText, { color: colors.primary }]}>{question.topic}</Text>
              </View>
            )}
          </View>

          {/* Question */}
          <Text style={styles.questionText}>{question.question}</Text>

          {/* Options */}
          {question.options.map((option, i) => {
            let bg = colors.card;
            let border = colors.border;
            let textColor = colors.foreground;
            if (revealed) {
              if (i === question.correct) {
                bg = "#D1FAE5"; border = "#10B981"; textColor = "#065F46";
              } else if (i === selected && i !== question.correct) {
                bg = "#FEE2E2"; border = "#EF4444"; textColor = "#991B1B";
              }
            } else if (selected === i) {
              bg = colors.tealLight; border = colors.primary; textColor = colors.primary;
            }

            return (
              <Pressable
                key={i}
                style={[styles.option, { backgroundColor: bg, borderColor: border }]}
                onPress={() => handleSelect(i)}
                disabled={revealed}
              >
                <View style={[styles.optionLetter, { backgroundColor: border + "20" }]}>
                  <Text style={[styles.optionLetterText, { color: textColor }]}>
                    {["A", "B", "C", "D"][i]}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                {revealed && i === question.correct && (
                  <Feather name="check-circle" size={16} color="#10B981" />
                )}
                {revealed && i === selected && i !== question.correct && (
                  <Feather name="x-circle" size={16} color="#EF4444" />
                )}
              </Pressable>
            );
          })}

          {/* Explanation */}
          {revealed && (
            <View style={styles.explanationCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Feather name="book-open" size={14} color={colors.primary} />
                <Text style={styles.explanationTitle}>Explanation</Text>
              </View>
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Next button */}
      {revealed && (
        <View style={[styles.nextContainer, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>
              {current + 1 >= questions.length ? "See Results" : "Next Question"}
            </Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 20, paddingBottom: 12, gap: 12,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.muted, alignItems: "center", justifyContent: "center",
    },
    headerCenter: { flex: 1, alignItems: "center" },
    headerSubject: { fontSize: 14, fontWeight: "700", color: colors.foreground },
    headerProgress: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
    scoreBadge: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.tealLight, alignItems: "center", justifyContent: "center",
    },
    scoreText: { fontSize: 16, fontWeight: "800", color: colors.primary },
    progressBar: { height: 4, backgroundColor: colors.muted, marginHorizontal: 20, borderRadius: 2 },
    progressFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 2 },
    diffRow: { flexDirection: "row", gap: 6, marginBottom: 16 },
    diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    diffText: { fontSize: 11, fontWeight: "700" },
    questionText: { fontSize: 17, fontWeight: "700", color: colors.foreground, lineHeight: 26, marginBottom: 20 },
    option: {
      flexDirection: "row", alignItems: "center", gap: 12,
      borderRadius: 14, padding: 14, marginBottom: 10,
      borderWidth: 1.5,
    },
    optionLetter: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    optionLetterText: { fontSize: 14, fontWeight: "800" },
    optionText: { flex: 1, fontSize: 14, lineHeight: 21 },
    explanationCard: {
      backgroundColor: colors.tealLight, borderRadius: 14, padding: 16,
      marginTop: 8, borderWidth: 1, borderColor: colors.primary + "40",
    },
    explanationTitle: { fontSize: 13, fontWeight: "700", color: colors.primary, textTransform: "uppercase" },
    explanationText: { fontSize: 13, color: colors.foreground, lineHeight: 21 },
    nextContainer: {
      paddingHorizontal: 20, paddingTop: 12,
      borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background,
    },
    nextBtn: {
      flexDirection: "row", alignItems: "center", justifyContent: "center",
      backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, gap: 10,
    },
    nextBtnText: { fontSize: 16, fontWeight: "800", color: "#fff" },
    // Results
    resultHeader: { alignItems: "center", marginBottom: 24 },
    resultCircle: {
      width: 120, height: 120, borderRadius: 60, borderWidth: 4,
      alignItems: "center", justifyContent: "center", marginBottom: 16,
    },
    resultPct: { fontSize: 30, fontWeight: "900" },
    resultScore: { fontSize: 14, fontWeight: "600" },
    resultTitle: { fontSize: 22, fontWeight: "800", color: colors.foreground },
    resultSubtitle: { fontSize: 13, color: colors.mutedForeground, marginTop: 4 },
    reviewCard: {
      backgroundColor: colors.card, borderRadius: 14, padding: 14,
      marginBottom: 10, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4,
    },
    reviewQuestion: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.foreground, lineHeight: 20 },
    reviewWrong: { fontSize: 12, color: "#EF4444", marginBottom: 4, paddingLeft: 24 },
    reviewCorrect: { fontSize: 12, color: "#10B981", marginBottom: 8, paddingLeft: 24, fontWeight: "600" },
    reviewExplanation: { fontSize: 12, color: colors.mutedForeground, lineHeight: 18, paddingLeft: 24 },
    doneBtn: {
      borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8,
    },
    doneBtnText: { fontSize: 16, fontWeight: "800", color: "#fff" },
  });
}
