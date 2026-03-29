export type Condition =
  | "Calculus"
  | "Cavities"
  | "Gingivitis"
  | "Periodontitis"
  | "Missing teeth";

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
  "Cavities",
  "Gingivitis",
  "Periodontitis",
  "Missing teeth",
];

export const QUESTIONS: Question[] = [
  {
    id: "missing_teeth",
    text: "Are you currently missing any teeth (not counting wisdom teeth)?",
    options: [
      { code: "none", label: "No, I am not missing any teeth" },
      { code: "1-2", label: "Yes, I am missing 1–2 teeth" },
      { code: "3+", label: "Yes, I am missing 3 or more teeth" },
    ],
  },
  {
    id: "last_cleaning",
    text: "When was your last professional dental cleaning?",
    options: [
      { code: "<6mo", label: "Less than 6 months ago" },
      { code: "6-12mo", label: "6–12 months ago" },
      { code: ">1yr", label: "More than 1 year ago" },
      { code: "never", label: "I have never had a professional cleaning" },
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
    id: "red_swollen_gums",
    text: "Do your gums often look red, puffy, or swollen?",
    options: [
      { code: "no", label: "No" },
      { code: "mild", label: "A little / occasionally" },
      { code: "severe", label: "Yes, very red or swollen" },
    ],
  },
  {
    id: "loose_teeth",
    text: "Do any of your teeth feel loose, or have they shifted recently?",
    options: [
      { code: "no", label: "No" },
      { code: "mild", label: "Yes, a little loose / small changes" },
      { code: "obvious", label: "Yes, clearly loose or moved" },
    ],
  },
  {
    id: "hard_deposits",
    text: "Can you see or feel hard yellow/brown deposits near the gumline that don't brush off?",
    options: [
      { code: "no", label: "No" },
      { code: "not_sure", label: "Not sure" },
      { code: "yes", label: "Yes" },
    ],
  },
  {
    id: "pain_sensitivity",
    text: "Do you have tooth pain or sensitivity?",
    options: [
      { code: "no", label: "No" },
      {
        code: "cold_sweet",
        label: "Yes, sensitivity to cold/sweet foods or drinks",
      },
      {
        code: "chewing_or_constant",
        label: "Yes, pain when chewing or constant/spontaneous pain",
      },
    ],
  },
  {
    id: "visible_holes",
    text: "Do you see any new visible holes, pits, or dark spots on your teeth?",
    options: [
      { code: "no", label: "No" },
      { code: "not_sure", label: "Not sure" },
      { code: "yes", label: "Yes" },
    ],
  },
  {
    id: "bad_breath",
    text: "Do you or others notice persistent bad breath, even after brushing?",
    options: [
      { code: "no", label: "No" },
      { code: "sometimes", label: "Sometimes" },
      { code: "often", label: "Often" },
    ],
  },
  {
    id: "age_group",
    text: "What is your age group?",
    options: [
      { code: "<18", label: "Under 18" },
      { code: "18-35", label: "18–35" },
      { code: "36-55", label: "36–55" },
      { code: ">55", label: "Over 55" },
    ],
  },
];
