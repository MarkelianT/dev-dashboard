import { useEffect, useState } from "react";

function RepoList() {
  const [repos, setRepos] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://api.github.com/users/MarkelianT/repos")
      .then((res) => res.json())
      .then((data) => setRepos(data));
  }, []);

  return (
    <div style={{ border: "1px solid #ddd", padding: "20px" }}>
      <h2>Latest Repositories</h2>

      {repos.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <ul style={{ paddingLeft: "20px" }}>
          {repos.slice(0, 4).map((repo) => (
            <li key={repo.id} style={{ marginBottom: "10px" }}>
              <strong>{repo.name}</strong>
              <br />
              ⭐ {repo.stargazers_count} | {repo.language || "No language"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RepoList;