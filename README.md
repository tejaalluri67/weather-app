# Weather App — Setup Guide

## What you're running
- `server.js` → your **backend** (Node.js + Express)
- `public/` → your **frontend** (plain HTML/CSS/JS)
- Your backend calls the **OpenWeatherMap API** and forwards clean data to your frontend

## Steps to run it locally

1. **Install Node.js** (if you don't have it): https://nodejs.org (LTS version)

2. **Open a terminal in this folder** and install dependencies:
   ```
   npm install
   ```

3. **Get your API key**
   - Sign up free at https://openweathermap.org/api
   - Copy your API key from your account dashboard
   - (Note: new keys can take 10-60 minutes to activate)

4. **Set up your `.env` file**
   - Paste your key in:
     ```
     OPENWEATHER_API_KEY=paste_your_real_key_here
     ```

5. **Run the server**
   ```
   npm start
   ```
   While actively editing code, use this instead — it auto-restarts the server every time you save a file, so you don't need to stop/start it manually:
   ```
   npm run dev
   ```

6. **Open your browser** to:
   ```
   http://localhost:3000
   ```

7. Type a city name and hit Search 🎉

## How the data flows (the important part)

```
Browser (script.js)
   │  fetch('/api/weather?city=London')
   ▼
Your Server (server.js)
   │  fetch('https://api.openweathermap.org/...&appid=SECRET_KEY')
   ▼
OpenWeatherMap API
   │  returns raw weather data
   ▼
Your Server (cleans up the data, hides the secret key)
   ▼
Browser (displays it)
```

Your API key **never appears in the browser** — only your server sees it. This is the standard, secure pattern for any app that uses a third-party API.

## Things to try next (once it works)
- ~~Add a 5-day forecast~~ ✅ done — see the Forecast tab
- ~~Add a "recent searches" list~~ ✅ done — see the Cities tab (stored in your browser's localStorage)
- Add error handling for typos / empty results
- Deploy it: frontend+backend together on **Render** or **Railway** (both have free tiers)
- Swap plain JS for React once you're comfortable
