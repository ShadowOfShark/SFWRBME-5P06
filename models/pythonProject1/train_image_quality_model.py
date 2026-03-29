import os
import json
import copy
import time

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, transforms
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights
from sklearn.model_selection import train_test_split

# ==========================================
# 1. SETTINGS
# ==========================================
DATASET_ROOT = "oral_quality_dataset"

BATCH_SIZE = 16
NUM_EPOCHS = 15
LR = 1e-4
WEIGHT_DECAY = 1e-4
IMG_SIZE = 224
RANDOM_SEED = 42

TRAIN_RATIO = 0.80
VAL_RATIO = 0.10
TEST_RATIO = 0.10

SAVE_DIR = "saved_quality_model"
MODEL_NAME = "oral_quality_mobilenetv3_small.pth"
LABELS_NAME = "oral_quality_labels.json"
HISTORY_NAME = "oral_quality_history.json"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", DEVICE)

# Sanity check
if abs((TRAIN_RATIO + VAL_RATIO + TEST_RATIO) - 1.0) > 1e-6:
    raise ValueError("TRAIN_RATIO + VAL_RATIO + TEST_RATIO must equal 1.0")

torch.manual_seed(RANDOM_SEED)

# ==========================================
# 2. TRANSFORMS
# ==========================================
train_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomRotation(10),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

eval_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

# ==========================================
# 3. LOAD DATASET ONCE
# ==========================================
full_dataset_for_split = datasets.ImageFolder(DATASET_ROOT)
class_names = full_dataset_for_split.classes
targets = full_dataset_for_split.targets
num_classes = len(class_names)

print("Classes found:", class_names)

if set(class_names) != {"valid_oral", "invalid_oral"}:
    print("Warning: expected class names ['invalid_oral', 'valid_oral'] or similar.")
    print("Found:", class_names)

if num_classes != 2:
    raise ValueError("Expected exactly 2 classes: valid_oral and invalid_oral")

all_indices = list(range(len(full_dataset_for_split)))

# ==========================================
# 4. STRATIFIED SPLIT
# ==========================================
train_indices, temp_indices, train_targets, temp_targets = train_test_split(
    all_indices,
    targets,
    test_size=(1.0 - TRAIN_RATIO),
    stratify=targets,
    random_state=RANDOM_SEED
)

val_fraction_of_temp = VAL_RATIO / (VAL_RATIO + TEST_RATIO)

val_indices, test_indices = train_test_split(
    temp_indices,
    test_size=(1.0 - val_fraction_of_temp),
    stratify=temp_targets,
    random_state=RANDOM_SEED
)

print(f"Total images: {len(all_indices)}")
print(f"Train: {len(train_indices)}")
print(f"Val:   {len(val_indices)}")
print(f"Test:  {len(test_indices)}")

# ==========================================
# 5. CREATE DATASETS WITH DIFFERENT TRANSFORMS
# ==========================================
train_dataset_full = datasets.ImageFolder(DATASET_ROOT, transform=train_transform)
eval_dataset_full = datasets.ImageFolder(DATASET_ROOT, transform=eval_transform)

train_dataset = Subset(train_dataset_full, train_indices)
val_dataset = Subset(eval_dataset_full, val_indices)
test_dataset = Subset(eval_dataset_full, test_indices)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

# ==========================================
# 6. MODEL
# ==========================================
def build_model(num_classes: int):
    model = mobilenet_v3_small(weights=MobileNet_V3_Small_Weights.IMAGENET1K_V1)

    for param in model.features.parameters():
        param.requires_grad = False

    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Sequential(
        nn.Linear(in_features, 128),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(128, num_classes)
    )
    return model

model = build_model(num_classes).to(DEVICE)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=LR,
    weight_decay=WEIGHT_DECAY
)

# ==========================================
# 7. TRAIN / EVAL LOOP
# ==========================================
def run_epoch(model, loader, criterion, optimizer=None):
    is_train = optimizer is not None
    model.train() if is_train else model.eval()

    running_loss = 0.0
    running_correct = 0
    total = 0

    with torch.set_grad_enabled(is_train):
        for images, labels in loader:
            images = images.to(DEVICE)
            labels = labels.to(DEVICE)

            outputs = model(images)
            loss = criterion(outputs, labels)

            if is_train:
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

            preds = outputs.argmax(dim=1)
            running_loss += loss.item() * images.size(0)
            running_correct += (preds == labels).sum().item()
            total += labels.size(0)

    return running_loss / max(total, 1), running_correct / max(total, 1)

# ==========================================
# 8. TRAINING
# ==========================================
best_model_wts = copy.deepcopy(model.state_dict())
best_val_acc = 0.0

history = {
    "train_loss": [],
    "train_acc": [],
    "val_loss": [],
    "val_acc": []
}

for epoch in range(NUM_EPOCHS):
    start = time.time()

    train_loss, train_acc = run_epoch(model, train_loader, criterion, optimizer)
    val_loss, val_acc = run_epoch(model, val_loader, criterion, optimizer=None)

    elapsed = time.time() - start

    history["train_loss"].append(train_loss)
    history["train_acc"].append(train_acc)
    history["val_loss"].append(val_loss)
    history["val_acc"].append(val_acc)

    print(
        f"Epoch {epoch + 1}/{NUM_EPOCHS} | {elapsed:.1f}s | "
        f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.4f} | "
        f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.4f}"
    )

    if val_acc > best_val_acc:
        best_val_acc = val_acc
        best_model_wts = copy.deepcopy(model.state_dict())

print(f"\nBest validation accuracy: {best_val_acc:.4f}")
model.load_state_dict(best_model_wts)

# ==========================================
# 9. TEST EVALUATION
# ==========================================
test_loss, test_acc = run_epoch(model, test_loader, criterion, optimizer=None)
print(f"Test Loss: {test_loss:.4f}, Test Acc: {test_acc:.4f}")

# ==========================================
# 10. SAVE MODEL + LABELS + HISTORY
# ==========================================
os.makedirs(SAVE_DIR, exist_ok=True)

model_path = os.path.join(SAVE_DIR, MODEL_NAME)
labels_path = os.path.join(SAVE_DIR, LABELS_NAME)
history_path = os.path.join(SAVE_DIR, HISTORY_NAME)

torch.save(model.state_dict(), model_path)

with open(labels_path, "w") as f:
    json.dump(class_names, f)

with open(history_path, "w") as f:
    json.dump(history, f, indent=2)

print(f"Saved model to: {model_path}")
print(f"Saved labels to: {labels_path}")
print(f"Saved history to: {history_path}")