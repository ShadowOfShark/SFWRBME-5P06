import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { QUESTIONS, QuestionOption } from "../constants/questions";
import { submitScan } from "../services/scanService";
import { Answers } from "../utils/scoring";

function ProgressBar({ current, total }: { current: number; total: number }) {
  const width = total > 0 ? (current / total) * 100 : 0;

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${width}%` }]} />
    </View>
  );
}

function OptionCard({
  option,
  selected,
  onPress,
}: {
  option: QuestionOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.optionCard, selected && styles.optionCardSelected]}
    >
      <View style={styles.optionRow}>
        <View
          style={[styles.radioOuter, selected && styles.radioOuterSelected]}
        >
          {selected ? <View style={styles.radioInner} /> : null}
        </View>
        <Text
          style={[styles.optionText, selected && styles.optionTextSelected]}
        >
          {option.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function QuestionnaireScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string | undefined;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const currentQuestion = QUESTIONS[currentIndex];
  const selectedValue = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  const handleSelect = (questionId: string, optionCode: string) => {
    if (isSubmitting) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionCode,
    }));
  };

  const handleExit = () => {
    if (isSubmitting) return;

    const hasProgress = Object.keys(answers).length > 0;

    if (!hasProgress) {
      router.replace("/");
      return;
    }

    Alert.alert(
      "Exit questionnaire?",
      "Your current progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => router.replace("/"),
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!imageUri) {
      Alert.alert(
        "Missing image",
        "Please return to the scan page and select an image before submitting."
      );
      return;
    }

    if (QUESTIONS.length === 0) {
      Alert.alert(
        "Questionnaire unavailable",
        "No questions are available right now. Please try again later."
      );
      return;
    }

    if (Object.keys(answers).length < QUESTIONS.length) {
      Alert.alert(
        "Incomplete questionnaire",
        "Please answer all questions before submitting."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await submitScan(imageUri, answers);

      router.push(
        `/scan_result?result=${encodeURIComponent(JSON.stringify(result))}`
      );
    } catch (error) {
      console.error("Questionnaire submit failed:", error);

      Alert.alert(
        "Submission failed",
        "We could not submit your questionnaire right now. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!currentQuestion) {
      Alert.alert(
        "Question unavailable",
        "We could not load this question. Please return and try again."
      );
      return;
    }

    if (!selectedValue) {
      Alert.alert(
        "Answer required",
        "Please select an answer before continuing."
      );
      return;
    }

    if (isSubmitting) return;

    if (currentIndex === QUESTIONS.length - 1) {
      handleSubmit();
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    if (isSubmitting) return;

    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      handleExit();
    }
  };

  if (!currentQuestion && QUESTIONS.length > 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredWrap}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Question unavailable</Text>
            <Text style={styles.infoText}>
              Something went wrong loading the questionnaire.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace("/")}
            >
              <Text style={styles.primaryButtonText}>Return Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (QUESTIONS.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredWrap}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>No questions available</Text>
            <Text style={styles.infoText}>
              The questionnaire is currently unavailable.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace("/")}
            >
              <Text style={styles.primaryButtonText}>Return Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={handleExit}
            style={styles.exitButton}
            disabled={isSubmitting}
          >
            <Text
              style={[styles.exitText, isSubmitting && styles.disabledText]}
            >
              ← Exit to Home
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Dental screening</Text>
          <Text style={styles.heroTitle}>Questionnaire</Text>
          <Text style={styles.heroSubtitle}>
            Answer each question as accurately as possible to support your oral
            health screening.
          </Text>
        </View>

        {!imageUri && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>No image selected</Text>
            <Text style={styles.warningText}>
              You can still review the questions, but you will need to return to
              the scan page before submission.
            </Text>
          </View>
        )}

        <View style={styles.progressSection}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressLabel}>
              Question {currentIndex + 1} of {QUESTIONS.length}
            </Text>
            <Text style={styles.progressLabel}>
              {Math.round(((currentIndex + 1) / QUESTIONS.length) * 100)}%
            </Text>
          </View>
          <ProgressBar current={currentIndex + 1} total={QUESTIONS.length} />
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <OptionCard
                key={option.code}
                option={option}
                selected={selectedValue === option.code}
                onPress={() => handleSelect(currentQuestion.id, option.code)}
              />
            ))}
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              isSubmitting && styles.disabledButton,
            ]}
            onPress={handleBack}
            disabled={isSubmitting}
          >
            <Text style={styles.secondaryButtonText}>
              {currentIndex === 0 ? "Exit" : "Back"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!selectedValue || isSubmitting) && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={!selectedValue || isSubmitting}
          >
            {isSubmitting ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Submitting...</Text>
              </View>
            ) : (
              <Text style={styles.primaryButtonText}>
                {currentIndex === QUESTIONS.length - 1 ? "Submit" : "Next"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8FF",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centeredWrap: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  topBar: {
    marginBottom: 10,
  },
  exitButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  exitText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },
  disabledText: {
    opacity: 0.5,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  heroEyebrow: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#2563EB",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
  },
  warningCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#9A3412",
    marginBottom: 6,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#9A3412",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 14,
  },
  progressSection: {
    marginBottom: 18,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#DCEAFE",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 21,
    lineHeight: 30,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 18,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    borderWidth: 1.5,
    borderColor: "#D6E4FF",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 14,
  },
  optionCardSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#94A3B8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 1,
  },
  radioOuterSelected: {
    borderColor: "#2563EB",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#1E293B",
  },
  optionTextSelected: {
    color: "#1D4ED8",
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#E8F0FF",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CFE0FF",
  },
  secondaryButtonText: {
    color: "#1746A2",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});