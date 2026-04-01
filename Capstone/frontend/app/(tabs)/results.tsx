import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "expo-router";
import {
  deleteScanHistoryItem,
  getScanHistory,
  ScanHistoryItem,
} from "@/services/scanHistoryStorage";

type RiskLevel = "low" | "moderate" | "high";

type ConditionCopy = {
  recommendation: string;
};

const CONDITION_CONTENT: Record<string, ConditionCopy> = {
  calculus: {
    recommendation:
      "Book a professional dental cleaning, since tartar cannot be removed effectively at home.",
  },
  caries: {
    recommendation:
      "Reduce sugary and acidic foods, and schedule a dental exam to assess for possible cavities.",
  },
  gingivitis: {
    recommendation:
      "Brush twice daily, floss every night, and consider a gum-care mouthwash. If bleeding continues, book a dental visit.",
  },
  tooth_discoloration: {
    recommendation:
      "Reduce staining habits such as coffee, tea, or tobacco, and ask your dentist about whitening if needed.",
  },
};

function normalizeConditionKey(key: string) {
  return key.trim().toLowerCase().replace(/\s+/g, "_");
}

function formatLabel(key: string) {
  return key.replace(/_/g, " ");
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

export default function ResultsScreen() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      const items = await getScanHistory();
      setHistory(items);
    } catch (error) {
      console.error("Failed to load scan history:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, []),
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteScanHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (expandedId === id) {
        setExpandedId(null);
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      Alert.alert("Delete failed", "We could not delete this scan.");
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert("Delete scan?", "This scan will be removed from your history.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDelete(id),
      },
    ]);
  };

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderProbabilities = (item: ScanHistoryItem) => {
    if (!item.probabilities) return null;

    const entries = Object.entries(item.probabilities).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return null;

    return (
      <View style={styles.expandedSection}>
        <Text style={styles.expandedSectionTitle}>Risk Summary</Text>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#16A34A" }]} />
            <Text style={styles.legendText}>Low</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#D97706" }]} />
            <Text style={styles.legendText}>Moderate</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#DC2626" }]} />
            <Text style={styles.legendText}>High</Text>
          </View>
        </View>

        {entries.map(([key, value]) => {
          const level = getRiskLevel(value);
          const color = getRiskColor(level);

          return (
            <View key={key} style={styles.riskRow}>
              <Text style={[styles.riskText, { color }]}>
                {formatLabel(key)}: {getPercent(value).toFixed(1)}% •{" "}
                {getRiskLabel(level)}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderRecommendations = (item: ScanHistoryItem) => {
    if (!item.probabilities) return null;

    const entries = Object.entries(item.probabilities)
      .filter(([, value]) => typeof value === "number" && value >= 0.5)
      .sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
      return (
        <View style={styles.expandedSection}>
          <Text style={styles.expandedSectionTitle}>Recommendations</Text>
          <Text style={styles.expandedText}>
            Continue brushing twice daily, floss once daily, and maintain routine
            dental checkups.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.expandedSection}>
        <Text style={styles.expandedSectionTitle}>Recommendations</Text>
        {entries.map(([key, value]) => {
          const normalizedKey = normalizeConditionKey(key);
          const content = CONDITION_CONTENT[normalizedKey];
          const level = getRiskLevel(value);
          const color = getRiskColor(level);

          if (!content) return null;

          return (
            <View key={key} style={styles.recommendationBlock}>
              <Text style={[styles.recommendationTitle, { color }]}>
                {formatLabel(key)} — {getPercent(value).toFixed(1)}% •{" "}
                {getRiskLabel(level)}
              </Text>
              <Text style={styles.expandedText}>{content.recommendation}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item }: { item: ScanHistoryItem }) => {
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => toggleExpanded(item.id)}
        style={styles.card}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUri }} style={styles.cardImage} />

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => confirmDelete(item.id)}
          >
            <Text style={styles.deleteButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardDate}>{formatTimestamp(item.createdAt)}</Text>
            <Text style={styles.expandHint}>
              {isExpanded ? "Tap to collapse" : "Tap to expand"}
            </Text>
          </View>

          <Text style={styles.cardSummary}>
            {item.summary || "No summary available"}
          </Text>

          {item.detectedConditions && item.detectedConditions.length > 0 ? (
            <Text style={styles.cardConditions}>
              Detected: {item.detectedConditions.join(", ")}
            </Text>
          ) : (
            <Text style={styles.cardConditions}>No conditions detected</Text>
          )}

          {isExpanded && (
            <View style={styles.expandedContainer}>
              {renderProbabilities(item)}
              {renderRecommendations(item)}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Past Scan Results</Text>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No past scans yet.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8FF",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E3ECF7",
  },
  imageContainer: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 180,
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  cardContent: {
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  expandHint: {
    fontSize: 12,
    color: "#94A3B8",
  },
  cardSummary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  cardConditions: {
    fontSize: 14,
    color: "#1E6FD9",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  expandedContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5EDF8",
  },
  expandedSection: {
    marginBottom: 14,
  },
  expandedSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1746A2",
    marginBottom: 8,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
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
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  riskRow: {
    marginBottom: 6,
  },
  riskText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  recommendationBlock: {
    marginBottom: 10,
  },
  recommendationTitle: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "800",
    textTransform: "capitalize",
    marginBottom: 2,
  },
  expandedText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#334155",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
  },
});