import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getScanHistory, ScanHistoryItem } from "@/services/scanHistoryStorage";

type ConditionCopy = {
  moderate: string;
  high: string;
  recommendation: string;
};

const CONDITION_CONTENT: Record<string, ConditionCopy> = {
  calculus: {
    moderate:
      "We noticed some signs of plaque hardening into tartar along the gumline.",
    high:
      "There appears to be significant tartar buildup on your teeth.",
    recommendation:
      "Tartar cannot be brushed away at home. Book a professional cleaning with a hygienist to have it safely scaled off.",
  },
  caries: {
    moderate:
      "There are indicators of potential early-stage enamel wear or decay.",
    high:
      "High likelihood of a cavity or structural tooth decay detected.",
    recommendation:
      "Limit sugary snacks and acidic drinks. Schedule an exam with a dentist so they can check this area with an X-ray before it causes pain.",
  },
  gingivitis: {
    moderate:
      "Your gums are showing early signs of inflammation or mild irritation.",
    high:
      "High likelihood of gingivitis. Your gums appear significantly red, swollen, or prone to bleeding.",
    recommendation:
      "Upgrade your routine: brush twice daily with a soft-bristle brush, floss every single night, and consider an antibacterial mouthwash to soothe the gums.",
  },
  tooth_discoloration: {
    moderate: "Mild surface staining detected.",
    high: "Noticeable tooth discoloration or heavy staining detected.",
    recommendation:
      "If this bothers you, try a whitening toothpaste or reducing coffee, tea, and tobacco. For deeper stains, ask your dentist about professional whitening options.",
  },
};

function normalizeConditionKey(key: string) {
  return key.trim().toLowerCase().replace(/\s+/g, "_");
}

function formatLabel(key: string) {
  return key.replace(/_/g, " ");
}

function getRiskBand(value: number) {
  const percent = value * 100;
  if (percent >= 75) return "high";
  if (percent >= 50) return "moderate";
  return "low";
}

export default function ScanResultScreen() {
  const { scanId } = useLocalSearchParams<{ scanId?: string }>();
  const [item, setItem] = useState<ScanHistoryItem | null>(null);

  useEffect(() => {
    const loadItem = async () => {
      const history = await getScanHistory();
      const found = history.find((entry) => entry.id === scanId) ?? null;
      setItem(found);
    };

    loadItem();
  }, [scanId]);

  const conditionEntries = useMemo(() => {
    if (!item?.probabilities) return [];

    return Object.entries(item.probabilities).filter(
      ([, value]) => typeof value === "number" && value >= 0.5
    );
  }, [item]);

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
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.summaryTitle}>
            {item.summary || "Analysis complete"}
          </Text>
          <Text style={styles.summaryMeta}>
            {item.detectedConditions && item.detectedConditions.length > 0
              ? `Detected: ${item.detectedConditions.join(", ")}`
              : "No conditions detected"}
          </Text>
          {!!item.imageQualityStatus && (
            <Text style={styles.summaryMeta}>
              Image quality: {item.imageQualityStatus}
            </Text>
          )}
        </View>

        {conditionEntries.length === 0 ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Healthy</Text>
            <Text style={styles.infoText}>
              Looking great! We didn't detect any high-risk indicators for
              cavities, tartar, gum inflammation, or severe staining.
            </Text>
            <Text style={styles.infoRecommendation}>
              Recommendation: Keep up the excellent work. Stick to your daily
              brushing and flossing routine, and don't forget your routine
              6-month checkups!
            </Text>
          </View>
        ) : (
          conditionEntries.map(([rawKey, value]) => {
            const key = normalizeConditionKey(rawKey);
            const content = CONDITION_CONTENT[key];
            if (!content) return null;

            const band = getRiskBand(value);

            return (
              <View key={rawKey} style={styles.infoCard}>
                <Text style={styles.infoTitle}>
                  {formatLabel(rawKey)} — {(value * 100).toFixed(1)}%
                </Text>
                <Text style={styles.infoText}>
                  {band === "high" ? content.high : content.moderate}
                </Text>
                <Text style={styles.infoRecommendation}>
                  Recommendation: {content.recommendation}
                </Text>
              </View>
            );
          })
        )}

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
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  summaryMeta: {
    fontSize: 15,
    color: "#1E6FD9",
    marginBottom: 4,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E3ECF7",
    padding: 16,
    marginBottom: 14,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1746A2",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  infoText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#334155",
    marginBottom: 10,
  },
  infoRecommendation: {
    fontSize: 15,
    lineHeight: 24,
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