import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import RangeDropdown from "./RangeDropdown";
import { getRangeStart, isDateWithinRange, type DateRange } from "../lib/dateRange";
import { fetchJson } from "../lib/fetchJson";

type Entry = {
  id: string;
  task: string;
  date: string;
  start: string;
  end: string;
  minutes: number;
};

type Project = {
  id: string;
  name: string;
  color: string;
  entries: Entry[];
};

type TogglTimeEntry = {
  id: number;
  description: string | null;
  start: string;
  stop: string | null;
  duration: number;
  project_id: number | null;
  workspace_id: number;
};

type TogglProject = {
  id: number;
  name: string;
};

const STORAGE_KEY = "dev-dashboard-project-tracker-v1";
const TOGGL_TOKEN_KEY = "dev-dashboard-toggl-token-v1";
const TOGGL_ENV_TOKEN = import.meta.env.VITE_TOGGL_TOKEN as string | undefined;
const TOGGL_API_BASE =
  (import.meta.env.VITE_TOGGL_API_BASE as string | undefined) ?? "/toggl/api/v9";
const PROJECT_COLORS = [
  "#C084FC",
  "#A78BFA",
  "#8B5CF6",
  "#D8B4FE",
  "#9333EA",
  "#7E22CE",
];

function minutesToClock(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function calculateMinutes(start: string, end: string) {
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return endMinutes - startMinutes;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function mapTogglDurationMinutes(entry: TogglTimeEntry) {
  if (entry.duration > 0) {
    return Math.round(entry.duration / 60);
  }
  if (entry.duration < 0) {
    // Toggl uses negative duration for running timers (start_time - now).
    const running = Math.floor(Date.now() / 1000) + entry.duration;
    return Math.max(0, Math.round(running / 60));
  }
  if (entry.stop) {
    const diff = (new Date(entry.stop).getTime() - new Date(entry.start).getTime()) / 60000;
    return Math.max(0, Math.round(diff));
  }
  return 0;
}

function ProjectTimeTracker() {
  const [mode, setMode] = useState<"local" | "toggl">("local");
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  const [togglProjects, setTogglProjects] = useState<Project[]>([]);
  const [selectedLocalProjectId, setSelectedLocalProjectId] = useState<string | null>(null);
  const [selectedTogglProjectId, setSelectedTogglProjectId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [range, setRange] = useState<DateRange>("today");
  const [filterOpen, setFilterOpen] = useState(false);
  const [name, setName] = useState("");
  const [task, setTask] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [error, setError] = useState("");

  const [togglTokenInput, setTogglTokenInput] = useState("");
  const [togglToken, setTogglToken] = useState("");
  const [togglLoading, setTogglLoading] = useState(false);
  const [togglError, setTogglError] = useState("");
  const [togglRefreshTick, setTogglRefreshTick] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Project[];
        setLocalProjects(parsed);
        if (parsed.length > 0) {
          setSelectedLocalProjectId(parsed[0].id);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    const storedToken = localStorage.getItem(TOGGL_TOKEN_KEY);
    const resolvedToken = storedToken || TOGGL_ENV_TOKEN || "";
    if (resolvedToken) {
      setTogglToken(resolvedToken);
      setTogglTokenInput(resolvedToken);
      setMode("toggl");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localProjects));
  }, [localProjects]);

  useEffect(() => {
    if (mode !== "toggl" || !togglToken) {
      return;
    }

    let cancelled = false;
    const authHeader = `Basic ${btoa(`${togglToken}:api_token`)}`;

    const loadTogglData = async () => {
      setTogglLoading(true);
      setTogglError("");
      try {
        const startDate = getRangeStart(range);
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        const entries = await fetchJson<TogglTimeEntry[]>(
          `${TOGGL_API_BASE}/me/time_entries?start_date=${encodeURIComponent(
            startDate.toISOString(),
          )}&end_date=${encodeURIComponent(endDate.toISOString())}`,
          { headers: { Authorization: authHeader } },
        );
        const workspaceIds = [...new Set(entries.map((entry) => entry.workspace_id))];

        const projectsMap = new Map<number, string>();
        await Promise.all(
          workspaceIds.map(async (workspaceId) => {
            const projectsRes = await fetch(
              `${TOGGL_API_BASE}/workspaces/${workspaceId}/projects`,
              { headers: { Authorization: authHeader } },
            );
            if (!projectsRes.ok) {
              return;
            }
            const workspaceProjects = await projectsRes.json() as TogglProject[];
            workspaceProjects.forEach((project) => {
              projectsMap.set(project.id, project.name);
            });
          }),
        );

        const grouped = new Map<string, Project>();

        entries.forEach((entry) => {
          const projectName = entry.project_id
            ? (projectsMap.get(entry.project_id) ?? `Project ${entry.project_id}`)
            : "Unassigned";
          const projectKey = String(entry.project_id ?? `none-${projectName}`);
          const minutes = mapTogglDurationMinutes(entry);

          if (!grouped.has(projectKey)) {
            const color = PROJECT_COLORS[grouped.size % PROJECT_COLORS.length];
            grouped.set(projectKey, {
              id: `toggl-${projectKey}`,
              name: projectName,
              color,
              entries: [],
            });
          }

          const project = grouped.get(projectKey)!;
          project.entries.push({
            id: `toggl-entry-${entry.id}`,
            task: entry.description || "No description provided",
            date: new Date(entry.start).toISOString().slice(0, 10),
            start: formatTime(entry.start),
            end: entry.stop ? formatTime(entry.stop) : "Running",
            minutes,
          });
        });

        const projectList = Array.from(grouped.values());
        if (!cancelled) {
          setTogglProjects(projectList);
          setSelectedTogglProjectId((current) => {
            if (!current) {
              return projectList[0]?.id ?? null;
            }
            const exists = projectList.some((project) => project.id === current);
            return exists ? current : projectList[0]?.id ?? null;
          });
        }
      } catch {
        if (!cancelled) {
          setTogglError("Could not load Toggl data. Check your token and try again.");
        }
      } finally {
        if (!cancelled) {
          setTogglLoading(false);
        }
      }
    };

    loadTogglData();
    const interval = window.setInterval(loadTogglData, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [mode, togglToken, range, togglRefreshTick]);

  const activeProjects = mode === "toggl" ? togglProjects : localProjects;
  const selectedProjectId =
    mode === "toggl" ? selectedTogglProjectId : selectedLocalProjectId;

  const setActiveSelectedProjectId = (id: string) => {
    if (mode === "toggl") {
      setSelectedTogglProjectId(id);
      return;
    }
    setSelectedLocalProjectId(id);
  };

  const computedProjects = useMemo(() => {
    return activeProjects.map((project) => {
      const entries = project.entries.filter((entry) => isDateWithinRange(entry.date, range));

      const totalMinutes = entries.reduce((sum, entry) => sum + entry.minutes, 0);
      const latestEntry = [...entries].sort((a, b) =>
        `${b.date} ${b.end}`.localeCompare(`${a.date} ${a.end}`),
      )[0];

      return { ...project, entries, totalMinutes, latestEntry };
    });
  }, [activeProjects, range]);

  const totalMinutes = computedProjects.reduce(
    (sum, project) => sum + project.totalMinutes,
    0,
  );

  const selectedProject = computedProjects.find(
    (project) => project.id === selectedProjectId,
  );

  let progress = 0;
  const chartFill =
    totalMinutes === 0
      ? "rgba(148,163,184,0.25) 0% 100%"
      : computedProjects
          .filter((project) => project.totalMinutes > 0)
          .map((project) => {
            const startPct = progress;
            progress += (project.totalMinutes / totalMinutes) * 100;
            return `${project.color} ${startPct}% ${progress}%`;
          })
          .join(", ");

  const onAddProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedTask = task.trim();
    const minutes = calculateMinutes(start, end);

    if (!trimmedName || !trimmedTask) {
      setError("Please add a project name and task.");
      return;
    }
    if (minutes <= 0) {
      setError("End time must be after start time.");
      return;
    }

    const color = PROJECT_COLORS[localProjects.length % PROJECT_COLORS.length];
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: trimmedName,
      color,
      entries: [
        {
          id: crypto.randomUUID(),
          task: trimmedTask,
          date: todayString(),
          start,
          end,
          minutes,
        },
      ],
    };

    setLocalProjects((current) => [newProject, ...current]);
    setSelectedLocalProjectId(newProject.id);
    setShowForm(false);
    setName("");
    setTask("");
    setStart("09:00");
    setEnd("10:00");
  };

  const onClearAll = () => {
    setLocalProjects([]);
    setSelectedLocalProjectId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const onConnectToggl = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!togglTokenInput.trim()) {
      setTogglError("Enter your Toggl API token to continue.");
      return;
    }
    setTogglError("");
    setTogglToken(togglTokenInput.trim());
    localStorage.setItem(TOGGL_TOKEN_KEY, togglTokenInput.trim());
    setMode("toggl");
  };

  const onDisconnectToggl = () => {
    setMode("local");
    setTogglToken("");
    setTogglTokenInput("");
    localStorage.removeItem(TOGGL_TOKEN_KEY);
    setTogglError("");
  };

  return (
    <section className="panel h-auto">
      <header className="flex items-start justify-between">
        <div>
          <p className="font-heading text-xl text-main">PulseTrack</p>
          <RangeDropdown
            className="mt-3"
            value={range}
            open={filterOpen}
            onToggle={() => setFilterOpen((value) => !value)}
            onChange={(nextRange) => {
              setRange(nextRange);
              setFilterOpen(false);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("local")}
            className={`chip ${mode === "local" ? "chip-active" : ""}`}
          >
            Local
          </button>
          <button
            onClick={() => setMode("toggl")}
            className={`chip ${mode === "toggl" ? "chip-active" : ""}`}
          >
            Toggl
          </button>
        </div>
      </header>

      {mode === "toggl" && !togglToken && (
        <form onSubmit={onConnectToggl} className="panel-sub mt-4 space-y-3">
          <p className="text-sm text-muted">
            Connect Toggl Track to display live project data.
          </p>
          <input
            type="password"
            value={togglTokenInput}
            onChange={(event) => setTogglTokenInput(event.target.value)}
            placeholder="Paste Toggl API token"
            className="field"
          />
          <button type="submit" className="btn btn-primary w-full">
            Connect to Toggl
          </button>
        </form>
      )}

      {mode === "toggl" && togglToken && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted">
            Toggl sync status: {togglLoading ? "Syncing..." : "Synced"}
          </p>
          <button onClick={onDisconnectToggl} className="btn btn-secondary">
            Disconnect
          </button>
        </div>
      )}

      {togglError && mode === "toggl" && (
        <p className="mt-3 text-xs text-[#ef94c8]">{togglError}</p>
      )}

      <div className="mt-8 flex items-center gap-5">
        <div
          className="grid h-26 w-26 shrink-0 aspect-square place-items-center rounded-full"
          style={{ background: `conic-gradient(${chartFill})` }}
        >
          <div
            className="grid h-20 w-20 shrink-0 aspect-square place-items-center rounded-full text-sm font-semibold text-main"
            style={{ background: "var(--bg-panel-soft)" }}
          >
            {minutesToClock(totalMinutes)}
          </div>
        </div>

        <ul className="themed-scrollbar min-w-0 max-h-30 flex-1 space-y-2 overflow-auto pr-1">
          {computedProjects.length === 0 && (
            <li className="text-sm text-muted">
              {mode === "toggl" ? "No time entries found for this range" : "No projects yet"}
            </li>
          )}
          {computedProjects.map((project) => (
            <li key={project.id}>
              <button
                onClick={() => setActiveSelectedProjectId(project.id)}
                className={`flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm transition ${
                  selectedProjectId === project.id
                    ? "chip-active"
                    : "text-main hover:bg-[var(--accent-soft)]"
                }`}
              >
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate">{project.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex items-center justify-between text-main">
        <h3 className="font-heading text-lg">Time tracker</h3>
        {mode === "local" ? (
          <button
            onClick={onClearAll}
            className="accent-link inline-flex items-center gap-2 text-sm"
          >
            Clear manual entries
          </button>
        ) : (
          <button
            onClick={() => setTogglRefreshTick((value) => value + 1)}
            className="accent-link inline-flex items-center gap-2 text-sm"
          >
            Refresh Toggl data
          </button>
        )}
      </div>

      {selectedProject ? (
        <>
          <dl className="mt-5 grid grid-cols-1 gap-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Task</dt>
              <dd className="mt-1 text-base text-main">
                {selectedProject.latestEntry?.task || "No task in this range"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Project
              </dt>
              <dd className="mt-1 text-base text-main">{selectedProject.name}</dd>
            </div>
          </dl>

          <div className="mt-6 grid grid-cols-[1fr_1fr_auto] items-end gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Time</p>
              <p className="mt-1 text-base text-main">
                {selectedProject.latestEntry
                  ? `${selectedProject.latestEntry.start} - ${selectedProject.latestEntry.end}`
                  : "--:-- - --:--"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Total</p>
              <p className="mt-1 text-base text-main">
                {minutesToClock(selectedProject.totalMinutes)}
              </p>
            </div>
            {mode === "local" && (
              <button
                onClick={() => setShowForm((value) => !value)}
                className="btn btn-primary"
              >
                {showForm ? "Close" : "Add"}
              </button>
            )}
          </div>
        </>
      ) : (
        <p className="mt-5 text-sm text-muted">
          {mode === "toggl"
            ? "Connect Toggl to see live projects and entries."
            : "Add your first project to start tracking time."}
        </p>
      )}

      {mode === "local" && (showForm || localProjects.length === 0) && (
        <form onSubmit={onAddProject} className="panel-sub mt-5 space-y-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Project name"
            className="field"
          />
          <input
            value={task}
            onChange={(event) => setTask(event.target.value)}
            placeholder="Task description"
            className="field"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="time"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className="field field-time"
            />
            <input
              type="time"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              className="field field-time"
            />
          </div>
          {error && <p className="text-xs text-[#ef94c8]">{error}</p>}
          <button type="submit" className="btn btn-primary w-full">
            Save Entry
          </button>
        </form>
      )}
    </section>
  );
}

export default ProjectTimeTracker;
