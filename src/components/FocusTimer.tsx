import { useEffect, useState } from "react";

type FocusTimerProps = {
  onFocusModeChange: (active: boolean) => void;
};

const QUICK_OPTIONS = [25, 40, 60];

function FocusTimer({ onFocusModeChange }: FocusTimerProps) {
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [time, setTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  const updateDuration = (nextDuration: number) => {
    setDurationMinutes(nextDuration);
    if (!running) {
      setTime(nextDuration * 60);
    }
  };

  const stepDuration = (step: number) => {
    updateDuration(Math.max(1, Math.min(240, durationMinutes + step)));
  };

  useEffect(() => {
    let timer: number | undefined;

    if (running && time > 0) {
      timer = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    }

    if (running && time === 0) {
      setRunning(false);
      onFocusModeChange(false);
    }

    return () => clearInterval(timer);
  }, [running, time, onFocusModeChange]);

  useEffect(() => {
    return () => onFocusModeChange(false);
  }, [onFocusModeChange]);

  const start = () => {
    if (time <= 0) {
      setTime(durationMinutes * 60);
    }
    setRunning(true);
    onFocusModeChange(true);
  };

  const pause = () => {
    setRunning(false);
    onFocusModeChange(false);
  };

  const stop = () => {
    setRunning(false);
    setTime(durationMinutes * 60);
    onFocusModeChange(false);
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <>
      <div className="panel h-auto">
        <h2 className="panel-title">Focus Timer</h2>

        <p className="mt-4 text-sm text-muted">Session duration (minutes)</p>
        <div className="mt-2 flex items-center gap-2">
          <button
            className="btn btn-secondary !px-3 !py-2"
            onClick={() => stepDuration(-1)}
            disabled={running}
            aria-label="Decrease duration"
          >
            -
          </button>
          <input
            type="number"
            min={1}
            max={240}
            value={durationMinutes}
            onChange={(event) =>
              updateDuration(
                Math.max(1, Math.min(240, Number(event.target.value) || 25)),
              )
            }
            className="field field-number"
            disabled={running}
          />
          <button
            className="btn btn-secondary !px-3 !py-2"
            onClick={() => stepDuration(1)}
            disabled={running}
            aria-label="Increase duration"
          >
            +
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => updateDuration(option)}
              className={`chip ${
                durationMinutes === option
                  ? "chip-active"
                  : ""
              }`}
              disabled={running}
            >
              {option} min
            </button>
          ))}
        </div>

        <p className="font-heading mt-6 text-center text-5xl font-semibold text-main sm:text-6xl">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button className="btn btn-primary" onClick={start} disabled={running}>
            Start
          </button>
          <button className="btn btn-secondary" onClick={pause} disabled={!running}>
            Pause
          </button>
          <button className="btn btn-secondary" onClick={stop}>
            Stop
          </button>
        </div>
      </div>

      {running && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-3">
          <button
            onClick={pause}
            className="rounded-xl border px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #a855f7, #9333ea)",
              borderColor: "rgba(221, 214, 254, 0.55)",
              boxShadow: "0 10px 24px rgba(147, 51, 234, 0.38)",
            }}
          >
            Pause
          </button>
          <button
            onClick={stop}
            className="rounded-xl border px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #7e22ce, #6b21a8)",
              borderColor: "rgba(216, 180, 254, 0.5)",
              boxShadow: "0 10px 24px rgba(107, 33, 168, 0.35)",
            }}
          >
            Stop
          </button>
        </div>
      )}
    </>
  );
}

export default FocusTimer;
