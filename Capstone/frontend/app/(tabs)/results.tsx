import { getScanHistory, ScanHistoryItem } from "@/services/scanHistoryStorage";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ResultsScreen() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

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

  const renderItem = ({ item }: { item: ScanHistoryItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUri }} style={styles.cardImage} />

      <View style={styles.cardContent}>
        <Text style={styles.cardDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>

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
      </View>
    </View>
  );

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
  cardDate: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
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
  },
  cardMeta: {
    fontSize: 13,
    color: "#5A6B85",
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
