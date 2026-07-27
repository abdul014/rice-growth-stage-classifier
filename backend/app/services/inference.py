# File: backend/app/services/inference.py

from __future__ import annotations

import io
import os
import time
from functools import lru_cache
from pathlib import Path
from typing import Any

import numpy as np
import tensorflow as tf
from PIL import Image
from tensorflow import keras

TARGET_CLASSES = [
    "vegetatif_awal",
    "vegetatif_akhir",
    "generatif",
    "panen",
]

MODEL_INPUT_SIZE = (224, 224)
DEFAULT_TOP_K = 4

PROJECT_ROOT = Path(__file__).resolve().parents[3]

DEFAULT_MODEL_PATH = (
    PROJECT_ROOT
    / "outputs"
    / "saved_models"
    / "hybrid_trainable_fusion"
    / "final_model.keras"
)


@keras.utils.register_keras_serializable(package="custom")
class ResNetPreprocessLayer(keras.layers.Layer):
    def call(self, inputs: tf.Tensor) -> tf.Tensor:
        return keras.applications.resnet.preprocess_input(inputs)

    def get_config(self) -> dict[str, Any]:
        return super().get_config()


def get_model_path(model_path: Path | None = None) -> Path:
    configured_path = os.getenv("MODEL_PATH")
    resolved_path = model_path or (
        Path(configured_path) if configured_path else DEFAULT_MODEL_PATH
    )

    if resolved_path.exists():
        return resolved_path

    # Cloud deploys ship without the 233 MB model bundled in the image/repo —
    # MODEL_HF_REPO_ID points at a Hugging Face *model* repo (not a Space, so it
    # isn't gated behind the Docker/Gradio PRO requirement) to fetch it from
    # instead. Local dev never sets this, so behavior there is unchanged.
    hf_repo_id = os.getenv("MODEL_HF_REPO_ID")
    if hf_repo_id:
        from huggingface_hub import hf_hub_download

        hf_filename = os.getenv("MODEL_HF_FILENAME", "final_model.keras")
        downloaded_path = hf_hub_download(repo_id=hf_repo_id, filename=hf_filename)
        return Path(downloaded_path)

    raise FileNotFoundError(f"Model Keras tidak ditemukan: {resolved_path}")


@lru_cache(maxsize=1)
def load_inference_model(model_path_str: str | None = None) -> keras.Model:
    model_path = Path(model_path_str) if model_path_str else get_model_path()

    model = keras.models.load_model(
        model_path,
        custom_objects={
            "ResNetPreprocessLayer": ResNetPreprocessLayer,
            "custom>ResNetPreprocessLayer": ResNetPreprocessLayer,
        },
        compile=False,
        safe_mode=False,
    )
    return model


def get_class_names() -> list[str]:
    return TARGET_CLASSES.copy()


def load_image_from_bytes(image_bytes: bytes) -> Image.Image:
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:
        raise ValueError("File gambar tidak valid atau gagal dibaca.") from exc
    return image


def prepare_image_batch(image: Image.Image) -> np.ndarray:
    resized = image.resize(MODEL_INPUT_SIZE, Image.BILINEAR)
    image_array = np.asarray(resized, dtype=np.float32)
    batch = np.expand_dims(image_array, axis=0)
    return batch


def prepare_image_batches(images: list[Image.Image]) -> np.ndarray:
    if not images:
        raise ValueError("Tidak ada frame gambar untuk diprediksi.")

    batches = [prepare_image_batch(image)[0] for image in images]
    return np.asarray(batches, dtype=np.float32)


def build_top_k(probabilities: np.ndarray, class_names: list[str], top_k: int) -> list[dict[str, Any]]:
    probs = np.asarray(probabilities).reshape(-1)
    top_indices = np.argsort(probs)[::-1][:top_k]

    results: list[dict[str, Any]] = []
    for rank, class_index in enumerate(top_indices, start=1):
        results.append(
            {
                "rank": rank,
                "class_name": class_names[int(class_index)],
                "probability": float(probs[int(class_index)]),
            }
        )
    return results


def predict_image_bytes(
    image_bytes: bytes,
    filename: str,
    top_k: int = DEFAULT_TOP_K,
) -> dict[str, Any]:
    image = load_image_from_bytes(image_bytes=image_bytes)
    return predict_images(images=[image], filename=filename, top_k=top_k)


def predict_images(
    images: list[Image.Image],
    filename: str,
    top_k: int = DEFAULT_TOP_K,
) -> dict[str, Any]:
    """Predict one or more RGB images and average their probabilities."""
    model = load_inference_model()
    class_names = get_class_names()
    batch = prepare_image_batches(images)

    start_time = time.perf_counter()
    predictions = model.predict(batch, verbose=0)
    end_time = time.perf_counter()

    predictions = np.asarray(predictions)
    if predictions.ndim != 2 or predictions.shape[0] != len(images):
        raise ValueError(f"Output model tidak valid: {predictions.shape}")

    probabilities = np.mean(predictions, axis=0)
    predicted_index = int(np.argmax(probabilities))
    predicted_label = class_names[predicted_index]
    predicted_confidence = float(probabilities[predicted_index])
    latency_ms = float((end_time - start_time) * 1000.0)

    return {
        "filename": filename,
        "predicted_label": predicted_label,
        "predicted_confidence": predicted_confidence,
        "latency_ms": latency_ms,
        "top_k": build_top_k(
            probabilities=probabilities,
            class_names=class_names,
            top_k=min(top_k, len(class_names)),
        ),
        "message": "Prediksi gambar berhasil dibuat.",
    }
