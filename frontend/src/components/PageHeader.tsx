// File: frontend/src/components/PageHeader.tsx
import type { CSSProperties } from "react";

type PageHeaderProps = {
  title: string;
  subtitle: string;
};

const styles: Record<string, CSSProperties> = {
  header: {
    marginBottom: 16,
  },
  eyebrow: {
    margin: 0,
    fontSize: 12,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  title: {
    margin: "6px 0 0",
    fontSize: 28,
    lineHeight: 1.2,
  },
};

function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header style={styles.header}>
      <p style={styles.eyebrow}>{subtitle}</p>
      <h1 style={styles.title}>{title}</h1>
    </header>
  );
}

export default PageHeader;