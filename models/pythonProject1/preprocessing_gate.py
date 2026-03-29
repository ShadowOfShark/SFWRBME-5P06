from image_quality_rules import assess_image_quality_rules
from oral_quality_inference import load_model as load_quality_model
from oral_quality_inference import predict_oral_quality


class OralPrecheck:
    def __init__(self):
        self.quality_model, self.quality_class_names = load_quality_model()

    def run(self, image_path: str):
        rules_report = assess_image_quality_rules(image_path)

        model_report = predict_oral_quality(
            image_path=image_path,
            model=self.quality_model,
            class_names=self.quality_class_names
        )

        failures = list(rules_report["failures"])
        warnings = list(rules_report["warnings"])

        if not model_report["passed"]:
            failures.append(model_report["message"])

        if failures:
            status = "fail"
        elif warnings:
            status = "warning"
        else:
            status = "pass"

        return {
            "status": status,
            "rules_report": rules_report,
            "model_report": model_report,
            "failures": failures,
            "warnings": warnings
        }