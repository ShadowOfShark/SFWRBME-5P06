import { getScanHistory, ScanHistoryItem } from "@/services/scanHistoryStorage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ConditionCopy = {
  low: string;
  moderate: string;
  high: string;
  recommendation: string;
};

const CONDITION_CONTENT: Record<string, ConditionCopy> = {
  calculus: {
    low: "Low visible signs of plaque hardening into tartar were detected.",
    moderate:
      "We noticed some signs of plaque hardening into tartar along the gumline.",
    high: "There appears to be significant tartar buildup on your teeth.",
    recommendation:
      "Tartar cannot be brushed away at home. Book a professional cleaning with a hygienist to have it safely scaled off.",
  },
  caries: {
    low: "Low visible signs associated with tooth decay were detected.",
    moderate:
      "There are indicators of potential early-stage enamel wear or decay.",
    high: "High likelihood of a cavity or structural tooth decay detected.",
    recommendation:
      "Limit sugary snacks and acidic drinks. Schedule an exam with a dentist so they can check this area with an X-ray before it causes pain.",
  },
  gingivitis: {
    low: "Low visible signs of gum inflammation were detected.",
    moderate:
      "Your gums are showing early signs of inflammation or mild irritation.",
    high: "High likelihood of gingivitis. Your gums appear significantly red, swollen, or prone to bleeding.",
    recommendation:
      "Brush twice daily with a soft-bristle brush, floss every night, and consider an antibacterial mouthwash. If bleeding continues, book a dental checkup.",
  },
  tooth_discoloration: {
    low: "Low visible signs of tooth staining were detected.",
    moderate: "Mild surface staining detected.",
    high: "Noticeable tooth discoloration or heavy staining detected.",
    recommendation:
      "If this bothers you, try a whitening toothpaste or reducing coffee, tea, and tobacco. For deeper stains, ask your dentist about professional whitening options.",
  },
};

type RiskLevel = "low" | "moderate" | "high";

function normalizeConditionKey(key: string) {
  return key.trim().toLowerCase().replace(/\s+/g, "_");
}

