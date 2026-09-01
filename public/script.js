// script.js
// Runs in the BROWSER. Only talks to OUR backend at /api/weather —
// never directly to OpenWeatherMap (see server.js for why).

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const updatedText = document.getElementById('updatedText');

const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const resultState = document.getElementById('resultState');

const cityName = document.getElementById('cityName');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');

const errorMsg = document.getElementById('errorMsg');
const errorCity = document.getElementById('errorCity');

// Show exactly one of the four state panels
function showState(state) {
  [emptyState, loadingState, errorState, resultState].forEach((el) => {
    el.classList.add('hidden-state');
  });
  state.classList.remove('hidden-state');
}

async function getWeather() {
  const city = cityInput.value.trim();
  if (!city) return;

  updatedText.classList.add('hidden-state');
  showState(loadingState);

  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    const data = await response.json();

    if (!response.ok) {
      errorCity.textContent = city;
      errorMsg.textContent = data.error || 'City not found. Please try again.';
      showState(errorState);
      return;
    }

    cityName.textContent = `${data.city}, ${data.country}`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
    temperature.textContent = `${Math.round(data.temperature)}°`;
    description.textContent = data.description;
    feelsLike.textContent = Math.round(data.feels_like);
    humidity.textContent = data.humidity;
    windSpeed.textContent = data.wind_speed;

    showState(resultState);
    updatedText.textContent = 'Updated just now';
    updatedText.classList.remove('hidden-state');
  } catch (err) {
    console.error(err);
    errorCity.textContent = city;
    errorMsg.textContent = 'Could not reach the server.';
    showState(errorState);
  }
}

searchBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') getWeather();
});

// --- Dark mode toggle ---
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const html = document.documentElement;

function updateThemeIcon() {
  // Icon shows what you'll SWITCH TO, not the current state
  themeIcon.textContent = html.classList.contains('dark') ? 'light_mode' : 'dark_mode';
}

themeToggle.addEventListener('click', () => {
  html.classList.toggle('dark');
  localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
  updateThemeIcon();
});

updateThemeIcon(); // set the correct icon on page load
