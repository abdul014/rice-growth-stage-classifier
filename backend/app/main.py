# File: backend/app/main.py

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.health import router as health_router
from app.routes.predict import router as predict_router

app = FastAPI(
    title="Rice Growth Backend API",
    description="Backend API untuk klasifikasi fase pertumbuhan padi",
    version="0.1.0",
)

default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
configured_origins = os.getenv("FRONTEND_ORIGINS", "")
allowed_origins = [origin.strip() for origin in configured_origins.split(",") if origin.strip()] or default_origins
local_origin_regex = (
    r"^http://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):(5173|4173)$"
)
origin_regex = os.getenv("FRONTEND_ORIGIN_REGEX") or (
    None if configured_origins else local_origin_regex
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(predict_router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {
        "message": "Rice Growth Backend API is running",
        "status": "ok",
    }
