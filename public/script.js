const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const searchBar = document.getElementById('searchBar');
const updatedText = document.getElementById('updatedText');

// "Today" tab states
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

// Tab panels
const forecastPanel = document.getElementById('forecastPanel');
const forecastEmpty = document.getElementById('forecastEmpty');
const forecastLoading = document.getElementById('forecastLoading');
const forecastList = document.getElementById('forecastList');

const citiesPanel = document.getElementById('citiesPanel');
const citiesEmpty = document.getElementById('citiesEmpty');
const citiesList = document.getElementById('citiesList');
const clearCitiesBtn = document.getElementById('clearCitiesBtn');

// Nav buttons
const navToday = document.getElementById('navToday');
const navForecast = document.getElementById('navForecast');
const navCities = document.getElementById('navCities');

let currentCity = null;

const RECENT_KEY = 'recentSearches';
const MAX_RECENT = 6;

// ---------- Today tab ----------

function showTodayState(state) {
  [emptyState, loadingState, errorState, resultState].forEach((el) => {
    el.classList.add('hidden-state');
  });
  state.classList.remove('hidden-state');
}

async function getWeather(cityArg) {
  const city = (cityArg || cityInput.value).trim();
  if (!city) return;

  cityInput.value = city;
  updatedText.classList.add('hidden-state');
  showTodayState(loadingState);

  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    const data = await response.json();

    if (!response.ok) {
      errorCity.textContent = city;
      errorMsg.textContent = data.error || 'City not found. Please try again.';
      showTodayState(errorState);
      return;
    }

    cityName.textContent = `${data.city}, ${data.country}`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
    temperature.textContent = `${Math.round(data.temperature)}°`;
    description.textContent = data.description;
    feelsLike.textContent = Math.round(data.feels_like);
    humidity.textContent = data.humidity;
    windSpeed.textContent = data.wind_speed;

    showTodayState(resultState);
    updatedText.textContent = 'Updated just now';
    updatedText.classList.remove('hidden-state');

    currentCity = `${data.city},${data.country}`;
    addRecentSearch(data.city, data.country);
  } catch (err) {
    console.error(err);
    errorCity.textContent = city;
    errorMsg.textContent = 'Could not reach the server.';
    showTodayState(errorState);
  }
}

searchBtn.addEventListener('click', () => getWeather());
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') getWeather();
});

// ---------- Recent searches (Cities tab) ----------

function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
}

function addRecentSearch(city, country) {
  let recent = getRecentSearches();
  // Remove any existing entry for the same city so it moves to the top instead of duplicating
  recent = recent.filter((r) => r.city.toLowerCase() !== city.toLowerCase());
  recent.unshift({ city, country });
  recent = recent.slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
}

function renderCitiesPanel() {
  const recent = getRecentSearches();

  if (recent.length === 0) {
    citiesEmpty.classList.remove('hidden-state');
    citiesList.classList.add('hidden-state');
    clearCitiesBtn.classList.add('hidden-state');
    return;
  }

  citiesEmpty.classList.add('hidden-state');
  citiesList.classList.remove('hidden-state');
  clearCitiesBtn.classList.remove('hidden-state');

  citiesList.innerHTML = '';
  recent.forEach(({ city, country }) => {
    const btn = document.createElement('button');
    btn.className =
      'w-full flex items-center justify-between bg-surface-container/50 dark:bg-white/10 rounded-xl px-4 py-3 text-left hover:bg-surface-container dark:hover:bg-white/15 transition-colors';
    btn.innerHTML = `
      <span class="flex items-center gap-2 text-on-surface dark:text-inverse-on-surface font-body-md">
        <span class="material-symbols-outlined text-outline dark:text-outline-variant text-[20px]">location_on</span>
        ${city}, ${country}
      </span>
      <span class="material-symbols-outlined text-outline dark:text-outline-variant text-[18px]">chevron_right</span>
    `;
    btn.addEventListener('click', () => {
      switchTab('today');
      getWeather(city);
    });
    citiesList.appendChild(btn);
  });
}