function formatLabel(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getPercent(value: number) {
  return value * 100;
}

function getRiskLevel(value: number): RiskLevel {
  const percent = getPercent(value);

  if (percent < 50) return "low";
  if (percent < 75) return "moderate";
  return "high";
}

function getRiskColor(level: RiskLevel) {
  switch (level) {
    case "low":
      return "#16A34A";
    case "moderate":
      return "#D97706";
    case "high":
      return "#DC2626";
    default:
      return "#1746A2";
  }
}

function getRiskLabel(level: RiskLevel) {
  switch (level) {
    case "low":
      return "Low risk";
    case "moderate":
      return "Moderate risk";
    case "high":
      return "High risk";
    default:
      return "";
  }
}

function formatTimestamp(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ScanResultScreen() {
  const { scanId } = useLocalSearchParams<{ scanId?: string }>();
  const [item, setItem] = useState<ScanHistoryItem | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  useEffect(() => {
    const loadItem = async () => {
      const history = await getScanHistory();
      const found = history.find((entry) => entry.id === scanId) ?? null;
      setItem(found);
    };

    loadItem();
  }, [scanId]);

  const probabilityEntries = useMemo(() => {
    if (!item?.probabilities) return [];

    return Object.entries(item.probabilities)
      .filter(([, value]) => typeof value === "number")
      .sort((a, b) => b[1] - a[1]);
  }, [item]);

  const visibleEntries = useMemo(() => {
    return probabilityEntries.filter(([, value]) => value >= 0.5);
  }, [probabilityEntries]);

  const toggleExpanded = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.title}>Scan Result</Text>
          <Text style={styles.emptyText}>Could not load this scan result.</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace("/(tabs)/results")}
          >
            <Text style={styles.primaryButtonText}>Go to Past Results</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Scan Result</Text>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Medical Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            This AI tool provides an estimated risk assessment based on your
            inputs and images. It is not a substitute for professional medical
            advice, diagnosis, or treatment. Always consult with a qualified
            dentist for your oral health.
          </Text>
        </View>

        <Image source={{ uri: item.imageUri }} style={styles.resultImage} />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryDate}>
            Scan completed: {formatTimestamp(item.createdAt)}
          </Text>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Risk Overview</Text>

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#16A34A" }]}
              />
              <Text style={styles.legendText}>Low (&lt;50%)</Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#D97706" }]}
              />
              <Text style={styles.legendText}>Moderate (50–74%)</Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#DC2626" }]}
              />
              <Text style={styles.legendText}>High (75%+)</Text>
            </View>
          </View>

          {visibleEntries.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateTitle}>Healthy — Low risk</Text>
              <Text style={styles.emptyStateText}>
                No moderate- or high-risk indicators were identified in this
                scan.
              </Text>
              <Text style={styles.emptyStateRecommendation}>
                Recommendation: Continue brushing twice daily, floss once daily,
                and attend routine dental checkups.
              </Text>
            </View>
          ) : (
            visibleEntries.map(([rawKey, value]) => {
              const key = normalizeConditionKey(rawKey);
              const content = CONDITION_CONTENT[key];
              if (!content) return null;

              const percent = getPercent(value);
              const level = getRiskLevel(value);
              const riskColor = getRiskColor(level);
              const isExpanded = expandedKey === key;

              let detailText = content.low;
              if (level === "moderate") detailText = content.moderate;
              if (level === "high") detailText = content.high;

              return (
                <TouchableOpacity
                  key={rawKey}
                  activeOpacity={0.9}
                  onPress={() => toggleExpanded(key)}
                  style={styles.accordionCard}
                >
                  <View style={styles.graphRow}>
                    <View style={styles.graphLabelRow}>
                      <Text
                        style={[
                          styles.graphLabel,
                          styles.graphLabelLeft,
                          { color: riskColor },
                        ]}
                      >
                        {formatLabel(rawKey)}
                      </Text>

                      <Text
                        style={[
                          styles.graphValue,
                          styles.graphValueRight,
                          { color: riskColor },
                        ]}
                      >
                        {percent.toFixed(1)}% • {getRiskLabel(level)}
                      </Text>
                    </View>

                    <View style={styles.graphTrack}>
                      <View
                        style={[
                          styles.graphFill,
                          {
                            width: `${Math.min(percent, 100)}%`,
                            backgroundColor: riskColor,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.tapHintRow}>
                      <Text style={styles.tapHintText}>
                        {isExpanded
                          ? "Tap to hide details"
                          : "Tap to view details"}
                      </Text>
                      <Text style={styles.tapHintChevron}>
                        {isExpanded ? "−" : "+"}
                      </Text>
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <Text style={styles.expandedDescription}>
                        {detailText}
                      </Text>
                      <Text style={styles.expandedRecommendation}>
                        Recommendation: {content.recommendation}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/(tabs)/results")}
        >
          <Text style={styles.primaryButtonText}>View Past Results</Text>
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
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
  },
  disclaimerCard: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FDBA74",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  disclaimerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#9A3412",
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#7C2D12",
  },
  resultImage: {
    width: "100%",
    height: 240,
    borderRadius: 20,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E3ECF7",
    padding: 16,
    marginBottom: 16,
  },
  summaryDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E3ECF7",
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1746A2",
    marginBottom: 12,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
  accordionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 10,
    marginBottom: 8,
  },
  graphRow: {
    marginBottom: 4,
  },
  graphLabelRow: {
    marginBottom: 8,
  },
  graphLabel: {
    fontSize: 15,
    fontWeight: "800",
    textTransform: "capitalize",
    marginBottom: 4,
  },
  graphLabelLeft: {
    width: "100%",
  },
  graphValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  graphValueRight: {
    width: "100%",
  },
  graphTrack: {
    width: "100%",
    height: 12,
    borderRadius: 999,
    backgroundColor: "#E5EDF8",
    overflow: "hidden",
  },
  graphFill: {
    height: "100%",
    borderRadius: 999,
  },
  tapHintRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tapHintText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  tapHintChevron: {
    fontSize: 18,
    color: "#64748B",
    fontWeight: "700",
    lineHeight: 18,
  },
  expandedContent: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5EDF8",
  },
  expandedDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: "#334155",
    marginBottom: 10,
  },
  expandedRecommendation: {
    fontSize: 14,
    lineHeight: 22,
    color: "#0F172A",
    fontWeight: "700",
  },
  emptyStateCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#16A34A",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#334155",
    marginBottom: 8,
  },
  emptyStateRecommendation: {
    fontSize: 14,
    lineHeight: 22,
    color: "#0F172A",
    fontWeight: "700",
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: "#1E6FD9",
    borderRadius: 999,
    alignItems: "center",
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 14,
  },
});
