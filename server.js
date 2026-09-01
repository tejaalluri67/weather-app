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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