clearCitiesBtn.addEventListener('click', () => {
  localStorage.removeItem(RECENT_KEY);
  renderCitiesPanel();
});

// ---------- Forecast tab ----------

async function loadForecast() {
  if (!currentCity) {
    forecastEmpty.classList.remove('hidden-state');
    forecastLoading.classList.add('hidden-state');
    forecastList.classList.add('hidden-state');
    return;
  }

  forecastEmpty.classList.add('hidden-state');
  forecastList.classList.add('hidden-state');
  forecastLoading.classList.remove('hidden-state');

  const cityQuery = currentCity.split(',')[0];

  try {
    const response = await fetch(`/api/forecast?city=${encodeURIComponent(cityQuery)}`);
    const data = await response.json();

    forecastLoading.classList.add('hidden-state');

    if (!response.ok) {
      forecastEmpty.classList.remove('hidden-state');
      return;
    }

    forecastList.innerHTML = '';
    data.days.forEach((day) => {
      const dateObj = new Date(day.date + 'T00:00:00');
      const dayLabel = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

      const row = document.createElement('div');
      row.className =
        'flex items-center justify-between bg-surface-container/50 dark:bg-white/10 rounded-xl px-4 py-3';
      row.innerHTML = `
        <span class="text-on-surface dark:text-inverse-on-surface font-body-md text-sm w-28">${dayLabel}</span>
        <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}" class="w-10 h-10" />
        <span class="text-on-surface-variant dark:text-outline-variant text-sm capitalize flex-1 text-center">${day.description}</span>
        <span class="text-on-surface dark:text-inverse-on-surface font-data-point text-sm w-20 text-right">${Math.round(day.max_temp)}° / ${Math.round(day.min_temp)}°</span>
      `;
      forecastList.appendChild(row);
    });
    forecastList.classList.remove('hidden-state');
  } catch (err) {
    console.error(err);
    forecastLoading.classList.add('hidden-state');
    forecastEmpty.classList.remove('hidden-state');
  }
}

// ---------- Tab switching ----------

function switchTab(tab) {
  // Reset nav button styles
  [navToday, navForecast, navCities].forEach((btn) => {
    btn.classList.remove('bg-primary-container', 'dark:bg-primary', 'text-on-primary-container', 'dark:text-on-primary');
    btn.classList.add('text-on-surface-variant', 'dark:text-outline-variant');
  });

  const activate = (btn) => {
    btn.classList.remove('text-on-surface-variant', 'dark:text-outline-variant');
    btn.classList.add('bg-primary-container', 'dark:bg-primary', 'text-on-primary-container', 'dark:text-on-primary');
  };

  searchBar.classList.add('hidden-state');
  [emptyState, loadingState, errorState, resultState].forEach((el) => el.classList.add('hidden-state'));
  forecastPanel.classList.add('hidden-state');
  citiesPanel.classList.add('hidden-state');
  updatedText.classList.add('hidden-state');

  if (tab === 'today') {
    activate(navToday);
    searchBar.classList.remove('hidden-state');
    showTodayState(currentCity ? resultState : emptyState);
    if (currentCity) {
      updatedText.classList.remove('hidden-state');
    }
  } else if (tab === 'forecast') {
    activate(navForecast);
    forecastPanel.classList.remove('hidden-state');
    loadForecast();
  } else if (tab === 'cities') {
    activate(navCities);
    citiesPanel.classList.remove('hidden-state');
    renderCitiesPanel();
  }
}

navToday.addEventListener('click', () => switchTab('today'));
navForecast.addEventListener('click', () => switchTab('forecast'));
navCities.addEventListener('click', () => switchTab('cities'));

// ---------- Dark mode toggle ----------

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const html = document.documentElement;

function updateThemeIcon() {
  themeIcon.textContent = html.classList.contains('dark') ? 'light_mode' : 'dark_mode';
}

themeToggle.addEventListener('click', () => {
  html.classList.toggle('dark');
  localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
  updateThemeIcon();
});

updateThemeIcon();
