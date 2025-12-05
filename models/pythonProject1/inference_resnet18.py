import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.models import resnet18, ResNet18_Weights
from PIL import Image
import argparse
import os

# Settings
MODEL_PATH = "saved_models/resnet18_calculus_vs_healthy.pth"

# ImageFolder sorted them alphabetically: ['Calculus', 'Healthy']
CLASS_NAMES = ['Calculus', 'Healthy']

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)


# Build model (must match training)
def load_model(model_path: str):
    # Load pretrained backbone
    weights = ResNet18_Weights.IMAGENET1K_V1
    model = resnet18(weights=weights)

    # Replace final FC layer: 512 -> 2 (same as training)
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, 2)

    # Load trained weights
    state_dict = torch.load(model_path, map_location=device)
    model.load_state_dict(state_dict)

    model.to(device)
    model.eval()
    return model


# Preprocessing (same as test_transform)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def preprocess_image(image_path: str):
    img = Image.open(image_path).convert("RGB")
    img = transform(img)              # [3, 224, 224]
    img = img.unsqueeze(0)            # [1, 3, 224, 224]
    return img


# inference on a single image
def predict_image(model, image_path: str):
    img_tensor = preprocess_image(image_path).to(device)

    with torch.no_grad():
        outputs = model(img_tensor)              # [1, 2]
        probs = torch.softmax(outputs, dim=1)[0] # [2]

    pred_idx = torch.argmax(probs).item()
    pred_class = CLASS_NAMES[pred_idx]

    probs_dict = {CLASS_NAMES[i]: float(probs[i]) for i in range(len(CLASS_NAMES))}
    return pred_class, probs_dict


# CLI entry point
def main():
    parser = argparse.ArgumentParser(description="Inference with ResNet-18 (Calculus vs Healthy)")
    parser.add_argument("image_path", type=str, nargs="?", help="Path to the input image (e.g. test.jpg)")
    args = parser.parse_args()

    # Allow running with no args → use default image
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
