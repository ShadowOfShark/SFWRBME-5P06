import AsyncStorage from "@react-native-async-storage/async-storage";

export type RiskLevel = "low" | "moderate" | "high";

export type SavedRecommendation = {
  condition: string;
  percentage: number;
  riskLevel: RiskLevel;
  recommendation: string;
};

export type ScanHistoryItem = {
  id: string;
  imageUri: string;
  createdAt: string;
  summary?: string;
  detectedConditions?: string[];
  probabilities?: Record<string, number>;
  recommendations?: SavedRecommendation[];
};

const SCAN_HISTORY_KEY = "scan_history";

function sanitizeHistoryItem(rawItem: any): ScanHistoryItem {
  return {
    id: String(rawItem?.id ?? ""),
    imageUri: String(rawItem?.imageUri ?? ""),
    createdAt: String(rawItem?.createdAt ?? new Date().toISOString()),
    summary: rawItem?.summary,
    detectedConditions: Array.isArray(rawItem?.detectedConditions)
      ? rawItem.detectedConditions
      : [],
    probabilities:
      rawItem?.probabilities && typeof rawItem.probabilities === "object"
        ? rawItem.probabilities
        : {},
    recommendations: Array.isArray(rawItem?.recommendations)
      ? rawItem.recommendations
      : [],
  };
}

export async function getScanHistory(): Promise<ScanHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(sanitizeHistoryItem);
  } catch (error) {
    console.error("Failed to load scan history:", error);
    return [];
  }
}

export async function saveScanToHistory(item: ScanHistoryItem): Promise<void> {
  try {
    const existing = await getScanHistory();
    const sanitizedItem = sanitizeHistoryItem(item);
    const updated = [sanitizedItem, ...existing];
    await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save scan history:", error);
    throw error;
  }
}

export async function deleteScanHistoryItem(id: string): Promise<void> {
  try {
    const existing = await getScanHistory();
    const updated = existing.filter((item) => item.id !== id);
    await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to delete scan history item:", error);
    throw error;
  }
}

export async function clearScanHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SCAN_HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear scan history:", error);
  }
}