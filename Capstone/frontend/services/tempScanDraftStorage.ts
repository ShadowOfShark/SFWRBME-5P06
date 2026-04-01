import AsyncStorage from "@react-native-async-storage/async-storage";

const TEMP_SCAN_DRAFT_KEY = "temp_scan_draft";

export type TempQuestionnaireAnswers = Record<string, string>;

export type TempScanDraft = {
  imageUri?: string;
  questionnaireAnswers?: TempQuestionnaireAnswers;
  updatedAt: string;
};

function sanitizeDraft(raw: any): TempScanDraft | null {
  if (!raw || typeof raw !== "object") return null;

  return {
    imageUri: typeof raw.imageUri === "string" ? raw.imageUri : undefined,
    questionnaireAnswers:
      raw.questionnaireAnswers && typeof raw.questionnaireAnswers === "object"
        ? raw.questionnaireAnswers
        : {},
    updatedAt:
      typeof raw.updatedAt === "string"
        ? raw.updatedAt
        : new Date().toISOString(),
  };
}

export async function getTempScanDraft(): Promise<TempScanDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(TEMP_SCAN_DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return sanitizeDraft(parsed);
  } catch (error) {
    console.error("Failed to load temp scan draft:", error);
    return null;
  }
}

export async function saveTempScanDraft(
  draft: TempScanDraft,
): Promise<void> {
  try {
    const sanitized = sanitizeDraft(draft);
    if (!sanitized) return;

    await AsyncStorage.setItem(
      TEMP_SCAN_DRAFT_KEY,
      JSON.stringify(sanitized),
    );
  } catch (error) {
    console.error("Failed to save temp scan draft:", error);
    throw error;
  }
}

export async function updateTempScanDraft(
  partialDraft: Partial<TempScanDraft>,
): Promise<void> {
  try {
    const existing = await getTempScanDraft();

    const updated: TempScanDraft = {
      imageUri: partialDraft.imageUri ?? existing?.imageUri,
      questionnaireAnswers:
        partialDraft.questionnaireAnswers ??
        existing?.questionnaireAnswers ??
        {},
      updatedAt: new Date().toISOString(),
    };

    await saveTempScanDraft(updated);
  } catch (error) {
    console.error("Failed to update temp scan draft:", error);
    throw error;
  }
}

export async function clearTempScanDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TEMP_SCAN_DRAFT_KEY);
  } catch (error) {
    console.error("Failed to clear temp scan draft:", error);
  }
}