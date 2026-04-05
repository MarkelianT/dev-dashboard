import { useEffect, useState } from "react";

function GithubCard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("https://api.github.com/users/MarkelianT")
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  if (!user) {
    return (
      <div style={{ border: "1px solid #ddd", padding: "20px" }}>
        <h2>GitHub Profile</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid #ddd", padding: "20px" }}>
      <h2>GitHub Profile</h2>

      <img
        src={user.avatar_url}
        alt="avatar"
        style={{ width: "60px", borderRadius: "50%" }}
      />

      <p><strong>{user.name}</strong></p>
      <p>Followers: {user.followers}</p>
      <p>Public repos: {user.public_repos}</p>
    </div>
  );
}

export default GithubCard;