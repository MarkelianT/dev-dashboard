import { useState, useEffect } from "react";

function FocusTimer() {
  const [time, setTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let timer: number | undefined;

    if (running && time > 0) {
      timer = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [running, time]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div style={{ border: "1px solid #ddd", padding: "20px" }}>
      <h2>Focus Timer</h2>

      <h1>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </h1>

      <button onClick={() => setRunning(true)}>Start</button>
      <button onClick={() => setRunning(false)} style={{ marginLeft: "10px" }}>
        Pause
      </button>
      <button
        onClick={() => {
          setTime(25 * 60);
          setRunning(false);
        }}
        style={{ marginLeft: "10px" }}
      >
        Reset
      </button>
    </div>
  );
}

export default FocusTimer;