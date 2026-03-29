import os
import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.models import resnet18, ResNet18_Weights
from PIL import Image
import matplotlib.pyplot as plt
import numpy as np

# Settings
MODEL_PATH = "resnet18_calculus_vs_healthy.pth"
CLASS_NAMES = ['Calculus', 'Healthy']  # same order as ImageFolder

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

# Model loading
def load_model():
    weights = ResNet18_Weights.IMAGENET1K_V1
    model = resnet18(weights=weights)

    # Final FC: 512 -> 2 (must match training)
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, 2)

    state_dict = torch.load(MODEL_PATH, map_location=device)
    model.load_state_dict(state_dict)

    model.to(device)
    model.eval()
    return model

# Preprocess image
def preprocess_image(image_path):
    img = Image.open(image_path).convert("RGB")
    original_img = img.copy()  # keep original size for overlay

    tensor = transform(img)         # [3, 224, 224]
    tensor = tensor.unsqueeze(0)    # [1, 3, 224, 224]
    return original_img, tensor


# Grad-CAM
def generate_gradcam(model, image_path, target_class=None, save_path=None):
    """
    Generate a Grad-CAM heatmap for a single image using ResNet-18.
    """
    original_img, input_tensor = preprocess_image(image_path)
    input_tensor = input_tensor.to(device)

    # Use the last residual block (layer4[-1]) as the target layer
    target_layer = model.layer4[-1]

    activations = []
    gradients = []

    def forward_hook(module, inp, out):
        # out is [N, C, H, W]
        activations.append(out.detach())

    def backward_hook(module, grad_input, grad_output):
        # grad_output[0] is [N, C, H, W]
        gradients.append(grad_output[0].detach())

    # Register hooks (PyTorch 2.x compatible)
    fh = target_layer.register_forward_hook(forward_hook)
    bh = target_layer.register_full_backward_hook(backward_hook)

    # Forward pass
    outputs = model(input_tensor)       # [1, 2]
    probs = torch.softmax(outputs, dim=1)[0]
    pred_idx = torch.argmax(probs).item()
    pred_label = CLASS_NAMES[pred_idx]

    print(f"Predicted: {pred_label}")
    print("Class probabilities:")
    for i, cls in enumerate(CLASS_NAMES):
        print(f"  {cls}: {probs[i].item():.4f}")

    # If no specific target_class given, use predicted class
    if target_class is None:
        target_class = pred_idx

    # Backward pass for target class
    model.zero_grad()
    target_score = outputs[0, target_class]
    target_score.backward()

    # Get stored activations & gradients
    # activations[0]: [N, C, H, W] -> [C, H, W] for single image
    activations_ = activations[0][0]   # [C, H, W]
    gradients_ = gradients[0][0]      # [C, H, W]

    # Global-average-pool gradients over spatial dims: [C]
    weights = torch.mean(gradients_, dim=(1, 2))  # [C]

    # Weighted sum of feature maps
    cam = torch.zeros(activations_.shape[1:], dtype=torch.float32).to(device)  # [H, W]
    for c, w in enumerate(weights):
        cam += w * activations_[c, :, :]

    # ReLU
    cam = torch.relu(cam)

    # Normalize to [0, 1]
    cam -= cam.min()
    if cam.max() > 0:
        cam /= cam.max()

    cam = cam.cpu().numpy()          # 2D array [H, W]
    cam = np.uint8(255 * cam)        # convert to 0–255 uint8

    # 2D grayscale image for PIL
    cam_img = Image.fromarray(cam).resize(original_img.size, Image.BILINEAR)
    cam_img = np.array(cam_img)

    original_np = np.array(original_img)

    # Overlay heatmap on original image
    plt.figure(figsize=(6, 6))
    plt.imshow(original_np)
    plt.imshow(cam_img, cmap="jet", alpha=0.4)
    plt.axis("off")
    plt.title(f"Grad-CAM - target: {CLASS_NAMES[target_class]} (ResNet-18)")

    if save_path is None:
        os.makedirs("gradcam_resnet_outputs", exist_ok=True)
        base = os.path.basename(image_path)
        save_path = os.path.join("gradcam_resnet_outputs", f"gradcam_resnet_{base}")

    plt.savefig(save_path, dpi=300, bbox_inches="tight")
    plt.close()

    # Clean up hooks
    fh.remove()
    bh.remove()

    print(f"Grad-CAM saved to: {save_path}")


if __name__ == "__main__":
    test_image = "test.jpg" # Image Path
    model = load_model()
    generate_gradcam(model, test_image)
