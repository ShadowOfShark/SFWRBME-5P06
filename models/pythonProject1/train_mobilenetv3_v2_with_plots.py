import os
import time
import copy
import json

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Subset, Dataset
from torchvision import datasets, transforms
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights

from sklearn.metrics import roc_curve, auc
import matplotlib.pyplot as plt
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
    def __init__(self, image_folder_dataset, class_names):
        self.dataset = image_folder_dataset
        self.class_names = class_names

        self.healthy_name = next((c for c in class_names if 'healthy' in c.lower()), None)
        if not self.healthy_name:
            raise ValueError("Could not find a 'healthy' folder in your dataset.")

        self.disease_classes = [c for c in class_names if c != self.healthy_name]
        self.num_diseases = len(self.disease_classes)

    def __len__(self):
        return len(self.dataset)

    def __getitem__(self, idx):
        image, original_label_idx = self.dataset[idx]
        original_class_name = self.class_names[original_label_idx]

        target = torch.full((self.num_diseases,), -1.0)

        if original_class_name == self.healthy_name:
            target = torch.zeros(self.num_diseases)
        else:
            disease_idx = self.disease_classes.index(original_class_name)
            target[disease_idx] = 1.0

        return image, target

# ==========================================
# 4. DATA LOADING
# ==========================================
base_train_img_folder = datasets.ImageFolder(DATASET_PATH, transform=train_transform)
base_test_img_folder = datasets.ImageFolder(DATASET_PATH, transform=test_transform)

raw_classes = base_train_img_folder.classes
base_train_dataset = MultiLabelDataset(base_train_img_folder, raw_classes)
base_test_dataset = MultiLabelDataset(base_test_img_folder, raw_classes)

num_samples = len(base_train_dataset)

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

for param in model.features.parameters():
    param.requires_grad = False

in_features = model.classifier[3].in_features
num_outputs = base_train_dataset.num_diseases

model.classifier[3] = nn.Sequential(
    nn.Linear(in_features, 256),
    nn.ReLU(),
    nn.Dropout(0.4),
    nn.Linear(256, num_outputs)
)

model = model.to(device)
optimizer = torch.optim.Adam(model.classifier.parameters(), lr=LR_HEAD, weight_decay=WEIGHT_DECAY)

# ==========================================
# 6. MASKED LOSS FUNCTION (No Weights)
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

        preds = (outputs > 0.0).float()
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

history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}

for epoch in range(NUM_EPOCHS):
    start = time.time()
    train_loss, train_acc = train_one_epoch(model, train_loader, optimizer, device)
    val_loss, val_acc, _, _ = evaluate(model, test_loader, device)
    elapsed = time.time() - start

    history["train_loss"].append(train_loss)
    history["train_acc"].append(train_acc)
    history["val_loss"].append(val_loss)
    history["val_acc"].append(val_acc)

    print(f"Epoch {epoch + 1}/{NUM_EPOCHS} - {elapsed:.1f}s | Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | Val Loss: {val_loss:.4f} Acc: {val_acc:.4f}")

    if val_acc > best_acc:
        best_acc = val_acc
        best_model_wts = copy.deepcopy(model.state_dict())

model.load_state_dict(best_model_wts)
print(f"\nTraining done. Best overall validation accuracy: {best_acc:.4f}")

# ==========================================
# 9. MULTI-LABEL EVALUATION & PLOTTING
# ==========================================
_, _, y_true, y_logits = evaluate(model, test_loader, device)
y_probs = torch.sigmoid(torch.tensor(y_logits)).numpy()
y_pred = (y_probs > 0.5).astype(float)

disease_names = base_train_dataset.disease_classes
os.makedirs("plots_mobilenet", exist_ok=True)

print("\n--- PER-CONDITION PERFORMANCE ---")

plt.figure(figsize=(8, 6))

for i, condition in enumerate(disease_names):
    valid_indices = np.where(y_true[:, i] != -1)[0]

    if len(valid_indices) == 0:
        continue

    true_labels = y_true[valid_indices, i]
    pred_labels = y_pred[valid_indices, i]
    probs = y_probs[valid_indices, i]

    acc = np.mean(true_labels == pred_labels)

    try:
        fpr, tpr, _ = roc_curve(true_labels, probs)
        roc_auc = auc(fpr, tpr)
        plt.plot(fpr, tpr, label=f"{condition.capitalize()} (AUC = {roc_auc:.2f})")
    except ValueError:
        roc_auc = float('nan')

    print(f"\nCondition: {condition.upper()}")
    print(f"  Valid Test Samples: {len(valid_indices)}")
    print(f"  Accuracy: {acc:.4f}")
    if not np.isnan(roc_auc):
        print(f"  ROC AUC:  {roc_auc:.4f}")

plt.plot([0, 1], [0, 1], linestyle="--", color="gray", label="Chance")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("Multi-Label ROC Curves")
plt.legend(loc="lower right")
plt.grid(True)
plt.savefig(os.path.join("plots_mobilenet", "roc_curve_multilabel.png"), dpi=300)
plt.close()

epochs = range(1, NUM_EPOCHS + 1)
plt.figure()
plt.plot(epochs, history["train_loss"], label="Train loss")
plt.plot(epochs, history["val_loss"], label="Test loss")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.title("Training and Test Loss")
plt.legend()
plt.grid(True)
plt.savefig(os.path.join("plots_mobilenet", "loss_curve_mobilenetv3.png"), dpi=300)
plt.close()

plt.figure()
plt.plot(epochs, history["train_acc"], label="Train accuracy")
plt.plot(epochs, history["val_acc"], label="Test accuracy")
plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.title("Training and Test Accuracy")
plt.legend()
plt.grid(True)
plt.savefig(os.path.join("plots_mobilenet", "accuracy_curve_mobilenetv3.png"), dpi=300)
plt.close()

print("\nSaved all plots to 'plots_mobilenet'.")

# ==========================================
# 10. SAVE MODEL & LABELS
# ==========================================
os.makedirs("saved_models", exist_ok=True)

model_path = os.path.join("saved_models", "mobilenetv3_multilabel.pth")
torch.save(model.state_dict(), model_path)
print(f"\nSaved best model to: {model_path}")

labels_path = os.path.join("saved_models", "labels.json")
with open(labels_path, "w") as f:
    json.dump(disease_names, f)
print(f"Saved label mapping to: {labels_path}")