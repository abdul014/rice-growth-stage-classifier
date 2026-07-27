from __future__ import annotations

import os
import tempfile
from pathlib import Path
from typing import Any

import cv2
from PIL import Image

from app.services.inference import DEFAULT_TOP_K, predict_images

MAX_VIDEO_BYTES = 100 * 1024 * 1024
MAX_SAMPLED_FRAMES = 24


def _sample_frame_indices(frame_count: int, max_frames: int) -> list[int]:
    sample_count = min(frame_count, max_frames)
    if sample_count < 1:
        return []
    if sample_count == 1:
        return [0]
    return [round(index * (frame_count - 1) / (sample_count - 1)) for index in range(sample_count)]


def predict_video_bytes(
    video_bytes: bytes,
    filename: str,
    top_k: int = DEFAULT_TOP_K,
) -> dict[str, Any]:
    if not video_bytes:
        raise ValueError("File video kosong.")
    if len(video_bytes) > MAX_VIDEO_BYTES:
        raise ValueError("Ukuran video melebihi batas 100 MB.")

    suffix = Path(filename).suffix or ".mp4"
    temp_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as temp_file:
            temp_file.write(video_bytes)
            temp_path = temp_file.name

        capture = cv2.VideoCapture(temp_path)
        if not capture.isOpened():
            raise ValueError("File video tidak valid atau formatnya tidak didukung.")

        frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = float(capture.get(cv2.CAP_PROP_FPS))
        if frame_count < 1:
            capture.release()
            raise ValueError("Video tidak memiliki frame yang dapat diproses.")

        frames: list[Image.Image] = []
        for frame_index in _sample_frame_indices(frame_count, MAX_SAMPLED_FRAMES):
            capture.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
            success, frame = capture.read()
            if success:
                frames.append(Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)))
        capture.release()

        if not frames:
            raise ValueError("Frame video tidak dapat dibaca.")

        result = predict_images(images=frames, filename=filename, top_k=top_k)
        result["processed_frames"] = len(frames)
        result["duration_seconds"] = frame_count / fps if fps > 0 else 0.0
        result["message"] = "Prediksi video berhasil dibuat dari sampel frame."
        return result
    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)
