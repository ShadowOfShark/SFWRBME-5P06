import os
import time
import copy
import json

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Subset, Dataset
from torchvision import datasets, transforms
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights

from sklearn.metrics import classification_report, roc_curve, auc
import numpy as np

# ==========================================
# 1. SETTINGS
# ==========================================
DATASET_PATH = "dataset"
BATCH_SIZE = 16
NUM_EPOCHS = 25
LR_HEAD = 1e-4
WEIGHT_DECAY = 1e-4

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# ==========================================
# 2. TRANSFORMS
# ==========================================
train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=(0.9, 1.1)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

test_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])


# ==========================================
# 3. CUSTOM MULTI-LABEL DATASET WRAPPER
# ==========================================
class MultiLabelDataset(Dataset):
    """
    Converts standard ImageFolder integer labels into masked multi-label arrays.
    Healthy -> [0, 0, 0, 0, 0]
    Disease X -> [-1, 1, -1, -1, -1]
    """

    def __init__(self, image_folder_dataset, class_names):
        self.dataset = image_folder_dataset
        self.class_names = class_names

        # Automatically identify the healthy class (case-insensitive)
        self.healthy_name = next((c for c in class_names if 'healthy' in c.lower()), None)

        if not self.healthy_name:
            raise ValueError("Could not find a 'healthy' folder in your dataset.")

        # The model will output predictions ONLY for the diseases
        self.disease_classes = [c for c in class_names if c != self.healthy_name]
        self.num_diseases = len(self.disease_classes)

    def __len__(self):
        return len(self.dataset)

    def __getitem__(self, idx):
        image, original_label_idx = self.dataset[idx]
        original_class_name = self.class_names[original_label_idx]

        # Initialize target array with -1 (ignore)
        target = torch.full((self.num_diseases,), -1.0)

        if original_class_name == self.healthy_name:
            # Healthy means 0 for all diseases
            target = torch.zeros(self.num_diseases)
        else:
            # Find which disease this is, set to 1
            disease_idx = self.disease_classes.index(original_class_name)
            target[disease_idx] = 1.0

        return image, target


# ==========================================
# 4. DATA LOADING
# ==========================================
# Load raw folders
base_train_img_folder = datasets.ImageFolder(DATASET_PATH, transform=train_transform)
base_test_img_folder = datasets.ImageFolder(DATASET_PATH, transform=test_transform)

raw_classes = base_train_img_folder.classes
print("Raw Folders Found:", raw_classes)

# Wrap with our multi-label converter
base_train_dataset = MultiLabelDataset(base_train_img_folder, raw_classes)
base_test_dataset = MultiLabelDataset(base_test_img_folder, raw_classes)

print("Target Classes (Model Outputs):", base_train_dataset.disease_classes)

num_samples = len(base_train_dataset)
print("Total images:", num_samples)

# Train/Test Split
train_size = int(0.8 * num_samples)
test_size = num_samples - train_size

indices = torch.randperm(num_samples).tolist()
train_dataset = Subset(base_train_dataset, indices[:train_size])
test_dataset = Subset(base_test_dataset, indices[train_size:])

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

# ==========================================
# 5. MODEL ARCHITECTURE
# ==========================================
weights = MobileNet_V3_Small_Weights.IMAGENET1K_V1
model = mobilenet_v3_small(weights=weights)

# Freeze backbone
for param in model.features.parameters():
    param.requires_grad = False

in_features = model.classifier[3].in_features
num_outputs = base_train_dataset.num_diseases

# Single head with outputs equal to number of disease conditions
model.classifier[3] = nn.Sequential(
    nn.Linear(in_features, 256),
    nn.ReLU(),
    nn.Dropout(0.4),
    nn.Linear(256, num_outputs)
)

model = model.to(device)

optimizer = torch.optim.Adam(model.classifier.parameters(), lr=LR_HEAD, weight_decay=WEIGHT_DECAY)


# ==========================================
# 6. MASKED LOSS FUNCTION
# ==========================================
def masked_bce_loss(outputs, targets):
    mask = (targets != -1)
    valid_outputs = outputs[mask]
    valid_targets = targets[mask]

    if valid_outputs.numel() == 0:
        return torch.tensor(0.0, requires_grad=True).to(outputs.device)

    return nn.BCEWithLogitsLoss()(valid_outputs, valid_targets)


