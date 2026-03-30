from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import tempfile
import os
import json

from ml.preprocessing_gate import OralPrecheck
from ml.image_inference import (
    load_model as load_image_model,
    predict_image_probabilities
)
from ml.questionnaire_inference import predict_questionnaire_probabilities
from ml.fusion import combine_probabilities, detect_conditions

app = FastAPI(
    title="Selfie Oral Screening API",
    version="0.5.0"
)

# Load models once at startup
print("=== STARTUP: loading precheck service ===")
precheck_service = OralPrecheck()

print("=== STARTUP: loading image inference model ===")
image_model, image_class_names = load_image_model()

print("=== STARTUP COMPLETE ===")
print("Loaded image classes:", image_class_names)


@app.get("/")
def root():
    return {"message": "Backend is running."}


@app.post("/analyze")
async def analyze(
    image: UploadFile = File(...),
    answers: str = Form(None)
):
    if not image.filename:
        raise HTTPException(status_code=400, detail="No image filename provided.")

    image_bytes = await image.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    print("\n=== IMAGE RECEIVED ===")
    print("Filename:", image.filename)
    print("Bytes received:", len(image_bytes))

    parsed_answers = {}
    if answers is not None:
        try:
            parsed_answers = json.loads(answers)
            print("=== ANSWERS RECEIVED ===")
            print(parsed_answers)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid answers JSON.")

    suffix = os.path.splitext(image.filename)[1] or ".jpg"
    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(image_bytes)
            temp_path = temp_file.name

        print("=== TEMP IMAGE SAVED ===")
        print("Temp path:", temp_path)

        # Step 1: precheck
        precheck_result = precheck_service.run(temp_path)

        print("=== PRECHECK RESULT ===")
        print(precheck_result)

        if precheck_result["status"] == "fail":
            print("=== EARLY EXIT: PRECHECK FAILED ===")

            return {
                "success": False,
                "summary": "Image failed precheck. Please retake a clearer photo.",
                "image_quality_passed": False,
                "image_quality_status": precheck_result["status"],
                "failures": precheck_result["failures"],
                "warnings": precheck_result["warnings"],
                "checks": precheck_result,
                "received_answers": parsed_answers,
                "image_probabilities": {},
                "questionnaire_probabilities": {},
                "probabilities": {},
                "detected_conditions": []
            }

        # Step 2: image inference
        image_probabilities = predict_image_probabilities(
            image_path=temp_path,
            model=image_model,
            class_names=image_class_names
        )

        print("=== IMAGE INFERENCE RESULT ===")
        print(image_probabilities)

        # Step 3: questionnaire inference
        questionnaire_probabilities = predict_questionnaire_probabilities(parsed_answers)

        print("=== QUESTIONNAIRE INFERENCE RESULT ===")
        print(questionnaire_probabilities)

        # Step 4: fusion
        final_probabilities = combine_probabilities(
            image_probabilities,
            questionnaire_probabilities
        )

        detected_conditions = detect_conditions(final_probabilities)

        print("=== FUSION RESULT ===")
        print(final_probabilities)

        print("=== DETECTED CONDITIONS ===")
        print(detected_conditions)

        return {
            "success": True,
            "summary": f"Analysis completed successfully for {image.filename}.",
            "image_quality_passed": True,
            "image_quality_status": precheck_result["status"],
            "failures": precheck_result["failures"],
            "warnings": precheck_result["warnings"],
            "checks": precheck_result,
            "received_answers": parsed_answers,
            "image_probabilities": image_probabilities,
            "questionnaire_probabilities": questionnaire_probabilities,
            "probabilities": final_probabilities,
            "detected_conditions": detected_conditions
        }

    except ValueError as e:
        print("=== VALUE ERROR ===")
        print(str(e))
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        print("=== UNEXPECTED ERROR ===")
        print(str(e))
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            print("=== TEMP FILE REMOVED ===")
            print(temp_path)