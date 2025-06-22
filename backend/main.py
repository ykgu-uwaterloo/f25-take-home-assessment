from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import requests
import uuid

app = FastAPI(title="Weather Data System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}

class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str

WEATHERSTACK_API_KEY = "e7b1453b87dff100c8dc860f29ace1e3"

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    """
    You need to implement this endpoint to handle the following:
    1. Receive form data (date, location, notes)
    2. Calls WeatherStack API for the location
    3. Stores combined data with unique ID in memory
    4. Returns the ID to frontend
    """
    
    WEATHERSTACK_URL = "http://api.weatherstack.com/current"
    params = {
        "access_key": WEATHERSTACK_API_KEY,
        "query": request.location,
    }

    # Make the API call to WeatherStack
    response = requests.get(url =  WEATHERSTACK_URL, params=params)

    # Check if the response is successful
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch weather data")
    
    # Parse the JSON response
    weather_data = response.json()

    # Check if the API returned an error
    if "error" in weather_data:
        raise HTTPException(status_code=400, detail=weather_data["error"]["info"])
    
    # Generate a unique ID for the weather data
    weather_id = str(uuid.uuid4())

    # Store the weather data combined with unique ID in memory
    weather_storage[weather_id] = {
        "date": request.date,
        "location": request.location,
        "notes": request.notes,
        "weather_data": weather_data
    }

    # Return the ID to the frontend
    return WeatherResponse(id=weather_id)

@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    return weather_storage[weather_id]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)