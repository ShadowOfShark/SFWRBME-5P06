import { CONDITIONS, Condition } from "../constants/questions";

export type Answers = Record<string, string>;
export type Scores = Record<Condition, number>;
export type Probabilities = Record<Condition, number>;

export function computeScores(answers: Answers): Scores {
  const scores: Scores = {
    Calculus: 0,
    Caries: 0,
    Gingivitis: 0,
    "Tooth Discoloration": 0,
  };

  const ageGroup = answers.age_group;
  const dentalVisits = answers.dental_visits;
  const hygieneHabits = answers.hygiene_habits;
  const dietSugar = answers.diet_sugar;
  const stainingHabits = answers.staining_habits;
  const dryMouth = answers.dry_mouth;
  const systemicHealth = answers.systemic_health;
  const traumaHistory = answers.trauma_history;
  const bleedingGums = answers.bleeding_gums;
  const painSensitivity = answers.pain_sensitivity;

  // 1. Age
  if (ageGroup === "35_to_55") {
    scores.Gingivitis += 0.5;
  } else if (ageGroup === "over_55") {
    scores.Gingivitis += 1.5;
  }

  // 2. Dental visits
  if (dentalVisits === "6-12mo") {
    scores.Calculus += 1.0;
    scores.Gingivitis += 0.5;
    scores.Caries += 0.5;
  } else if (dentalVisits === ">1yr") {
    scores.Calculus += 2.5;
    scores.Gingivitis += 1.5;
    scores.Caries += 1.0;
  } else if (dentalVisits === "never") {
    scores.Calculus += 4.0;
    scores.Gingivitis += 2.5;
    scores.Caries += 1.5;
  }

  // 3. Hygiene habits
  if (hygieneHabits === "once_daily") {
    scores.Calculus += 1.0;
    scores.Gingivitis += 1.0;
    scores.Caries += 1.0;
  } else if (hygieneHabits === "rarely") {
    scores.Calculus += 2.5;
    scores.Gingivitis += 2.5;
    scores.Caries += 3.0;
  }

  // 4. Sugar exposure
  if (dietSugar === "sometimes") {
    scores.Caries += 2.0;
  } else if (dietSugar === "frequently") {
    scores.Caries += 4.0;
  }

  // 5. Staining / tobacco
  if (stainingHabits === "diet_only") {
    scores["Tooth Discoloration"] += 3.0;
  } else if (stainingHabits === "tobacco") {
    scores["Tooth Discoloration"] += 4.5;
    scores.Gingivitis += 3.0;
    scores.Calculus += 1.5;
  }

  // 6. Dry mouth
  if (dryMouth === "yes") {
    scores.Caries += 2.5;
  }

  // 7. Systemic health
  if (systemicHealth === "yes") {
    scores.Gingivitis += 2.5;
  }

  // 8. Trauma history
  if (traumaHistory === "yes") {
    scores["Tooth Discoloration"] += 4.0;
  }

  // 9. Bleeding gums
  if (bleedingGums === "sometimes") {
    scores.Gingivitis += 2.5;
  } else if (bleedingGums === "often") {
    scores.Gingivitis += 4.5;
  }

  // 10. Pain / sensitivity
  if (painSensitivity === "mild") {
    scores.Caries += 2.0;
  } else if (painSensitivity === "severe") {
    scores.Caries += 4.5;
  }

  return scores;
}

export function scoresToProbabilities(scores: Scores): Probabilities {
  const probs: Partial<Probabilities> = {};
  const beta = 4.0;

  for (const condition of CONDITIONS) {
    const score = scores[condition];

    if (score === 0) {
      probs[condition] = 0.05;
    } else {
      probs[condition] = 1 / (1 + Math.exp(-(score - beta)));
    }
  }

  return probs as Probabilities;
}