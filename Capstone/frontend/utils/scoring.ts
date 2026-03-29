import { CONDITIONS, Condition } from '../constants/questions';

export type Answers = Record<string, string>;
export type Scores = Record<Condition, number>;
export type Probabilities = Record<Condition, number>;

export function computeScores(answers: Answers): Scores {
  const scores: Scores = {
    Calculus: 0,
    Cavities: 0,
    Gingivitis: 0,
    Periodontitis: 0,
    'Missing teeth': 0,
  };

  const q1 = answers.missing_teeth;
  const q2 = answers.last_cleaning;
  const q3 = answers.bleeding_gums;
  const q4 = answers.red_swollen_gums;
  const q5 = answers.loose_teeth;
  const q6 = answers.hard_deposits;
  const q7 = answers.pain_sensitivity;
  const q8 = answers.visible_holes;
  const q9 = answers.bad_breath;
  const q10 = answers.age_group;

  if (q1 === '1-2') {
    scores['Missing teeth'] += 3;
    scores.Periodontitis += 1;
  } else if (q1 === '3+') {
    scores['Missing teeth'] += 4;
    scores.Periodontitis += 1.5;
  }

  if (q2 === '6-12mo') {
    scores.Calculus += 1;
    scores.Gingivitis += 0.5;
    scores.Cavities += 0.5;
  } else if (q2 === '>1yr') {
    scores.Calculus += 2;
    scores.Gingivitis += 1;
    scores.Periodontitis += 1;
    scores.Cavities += 1;
  } else if (q2 === 'never') {
    scores.Calculus += 2.5;
    scores.Gingivitis += 1.5;
    scores.Periodontitis += 1.5;
    scores.Cavities += 1.5;
  }

  if (q3 === 'sometimes') {
    scores.Gingivitis += 2;
    scores.Periodontitis += 0.5;
  } else if (q3 === 'often') {
    scores.Gingivitis += 3;
    scores.Periodontitis += 1.5;
  }

  if (q4 === 'mild') {
    scores.Gingivitis += 1.5;
  } else if (q4 === 'severe') {
    scores.Gingivitis += 2.5;
    scores.Periodontitis += 1;
  }

  if (q5 === 'mild') {
    scores.Periodontitis += 3;
  } else if (q5 === 'obvious') {
    scores.Periodontitis += 4;
  }

  if (q6 === 'yes') {
    scores.Calculus += 4;
    scores.Gingivitis += 1;
    scores.Periodontitis += 1;
  }

  if (q7 === 'cold_sweet') {
    scores.Cavities += 2.5;
  } else if (q7 === 'chewing_or_constant') {
    scores.Cavities += 3.5;
    scores.Periodontitis += 1;
  }

  if (q8 === 'yes') {
    scores.Cavities += 4;
  }

  if (q9 === 'sometimes') {
    scores.Gingivitis += 1;
    scores.Periodontitis += 1;
    scores.Calculus += 0.5;
  } else if (q9 === 'often') {
    scores.Gingivitis += 2;
    scores.Periodontitis += 2;
    scores.Calculus += 1;
  }

  if (q10 === '36-55') {
    scores.Periodontitis += 0.5;
  } else if (q10 === '>55') {
    scores.Periodontitis += 1;
  }

  return scores;
}

export function scoresToProbabilities(scores: Scores): Probabilities {
  const adjustedEntries = Object.entries(scores).map(([key, value]) => [
    key,
    Math.max(value, 0),
  ]) as [Condition, number][];

  const adjusted = Object.fromEntries(adjustedEntries) as Probabilities;

  const values = Object.values(adjusted);
  const allZero = values.every((value) => value === 0);

  if (allZero) {
    const uniform = 1 / CONDITIONS.length;
    return {
      Calculus: uniform,
      Cavities: uniform,
      Gingivitis: uniform,
      Periodontitis: uniform,
      'Missing teeth': uniform,
    };
  }

  const expEntries = Object.entries(adjusted).map(([key, value]) => [
    key,
    Math.exp(value),
  ]) as [Condition, number][];

  const exps = Object.fromEntries(expEntries) as Probabilities;
  const total = Object.values(exps).reduce((sum, value) => sum + value, 0);

  return {
    Calculus: exps.Calculus / total,
    Cavities: exps.Cavities / total,
    Gingivitis: exps.Gingivitis / total,
    Periodontitis: exps.Periodontitis / total,
    'Missing teeth': exps['Missing teeth'] / total,
  };
}