#Weather App

A full-stack weather app built as a first project to learn how a frontend, a backend, and a third-party API all fit together. Search any city to see current conditions, a 5-day forecast, and quickly revisit recently searched cities — with light/dark mode support.

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![OpenWeatherMap](https://img.shields.io/badge/API-OpenWeatherMap-orange)

## Features

- 🔍 **Search any city** for its current weather
- 🌡️ **Current conditions**: temperature, feels-like, description, humidity, wind speed
- 📅 **5-day forecast** — daily highs/lows and conditions
- 🕑 **Recent searches** — your last few cities, saved locally, one tap to revisit
- 🌙 **Dark mode** — toggle manually, or it follows your system preference by default
- 📱 Responsive layout with a mobile-style bottom nav (Today / Forecast / Cities)

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | HTML, Tailwind CSS (CDN), vanilla JavaScript |
| Backend | Node.js, Express |
| External API | [OpenWeatherMap](https://openweathermap.org/api) (current weather + 5-day/3-hour forecast) |
| Storage | Browser `localStorage` (recent searches, theme preference) — no database |

## How it works

```
Browser (script.js)
   │  fetch('/api/weather?city=Hyderabad')
   │  fetch('/api/forecast?city=Hyderabad')
   ▼
Your Server (server.js)
   │  fetch('https://api.openweathermap.org/...&appid=SECRET_KEY')
   ▼
OpenWeatherMap API
   │  returns raw weather/forecast data
   ▼
Your Server (cleans up the data, hides the secret key)
   ▼
Browser (renders it)
```

The browser never talks to OpenWeatherMap directly and never sees the API key — every request is proxied through the Express backend. This is the standard pattern for any app that wraps a third-party API.

## Project structure

```
weather-app/
├── server.js           # Express backend: /api/weather and /api/forecast endpoints
├── package.json
├── .env.example         # Template for your API key
├── public/
│   ├── index.html        # UI markup for all app states (empty/loading/error/result/forecast/cities)
│   └── script.js         # Frontend logic: API calls, tab switching, dark mode, recent searches
└── README.md
```

## Getting started

### 1. Install dependencies
```bash
npm install
```

### 2. Get a free API key
Sign up at [openweathermap.org/api](https://openweathermap.org/api) and grab your key from your account dashboard. New keys can take up to an hour to activate.

### 3. Set up your environment file
Rename `.env.example` to `.env` and add your key:
```
OPENWEATHER_API_KEY=your_real_key_here
```

### 4. Run it
```bash
npm start
```
Or, while actively developing (auto-restarts on file changes):
```bash
npm run dev
```

### 5. Open it
Visit **http://localhost:3000**

## API endpoints (backend)

| Endpoint | Description |
|---|---|
| `GET /api/weather?city=<name>` | Returns current conditions for a city |
| `GET /api/forecast?city=<name>` | Returns a 5-day forecast summary for a city |

Both proxy to OpenWeatherMap and return trimmed-down JSON tailored to what the frontend needs.

## Ideas for extending this further

- Add geolocation ("use my current location" button)
- Show hourly forecast for the current day
- Add unit toggle (°C / °F)
- Deploy it (Render/Railway both have free tiers for Node apps)
- Rebuild the frontend in React once comfortable with the vanilla JS version

## License

This project is for personal learning purposes — feel free to fork and build on it.
