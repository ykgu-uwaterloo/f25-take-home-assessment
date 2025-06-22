"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WeatherLookupProps {
  weatherId?: string;
}

export default function WeatherLookup({
  weatherId: initialId,
}: WeatherLookupProps) {
  const [weatherId, setWeatherId] = useState(initialId ?? "");
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (initialId) {
      setWeatherId(initialId);
    }
  }, [initialId]);
  const handleLookup = async () => {
    setError("");
    setResult(null);
    setShowAdvanced(false);
    try {
      const res = await fetch(`http://localhost:8000/weather/${weatherId}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Could not fetch weather data for that ID.");
    }
  };

  return (
    <div className="w-full space-y-4">
      <Input
        placeholder="Enter weather ID"
        value={weatherId}
        onChange={(e) => setWeatherId(e.target.value)}
      />
      <Button onClick={handleLookup} disabled={!weatherId.trim()}>
        Lookup
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 border p-4 rounded bg-muted text-sm text-left space-y-2"
        >
          {/* Main Info */}
          <p>
            <strong>Date:</strong> {result.date}
          </p>
          <p>
            <strong>Location:</strong> {result.location}
          </p>
          <p>
            <strong>Notes:</strong> {result.notes || "None"}
          </p>
          <p>
            <strong>Temperature:</strong>{" "}
            {result.weather_data?.current?.temperature}°C
          </p>
          <p>
            <strong>Feels Like:</strong>{" "}
            {result.weather_data?.current?.feelslike}°C
          </p>
          <p className="flex items-center gap-2">
            <strong>Condition:</strong>{" "}
            {result.weather_data?.current?.weather_descriptions?.[0]}
            {result.weather_data?.current?.weather_icons?.[0] && (
              <img
                src={result.weather_data.current.weather_icons[0]}
                alt="icon"
                className="w-6 h-6"
              />
            )}
          </p>
          <p>
            <strong>Humidity:</strong> {result.weather_data?.current?.humidity}%
          </p>

          {/* Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Hide Advanced Info" : "Show Advanced Info"}
          </Button>

          {/* Advanced Info */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-4 pt-2 border-t grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-muted-foreground"
              >
                <p>
                  <strong>Wind:</strong>{" "}
                  {result.weather_data?.current?.wind_speed} km/h{" "}
                  {result.weather_data?.current?.wind_dir}
                </p>
                <p>
                  <strong>Visibility:</strong>{" "}
                  {result.weather_data?.current?.visibility} km
                </p>
                <p>
                  <strong>UV Index:</strong>{" "}
                  {result.weather_data?.current?.uv_index}
                </p>
                <p>
                  <strong>Sunrise:</strong>{" "}
                  {result.weather_data?.current?.astro?.sunrise}
                </p>
                <p>
                  <strong>Sunset:</strong>{" "}
                  {result.weather_data?.current?.astro?.sunset}
                </p>
                <p>
                  <strong>Pressure:</strong>{" "}
                  {result.weather_data?.current?.pressure} hPa
                </p>
                <p>
                  <strong>Precipitation:</strong>{" "}
                  {result.weather_data?.current?.precip} mm
                </p>
                <p>
                  <strong>Cloud Cover:</strong>{" "}
                  {result.weather_data?.current?.cloudcover}%
                </p>
                <p>
                  <strong>PM2.5:</strong>{" "}
                  {result.weather_data?.current?.air_quality?.pm2_5}
                </p>
                <p>
                  <strong>PM10:</strong>{" "}
                  {result.weather_data?.current?.air_quality?.pm10}
                </p>
                <p>
                  <strong>CO:</strong>{" "}
                  {result.weather_data?.current?.air_quality?.co}
                </p>
                <p>
                  <strong>NO2:</strong>{" "}
                  {result.weather_data?.current?.air_quality?.no2}
                </p>
                <p>
                  <strong>O3:</strong>{" "}
                  {result.weather_data?.current?.air_quality?.o3}
                </p>
                <p>
                  <strong>Moon Phase:</strong>{" "}
                  {result.weather_data?.current?.astro?.moon_phase}
                </p>
                <p>
                  <strong>Moon Illumination:</strong>{" "}
                  {result.weather_data?.current?.astro?.moon_illumination}%
                </p>
                <p>
                  <strong>Observation Time:</strong>{" "}
                  {result.weather_data?.current?.observation_time}
                </p>
                <p>
                  <strong>Lat/Lon:</strong> {result.weather_data?.location?.lat}
                  , {result.weather_data?.location?.lon}
                </p>
                <p>
                  <strong>Timezone:</strong>{" "}
                  {result.weather_data?.location?.timezone_id}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
