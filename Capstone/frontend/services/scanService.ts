export type QuestionnaireAnswers = {
  missing_teeth?: string;
  last_cleaning?: string;
  bleeding_gums?: string;
  red_swollen_gums?: string;
  loose_teeth?: string;
  hard_deposits?: string;
  pain_sensitivity?: string;
  visible_holes?: string;
  bad_breath?: string;
  age_group?: string;
};

export type AnalyzeResponse = {
  success: boolean;
  image_quality_passed?: boolean;
  probabilities?: Record<string, number>;
  detected_conditions?: string[];
  summary?: string;
  message?: string;
};

const API_BASE_URL = 'http://192.168.1.10:8000';

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

  export async function submitScan(
  imageUri: string,
  answers: Record<string, string>
) {
  console.log("submitScan imageUri:", imageUri);
  console.log("submitScan answers:", answers);

  const formData = new FormData();

  formData.append(
    "image",
    {
      uri: imageUri,
      name: "oral_scan.jpg",
      type: "image/jpeg",
    } as any
  );

  formData.append("answers", JSON.stringify(answers));

  console.log("Sending request to:", `${API_BASE_URL}/analyze`);

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  const text = await response.text();
  console.log("Raw backend response:", text);

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status} ${text}`);
  }

  return JSON.parse(text);
}