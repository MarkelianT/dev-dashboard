import { useEffect, useState } from "react";

function WeatherCard() {
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    fetch(
      "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.91&lon=10.75",
      {
        headers: {
          "User-Agent": "dev-dashboard markelian.cuni@gmail.com",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        const current =
          data.properties.timeseries[0].data.instant.details;

        setWeather(current);
      });
  }, []);

  return (
    <div style={{ border: "1px solid #ddd", padding: "20px" }}>
      <h2>Weather</h2>

      {!weather ? (
        <p>Loading...</p>
      ) : (
        <>
          <p><strong>Oslo</strong></p>
          <p>Temperature: {weather.air_temperature}°C</p>
          <p>Wind: {weather.wind_speed} m/s</p>
        </>
      )}
    </div>
  );
}

export default WeatherCard;