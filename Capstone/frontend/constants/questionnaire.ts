export const QUESTIONS = [
  {
    id: 'missing_teeth',
    text: 'Are you currently missing any teeth (not counting wisdom teeth)?',
    options: [
      { value: 'none', label: 'No, I am not missing any teeth' },
      { value: '1-2', label: 'Yes, I am missing 1–2 teeth' },
      { value: '3+', label: 'Yes, I am missing 3 or more teeth' },
    ],
  },
  {
    id: 'last_cleaning',
    text: 'When was your last professional dental cleaning?',
    options: [
      { value: '<6mo', label: 'Less than 6 months ago' },
      { value: '6-12mo', label: '6–12 months ago' },
      { value: '>1yr', label: 'More than 1 year ago' },
      { value: 'never', label: 'I have never had a professional cleaning' },
    ],
  },
  {
    id: 'bleeding_gums',
    text: 'Do your gums bleed when you brush or floss?',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'often', label: 'Often / almost every time' },
    ],
  },
  {
    id: 'red_swollen_gums',
    text: 'Do your gums often look red, puffy, or swollen?',
    options: [
      { value: 'no', label: 'No' },
      { value: 'mild', label: 'A little / occasionally' },
      { value: 'severe', label: 'Yes, very red or swollen' },
    ],
  },
  {
    id: 'loose_teeth',
    text: 'Do any of your teeth feel loose, or have they shifted recently?',
    options: [
      { value: 'no', label: 'No' },
      { value: 'mild', label: 'Yes, a little loose / small changes' },
      { value: 'obvious', label: 'Yes, clearly loose or moved' },
    ],
  },
  {
    id: 'hard_deposits',
    text: "Can you see or feel hard yellow/brown deposits near the gumline that don't brush off?",
    options: [
      { value: 'no', label: 'No' },
      { value: 'not_sure', label: 'Not sure' },
      { value: 'yes', label: 'Yes' },
    ],
  },
  {
    id: 'pain_sensitivity',
    text: 'Do you have tooth pain or sensitivity?',
    options: [
      { value: 'no', label: 'No' },
      { value: 'cold_sweet', label: 'Yes, sensitivity to cold/sweet foods or drinks' },
      { value: 'chewing_or_constant', label: 'Yes, pain when chewing or constant/spontaneous pain' },
    ],
  },
  {
    id: 'visible_holes',
    text: 'Do you see any new visible holes, pits, or dark spots on your teeth?',
    options: [
      { value: 'no', label: 'No' },
      { value: 'not_sure', label: 'Not sure' },
      { value: 'yes', label: 'Yes' },
    ],
  },
  {
    id: 'bad_breath',
    text: 'Do you or others notice persistent bad breath, even after brushing?',
    options: [
      { value: 'no', label: 'No' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'often', label: 'Often' },
    ],
  },
  {
    id: 'age_group',
    text: 'What is your age group?',
    options: [
      { value: '<18', label: 'Under 18' },
      { value: '18-35', label: '18–35' },
      { value: '36-55', label: '36–55' },
      { value: '>55', label: 'Over 55' },
    ],
  },
];