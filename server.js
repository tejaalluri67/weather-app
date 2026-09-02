// server.js
// This is our BACKEND. It runs on a server (your computer, for now)
// and does two jobs:
//   1. Serves our frontend files (the HTML/CSS/JS in the "public" folder)
//   2. Provides an API endpoint (/api/weather) that the frontend calls,
//      which then talks to the REAL weather API on our behalf.

const express = require('express');
require('dotenv').config(); // loads variables from a .env file (like our secret API key)

const app = express();
const PORT = 3000;

// This lets Express serve static files (index.html, style.css, script.js)
// directly from the "public" folder.
app.use(express.static('public'));

// This is OUR API endpoint. Our frontend will call THIS, not OpenWeatherMap directly.
// Example: fetch('/api/weather?city=London')
app.get('/api/weather', async (req, res) => {
  const city = req.query.city; // grabs "London" from ?city=London

  if (!city) {
    return res.status(400).json({ error: 'Please provide a city name' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY; // our SECRET key, never exposed to the browser
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  try {
    // Our BACKEND calls the real weather API here (not the browser)
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      // OpenWeatherMap returns an error message (e.g. "city not found")
      return res.status(response.status).json({ error: data.message || 'Something went wrong' });
    }

    // Send back only the pieces our frontend actually needs
    res.json({
      city: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching weather' });
  }
});

// NEW: 5-day forecast endpoint.
// OpenWeatherMap's free forecast API gives readings every 3 hours (40 total
// over 5 days), not one-per-day. We pick the reading closest to midday for
// each date, and also track the min/max temperature seen that day.
// Example: fetch('/api/forecast?city=London')
app.get('/api/forecast', async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: 'Please provide a city name' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Something went wrong' });
    }

    // Group the 3-hour entries by calendar date (YYYY-MM-DD)
    const byDate = {};
    for (const entry of data.list) {
      const date = entry.dt_txt.split(' ')[0]; // "2026-09-02 15:00:00" -> "2026-09-02"
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(entry);
    }

    // Turn each day's group of entries into one summary object
    const days = Object.keys(byDate)
      .slice(0, 5) // only need 5 days
      .map((date) => {
        const entries = byDate[date];

        // Pick the entry closest to 12:00 to represent "the weather that day"
        const midday = entries.reduce((closest, entry) => {
          const hour = parseInt(entry.dt_txt.split(' ')[1].split(':')[0], 10);
          const closestHour = parseInt(closest.dt_txt.split(' ')[1].split(':')[0], 10);
          return Math.abs(hour - 12) < Math.abs(closestHour - 12) ? entry : closest;
        }, entries[0]);

        const temps = entries.map((e) => e.main.temp);

        return {
          date,
          min_temp: Math.min(...temps),
          max_temp: Math.max(...temps),
          description: midday.weather[0].description,
          icon: midday.weather[0].icon,
        };
      });

    res.json({
      city: data.city.name,
      country: data.city.country,
      days,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching forecast' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
