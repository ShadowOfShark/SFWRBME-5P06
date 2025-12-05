import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights
from PIL import Image
import argparse
import os

# Settings
MODEL_PATH = "saved_models/mobilenetv3_v2_calculus_vs_healthy.pth"

# Must match ImageFolder ordering: ['Calculus', 'Healthy']
CLASS_NAMES = ['Calculus', 'Healthy']

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# Same as test_transform in training
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# Build model (must match training)
def load_model(model_path: str):
    weights = MobileNet_V3_Small_Weights.IMAGENET1K_V1
    model = mobilenet_v3_small(weights=weights)

    # Rebuild the same classifier head: 1024 -> 256 -> 2 with dropout
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Sequential(
        nn.Linear(in_features, 256),
        nn.ReLU(),
        nn.Dropout(0.4),
        nn.Linear(256, 2)
    )

    state_dict = torch.load(model_path, map_location=device)
    model.load_state_dict(state_dict)

    model.to(device)
    model.eval()
    return model


# Preprocess single image
def preprocess_image(image_path: str):
    img = Image.open(image_path).convert("RGB")
    img = transform(img)           # [3, 224, 224]
    img = img.unsqueeze(0)         # [1, 3, 224, 224]
    return img


# Inference
def predict_image(model, image_path: str):
    img_tensor = preprocess_image(image_path).to(device)

    with torch.no_grad():
        outputs = model(img_tensor)             # [1, 2]
        probs = torch.softmax(outputs, dim=1)[0]  # [2]

    pred_idx = torch.argmax(probs).item()
    pred_class = CLASS_NAMES[pred_idx]

    probs_dict = {CLASS_NAMES[i]: float(probs[i]) for i in range(len(CLASS_NAMES))}
    return pred_class, probs_dict


# CLI entry point
def main():
    parser = argparse.ArgumentParser(
        description="Inference with MobileNetV3-Small (Calculus vs Healthy)"
    )
    parser.add_argument(
        "image_path",
        type=str,
        nargs="?",
        help="Path to the input image (e.g. test.jpg)"
    )
    args = parser.parse_args()

    # Allow running without args by using a default test image
    if args.image_path is None:
        default_image = "test.jpg"  # put a sample image in your project folder
        print(f"No image_path provided. Using default: {default_image}")
        image_path = default_image
    else:
        image_path = args.image_path

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")

    print(f"Loading model from: {MODEL_PATH}")
    model = load_model(MODEL_PATH)

    print(f"Running inference on: {image_path}")
    pred_class, probs = predict_image(model, image_path)

    print("\nPrediction:")
    print(f"  Class: {pred_class}")
    print("  Probabilities:")
    for cls_name, p in probs.items():
        print(f"    {cls_name}: {p:.4f}")


if __name__ == "__main__":
    main()
