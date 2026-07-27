import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import PageHeader from "./components/PageHeader";
import ResultItem from "./components/ResultItem";
import BottomNav from "./components/BottomNav";
import PhotoSection from "./components/PhotoSection";
import VideoSection from "./components/VideoSection";
import {
  predictPhotoApi,
  predictVideoApi,
  type PhotoPredictionResult,
  type VideoPredictionResult,
} from "./services/api";

type TabKey = "home" | "photo" | "video" | "evaluation";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "home", label: "Beranda" },
  { key: "photo", label: "Foto" },
  { key: "video", label: "Video" },
  { key: "evaluation", label: "Evaluasi" },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>("");
  const [photoFileName, setPhotoFileName] = useState<string>("");
  const [photoPrediction, setPhotoPrediction] =
    useState<PhotoPredictionResult | null>(null);
  const [isPredictingPhoto, setIsPredictingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  const [videoFileName, setVideoFileName] = useState<string>("");
  const [videoPrediction, setVideoPrediction] =
    useState<VideoPredictionResult | null>(null);
  const [isPredictingVideo, setIsPredictingVideo] = useState(false);
  const [videoError, setVideoError] = useState("");

  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const captureInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const videoCaptureInputRef = useRef<HTMLInputElement | null>(null);
  const photoAbortControllerRef = useRef<AbortController | null>(null);
  const photoRequestIdRef = useRef(0);

  const title = useMemo(() => {
    if (activeTab === "home") return "Beranda";
    if (activeTab === "photo") return "Foto";
    if (activeTab === "video") return "Video";
    return "Evaluasi";
  }, [activeTab]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  const processSelectedPhoto = async (file: File | undefined) => {
    if (!file) return;

    photoAbortControllerRef.current?.abort();
    const controller = new AbortController();
    photoAbortControllerRef.current = controller;
    const requestId = ++photoRequestIdRef.current;

    try {
      setPhotoError("");
      setIsPredictingPhoto(true);
      setPhotoPrediction(null);

      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }

      const objectUrl = URL.createObjectURL(file);
      setPhotoPreviewUrl(objectUrl);
      setPhotoFileName(file.name);

      const prediction = await predictPhotoApi(file, controller.signal);
      if (requestId === photoRequestIdRef.current) {
        setPhotoPrediction(prediction);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error(error);
      if (requestId === photoRequestIdRef.current) {
        setPhotoError(
          error instanceof Error ? error.message : "Gagal memproses foto.",
        );
      }
    } finally {
      if (requestId === photoRequestIdRef.current) {
        setIsPredictingPhoto(false);
      }
    }
  };

  const processSelectedVideo = async (file: File | undefined) => {
    if (!file) return;

    try {
      setVideoError("");
      setIsPredictingVideo(true);
      setVideoPrediction(null);

      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }

      const objectUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(objectUrl);
      setVideoFileName(file.name);

      const prediction = await predictVideoApi(file);
      setVideoPrediction(prediction);
    } catch (error) {
      console.error(error);
      setVideoError(
        error instanceof Error ? error.message : "Gagal memproses video.",
      );
    } finally {
      setIsPredictingVideo(false);
    }
  };

  const handlePhotoUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    await processSelectedPhoto(file);
    event.target.value = "";
  };

  const handleVideoUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    await processSelectedVideo(file);
    event.target.value = "";
  };

  const openUploadPicker = () => {
    uploadInputRef.current?.click();
  };

  const openCameraCapture = () => {
    captureInputRef.current?.click();
  };

  const openVideoPicker = () => {
    videoInputRef.current?.click();
  };

  const openVideoCapture = () => {
    videoCaptureInputRef.current?.click();
  };

  const clearPhoto = () => {
    photoRequestIdRef.current += 1;
    photoAbortControllerRef.current?.abort();
    photoAbortControllerRef.current = null;
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoPreviewUrl("");
    setPhotoFileName("");
    setPhotoPrediction(null);
    setPhotoError("");
    setIsPredictingPhoto(false);
  };

  const clearVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl("");
    setVideoFileName("");
    setVideoPrediction(null);
    setVideoError("");
  };

  return (
    <div style={styles.shell}>
      <PageHeader title={title} subtitle="Hybrid Trainable Fusion" />

      <main style={styles.content}>
        {activeTab === "home" && (
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Dashboard</h2>
            <p style={styles.text}>
              Aplikasi mobile sederhana untuk klasifikasi fase pertumbuhan padi.
            </p>
          </section>
        )}

        {activeTab === "photo" && (
          <PhotoSection
            uploadInputRef={uploadInputRef}
            captureInputRef={captureInputRef}
            onPhotoUpload={handlePhotoUpload}
            onOpenUploadPicker={openUploadPicker}
            onOpenCameraCapture={openCameraCapture}
            isPredictingPhoto={isPredictingPhoto}
            photoPreviewUrl={photoPreviewUrl}
            photoFileName={photoFileName}
            photoPrediction={photoPrediction}
            photoError={photoError}
            onClearPhoto={clearPhoto}
          />
        )}

        {activeTab === "video" && (
          <VideoSection
            videoInputRef={videoInputRef}
            videoCaptureInputRef={videoCaptureInputRef}
            onVideoUpload={handleVideoUpload}
            onOpenVideoPicker={openVideoPicker}
            onOpenVideoCapture={openVideoCapture}
            isPredictingVideo={isPredictingVideo}
            videoPreviewUrl={videoPreviewUrl}
            videoFileName={videoFileName}
            videoPrediction={videoPrediction}
            videoError={videoError}
            onClearVideo={clearVideo}
          />
        )}

        {activeTab === "evaluation" && (
          <section style={styles.stack}>
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>Evaluasi Foto</h2>
              <div style={styles.resultGrid}>
                <ResultItem label="Label" value={photoPrediction?.label ?? "-"} />
                <ResultItem
                  label="Confidence"
                  value={
                    photoPrediction
                      ? photoPrediction.confidence.toFixed(3)
                      : "-"
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

            <section style={styles.card}>
              <h2 style={styles.cardTitle}>Evaluasi Video</h2>
              <div style={styles.resultGrid}>
                <ResultItem label="Label" value={videoPrediction?.label ?? "-"} />
                <ResultItem
                  label="Confidence"
                  value={
                    videoPrediction
                      ? videoPrediction.confidence.toFixed(3)
                      : "-"
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
                  label="Frames"
                  value={
                    videoPrediction
                      ? String(videoPrediction.processedFrames)
                      : "-"
                  }
                />
              </div>
            </section>
          </section>
        )}
      </main>

      <BottomNav
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  shell: {
    width: "100%",
    maxWidth: 430,
    minHeight: "100vh",
    margin: "0 auto",
    padding: "16px 16px 88px",
    background: "#0f172a",
  },
  content: {
    display: "block",
  },
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
  resultGrid: {
    display: "grid",
    gap: 10,
    marginTop: 12,
  },
};

export default App;
