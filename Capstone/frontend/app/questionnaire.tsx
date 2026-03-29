import React, { useMemo, useState } from "react";
import {
        SafeAreaView,
        ScrollView,
        StyleSheet,
        Text,
        TouchableOpacity,
        View,
} from "react-native";
import {
        CONDITIONS,
        Condition,
        QUESTIONS,
        QuestionOption,
} from "../constants/questions";
import {
        Answers,
        computeScores,
        scoresToProbabilities,
} from "../utils/scoring";

function ProgressBar({ current, total }: { current: number; total: number }) {
  const width = (current / total) * 100;

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

function ResultCard({
  label,
  score,
  probability,
}: {
  label: Condition;
  score: number;
  probability: number;
}) {
  const percentage = Math.round(probability * 100);

  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultTitle}>{label}</Text>
        <Text style={styles.resultPercent}>{percentage}%</Text>
      </View>

      <View style={styles.resultBarTrack}>
        <View style={[styles.resultBarFill, { width: `${percentage}%` }]} />
      </View>

      <Text style={styles.resultScore}>Score: {score.toFixed(1)}</Text>
    </View>
  );
}

export default function QuestionnaireScreen() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResults, setShowResults] = useState<boolean>(false);

  const currentQuestion = QUESTIONS[currentIndex];
  const selectedValue = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  const results = useMemo(() => {
    const scores = computeScores(answers);
    const probabilities = scoresToProbabilities(scores);
    return { scores, probabilities };
  }, [answers]);

  const handleSelect = (questionId: string, optionCode: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionCode,
    }));
  };

  const handleNext = () => {
    if (!selectedValue) return;

    if (currentIndex === QUESTIONS.length - 1) {
      setShowResults(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    if (showResults) {
      setShowResults(false);
      return;
    }

    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>Screening summary</Text>
            <Text style={styles.heroTitle}>Your questionnaire results</Text>
            <Text style={styles.heroSubtitle}>
              This is a simple screening estimate, not a diagnosis. Please
              consult a dental professional for proper evaluation.
            </Text>
          </View>

          <View style={styles.resultsSection}>
            {CONDITIONS.map((condition) => (
              <ResultCard
                key={condition}
                label={condition}
                score={results.scores[condition]}
                probability={results.probabilities[condition]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRestart}
          >
            <Text style={styles.primaryButtonText}>Start again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
            <Text style={styles.secondaryButtonText}>
              Back to last question
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Dental screening</Text>
          <Text style={styles.heroTitle}>Questionnaire</Text>
          <Text style={styles.heroSubtitle}>
            Answer each question as accurately as possible for a quick screening
            estimate.
          </Text>
        </View>

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
              currentIndex === 0 && styles.disabledButton,
            ]}
            onPress={handleBack}
            disabled={currentIndex === 0}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              !selectedValue && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={!selectedValue}
          >
            <Text style={styles.primaryButtonText}>
              {currentIndex === QUESTIONS.length - 1 ? "See results" : "Next"}
            </Text>
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
  resultsSection: {
    marginBottom: 20,
    gap: 12,
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  resultPercent: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563EB",
  },
  resultBarTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
    overflow: "hidden",
    marginBottom: 10,
  },
  resultBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },
  resultScore: {
    fontSize: 14,
    color: "#475569",
  },
});
