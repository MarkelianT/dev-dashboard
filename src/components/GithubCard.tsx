import { useEffect, useState } from "react";
import { fetchJson } from "../lib/fetchJson";

type GithubUser = {
  avatar_url: string;
  name: string;
  followers: number;
  public_repos: number;
  html_url: string;
};

function GithubCard() {
  const [user, setUser] = useState<GithubUser | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchJson<GithubUser>("https://api.github.com/users/MarkelianT")
      .then((data) => {
        if (!cancelled) {
          setUser(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load profile.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!user && !error) {
    return (
      <div className="panel h-auto">
        <h2 className="panel-title">GitHub Profile</h2>
        <p className="panel-muted">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="panel h-auto">
      <h2 className="panel-title">GitHub Profile</h2>
      {error && <p className="panel-muted mt-4">{error}</p>}
      {user && (
        <>
          <div className="mt-4 flex items-center gap-4">
            <img
              src={user.avatar_url}
              alt="GitHub avatar"
              className="h-14 w-14 rounded-full border object-cover"
              style={{ borderColor: "var(--border-soft)" }}
            />
            <div className="space-y-1">
              <p className="text-base font-semibold text-main">
                {user.name || "MarkelianT"}
              </p>
              <a
                href={user.html_url}
                target="_blank"
                rel="noreferrer"
                className="accent-link text-sm font-medium"
              >
                Open profile
              </a>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="panel-sub">
              <p className="panel-label">Followers</p>
              <p className="panel-metric">{user.followers}</p>
            </div>
            <div className="panel-sub">
              <p className="panel-label">Public repos</p>
              <p className="panel-metric">{user.public_repos}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default GithubCard;
