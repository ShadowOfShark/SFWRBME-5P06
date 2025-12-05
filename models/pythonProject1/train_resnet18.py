import os
import time
import copy

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, transforms
from torchvision.models import resnet18, ResNet18_Weights

import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, classification_report, roc_curve, auc
import numpy as np



# Settings
DATASET_PATH = "dataset"   # must contain Calculus/ and Healthy/
BATCH_SIZE = 16
NUM_EPOCHS = 25
LR_HEAD = 1e-3
WEIGHT_DECAY = 1e-4

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# Transforms
train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=(0.9, 1.1)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],   # ImageNet mean
        std=[0.229, 0.224, 0.225]     # ImageNet std
    )
])

test_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# Datasets and loaders
base_train_dataset = datasets.ImageFolder(DATASET_PATH, transform=train_transform)
base_test_dataset  = datasets.ImageFolder(DATASET_PATH, transform=test_transform)

print("Classes:", base_train_dataset.classes)  # should be ['Calculus', 'Healthy']
num_samples = len(base_train_dataset)
print("Total images:", num_samples)

train_size = int(0.8 * num_samples)
test_size  = num_samples - train_size

# Fixed random split for reproducibility
indices = torch.randperm(num_samples).tolist()
train_indices = indices[:train_size]
test_indices  = indices[train_size:]

train_dataset = Subset(base_train_dataset, train_indices)
test_dataset  = Subset(base_test_dataset,  test_indices)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True,  num_workers=0)
test_loader  = DataLoader(test_dataset,  batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

print("Train size:", len(train_dataset))
print("Test size:", len(test_dataset))


# Model: ResNet-18 + new head
weights = ResNet18_Weights.IMAGENET1K_V1
model = resnet18(weights=weights)

# Freeze all backbone parameters
for param in model.parameters():
    param.requires_grad = False

# Replace final FC layer: 512 -> 2
in_features = model.fc.in_features
model.fc = nn.Linear(in_features, 2)

model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(
    model.fc.parameters(),          # only train the final layer
    lr=LR_HEAD,
    weight_decay=WEIGHT_DECAY
)


# Train / eval functions
def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    running_corrects = 0
    total = 0

    for images, labels in loader:
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)            # [batch, 2]
        loss = criterion(outputs, labels)
        _, preds = torch.max(outputs, 1)

        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        running_corrects += (preds == labels).sum().item()
        total += labels.size(0)

    return running_loss / total, running_corrects / total


def evaluate(model, loader, criterion, device, return_probs=False):
    model.eval()
    running_loss = 0.0
    running_corrects = 0
    total = 0

    all_labels = []
    all_preds = []
    all_scores = []

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)
            probs = torch.softmax(outputs, dim=1)

            _, preds = torch.max(outputs, 1)

            running_loss += loss.item() * images.size(0)
            running_corrects += (preds == labels).sum().item()
            total += labels.size(0)

            all_labels.extend(labels.cpu().tolist())
            all_preds.extend(preds.cpu().tolist())

            # Probability for class 0 ("Calculus")
            all_scores.extend(probs[:, 0].cpu().tolist())

    avg_loss = running_loss / total
    avg_acc  = running_corrects / total

    if return_probs:
        return avg_loss, avg_acc, all_labels, all_preds, all_scores
    else:
        return avg_loss, avg_acc, all_labels, all_preds


# Training loop
history = {
    "train_loss": [],
    "train_acc": [],
    "val_loss": [],
    "val_acc": []
}

best_model_wts = copy.deepcopy(model.state_dict())
best_acc = 0.0

for epoch in range(NUM_EPOCHS):
    start = time.time()

    train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
    val_loss, val_acc, _, _ = evaluate(model, test_loader, criterion, device)

    history["train_loss"].append(train_loss)
    history["train_acc"].append(train_acc)
    history["val_loss"].append(val_loss)
    history["val_acc"].append(val_acc)

    elapsed = time.time() - start
    print(f"\nEpoch {epoch+1}/{NUM_EPOCHS} - {elapsed:.1f}s")
    print(f"  Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.4f}")
    print(f"  Test  Loss: {val_loss:.4f} | Test  Acc:  {val_acc:.4f}")

    if val_acc > best_acc:
        best_acc = val_acc
        best_model_wts = copy.deepcopy(model.state_dict())
        print("  --> New best model")

# Load best weights
model.load_state_dict(best_model_wts)
print(f"\nTraining done. Best test accuracy: {best_acc:.4f}")


# evaluation + ROC

test_loss, test_acc, y_true, y_pred, y_scores = evaluate(
    model, test_loader, criterion, device, return_probs=True
)
print("\nFinal Test Accuracy:", test_acc)

cm = confusion_matrix(y_true, y_pred)
print("\nConfusion matrix (rows=true, cols=pred):")
print(cm)

class_names = base_train_dataset.classes
print("\nClassification report:")
print(classification_report(y_true, y_pred, target_names=class_names))

# ROC curve (Calculus = positive class label 0)
fpr, tpr, thresholds = roc_curve(y_true, y_scores, pos_label=0)
roc_auc = auc(fpr, tpr)
print(f"\nROC AUC (Calculus vs Healthy): {roc_auc:.4f}")


# Plot curves
os.makedirs("plots_resnet", exist_ok=True)

epochs = range(1, NUM_EPOCHS + 1)

# Loss
plt.figure()
plt.plot(epochs, history["train_loss"], label="Train loss")
plt.plot(epochs, history["val_loss"], label="Test loss")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.title("ResNet-18: Training and Test Loss")
plt.legend()
plt.grid(True)
plt.savefig(os.path.join("plots_resnet", "loss_curve_resnet18.png"), dpi=300)
plt.close()

# Accuracy
plt.figure()
plt.plot(epochs, history["train_acc"], label="Train accuracy")
plt.plot(epochs, history["val_acc"], label="Test accuracy")
plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.title("ResNet-18: Training and Test Accuracy")
plt.legend()
plt.grid(True)
plt.savefig(os.path.join("plots_resnet", "accuracy_curve_resnet18.png"), dpi=300)
plt.close()

# ROC
plt.figure()
plt.plot(fpr, tpr, label=f"ROC curve (AUC = {roc_auc:.2f})")
plt.plot([0, 1], [0, 1], linestyle="--", label="Chance")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ResNet-18: ROC Curve (Calculus as positive class)")
plt.legend()
plt.grid(True)
plt.savefig(os.path.join("plots_resnet", "roc_curve_resnet18.png"), dpi=300)
plt.close()

print("\nSaved ResNet-18 plots to the 'plots_resnet' folder.")


# save model
os.makedirs("saved_models", exist_ok=True)
model_path = os.path.join("saved_models", "resnet18_calculus_vs_healthy.pth")
torch.save(model.state_dict(), model_path)
print(f"Saved best ResNet-18 model to: {model_path}")
