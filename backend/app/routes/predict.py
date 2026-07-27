# File: backend/app/routes/predict.py

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.predict import PhotoPredictionResponse, TopPredictionItem
from app.services.inference import predict_image_bytes
from app.schemas.video import VideoPredictionResponse
from app.services.video_inference import predict_video_bytes

router = APIRouter(prefix="/predict", tags=["predict"])


@router.post("/photo", response_model=PhotoPredictionResponse)
async def predict_photo(file: UploadFile = File(...)) -> PhotoPredictionResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nama file tidak valid.")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar.")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="File gambar kosong.")

    try:
        result = predict_image_bytes(
            image_bytes=image_bytes,
            filename=file.filename,
            top_k=4,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal menjalankan prediksi: {exc}",
        ) from exc

    return PhotoPredictionResponse(
        filename=result["filename"],
        predicted_label=result["predicted_label"],
        predicted_confidence=result["predicted_confidence"],
        latency_ms=result["latency_ms"],
        top_k=[
            TopPredictionItem(
                rank=item["rank"],
                class_name=item["class_name"],
                probability=item["probability"],
            )
            for item in result["top_k"]
        ],
        message=result["message"],
    )


@router.post("/video", response_model=VideoPredictionResponse)
async def predict_video(file: UploadFile = File(...)) -> VideoPredictionResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nama file tidak valid.")
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File harus berupa video.")

    try:
        result = predict_video_bytes(await file.read(), file.filename, top_k=4)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Gagal menjalankan prediksi video: {exc}") from exc

    return VideoPredictionResponse(**result)
