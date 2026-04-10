export type QuestionnaireAnswers = {
  age_group?: string;
  dental_visits?: string;
  hygiene_habits?: string;
  diet_sugar?: string;
  staining_habits?: string;
  dry_mouth?: string;
  systemic_health?: string;
  trauma_history?: string;
  bleeding_gums?: string;
  pain_sensitivity?: string;
};

export type AnalyzeResponse = {
  success: boolean;
  image_quality_passed?: boolean;
  image_quality_status?: string;
  probabilities?: Record<string, number>;
  detected_conditions?: string[];
  summary?: string;
  message?: string;
  failures?: string[];
  warnings?: string[];
  checks?: Record<string, any>;
  received_answers?: Record<string, string>;
};

// Render (cloud)
// const API_BASE_URL = "https://sfwrbme-5p06.onrender.com";

// Local server
const API_BASE_URL = "http://192.168.106.244:8000";

export async function submitScan(
  imageUri: string,
  answers: QuestionnaireAnswers,
  imageName?: string,
  imageType?: string,
): Promise<AnalyzeResponse> {
  console.log("submitScan imageUri:", imageUri);
  console.log("submitScan imageName:", imageName);
  console.log("submitScan imageType:", imageType);
  console.log("submitScan answers:", answers);
  console.log("Sending request to:", `${API_BASE_URL}/analyze`);

  const formData = new FormData();

  formData.append("image", {
    uri: imageUri,
    name: imageName || `oral_scan_${Date.now()}.jpg`,
    type: imageType || "image/jpeg",
  } as any);

  formData.append("answers", JSON.stringify(answers));

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    const text = await response.text();
    console.log("Backend status:", response.status);
    console.log("Raw backend response:", text);

    let parsed: AnalyzeResponse;

    try {
      parsed = JSON.parse(text) as AnalyzeResponse;
    } catch {
      throw new Error(`Invalid JSON response from backend: ${text}`);
    }

    if (!response.ok) {
      throw new Error(
        parsed?.message || `Backend error: ${response.status} ${text}`,
      );
    }

    return parsed;
  } catch (error) {
    console.error("submitScan failed:", error);
    throw error;
  }
}
