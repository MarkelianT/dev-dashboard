type ThemeToggleCardProps = {
  theme: "dark" | "light";
  onToggle: () => void;
};

function ThemeToggleCard({ theme, onToggle }: ThemeToggleCardProps) {
  const isDark = theme === "dark";

  return (
    <section className="panel h-auto">
      <h2 className="panel-title">Appearance</h2>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className={isDark ? "text-main" : "text-muted"}>Dark mode</span>
        <div className="flex items-center gap-3">
          <span
            className={`theme-icon ${isDark ? "theme-icon-active" : ""}`}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.4 14.6A8.5 8.5 0 1 1 9.4 3.6a7 7 0 1 0 11 11Z" />
              <path d="m17.8 4.2.7 1.4 1.4.7-1.4.7-.7 1.4-.7-1.4-1.4-.7 1.4-.7.7-1.4Z" />
            </svg>
          </span>
        <button
          onClick={onToggle}
          className={`theme-switch ${isDark ? "theme-switch-dark" : "theme-switch-light"}`}
          aria-label="Toggle dark and light mode"
        >
          <span className="theme-switch-knob" />
        </button>
          <span
            className={`theme-icon ${!isDark ? "theme-icon-active" : ""}`}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3" />
            </svg>
          </span>
        </div>
        <span className={!isDark ? "text-main" : "text-muted"}>Light mode</span>
      </div>
    </section>
  );
}

export default ThemeToggleCard;
