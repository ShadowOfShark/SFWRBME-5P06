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

const API_BASE_URL = "http://192.168.1.13:8000"; //ip might change .10

export async function submitScan(
  imageUri: string,
  answers: QuestionnaireAnswers,
): Promise<AnalyzeResponse> {
  console.log("submitScan imageUri:", imageUri);
  console.log("submitScan answers:", answers);
  console.log("Sending request to:", `${API_BASE_URL}/analyze`);

  const formData = new FormData();

  formData.append("image", {
    uri: imageUri,
    name: "oral_scan.jpg",
    type: "image/jpeg",
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

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} ${text}`);
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("submitScan failed:", error);
    throw error;
  }
}

//NON TESTING CODE -UNBLOCK THIS after testing

/* export async function submitScan(
  imageUri: string,
  answers: QuestionnaireAnswers
): Promise<AnalyzeResponse> {
  const formData = new FormData();

  formData.append(
    'image',
    {
      uri: imageUri,
      name: 'oral_scan.jpg',
      type: 'image/jpeg',
    } as any
  );

  formData.append('answers', JSON.stringify(answers));

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Backend error: ${response.status} ${text}`);
  }

  return response.json();
} */
