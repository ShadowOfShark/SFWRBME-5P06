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
import { Swipeable } from "react-native-gesture-handler";
import {
  deleteScanHistoryItem,
  getScanHistory,
  ScanHistoryItem,
} from "@/services/scanHistoryStorage";

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
    }, [])
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

  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => confirmDelete(id)}
      >
        <Text style={styles.deleteActionText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const renderProbabilities = (item: ScanHistoryItem) => {
    if (!item.probabilities) return null;

    const entries = Object.entries(item.probabilities);
    if (entries.length === 0) return null;

    return (
      <View style={styles.expandedSection}>
        <Text style={styles.expandedSectionTitle}>Model Probabilities</Text>
        {entries.map(([key, value]) => (
          <Text key={key} style={styles.expandedText}>
            {key}: {(value * 100).toFixed(1)}%
          </Text>
        ))}
      </View>
    );
  };

  const renderAnswers = (item: ScanHistoryItem) => {
    if (!item.questionnaireAnswers) return null;

    const entries = Object.entries(item.questionnaireAnswers);
    if (entries.length === 0) return null;

    return (
      <View style={styles.expandedSection}>
        <Text style={styles.expandedSectionTitle}>Questionnaire Answers</Text>
        {entries.map(([key, value]) => (
          <Text key={key} style={styles.expandedText}>
            {key}: {String(value)}
          </Text>
        ))}
      </View>
    );
  };

  const renderItem = ({ item }: { item: ScanHistoryItem }) => {
    const isExpanded = expandedId === item.id;

    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => toggleExpanded(item.id)}
          style={styles.card}
        >
          <Image source={{ uri: item.imageUri }} style={styles.cardImage} />

          <View style={styles.cardContent}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
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

            {item.imageQualityStatus ? (
              <Text style={styles.cardMeta}>
                Image quality: {item.imageQualityStatus}
              </Text>
            ) : null}

            {isExpanded && (
              <View style={styles.expandedContainer}>
                {renderProbabilities(item)}
                {renderAnswers(item)}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
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
  cardImage: {
    width: "100%",
    height: 180,
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
  cardMeta: {
    fontSize: 13,
    color: "#5A6B85",
  },
  expandedContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5EDF8",
  },
  expandedSection: {
    marginBottom: 12,
  },
  expandedSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1746A2",
    marginBottom: 6,
  },
  expandedText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#334155",
  },
  deleteAction: {
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    width: 92,
    marginBottom: 16,
    borderRadius: 20,
  },
  deleteActionText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
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