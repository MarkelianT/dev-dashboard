import { useEffect, useState } from "react";
import { fetchJson } from "../lib/fetchJson";

type Repo = {
  id: number;
  name: string;
  html_url: string;
  updated_at: string;
  stargazers_count: number;
  language: string | null;
};

function RepoList() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchJson<Repo[]>("https://api.github.com/users/MarkelianT/repos")
      .then((data) => {
        if (!cancelled) {
          // Keep most recently updated repos at the top.
          const sorted = [...data].sort((a, b) =>
            b.updated_at.localeCompare(a.updated_at),
          );
          setRepos(sorted);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load repositories.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="panel h-auto">
      <h2 className="panel-title">Recent Repositories</h2>

      {error ? (
        <p className="panel-muted mt-4">{error}</p>
      ) : repos.length === 0 ? (
        <p className="panel-muted mt-4">Loading repositories...</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {repos.slice(0, 6).map((repo) => (
            <li key={repo.id} className="panel-sub">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="accent-link text-sm font-medium"
              >
                {repo.name}
              </a>
              <p className="mt-1 text-xs text-muted">
                ★ {repo.stargazers_count} | {repo.language || "Unspecified"} |{" "}
                Updated {new Date(repo.updated_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RepoList;
