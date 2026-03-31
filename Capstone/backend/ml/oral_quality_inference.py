from pathlib import Path
import json
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
QUALITY_MODEL_DIR = BASE_DIR / "saved_quality_model"

MODEL_PATH = QUALITY_MODEL_DIR / "oral_quality_mobilenetv3_small.pth"
LABELS_PATH = QUALITY_MODEL_DIR / "oral_quality_labels.json"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

IMAGE_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])


def load_labels(labels_path: Path = LABELS_PATH):
    if not labels_path.exists():
        raise FileNotFoundError(f"Labels file not found: {labels_path}")

    with open(labels_path, "r", encoding="utf-8") as f:
        labels = json.load(f)

    if not isinstance(labels, list):
        raise TypeError(f"Expected labels JSON to be a list, got: {type(labels)}")

    return labels


def build_model(num_classes: int):
    model = models.mobilenet_v3_small(weights=None)

    in_features = model.classifier[3].in_features

    model.classifier[3] = nn.Sequential(
        nn.Linear(in_features, 128),
        nn.ReLU(),
        nn.Dropout(0.4),
        nn.Linear(128, num_classes)
    )

    return model


def load_model():
    class_names = load_labels()
    model = build_model(len(class_names))

    state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
    model.load_state_dict(state_dict)

    model.to(DEVICE)
    model.eval()

    return model, class_names


def predict_oral_quality(image_path: str, model, class_names):
    image = Image.open(image_path).convert("RGB")
    image_tensor = IMAGE_TRANSFORM(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(image_tensor)
        probs = torch.softmax(outputs, dim=1)[0]

        pred_idx = int(torch.argmax(probs).item())
        confidence = float(probs[pred_idx].item())
        predicted_class = class_names[pred_idx]

    CONFIDENCE_THRESHOLD = 0.65

    is_valid_class = predicted_class.lower() not in ["invalid_oral"]
    is_confident = confidence >= CONFIDENCE_THRESHOLD

    passed = is_valid_class and is_confident

    return {
        "passed": passed,
        "predicted_class": predicted_class,
        "confidence": confidence,
        "message": None if passed else f"Model flagged image quality as {predicted_class}."
    }