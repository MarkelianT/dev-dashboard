import { useEffect, useState } from "react";
import { fetchJson } from "../lib/fetchJson";

type WeatherData = {
  air_temperature: number;
  wind_speed: number;
};
type WeatherResponse = {
  properties: {
    timeseries: Array<{
      data: {
        instant: {
          details: WeatherData;
        };
      };
    }>;
  };
};

function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchJson<WeatherResponse>(
      "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.91&lon=10.75",
      {
        headers: {
          "User-Agent": "dev-dashboard markelian.cuni@gmail.com",
        },
      },
    )
      .then((data) => {
        if (!cancelled) {
          setWeather(data.properties.timeseries[0]?.data.instant.details ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load weather.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="panel h-auto">
      <h2 className="panel-title">Weather</h2>

      {error ? (
        <p className="panel-muted mt-4">{error}</p>
      ) : !weather ? (
        <p className="panel-muted mt-4">Loading weather...</p>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-base font-semibold text-main">Oslo</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="panel-sub">
              <p className="panel-label">Temperature</p>
              <p className="panel-metric">{Math.round(weather.air_temperature)}°C</p>
            </div>
            <div className="panel-sub">
              <p className="panel-label">Wind Speed</p>
              <p className="panel-metric">{weather.wind_speed} m/s</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherCard;
