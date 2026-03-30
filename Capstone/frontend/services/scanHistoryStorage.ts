import AsyncStorage from "@react-native-async-storage/async-storage";

export type ScanHistoryItem = {
  id: string;
  imageUri: string;
  createdAt: string;
  summary?: string;
  detectedConditions?: string[];
  probabilities?: Record<string, number>;
  imageQualityPassed?: boolean;
  imageQualityStatus?: string;
  questionnaireAnswers?: Record<string, string>;
};

const SCAN_HISTORY_KEY = "scan_history";

export async function getScanHistory(): Promise<ScanHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to load scan history:", error);
    return [];
  }
}

export async function saveScanToHistory(item: ScanHistoryItem): Promise<void> {
  try {
    const existing = await getScanHistory();
    const updated = [item, ...existing];
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