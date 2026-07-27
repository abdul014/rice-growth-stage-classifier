// File: frontend/src/components/ResultItem.tsx
import type { CSSProperties } from "react";

type ResultItemProps = {
  label: string;
  value: string;
};

const styles: Record<string, CSSProperties> = {
  resultCard: {
    background: "#1f2937",
    border: "1px solid #334155",
    borderRadius: 12,
    padding: 12,
  },
  resultLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 6,
  },
  resultValue: {
    fontSize: 16,
    color: "#e5e7eb",
  },
};

function ResultItem({ label, value }: ResultItemProps) {
  return (
    <div style={styles.resultCard}>
      <span style={styles.resultLabel}>{label}</span>
      <strong style={styles.resultValue}>{value}</strong>
    </div>
  );
}

export default ResultItem;