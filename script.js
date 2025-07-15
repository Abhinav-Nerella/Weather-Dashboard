const apiKey = "  "; // Your API key

const form = document.getElementById("weatherForm");
const input = document.getElementById("cityInput");
const card = document.getElementById("weatherCard");
const cityName = document.getElementById("cityName");
const temp = document.getElementById("temperature");
const condition = document.getElementById("condition");
const icon = document.querySelector(".weather-icon");
const themeSwitch = document.getElementById("themeSwitch");
const themeLabel = document.getElementById("themeLabel");
const forecastCards = document.getElementById("forecastCards");
const forecastContainer = document.getElementById("forecastContainer");

const icons = {
  "Clear": "sun.gif",
  "Rain": "rain.gif",
  "Clouds": "clouds.gif",
  "Snow": "snow.gif",
  "Drizzle": "rain.gif",
  "Thunderstorm": "rain.gif",
  "Mist": "clouds.gif",
  "Fog": "clouds.gif",
  "Haze": "clouds.gif"
};

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const city = input.value.trim();
  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  Promise.all([fetch(currentUrl), fetch(forecastUrl)])
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(([currentData, forecastData]) => {
      if (currentData.cod !== 200 || forecastData.cod !== "200") {
        alert("City not found.");
        card.classList.add("hidden");
        forecastContainer.classList.add("hidden");
        return;
      }

      // Current weather
      cityName.textContent = currentData.name;
      temp.textContent = "Temperature: " + Math.round(currentData.main.temp) + " °C";
      condition.textContent = "Condition: " + currentData.weather[0].main;
      icon.src = "images/" + (icons[currentData.weather[0].main] || "sun.gif");
      card.classList.remove("hidden");

      // Night detection
      const currentTime = currentData.dt;
      const sunrise = currentData.sys.sunrise;
      const sunset = currentData.sys.sunset;
      const isNight = currentTime < sunrise || currentTime > sunset;
      document.body.classList.toggle("night", isNight);
      themeSwitch.checked = isNight;
      themeLabel.textContent = isNight ? "🌙 Night Mode" : "☀️ Day Mode";
      localStorage.setItem("theme", isNight ? "night" : "day");

      // Forecast
      const forecastMap = {};
      forecastData.list.forEach(entry => {
        const [date, time] = entry.dt_txt.split(" ");
        if (!forecastMap[date] || time === "12:00:00") {
          forecastMap[date] = entry;
        }
      });

      const dates = Object.keys(forecastMap).slice(0, 5);
      forecastCards.innerHTML = "";
      dates.forEach(dateStr => {
        const data = forecastMap[dateStr];
        const dayName = new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
        const weatherMain = data.weather[0].main;
        const tempMin = Math.round(data.main.temp_min);
        const tempMax = Math.round(data.main.temp_max);

        const card = document.createElement("div");
        card.className = "forecast-card";
        card.innerHTML = `
          <p><strong>${dayName}</strong></p>
          <img src="images/${icons[weatherMain] || "sun.gif"}" alt="${weatherMain}">
          <p>${weatherMain}</p>
          <p>${tempMin}°C / ${tempMax}°C</p>
        `;
        forecastCards.appendChild(card);
      });
      forecastContainer.classList.remove("hidden");
    })
    .catch(err => {
      console.error("Fetch error:", err);
      alert("Failed to fetch weather data.");
    });
});

// Manual theme toggle
themeSwitch.addEventListener("change", () => {
  const isNight = themeSwitch.checked;
  document.body.classList.toggle("night", isNight);
  themeLabel.textContent = isNight ? "🌙 Night Mode" : "☀️ Day Mode";
  localStorage.setItem("theme", isNight ? "night" : "day");
});

// Load saved theme
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme");
  const isNight = saved === "night";
  document.body.classList.toggle("night", isNight);
  themeSwitch.checked = isNight;
  themeLabel.textContent = isNight ? "🌙 Night Mode" : "☀️ Day Mode";
});
