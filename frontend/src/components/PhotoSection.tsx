import type {
  ChangeEvent,
  CSSProperties,
  MutableRefObject,
} from "react";
import ResultItem from "./ResultItem";
import type { PhotoPredictionResult } from "../services/api";

type PhotoSectionProps = {
  uploadInputRef: MutableRefObject<HTMLInputElement | null>;
  captureInputRef: MutableRefObject<HTMLInputElement | null>;
  onPhotoUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onOpenUploadPicker: () => void;
  onOpenCameraCapture: () => void;
  isPredictingPhoto: boolean;
  photoPreviewUrl: string;
  photoFileName: string;
  photoPrediction: PhotoPredictionResult | null;
  photoError: string;
  onClearPhoto: () => void;
};

function PhotoSection({
  uploadInputRef,
  captureInputRef,
  onPhotoUpload,
  onOpenUploadPicker,
  onOpenCameraCapture,
  isPredictingPhoto,
  photoPreviewUrl,
  photoFileName,
  photoPrediction,
  photoError,
  onClearPhoto,
}: PhotoSectionProps) {
  return (
    <section style={styles.stack}>
      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Foto</h2>
        <p style={styles.text}>
          Unggah foto dari kamera HP atau galeri untuk diklasifikasikan oleh
          model hybrid.
        </p>

        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          onChange={onPhotoUpload}
          style={styles.hiddenInput}
        />

        <input
          ref={captureInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPhotoUpload}
          style={styles.hiddenInput}
        />

        <div style={styles.buttonGroup}>
          <button
            type="button"
            style={styles.primaryButton}
            onClick={onOpenCameraCapture}
            disabled={isPredictingPhoto}
          >
            {isPredictingPhoto ? "Memproses..." : "Ambil Gambar"}
          </button>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={onOpenUploadPicker}
            disabled={isPredictingPhoto}
          >
            {isPredictingPhoto ? "Memproses..." : "Upload Foto"}
          </button>
        </div>
      </section>

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Preview</h2>

        {!photoPreviewUrl ? (
          <p style={styles.text}>Belum ada gambar dipilih.</p>
        ) : (
          <div style={styles.previewWrapper}>
            <button
              type="button"
              style={styles.clearButton}
              onClick={onClearPhoto}
              aria-label="Hapus foto"
              title="Hapus foto"
            >
              ×
            </button>
            <img
              src={photoPreviewUrl}
              alt="Preview upload"
              style={styles.previewImage}
            />
            <p style={styles.fileName}>{photoFileName}</p>
          </div>
        )}
      </section>

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Hasil Prediksi</h2>

        {photoError ? <p style={styles.errorText}>{photoError}</p> : null}

        {isPredictingPhoto ? (
          <p style={styles.text}>Sedang menjalankan prediksi...</p>
        ) : null}

        <div style={styles.resultGrid}>
          <ResultItem label="Prediksi" value={photoPrediction?.label ?? "-"} />
          <ResultItem
            label="Confidence"
            value={
              photoPrediction ? photoPrediction.confidence.toFixed(3) : "-"
            }
          />
          <ResultItem
            label="Latency"
            value={
              photoPrediction
                ? `${photoPrediction.latencyMs.toFixed(2)} ms`
                : "-"
            }
          />
        </div>
      </section>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  stack: {
    display: "grid",
    gap: 14,
  },
  card: {
    background: "#111827",
    border: "1px solid #334155",
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    margin: "0 0 8px",
    fontSize: 20,
  },
  text: {
    margin: 0,
    color: "#94a3b8",
    fontSize: 14,
  },
  errorText: {
    margin: "0 0 12px",
    color: "#fca5a5",
    fontSize: 14,
  },
  buttonGroup: {
    display: "grid",
    gap: 10,
    marginTop: 14,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 12,
    border: 0,
    background: "#22c55e",
    color: "#052e16",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 12,
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#e5e7eb",
    fontWeight: 700,
    cursor: "pointer",
  },
  hiddenInput: {
    display: "none",
  },
  previewWrapper: {
    display: "grid",
    gap: 10,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    borderRadius: 14,
    border: "1px solid #334155",
    objectFit: "cover",
    maxHeight: 360,
  },
  fileName: {
    margin: 0,
    color: "#94a3b8",
    fontSize: 13,
    wordBreak: "break-word",
  },
  clearButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 42,
    height: 42,
    border: "1px solid #64748b",
    borderRadius: "50%",
    background: "#dc2626",
    color: "#ffffff",
    fontSize: 30,
    fontWeight: 700,
    lineHeight: 1,
    cursor: "pointer",
    zIndex: 2,
  },
  resultGrid: {
    display: "grid",
    gap: 10,
    marginTop: 12,
  },
};

export default PhotoSection;
