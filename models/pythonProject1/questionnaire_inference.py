import math

CONDITIONS = [
    "Calculus",
    "Caries",
    "Gingivitis",
    "Tooth Discoloration"
]


def compute_scores(answers: dict):
    scores = {cond: 0.0 for cond in CONDITIONS}

    if answers.get("age_group") == "35_to_55":
        scores["Gingivitis"] += 0.5
    elif answers.get("age_group") == "over_55":
        scores["Gingivitis"] += 1.5

    if answers.get("dental_visits") == "6-12mo":
        scores["Calculus"] += 1.0
        scores["Gingivitis"] += 0.5
        scores["Caries"] += 0.5
    elif answers.get("dental_visits") == ">1yr":
        scores["Calculus"] += 2.5
        scores["Gingivitis"] += 1.5
        scores["Caries"] += 1.0
    elif answers.get("dental_visits") == "never":
        scores["Calculus"] += 4.0
        scores["Gingivitis"] += 2.5
        scores["Caries"] += 1.5

    if answers.get("hygiene_habits") == "once_daily":
        scores["Calculus"] += 1.0
        scores["Gingivitis"] += 1.0
        scores["Caries"] += 1.0
    elif answers.get("hygiene_habits") == "rarely":
        scores["Calculus"] += 2.5
        scores["Gingivitis"] += 2.5
        scores["Caries"] += 3.0

    if answers.get("diet_sugar") == "sometimes":
        scores["Caries"] += 2.0
    elif answers.get("diet_sugar") == "frequently":
        scores["Caries"] += 4.0

    if answers.get("staining_habits") == "diet_only":
        scores["Tooth Discoloration"] += 3.0
    elif answers.get("staining_habits") == "tobacco":
        scores["Tooth Discoloration"] += 4.5
        scores["Gingivitis"] += 3.0
        scores["Calculus"] += 1.5

    if answers.get("dry_mouth") == "yes":
        scores["Caries"] += 2.5

    if answers.get("systemic_health") == "yes":
        scores["Gingivitis"] += 2.5

    if answers.get("trauma_history") == "yes":
        scores["Tooth Discoloration"] += 4.0

    if answers.get("bleeding_gums") == "sometimes":
        scores["Gingivitis"] += 2.5
    elif answers.get("bleeding_gums") == "often":
        scores["Gingivitis"] += 4.5

    if answers.get("pain_sensitivity") == "mild":
        scores["Caries"] += 2.0
    elif answers.get("pain_sensitivity") == "severe":
        scores["Caries"] += 4.5

    return scores


def scores_to_probabilities(scores_dict: dict):
    probs = {}
    beta = 4.0

    for cond, score in scores_dict.items():
        if score == 0:
            probs[cond] = 0.05
        else:
            probs[cond] = 1.0 / (1.0 + math.exp(-(score - beta)))

    return probs


def predict_questionnaire_probabilities(answers: dict):
    scores = compute_scores(answers)
    return scores_to_probabilities(scores)