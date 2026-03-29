import os
import json
import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights

MODEL_PATH = "saved_quality_model/oral_quality_mobilenetv3_small.pth"
LABELS_PATH = "saved_quality_model/oral_quality_labels.json"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])


def load_labels(labels_path=LABELS_PATH):
    if not os.path.exists(labels_path):
        raise FileNotFoundError(f"Labels file not found: {labels_path}")
    with open(labels_path, "r") as f:
        return json.load(f)


def build_model(num_classes: int):
    model = mobilenet_v3_small(weights=MobileNet_V3_Small_Weights.IMAGENET1K_V1)
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Sequential(
        nn.Linear(in_features, 128),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(128, num_classes)
    )
    return model


def load_model(model_path=MODEL_PATH, labels_path=LABELS_PATH):
    class_names = load_labels(labels_path)
    model = build_model(len(class_names))
    state_dict = torch.load(model_path, map_location=DEVICE)
    model.load_state_dict(state_dict)
    model.to(DEVICE)
    model.eval()
    return model, class_names


def preprocess_image(image_path: str):
    img = Image.open(image_path).convert("RGB")
    return TRANSFORM(img).unsqueeze(0)


def predict_oral_quality(image_path: str, model=None, class_names=None):
    if model is None or class_names is None:
        model, class_names = load_model()

    img_tensor = preprocess_image(image_path).to(DEVICE)

    with torch.no_grad():
        logits = model(img_tensor)
        probs = torch.softmax(logits, dim=1)[0].cpu().tolist()

    probs_dict = {class_names[i]: float(probs[i]) for i in range(len(class_names))}
    pred_idx = int(torch.tensor(probs).argmax().item())
    pred_label = class_names[pred_idx]

    valid_prob = probs_dict.get("valid_oral", 0.0)
    passed = valid_prob >= 0.65

    return {
        "passed": passed,
        "predicted_label": pred_label,
        "probabilities": probs_dict,
        "probability_valid_oral": valid_prob,
        "message": None if passed else "Image does not appear to be a usable oral/teeth photo."
    }