# ==========================================
# 7. TRAIN / EVAL LOOPS
# ==========================================
def train_one_epoch(model, loader, optimizer, device):
    model.train()
    running_loss = 0.0
    running_corrects = 0
    total_valid = 0

    for images, targets in loader:
        images, targets = images.to(device), targets.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = masked_bce_loss(outputs, targets)
        loss.backward()
        optimizer.step()

        # Calculate accuracy only on valid (non -1) labels
        preds = (outputs > 0.0).float()  # Sigmoid > 0.5 is mathematically the same as logit > 0.0
        mask = (targets != -1)

        running_loss += loss.item() * images.size(0)
        running_corrects += (preds[mask] == targets[mask]).sum().item()
        total_valid += mask.sum().item()

    return running_loss / len(loader.dataset), running_corrects / max(total_valid, 1)


def evaluate(model, loader, device):
    model.eval()
    running_loss = 0.0
    running_corrects = 0
    total_valid = 0

    all_targets = []
    all_outputs = []

    with torch.no_grad():
        for images, targets in loader:
            images, targets = images.to(device), targets.to(device)
            outputs = model(images)
            loss = masked_bce_loss(outputs, targets)

            preds = (outputs > 0.0).float()
            mask = (targets != -1)

            running_loss += loss.item() * images.size(0)
            running_corrects += (preds[mask] == targets[mask]).sum().item()
            total_valid += mask.sum().item()

            all_targets.append(targets.cpu().numpy())
            all_outputs.append(outputs.cpu().numpy())

    avg_loss = running_loss / len(loader.dataset)
    avg_acc = running_corrects / max(total_valid, 1)

    return avg_loss, avg_acc, np.vstack(all_targets), np.vstack(all_outputs)


# ==========================================
# 8. TRAINING EXECUTION
# ==========================================
best_model_wts = copy.deepcopy(model.state_dict())
best_acc = 0.0

for epoch in range(NUM_EPOCHS):
    start = time.time()
    train_loss, train_acc = train_one_epoch(model, train_loader, optimizer, device)
    val_loss, val_acc, _, _ = evaluate(model, test_loader, device)
    elapsed = time.time() - start

    print(
        f"Epoch {epoch + 1}/{NUM_EPOCHS} - {elapsed:.1f}s | Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | Val Loss: {val_loss:.4f} Acc: {val_acc:.4f}")

    if val_acc > best_acc:
        best_acc = val_acc
        best_model_wts = copy.deepcopy(model.state_dict())

model.load_state_dict(best_model_wts)
print(f"\nTraining done. Best overall validation accuracy: {best_acc:.4f}")

# ==========================================
# 9. MULTI-LABEL EVALUATION
# ==========================================
_, _, y_true, y_logits = evaluate(model, test_loader, device)
y_probs = torch.sigmoid(torch.tensor(y_logits)).numpy()
y_pred = (y_probs > 0.5).astype(float)

disease_names = base_train_dataset.disease_classes

print("\n--- PER-CONDITION PERFORMANCE ---")
# Evaluate each disease independently, filtering out the -1 masks
for i, condition in enumerate(disease_names):
    # Get indices where the label is NOT -1
    valid_indices = np.where(y_true[:, i] != -1)[0]

    if len(valid_indices) == 0:
        continue

    true_labels = y_true[valid_indices, i]
    pred_labels = y_pred[valid_indices, i]
    probs = y_probs[valid_indices, i]

    # Accuracy for this specific condition
    acc = np.mean(true_labels == pred_labels)

    # ROC AUC
    try:
        fpr, tpr, _ = roc_curve(true_labels, probs)
        roc_auc = auc(fpr, tpr)
    except ValueError:
        roc_auc = float('nan')

    print(f"\nCondition: {condition.upper()}")
    print(f"  Valid Test Samples: {len(valid_indices)}")
    print(f"  Accuracy: {acc:.4f}")
    if not np.isnan(roc_auc):
        print(f"  ROC AUC:  {roc_auc:.4f}")

# Save Model
os.makedirs("saved_models", exist_ok=True)
model_path = os.path.join("saved_models", "mobilenetv3_multilabel.pth")
torch.save(model.state_dict(), model_path)
print(f"\nSaved best model to: {model_path}")

# Save the class names
labels_path = os.path.join("saved_models", "labels.json")
with open(labels_path, "w") as f:
    # Save the array so your mobile app can load it later
    json.dump(disease_names, f)

print(f"Saved label mapping to: {labels_path}")