import json

import uvicorn
from fastapi import FastAPI, File, Form, UploadFile

app = FastAPI()

@app.post("/analyze")
async def analyze(
    image: UploadFile = File(...),
    answers: str = Form(...)
):
    parsed_answers = json.loads(answers)
    image_bytes = await image.read()

    print("\n=== MOCK BACKEND RECEIVED ===")
    print("filename:", image.filename)
    print("content_type:", image.content_type)
    print("image_size_bytes:", len(image_bytes))
    print("answers:", parsed_answers)

    return {
        "success": True,
        "summary": "Mock backend received image and questionnaire successfully.",
        "image_quality_passed": True,
        "detected_conditions": ["Caries", "Gingivitis"],
        "probabilities": {
            "Calculus": 0.20,
            "Caries": 0.35,
            "Gingivitis": 0.25,
            "Tooth Discoloration": 0.20
        },
        "received_image": {
            "filename": image.filename,
            "content_type": image.content_type,
            "size_bytes": len(image_bytes)
        },
        "received_answers": parsed_answers
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)    uvicorn.run(app, host="0.0.0.0", port=8000)