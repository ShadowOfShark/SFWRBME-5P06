export type Condition =
  | "Calculus"
  | "Caries"
  | "Gingivitis"
  | "Tooth Discoloration";

export type QuestionOption = {
  code: string;
  label: string;
};

export type Question = {
  id: string;
  text: string;
  options: QuestionOption[];
};

export const CONDITIONS: Condition[] = [
  "Calculus",
  "Caries",
  "Gingivitis",
  "Tooth Discoloration",
];

export const QUESTIONS: Question[] = [
  {
    id: "age_group",
    text: "What is your age group?",
    options: [
      { code: "under_35", label: "Under 35" },
      { code: "35_to_55", label: "35 to 55" },
      { code: "over_55", label: "Over 55" },
    ],
  },
  {
    id: "dental_visits",
    text: "When was your last professional dental cleaning?",
    options: [
      { code: "<6mo", label: "Less than 6 months ago" },
      { code: "6-12mo", label: "6–12 months ago" },
      { code: ">1yr", label: "More than 1 year ago" },
      { code: "never", label: "I have never had a professional cleaning" },
    ],
  },
  {
    id: "hygiene_habits",
    text: "How often do you brush your teeth with fluoride toothpaste?",
    options: [
      { code: "twice_daily", label: "Twice a day or more" },
      { code: "once_daily", label: "Once a day" },
      { code: "rarely", label: "Rarely / I don't use fluoride toothpaste" },
    ],
  },
  {
    id: "diet_sugar",
    text: "How often do you snack on sugary/starchy foods or sip sugary drinks between meals?",
    options: [
      { code: "rarely", label: "Rarely (mostly with meals)" },
      { code: "sometimes", label: "1-2 times a day between meals" },
      { code: "frequently", label: "3 or more times a day / constant sipping" },
    ],
  },
  {
    id: "staining_habits",
    text: "Do you consume coffee, tea, red wine, or use tobacco products (smoking/chewing)?",
    options: [
      { code: "no", label: "No" },
      { code: "diet_only", label: "Yes, coffee/tea/wine, but no tobacco" },
      { code: "tobacco", label: "Yes, I use tobacco products" },
    ],
  },
  {
    id: "dry_mouth",
    text: "Do you frequently experience dry mouth (often caused by medications or aging)?",
    options: [
      { code: "no", label: "No" },
      { code: "yes", label: "Yes, my mouth often feels dry" },
    ],
  },
  {
    id: "systemic_health",
    text: "Do you have diabetes, or a family history of severe gum disease/early tooth loss?",
    options: [
      { code: "no", label: "No" },
      { code: "yes", label: "Yes (Diabetes or Family History)" },
    ],
  },
  {
    id: "trauma_history",
    text: "Have you ever experienced a physical impact or trauma to any of your teeth?",
    options: [
      { code: "no", label: "No" },
      { code: "yes", label: "Yes, a tooth was hit, chipped, or knocked loose in the past" },
    ],
  },
  {
    id: "bleeding_gums",
    text: "Do your gums bleed when you brush or floss?",
    options: [
      { code: "never", label: "Never" },
      { code: "sometimes", label: "Sometimes" },
      { code: "often", label: "Often / almost every time" },
    ],
  },
  {
    id: "pain_sensitivity",
    text: "Do you currently have tooth pain or sensitivity?",
    options: [
      { code: "no", label: "No" },
      { code: "mild", label: "Mild sensitivity to hot/cold/sweets" },
      { code: "severe", label: "Severe, constant pain or pain when chewing" },
    ],
  },
];