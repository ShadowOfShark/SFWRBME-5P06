import os
import json
import argparse
import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights
from PIL import Image

# ==========================================
# 1. SETTINGS & PATHS
# ==========================================
MODEL_PATH = "saved_models/mobilenetv3_multilabel.pth"
LABELS_PATH = "saved_models/labels.json"
THRESHOLD = 0.5  # Probabilities above this are considered "detected"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# Same transform used during test/eval
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])


# ==========================================
# 2. HELPER FUNCTIONS
# ==========================================
def load_labels(json_path: str):
    """Loads the disease class names saved during training."""
    if not os.path.exists(json_path):
        raise FileNotFoundError(
            f"Labels file not found at {json_path}. Did you run the training script to generate it?")
    with open(json_path, "r") as f:
        return json.load(f)


def load_model(model_path: str, num_classes: int):
    """Rebuilds the MobileNetV3 architecture and loads the weights."""
    weights = MobileNet_V3_Small_Weights.IMAGENET1K_V1
    model = mobilenet_v3_small(weights=weights)

    # Rebuild the classifier head to match training
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Sequential(
        nn.Linear(in_features, 256),
        nn.ReLU(),
        nn.Dropout(0.4),
        nn.Linear(256, num_classes)  # Outputs map precisely to our disease classes
    )

    state_dict = torch.load(model_path, map_location=device)
    model.load_state_dict(state_dict)

    model.to(device)
    model.eval()
    return model


def preprocess_image(image_path: str):
    img = Image.open(image_path).convert("RGB")
    img = transform(img).unsqueeze(0)  # Add batch dimension: [1, 3, 224, 224]
    return img


# ==========================================
# 3. CORE INFERENCE LOGIC
# ==========================================
def predict_image(model, image_path: str, class_names: list):
    img_tensor = preprocess_image(image_path).to(device)

    with torch.no_grad():
        outputs = model(img_tensor)
        # Multi-label uses Sigmoid to evaluate each condition independently
        probs = torch.sigmoid(outputs)[0]

        # Map probabilities to class names
    probs_dict = {class_names[i]: float(probs[i]) for i in range(len(class_names))}

    # Filter conditions that pass the confidence threshold
    detected_conditions = [name for name, p in probs_dict.items() if p >= THRESHOLD]

    # If no diseases break the threshold, the diagnosis is Healthy
    if not detected_conditions:
        detected_conditions = ["Healthy"]

    return detected_conditions, probs_dict


# ==========================================
# 4. CLI ENTRY POINT
# ==========================================
def main():
    parser = argparse.ArgumentParser(description="Multi-Label Dental Inference")
    parser.add_argument("image_path", type=str, nargs="?", help="Path to input image")
    args = parser.parse_args()

    # Default image handling
    image_path = args.image_path if args.image_path else "test.jpg"
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    # 1. Load labels
    print(f"Loading labels from: {LABELS_PATH}")
    disease_classes = load_labels(LABELS_PATH)

    # 2. Load model
    print(f"Loading model from: {MODEL_PATH}")
    model = load_model(MODEL_PATH, len(disease_classes))

    # 3. Predict
    print(f"\nRunning inference on: {image_path}")
    detected, probabilities = predict_image(model, image_path, disease_classes)

    # 4. Display Results
    print("\n" + "=" * 30)
    print("DIAGNOSIS REPORT")
    print("=" * 30)
    print(f"Detected: {', '.join(detected)}")
    print("-" * 30)
    print("Raw Probabilities:")
    for cls_name, p in probabilities.items():
        # Print with a simple visual indicator if it crossed the threshold
        marker = "[!]" if p >= THRESHOLD else "   "
        print(f" {marker} {cls_name.capitalize().ljust(20)}: {p * 100:.1f}%")
    print("=" * 30)


if __name__ == "__main__":
    main()