# File: backend/app/schemas/predict.py

from pydantic import BaseModel, Field


class TopPredictionItem(BaseModel):
    rank: int = Field(..., ge=1, description="Urutan top-k prediksi")
    class_name: str = Field(..., description="Nama kelas")
    probability: float = Field(..., ge=0.0, le=1.0, description="Probabilitas kelas")


class PhotoPredictionResponse(BaseModel):
    filename: str = Field(..., description="Nama file gambar yang diunggah")
    predicted_label: str = Field(..., description="Label prediksi utama")
    predicted_confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence prediksi utama",
    )
    latency_ms: float = Field(..., ge=0.0, description="Waktu inferensi dalam milidetik")
    top_k: list[TopPredictionItem] = Field(
        default_factory=list,
        description="Daftar top-k prediksi",
    )
    message: str = Field(..., description="Pesan status prediksi")