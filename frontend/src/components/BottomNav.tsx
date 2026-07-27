import type { CSSProperties } from "react";

type TabItem<T extends string> = {
  key: T;
  label: string;
};

type BottomNavProps<T extends string> = {
  tabs: Array<TabItem<T>>;
  activeTab: T;
  onChange: (tab: T) => void;
};

function BottomNav<T extends string>({
  tabs,
  activeTab,
  onChange,
}: BottomNavProps<T>) {
  return (
    <nav style={styles.bottomNav}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            style={{
              ...styles.navButton,
              ...(isActive ? styles.navButtonActive : {}),
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

const styles: Record<string, CSSProperties> = {
  bottomNav: {
    position: "fixed",
    left: "50%",
    bottom: 12,
    transform: "translateX(-50%)",
    width: "min(100% - 24px, 398px)",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
    padding: 10,
    background: "rgba(15, 23, 42, 0.96)",
    border: "1px solid #334155",
    borderRadius: "12px 12px 0 0",
  },
  navButton: {
    minHeight: 48,
    border: 0,
    borderRadius: 12,
    background: "transparent",
    color: "#94a3b8",
    fontWeight: 700,
    cursor: "pointer",
  },
  navButtonActive: {
    background: "rgba(34, 197, 94, 0.14)",
    color: "#bbf7d0",
  },
};

export default BottomNav;