import { useEffect, useState } from "react";
import GithubCard from "./components/GithubCard";
import RepoList from "./components/RepoList";
import WeatherCard from "./components/WeatherCard";
import TechNews from "./components/TechNews";
import FocusTimer from "./components/FocusTimer";
import ProjectTimeTracker from "./components/ProjectTimeTracker";
import ThemeToggleCard from "./components/ThemeToggleCard";
import GithubCommitsCard from "./components/GithubCommitsCard";

const DARK_LOGO = "/dev-dashboard-logo-dark.png";
const LIGHT_LOGO = "/dev-dashboard-logo-light.png";
const THEME_KEY = "dev-dashboard-theme";

function App() {
  const [focusMode, setFocusMode] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const isLightTheme = theme === "light";

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const favicon = document.getElementById("app-favicon") as HTMLLinkElement | null;
    if (!favicon) {
      return;
    }
    favicon.href = isLightTheme ? LIGHT_LOGO : DARK_LOGO;
  }, [isLightTheme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <div className={`app-shell ${isLightTheme ? "theme-light" : "theme-dark"}`}>
      <div className="app-glow app-glow-left" />
      <div className="app-glow app-glow-right" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="mb-8 flex flex-col gap-3 lg:mb-10">
          <p className="app-badge">
            Developer Dashboard
          </p>
          <h1 className="font-heading flex items-center gap-3 text-4xl text-main sm:text-5xl">
            <img
              src={isLightTheme ? LIGHT_LOGO : DARK_LOGO}
              alt="Dev Dashboard logo"
              className="h-10 w-10 shrink-0 sm:h-12 sm:w-12"
            />
            <span>Dev Dashboard</span>
          </h1>
          <p className="max-w-2xl text-sm text-muted sm:text-base">
            Track repositories, project activity, weather, and focus sessions in
            one streamlined workspace.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-12 xl:grid-rows-[1.15fr_0.8fr]">
          <div className="h-full grid grid-cols-1 gap-5 xl:col-span-3 xl:row-start-1 xl:grid-rows-[1.15fr_1.6fr_0.7fr] [&_.panel]:h-full">
            <GithubCard />
            <RepoList />
            <WeatherCard />
          </div>

          <div className="h-full xl:col-span-3 xl:col-start-4 xl:row-start-1 [&_.panel]:h-full">
            <GithubCommitsCard />
          </div>

          <div className="h-full xl:col-span-6 xl:col-start-7 xl:row-start-1 [&_.panel]:h-full">
            <ProjectTimeTracker />
          </div>

          <div className="h-full flex flex-col gap-5 xl:col-span-3 xl:col-start-1 xl:row-start-2 [&_.panel]:h-full">
            <div className="shrink-0">
              <FocusTimer onFocusModeChange={setFocusMode} />
            </div>
            <div className="min-h-0 flex-1">
              <ThemeToggleCard
                theme={theme}
                onToggle={toggleTheme}
              />
            </div>
          </div>

          <div className="h-full xl:col-span-9 xl:col-start-4 xl:row-start-2 [&_.panel]:h-full">
            <TechNews />
          </div>
        </section>
      </main>

      {focusMode && (
        <div className="focus-overlay" />
      )}
    </div>
  );
}

export default App;
