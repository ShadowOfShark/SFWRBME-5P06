import time
import torch
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights, resnet18, ResNet18_Weights
import torch.nn as nn

device = torch.device("cpu")  # simulate mobile CPU

# Dummy input: 1 image, 3x224x224
dummy_input = torch.randn(1, 3, 224, 224, device=device)

def build_mobilenet():
    weights = MobileNet_V3_Small_Weights.IMAGENET1K_V1
    model = mobilenet_v3_small(weights=weights)
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Sequential(
        nn.Linear(in_features, 256),
        nn.ReLU(),
        nn.Dropout(0.4),
        nn.Linear(256, 2)
    )
    model.eval().to(device)
    return model

def build_resnet():
    weights = ResNet18_Weights.IMAGENET1K_V1
    model = resnet18(weights=weights)
    for p in model.parameters():
        p.requires_grad = False
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, 2)
    model.eval().to(device)
    return model

def time_model(model, name, runs=50):
    # warmup
    for _ in range(5):
        _ = model(dummy_input)

    start = time.perf_counter()
    for _ in range(runs):
        _ = model(dummy_input)
    end = time.perf_counter()

    avg_ms = (end - start) * 1000 / runs
    print(f"{name}: ~{avg_ms:.2f} ms per image on CPU")

mobilenet = build_mobilenet()
resnet = build_resnet()

time_model(mobilenet, "MobileNetV3-Small")
time_model(resnet,   "ResNet-18")