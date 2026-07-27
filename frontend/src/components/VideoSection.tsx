// File: frontend/src/components/VideoSection.tsx

import type {
  ChangeEvent,
  CSSProperties,
  MutableRefObject,
} from "react";
import ResultItem from "./ResultItem";
import type { VideoPredictionResult } from "../services/api";

type VideoSectionProps = {
  videoInputRef: MutableRefObject<HTMLInputElement | null>;
  videoCaptureInputRef: MutableRefObject<HTMLInputElement | null>;
  onVideoUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onOpenVideoPicker: () => void;
  onOpenVideoCapture: () => void;
  isPredictingVideo: boolean;
  videoPreviewUrl: string;
  videoFileName: string;
  videoPrediction: VideoPredictionResult | null;
  videoError: string;
  onClearVideo: () => void;
};

function VideoSection({
  videoInputRef,
  videoCaptureInputRef,
  onVideoUpload,
  onOpenVideoPicker,
  onOpenVideoCapture,
  isPredictingVideo,
  videoPreviewUrl,
  videoFileName,
  videoPrediction,
  videoError,
  onClearVideo,
}: VideoSectionProps) {
  return (
    <section style={styles.stack}>
      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Video</h2>
        <p style={styles.text}>
          Upload video untuk diklasifikasikan dari beberapa frame yang diambil
          merata sepanjang video.
        </p>

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={onVideoUpload}
          style={styles.hiddenInput}
        />

        <input
          ref={videoCaptureInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          onChange={onVideoUpload}
          style={styles.hiddenInput}
        />

        <div style={styles.buttonGroup}>
          <button
            type="button"
            style={styles.primaryButton}
            onClick={onOpenVideoPicker}
            disabled={isPredictingVideo}
          >
            {isPredictingVideo ? "Memproses..." : "Upload Video"}
          </button>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={onOpenVideoCapture}
            disabled={isPredictingVideo}
          >
            {isPredictingVideo ? "Memproses..." : "Ambil Rekaman Video"}
          </button>
        </div>
      </section>

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Preview Video</h2>

        {!videoPreviewUrl ? (
          <p style={styles.text}>Belum ada video dipilih.</p>
        ) : (
          <div style={styles.previewWrapper}>
            <button
              type="button"
              style={styles.clearButton}
              onClick={onClearVideo}
              disabled={isPredictingVideo}
              aria-label="Hapus video"
              title="Hapus video"
            >
              ×
            </button>
            <video
              src={videoPreviewUrl}
              controls
              playsInline
              style={styles.previewVideo}
            />
            <p style={styles.fileName}>{videoFileName}</p>
          </div>
        )}
      </section>

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Hasil Analisis Video</h2>

        {videoError ? <p style={styles.errorText}>{videoError}</p> : null}

        {isPredictingVideo ? (
          <p style={styles.text}>Sedang menjalankan analisis video...</p>
        ) : null}

        <div style={styles.resultGrid}>
          <ResultItem
            label="Prediksi"
            value={videoPrediction?.label ?? "-"}
          />
          <ResultItem
            label="Confidence"
            value={
              videoPrediction ? videoPrediction.confidence.toFixed(3) : "-"
            }
          />
          <ResultItem
            label="Latency"
            value={
              videoPrediction
                ? `${videoPrediction.latencyMs.toFixed(2)} ms`
                : "-"
            }
          />
          <ResultItem
            label="Processed Frames"
            value={
              videoPrediction ? String(videoPrediction.processedFrames) : "-"
            }
          />
          <ResultItem
            label="Durasi"
            value={
              videoPrediction
                ? `${videoPrediction.durationSeconds.toFixed(1)} s`
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
    border: "1px solid #475569",
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
  previewVideo: {
    width: "100%",
    borderRadius: 14,
    border: "1px solid #334155",
    background: "#000000",
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
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    border: "1px solid #64748b",
    borderRadius: "50%",
    background: "rgba(15, 23, 42, 0.88)",
    color: "#ffffff",
    fontSize: 25,
    lineHeight: 1,
    cursor: "pointer",
    zIndex: 1,
  },
  resultGrid: {
    display: "grid",
    gap: 10,
    marginTop: 12,
  },
};

export default VideoSection;
