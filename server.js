const express = require('express');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/api/weather', async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: 'Please provide a city name' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY; // our SECRET key, never exposed to the browser
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Something went wrong' });
    }

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

    const byDate = {};
    for (const entry of data.list) {
      const date = entry.dt_txt.split(' ')[0];
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(entry);
    }

    const days = Object.keys(byDate)
      .slice(0, 5)
      .map((date) => {
        const entries = byDate[date];

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
