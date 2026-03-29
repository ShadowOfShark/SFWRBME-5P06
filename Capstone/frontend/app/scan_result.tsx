import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

export default function ScanResultScreen() {
  const params = useLocalSearchParams();

  let result: any = null;

  try {
    result = params.result ? JSON.parse(params.result as string) : null;
  } catch (error) {
    console.error("Failed to parse result:", error);
  }

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.scrollContent}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>No Result Found</Text>
            <Text style={styles.infoText}>
              We could not load the screening result.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const probabilities = result.probabilities ?? {};
  const detectedConditions = result.detected_conditions ?? [];
  const summary = result.summary ?? "Analysis completed.";
  const imageQualityPassed = result.image_quality_passed;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Screening complete</Text>
          <Text style={styles.heroTitle}>Your scan result</Text>
          <Text style={styles.heroSubtitle}>{summary}</Text>
        </View>

        {typeof imageQualityPassed === "boolean" && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Image quality check</Text>
            <Text style={styles.infoText}>
              {imageQualityPassed ? "Passed" : "Needs review"}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk breakdown</Text>

          {Object.keys(probabilities).length === 0 ? (
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>No probability data returned.</Text>
            </View>
          ) : (
            Object.entries(probabilities).map(([condition, prob]) => {
              const percentage = Math.round(Number(prob) * 100);

              return (
                <View key={condition} style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultTitle}>{condition}</Text>
                    <Text style={styles.resultPercent}>{percentage}%</Text>
                  </View>

                  <View style={styles.resultBarTrack}>
                    <View
                      style={[styles.resultBarFill, { width: `${percentage}%` }]}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detected indicators</Text>

          {detectedConditions.length === 0 ? (
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                No detected indicators were returned.
              </Text>
            </View>
          ) : (
            <View style={styles.infoCard}>
              {detectedConditions.map((item: string) => (
                <Text key={item} style={styles.bulletItem}>
                  • {item}
                </Text>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.primaryButtonText}>Start New Scan</Text>
        </TouchableOpacity>
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
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
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
    marginBottom: 12,
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
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
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
  },
  resultBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },
  bulletItem: {
    fontSize: 15,
    lineHeight: 24,
    color: "#1E293B",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});