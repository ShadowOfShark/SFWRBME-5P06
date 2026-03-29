import math

CONDITIONS = [
    "Calculus",
    "Cavities",
    "Gingivitis",
    "Periodontitis",
    "Missing teeth",
]

QUESTIONS = [
    {
        "id": "missing_teeth",
        "text": "Are you currently missing any teeth (not counting wisdom teeth)?",
        "options": [
            ("none", "No, I am not missing any teeth"),
            ("1-2", "Yes, I am missing 1–2 teeth"),
            ("3+", "Yes, I am missing 3 or more teeth"),
        ],
    },
    {
        "id": "last_cleaning",
        "text": "When was your last professional dental cleaning?",
        "options": [
            ("<6mo", "Less than 6 months ago"),
            ("6-12mo", "6–12 months ago"),
            (">1yr", "More than 1 year ago"),
            ("never", "I have never had a professional cleaning"),
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
        "id": "red_swollen_gums",
        "text": "Do your gums often look red, puffy, or swollen?",
        "options": [
            ("no", "No"),
            ("mild", "A little / occasionally"),
            ("severe", "Yes, very red or swollen"),
        ],
    },
    {
        "id": "loose_teeth",
        "text": "Do any of your teeth feel loose, or have they shifted recently?",
        "options": [
            ("no", "No"),
            ("mild", "Yes, a little loose / small changes"),
            ("obvious", "Yes, clearly loose or moved"),
        ],
    },
    {
        "id": "hard_deposits",
        "text": "Can you see or feel hard yellow/brown deposits near the gumline that don't brush off?",
        "options": [
            ("no", "No"),
            ("not_sure", "Not sure"),
            ("yes", "Yes"),
        ],
    },
    {
        "id": "pain_sensitivity",
        "text": "Do you have tooth pain or sensitivity?",
        "options": [
            ("no", "No"),
            ("cold_sweet", "Yes, sensitivity to cold/sweet foods or drinks"),
            ("chewing_or_constant", "Yes, pain when chewing or constant/spontaneous pain"),
        ],
    },
    {
        "id": "visible_holes",
        "text": "Do you see any new visible holes, pits, or dark spots on your teeth?",
        "options": [
            ("no", "No"),
            ("not_sure", "Not sure"),
            ("yes", "Yes"),
        ],
    },
    {
        "id": "bad_breath",
        "text": "Do you or others notice persistent bad breath, even after brushing?",
        "options": [
            ("no", "No"),
            ("sometimes", "Sometimes"),
            ("often", "Often"),
        ],
    },
    {
        "id": "age_group",
        "text": "What is your age group?",
        "options": [
            ("<18", "Under 18"),
            ("18-35", "18–35"),
            ("36-55", "36–55"),
            (">55", "Over 55"),
        ],
    },
]


def ask_questions():
    """
    Ask all questions in the terminal and return a dict:
    {question_id: selected_option_code}
    """
    answers = {}
    print("Please answer the following questions about your teeth and gums:\n")

    for q in QUESTIONS:
        print(q["text"])
        for i, (code, label) in enumerate(q["options"], start=1):
            print(f"  {i}. {label}")
        while True:
            choice = input("Enter the number of your choice: ").strip()
            if not choice.isdigit():
                print("Please enter a valid number.")
                continue
            idx = int(choice)
            if 1 <= idx <= len(q["options"]):
                selected_code = q["options"][idx - 1][0]
                answers[q["id"]] = selected_code
                print()
                break
            else:
                print("Please choose a number from the list.")
    return answers


def compute_scores(answers):
    """
    Given answers dict, return a dict of scores for each condition.
    """
    scores = {cond: 0.0 for cond in CONDITIONS}

    q1 = answers.get("missing_teeth")
    q2 = answers.get("last_cleaning")
    q3 = answers.get("bleeding_gums")
    q4 = answers.get("red_swollen_gums")
    q5 = answers.get("loose_teeth")
    q6 = answers.get("hard_deposits")
    q7 = answers.get("pain_sensitivity")
    q8 = answers.get("visible_holes")
    q9 = answers.get("bad_breath")
    q10 = answers.get("age_group")

    # Q1: Missing teeth
    if q1 == "none":
        scores["Missing teeth"] += 0.0
    elif q1 == "1-2":
        scores["Missing teeth"] += 3.0
        scores["Periodontitis"] += 1.0
    elif q1 == "3+":
        scores["Missing teeth"] += 4.0
        scores["Periodontitis"] += 1.5

    # Q2: Last cleaning
    if q2 == "<6mo":
        pass
    elif q2 == "6-12mo":
        scores["Calculus"] += 1.0
        scores["Gingivitis"] += 0.5
        scores["Cavities"] += 0.5
    elif q2 == ">1yr":
        scores["Calculus"] += 2.0
        scores["Gingivitis"] += 1.0
        scores["Periodontitis"] += 1.0
        scores["Cavities"] += 1.0
    elif q2 == "never":
        scores["Calculus"] += 2.5
        scores["Gingivitis"] += 1.5
        scores["Periodontitis"] += 1.5
        scores["Cavities"] += 1.5

    # Q3: Bleeding gums
    if q3 == "sometimes":
        scores["Gingivitis"] += 2.0
        scores["Periodontitis"] += 0.5
    elif q3 == "often":
        scores["Gingivitis"] += 3.0
        scores["Periodontitis"] += 1.5

    # Q4: Red/swollen gums
    if q4 == "mild":
        scores["Gingivitis"] += 1.5
    elif q4 == "severe":
        scores["Gingivitis"] += 2.5
        scores["Periodontitis"] += 1.0

    # Q5: Loose teeth
    if q5 == "mild":
        scores["Periodontitis"] += 3.0
    elif q5 == "obvious":
        scores["Periodontitis"] += 4.0

    # Q6: Hard deposits (calculus)
    if q6 == "yes":
        scores["Calculus"] += 4.0
        scores["Gingivitis"] += 1.0
        scores["Periodontitis"] += 1.0

    # Q7: Pain / sensitivity
    if q7 == "cold_sweet":
        scores["Cavities"] += 2.5
    elif q7 == "chewing_or_constant":
        scores["Cavities"] += 3.5
        scores["Periodontitis"] += 1.0

    # Q8: Visible holes/spots
    if q8 == "yes":
        scores["Cavities"] += 4.0

    # Q9: Persistent bad breath
    if q9 == "sometimes":
        scores["Gingivitis"] += 1.0
        scores["Periodontitis"] += 1.0
        scores["Calculus"] += 0.5
    elif q9 == "often":
        scores["Gingivitis"] += 2.0
        scores["Periodontitis"] += 2.0
        scores["Calculus"] += 1.0

    # Q10: Age group
    if q10 == "36-55":
        scores["Periodontitis"] += 0.5
    elif q10 == ">55":
        scores["Periodontitis"] += 1.0

    return scores


def scores_to_probabilities(scores_dict):
    """
    Convert raw scores into normalized probabilities using a softmax.
    """
    adjusted = {k: max(v, 0.0) for k, v in scores_dict.items()}

    # If everything is zero, return uniform probabilities
    if all(v == 0.0 for v in adjusted.values()):
        n = len(adjusted)
        return {k: 1.0 / n for k in adjusted}

    exps = {k: math.exp(v) for k, v in adjusted.items()}
    total = sum(exps.values())
    probs = {k: exps[k] / total for k in exps}
    return probs


def main():
    answers = ask_questions()
    scores = compute_scores(answers)
    probs = scores_to_probabilities(scores)

    print("=== Questionnaire-based risk scores ===")
    for cond in CONDITIONS:
        print(f"{cond:13s}: score = {scores[cond]:4.1f}")

    print("\n=== Estimated probabilities (normalized) ===")
    for cond in CONDITIONS:
        print(f"{cond:13s}: {probs[cond] * 100:5.1f}%")

    print("\nNote: This tool does NOT provide a diagnosis. "
          "It only estimates likelihood based on your answers. "
          "Please see a dentist for a proper clinical evaluation.")


if __name__ == "__main__":
    main()
