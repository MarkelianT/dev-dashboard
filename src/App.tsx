import GithubCard from "./components/GithubCard";
import RepoList from "./components/RepoList";
import WeatherCard from "./components/WeatherCard";
import TechNews from "./components/TechNews";
import FocusTimer from "./components/FocusTimer";



function App() {
  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Dev Dashboard</h1>
  
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginTop: "30px",
        }}
      >
       <GithubCard />
       <RepoList />
       <WeatherCard />
       <TechNews />
        <FocusTimer />
      </div>
    </div>
  );
}

export default App;