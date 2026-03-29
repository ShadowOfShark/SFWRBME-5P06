import math

# Target conditions matching the neural network
CONDITIONS = [
    "Calculus",
    "Caries",
    "Gingivitis",
    "Tooth Discoloration"
]

QUESTIONS = [
    {
        "id": "age_group",
        "text": "What is your age group?",
        "options": [
            ("under_35", "Under 35"),
            ("35_to_55", "35 to 55"),
            ("over_55", "Over 55"),
        ],
    },
    {
        "id": "dental_visits",
        "text": "When was your last professional dental cleaning?",
        "options": [
            ("<6mo", "Less than 6 months ago"),
            ("6-12mo", "6–12 months ago"),
            (">1yr", "More than 1 year ago"),
            ("never", "I have never had a professional cleaning"),
        ],
    },
    {
        "id": "hygiene_habits",
        "text": "How often do you brush your teeth with fluoride toothpaste?",
        "options": [
            ("twice_daily", "Twice a day or more"),
            ("once_daily", "Once a day"),
            ("rarely", "Rarely / I don't use fluoride toothpaste"),
        ],
    },
    {
        "id": "diet_sugar",
        "text": "How often do you snack on sugary/starchy foods or sip sugary drinks between meals?",
        "options": [
            ("rarely", "Rarely (mostly with meals)"),
            ("sometimes", "1-2 times a day between meals"),
            ("frequently", "3 or more times a day / constant sipping"),
        ],
    },
    {
        "id": "staining_habits",
        "text": "Do you consume coffee, tea, red wine, or use tobacco products (smoking/chewing)?",
        "options": [
            ("no", "No"),
            ("diet_only", "Yes, coffee/tea/wine, but no tobacco"),
            ("tobacco", "Yes, I use tobacco products"),
        ],
    },
    {
        "id": "dry_mouth",
        "text": "Do you frequently experience dry mouth (often caused by medications or aging)?",
        "options": [
            ("no", "No"),
            ("yes", "Yes, my mouth often feels dry"),
        ],
    },
    {
        "id": "systemic_health",
        "text": "Do you have diabetes, or a family history of severe gum disease/early tooth loss?",
        "options": [
            ("no", "No"),
            ("yes", "Yes (Diabetes or Family History)"),
        ],
    },
    {
        "id": "trauma_history",
        "text": "Have you ever experienced a physical impact or trauma to any of your teeth?",
        "options": [
            ("no", "No"),
            ("yes", "Yes, a tooth was hit, chipped, or knocked loose in the past"),
        ],
    },
    {
        "id": "bleeding_gums",
        "text": "Do your gums bleed when you brush or floss?",
        "options": [
            ("never", "Never"),
            ("sometimes", "Sometimes"),
            ("often", "Often / almost every time"),
        ],
    },
    {
        "id": "pain_sensitivity",
        "text": "Do you currently have tooth pain or sensitivity?",
        "options": [
            ("no", "No"),
            ("mild", "Mild sensitivity to hot/cold/sweets"),
            ("severe", "Severe, constant pain or pain when chewing"),
        ],
    }
]


def ask_questions():
    answers = {}
    print("=== Dental Health History Questionnaire ===\n")
    for q in QUESTIONS:
        print(q["text"])
        for i, (code, label) in enumerate(q["options"], start=1):
            print(f"  {i}. {label}")
        while True:
            choice = input("Enter the number of your choice: ").strip()
            if choice.isdigit() and 1 <= int(choice) <= len(q["options"]):
                answers[q["id"]] = q["options"][int(choice) - 1][0]
                print()
                break
            else:
                print("Invalid choice. Please choose a valid number.")
    return answers


def compute_scores(answers):
    scores = {cond: 0.0 for cond in CONDITIONS}

    ans = {q["id"]: answers.get(q["id"]) for q in QUESTIONS}

    # 1. Age (Periodontal disease risk heavily increases with age)
    if ans["age_group"] == "35_to_55":
        scores["Gingivitis"] += 0.5
    elif ans["age_group"] == "over_55":
        scores["Gingivitis"] += 1.5

    # 2. Dental Visits (Lack of scaling builds Calculus, increases Gingivitis/Caries risk)
    if ans["dental_visits"] == "6-12mo":
        scores["Calculus"] += 1.0;
        scores["Gingivitis"] += 0.5;
        scores["Caries"] += 0.5
    elif ans["dental_visits"] == ">1yr":
        scores["Calculus"] += 2.5;
        scores["Gingivitis"] += 1.5;
        scores["Caries"] += 1.0
    elif ans["dental_visits"] == "never":
        scores["Calculus"] += 4.0;
        scores["Gingivitis"] += 2.5;
        scores["Caries"] += 1.5

    # 3. Hygiene & Fluoride (Lack of fluoride is a primary Caries risk)
    if ans["hygiene_habits"] == "once_daily":
        scores["Calculus"] += 1.0;
        scores["Gingivitis"] += 1.0;
        scores["Caries"] += 1.0
    elif ans["hygiene_habits"] == "rarely":
        scores["Calculus"] += 2.5;
        scores["Gingivitis"] += 2.5;
        scores["Caries"] += 3.0

    # 4. Diet/Sugar (Frequent sugar exposure drives Caries)
    if ans["diet_sugar"] == "sometimes":
        scores["Caries"] += 2.0
    elif ans["diet_sugar"] == "frequently":
        scores["Caries"] += 4.0

    # 5. Staining & Tobacco (Tobacco heavily drives both Discoloration and Periodontal issues)
    if ans["staining_habits"] == "diet_only":
        scores["Tooth Discoloration"] += 3.0
    elif ans["staining_habits"] == "tobacco":
        scores["Tooth Discoloration"] += 4.5;
        scores["Gingivitis"] += 3.0;
        scores["Calculus"] += 1.5

    # 6. Dry Mouth (Saliva washes away acid; lack of it spikes Caries risk)
    if ans["dry_mouth"] == "yes": scores["Caries"] += 2.5

    # 7. Systemic Health (Diabetes/Genetics strictly drive Periodontal/Gingivitis risk)
    if ans["systemic_health"] == "yes": scores["Gingivitis"] += 2.5

    # 8. Trauma (Dead nerves cause intrinsic tooth darkening)
    if ans["trauma_history"] == "yes": scores["Tooth Discoloration"] += 4.0

    # 9. Bleeding Gums (Hallmark symptom of Gingivitis)
    if ans["bleeding_gums"] == "sometimes":
        scores["Gingivitis"] += 2.5
    elif ans["bleeding_gums"] == "often":
        scores["Gingivitis"] += 4.5

    # 10. Pain/Sensitivity (Symptomatic indicator of advanced Caries)
    if ans["pain_sensitivity"] == "mild":
        scores["Caries"] += 2.0
    elif ans["pain_sensitivity"] == "severe":
        scores["Caries"] += 4.5

    return scores


def scores_to_probabilities(scores_dict):
    """
    Evaluates each condition independently using a Sigmoid function.
    A score of 4.0 equals a 50% probability.
    """
    probs = {}
    beta = 4.0

    for cond, score in scores_dict.items():
        if score == 0:
            probs[cond] = 0.05  # Baseline 5% risk
        else:
            probs[cond] = 1.0 / (1.0 + math.exp(-(score - beta)))

    return probs


def main():
    answers = ask_questions()
    scores = compute_scores(answers)
    probs = scores_to_probabilities(scores)

    print("=== Independent Condition Probabilities ===")
    for cond in CONDITIONS:
        print(f"{cond:20s}: {probs[cond] * 100:5.1f}%")


if __name__ == "__main__":
    main()