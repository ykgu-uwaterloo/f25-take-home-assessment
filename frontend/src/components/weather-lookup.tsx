"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function WeatherLookup() {
  const [weatherId, setWeatherId] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState("");

  const handleLookup = async () => {
    setError("");
    setResult(null);
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
      <Button onClick={handleLookup}>Lookup</Button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <div className="mt-4 border p-4 rounded bg-muted text-sm text-left">
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
            {result.weather_data?.current?.temperature}
            °C
          </p>
          <p>
            <strong>Description:</strong>{" "}
            {result.weather_data?.current?.weather_descriptions?.[0]}
          </p>
        </div>
      )}
    </div>
  );
}
