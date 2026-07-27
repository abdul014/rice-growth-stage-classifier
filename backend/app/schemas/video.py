from pydantic import BaseModel, Field

from app.schemas.predict import TopPredictionItem


class VideoPredictionResponse(BaseModel):
    filename: str
    predicted_label: str
    predicted_confidence: float = Field(..., ge=0.0, le=1.0)
    latency_ms: float = Field(..., ge=0.0)
    processed_frames: int = Field(..., ge=1)
    duration_seconds: float = Field(..., ge=0.0)
    top_k: list[TopPredictionItem] = Field(default_factory=list)
    message: str
