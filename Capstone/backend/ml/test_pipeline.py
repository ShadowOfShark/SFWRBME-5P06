from preprocessing_gate import OralPrecheck
from image_inference import load_model, predict_image_probabilities
from questionnaire_inference import predict_questionnaire_probabilities
from fusion import combine_probabilities, detect_conditions
import json


class OralDiseasePredictor:
    def __init__(self):
        self.precheck = OralPrecheck()
        self.model, self.class_names = load_model()

    def predict(self, image_path: str, answers: dict, threshold: float = 0.5):
        precheck_report = self.precheck.run(image_path)

        if precheck_report["status"] == "fail":
            return {
                "success": False,
                "message": "Image quality is insufficient. Please retake the photo.",
                "precheck": precheck_report
            }

        image_probs = predict_image_probabilities(
            image_path=image_path,
            model=self.model,
            class_names=self.class_names
        )

        questionnaire_probs = predict_questionnaire_probabilities(answers)
        final_probs = combine_probabilities(image_probs, questionnaire_probs)
        detected = detect_conditions(final_probs, threshold=threshold)

        return {
            "success": True,
            "precheck": precheck_report,
            "detected_conditions": detected,
            "image_probabilities": image_probs,
            "questionnaire_probabilities": questionnaire_probs,
            "final_probabilities": final_probs
        }


if __name__ == "__main__":
    predictor = OralDiseasePredictor()

    answers = {
        "age_group": "35_to_55",
        "dental_visits": ">1yr",
        "hygiene_habits": "once_daily",
        "diet_sugar": "frequently",
        "staining_habits": "diet_only",
        "dry_mouth": "yes",
        "systemic_health": "no",
        "trauma_history": "no",
        "bleeding_gums": "sometimes",
        "pain_sensitivity": "mild"
    }

    image_path = "test.jpg"
    result = predictor.predict(image_path, answers)

    print("\n=== FINAL RESULT ===")
    print(json.dumps(result, indent=2))