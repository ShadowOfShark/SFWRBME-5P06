FUSION_WEIGHTS = {
    "Calculus": 0.65,
    "Caries": 0.70,
    "Gingivitis": 0.60,
    "Tooth Discoloration": 0.75,
}


def combine_probabilities(image_probs: dict, questionnaire_probs: dict):
    final_probs = {}

    all_conditions = set(image_probs.keys()) | set(questionnaire_probs.keys())

    for disease in all_conditions:
        w_img = FUSION_WEIGHTS.get(disease, 0.5)
        p_img = float(image_probs.get(disease, 0.0))
        p_q = float(questionnaire_probs.get(disease, 0.0))

        final_probs[disease] = w_img * p_img + (1.0 - w_img) * p_q

    return final_probs


def detect_conditions(final_probs: dict, threshold: float = 0.5):
    detected = [d for d, p in final_probs.items() if p >= threshold]
    return detected if detected else ["Healthy"]