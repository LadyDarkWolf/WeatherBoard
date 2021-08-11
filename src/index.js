// open weather map apiKey
let apiKey = "2af1ff2de81cdd8d67552da7d4b4331d";

// Full names of the days for display
let dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Wind directions
let windDirections = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
];

// mapping of wind speed display units
let windSpeedUnits = {
  C: "m/s",
  K: "m/s",
  F: "mph",
};

// Map from internal units to display units
let displayUnits = {
  C: "°C",
  F: "°F",
  K: " K",
};
// What we send to openweathermap to get a specific unit of temperature
let weatherUnits = {
  C: "metric",
  F: "imperial",
  K: "",
};

let forecastDays = 5; // number of forecast days
let currentUnit = "C"; // current unit we're displaying
// remember last thing we asked weather API for
let lastWeatherQuery = "";

function simpleDate(date) {
  let hour = date.getHours();
  if (hour < 10) {
    hour = "0" + $hour;
  }
  let minute = date.getMinutes();
  if (minute < 10) {
    minute = "0" + minute;
  }
  return `${dayNames[date.getDay()]} ${hour}:${minute}`;
}

function capitalise(text) {
  return text[0].toUpperCase() + text.slice(1);
}
function updateTempDisplay(temp, id) {
  let tempField = document.querySelector(`#${id}`);
  temp = Math.round(temp);
  tempField.innerHTML = `${temp}${displayUnits[currentUnit]}`;
}

function updateIconDisplay(weather, id) {
  let iconImg = document.getElementById(id);
  iconImg.src = `http://openweathermap.org/img/wn/${weather}@2x.png`;
}

function updateLocationDisplay(town, country, id) {
  let locationField = document.querySelector(`#${id}`);
  let currentLocationName = "- -";
  if (town) {
    currentLocationName = `${town},&nbsp;${country}`;
  }
  locationField.innerHTML = currentLocationName;
}

function updateWeatherDisplay(weather, id) {
  let weatherField = document.querySelector(`#${id}`);
  weather = capitalise(weather);
  weatherField.innerHTML = `${weather}`;
}

function updateHumidityDisplay(humidity, id) {
  let humidityField = document.querySelector(`#${id}`);
  humidityField.innerHTML = humidity;
}
function translateWindDirection(degrees) {
  let index = Math.round(degrees / 22.5) % 16;
  return windDirections[index];
}
function updateWindDisplay(wind, id) {
  let windField = document.querySelector(`#${id}`);
  let windDirection = translateWindDirection(wind.deg);
  let windSpeed = Math.round(wind.speed);
  let windDesc = `${windDirection}&nbsp;${windSpeed}&nbsp;${windSpeedUnits[currentUnit]}`;
  windField.innerHTML = windDesc;
}
function updateDisplays() {
  updateTempDisplay(currentTempStore, "current-temp");
  updateIconDisplay(currentWeatherStore, "current-icon");
  updateWeatherDisplay(currentWeatherStore, "current-weather");
  updateTempDisplay(feelsTempStore, "current-feels");
  for (let day = 0; day < forecastDays; day++) {
    updateTempDisplay(forecastTempStores[day].temp, `forecast-temp-${day}`);
    updateIconDisplay(forecastTempStores[day].weather, `forecast-icon-${day}`);
  }
}

let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}`;
function handleWeather(weather) {
  //  debugger;
  updateTempDisplay(weather.data.main.temp, "current-temp");
  updateTempDisplay(weather.data.main.feels_like, "current-feels");
  updateWeatherDisplay(weather.data.weather[0].description, "current-weather");
  updateIconDisplay(weather.data.weather[0].icon, "current-icon");
  updateLocationDisplay(
    weather.data.name,
    weather.data.sys.country,
    "current-location"
  );
  updateHumidityDisplay(weather.data.main.humidity, "current_humidity");
  updateWindDisplay(weather.data.wind, "current-winds");
}

function getWeather(extraData) {
  let url = `${weatherUrl}`;
  let units = "";
  if (weatherUnits[currentUnit]) {
    units = `&units=${weatherUnits[currentUnit]}`;
  }
  lastWeatherQuery = extraData;
  url = url + units + "&" + extraData;
  axios.get(url).then(handleWeather);
}

function handlePosition(position) {
  let weatherData = `lat=${position.coords.latitude}&lon=${position.coords.longitude}`;
  getWeather(weatherData);
}

function handleCitySearch(event) {
  event.preventDefault();
  if (event.submitter.id === "search-request") {
    // debugger;
    let city = document.querySelector("#city-field");
    let currentLocation = document.querySelector("#current-location");
    if (!city.value) {
      alert("I can't search on an empty city");
    } else {
      let weatherData = `q=${city.value}`;
      getWeather(weatherData);
    }
  } else if (event.submitter.id === "local-request") {
    navigator.geolocation.getCurrentPosition(handlePosition);
  }
}

function updateChangeButtons() {
  for (let unit in displayUnits) {
    let button = document.querySelector(`#unit-change-${unit}`);
    if (unit === currentUnit) {
      button.className = "btn btn-secondary";
    } else {
      button.className = "btn btn-info";
    }
  }
}
function handleUnitChange(event) {
  //debugger;
  let whichButton = event.target;
  let unit = whichButton.id;
  unit = unit.replace("unit-change-", "");
  currentUnit = unit;

  getWeather(lastWeatherQuery);
  updateChangeButtons();
}
// Let's kick the world off.
updateChangeButtons();
getWeather("q=Sydney,au");
//navigator.geolocation.getCurrentPosition(handlePosition);
//  Current day/time
let currentDateTime = document.querySelector("#current-datetime");
currentDateTime.innerHTML = simpleDate(new Date());

let citySearch = document.querySelector("#city-search");
citySearch.addEventListener("submit", handleCitySearch);

let unitChangeC = document.querySelector("#unit-change-C");
unitChangeC.addEventListener("click", handleUnitChange);
let unitChangeF = document.querySelector("#unit-change-F");
unitChangeF.addEventListener("click", handleUnitChange);
let unitChangeK = document.querySelector("#unit-change-K");
unitChangeK.addEventListener("click", handleUnitChange);
