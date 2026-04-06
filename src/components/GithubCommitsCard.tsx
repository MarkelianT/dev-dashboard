import { useEffect, useMemo, useState } from "react";
import RangeDropdown from "./RangeDropdown";
import { getRangeStart, type DateRange } from "../lib/dateRange";
import { fetchJson } from "../lib/fetchJson";

type GithubEvent = {
  id: string;
  type: string;
  created_at: string;
  payload?: {
    commits?: { sha: string }[];
    action?: string;
  };
};

type UserResponse = {
  public_repos: number;
};

type GithubStats = {
  commits: number;
  pullRequests: number;
  reviewRequests: number;
  issues: number;
  publicRepos: number;
  contributions: number;
};

const USERNAME = "MarkelianT";

function GithubCommitsCard() {
  const [range, setRange] = useState<DateRange>("7d");
  const [filterOpen, setFilterOpen] = useState(false);
  const [stats, setStats] = useState<GithubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const rangeStart = getRangeStart(range);
    const rangeStartIso = rangeStart.toISOString();

    setLoading(true);
    setError("");

    Promise.all([
      Promise.all(
        // GitHub events API is paginated, so we pull a small batch of recent pages.
        [1, 2, 3].map((page) =>
          fetchJson<GithubEvent[]>(
            `https://api.github.com/users/${USERNAME}/events/public?per_page=100&page=${page}`,
          ),
        ),
      ),
      fetchJson<UserResponse>(`https://api.github.com/users/${USERNAME}`),
    ])
      .then(([eventPages, user]) => {
        const events = eventPages.flat();
        const filteredEvents = events.filter(
          (event) => new Date(event.created_at) >= new Date(rangeStartIso),
        );

        const commits = filteredEvents
          .filter((event) => event.type === "PushEvent")
          .reduce((sum, event) => sum + (event.payload?.commits?.length || 0), 0);
        const pullRequests = filteredEvents.filter(
          (event) => event.type === "PullRequestEvent",
        ).length;
        const reviewRequests = filteredEvents.filter((event) => {
          if (event.type === "PullRequestReviewEvent") {
            return true;
          }
          return (
            event.type === "PullRequestEvent" &&
            event.payload?.action === "review_requested"
          );
        }).length;
        const issues = filteredEvents.filter(
          (event) => event.type === "IssuesEvent",
        ).length;

        setStats({
          commits,
          pullRequests,
          reviewRequests,
          issues,
          publicRepos: user.public_repos || 0,
          contributions: filteredEvents.length,
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load GitHub activity right now.");
        setLoading(false);
      });
  }, [range]);

  const donutStyle = useMemo(() => {
    if (!stats) {
      return { background: "conic-gradient(var(--chart-primary) 0% 100%)" };
    }

    const total = Math.max(stats.commits + stats.reviewRequests, 1);
    const commitsPct = (stats.commits / total) * 100;

    return {
      background: `conic-gradient(var(--chart-primary) 0% ${commitsPct}%, var(--chart-secondary) ${commitsPct}% 100%)`,
    };
  }, [stats]);

  return (
    <section className="panel h-auto">
      <header className="flex items-center justify-between">
        <h2 className="panel-title">GitHub Activity</h2>
        <a
          href={`https://github.com/${USERNAME}`}
          target="_blank"
          rel="noreferrer"
          className="accent-link text-sm font-medium"
        >
          @{USERNAME}
        </a>
      </header>

      {loading && <p className="panel-muted mt-4">Loading GitHub activity...</p>}
      {error && <p className="mt-4 text-sm text-[#ef94c8]">{error}</p>}

      {stats && (
        <>
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

          <div className="mt-5 flex items-center gap-4">
            <div className="grid h-24 w-24 place-items-center rounded-full" style={donutStyle}>
              <div
                className="grid h-16 w-16 place-items-center rounded-full text-sm font-semibold text-main"
                style={{ background: "var(--bg-panel-soft)" }}
              >
                Commits
              </div>
            </div>

            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-main">
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ background: "var(--chart-primary)" }}
                />
                <span className="whitespace-nowrap">{stats.commits} commits</span>
              </li>
              <li className="flex items-center gap-2 text-main">
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ background: "var(--chart-secondary)" }}
                />
                <span className="whitespace-nowrap">
                  {stats.reviewRequests} pending reviews
                </span>
              </li>
            </ul>
          </div>

          <dl className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <dt className="panel-label whitespace-nowrap">Pull requests</dt>
              <dd className="text-sm font-semibold text-main">{stats.pullRequests}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="panel-label whitespace-nowrap">Review requests</dt>
              <dd className="text-sm font-semibold text-main">{stats.reviewRequests}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="panel-label whitespace-nowrap">Public repositories</dt>
              <dd className="text-sm font-semibold text-main">{stats.publicRepos}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="panel-label whitespace-nowrap">Recent activity</dt>
              <dd className="text-sm font-semibold text-main">{stats.contributions}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="panel-label whitespace-nowrap">Issues</dt>
              <dd className="text-sm font-semibold text-main">{stats.issues}</dd>
            </div>
          </dl>
        </>
      )}
    </section>
  );
}

export default GithubCommitsCard;
