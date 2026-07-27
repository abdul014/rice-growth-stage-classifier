// File: frontend/src/services/api.ts

export type PhotoPredictionResult = {
  label: string;
  confidence: number;
  latencyMs: number;
};

export type VideoPredictionResult = {
  label: string;
  confidence: number;
  latencyMs: number;
  processedFrames: number;
  durationSeconds: number;
};

export type TopPredictionItem = {
  rank: number;
  class_name: string;
  probability: number;
};

type PhotoPredictionApiResponse = {
  filename: string;
  predicted_label: string;
  predicted_confidence: number;
  latency_ms: number;
  top_k: TopPredictionItem[];
  message: string;
};

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = (
  configuredApiUrl ||
  (import.meta.env.DEV
    ? "/api"
    : `${window.location.protocol}//${window.location.hostname}:8000`)
).replace(/\/$/, "");

export async function predictPhotoApi(
  file: File,
  signal?: AbortSignal,
): Promise<PhotoPredictionResult> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/predict/photo`, {
      method: "POST",
      body: formData,
      signal,
    });
  } catch {
    throw new Error(
      "Backend tidak dapat dijangkau. Jalankan backend pada port 8000, lalu coba lagi.",
    );
  }

  if (!response.ok) {
    let errorMessage = "Gagal memanggil backend prediksi foto.";

    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        errorMessage = String(errorData.detail);
      }
    } catch {
      // abaikan parsing error
    }

    throw new Error(errorMessage);
  }

  const data = (await response.json()) as PhotoPredictionApiResponse;

  return {
    label: data.predicted_label,
    confidence: data.predicted_confidence,
    latencyMs: data.latency_ms,
  };
}

export async function predictVideoApi(
  file: File,
): Promise<VideoPredictionResult> {
  const formData = new FormData();
  formData.append("file", file);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/predict/video`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error(
      "Backend tidak dapat dijangkau. Jalankan backend pada port 8000, lalu coba lagi.",
    );
  }

  if (!response.ok) {
    let errorMessage = "Gagal memanggil backend prediksi video.";
    try {
      const errorData = await response.json();
      if (errorData?.detail) errorMessage = String(errorData.detail);
    } catch {
      // Respons bukan JSON.
    }
    throw new Error(errorMessage);
  }

  const data = (await response.json()) as {
    predicted_label: string;
    predicted_confidence: number;
    latency_ms: number;
    processed_frames: number;
    duration_seconds: number;
  };

  return {
    label: data.predicted_label,
    confidence: data.predicted_confidence,
    latencyMs: data.latency_ms,
    processedFrames: data.processed_frames,
    durationSeconds: data.duration_seconds,
  };
}
