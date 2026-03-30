import cv2
import numpy as np


def load_image_cv(image_path: str):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not read image: {image_path}")
    return image


def check_resolution(image, min_width=150, min_height=150):
    h, w = image.shape[:2]
    passed = (w >= min_width and h >= min_height)
    return {
        "passed": passed,
        "width": w,
        "height": h,
        "message": None if passed else f"Image resolution too low ({w}x{h})."
    }


def check_brightness(image, dark_thresh=50, bright_thresh=220):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    mean_val = float(np.mean(gray))

    too_dark = mean_val < dark_thresh
    too_bright = mean_val > bright_thresh

    return {
        "passed": not (too_dark or too_bright),
        "mean_brightness": mean_val,
        "too_dark": too_dark,
        "too_bright": too_bright,
        "message": (
            "Image is too dark." if too_dark
            else "Image is too bright or overexposed." if too_bright
            else None
        )
    }


def check_blur(image, blur_thresh=25.0):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    blurry = blur_score < blur_thresh

    return {
        "passed": not blurry,
        "blur_score": blur_score,
        "message": None if not blurry else "Image is blurry."
    }


def check_contrast(image, contrast_thresh=25.0):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    contrast_score = float(gray.std())
    low_contrast = contrast_score < contrast_thresh

    return {
        "passed": not low_contrast,
        "contrast_score": contrast_score,
        "message": None if not low_contrast else "Image contrast is too low."
    }


def assess_image_quality_rules(image_path: str):
    image = load_image_cv(image_path)

    checks = {
        "resolution": check_resolution(image),
        "brightness": check_brightness(image),
        "blur": check_blur(image),
        "contrast": check_contrast(image),
    }

    failures = []
    warnings = []

    for check_name, result in checks.items():
        if not result["passed"]:
            if check_name in ["resolution", "blur"]:
                failures.append(result["message"])
            else:
                warnings.append(result["message"])

    if failures:
        status = "fail"
    elif warnings:
        status = "warning"
    else:
        status = "pass"

    return {
        "status": status,
        "checks": checks,
        "failures": failures,
        "warnings": warnings
    }