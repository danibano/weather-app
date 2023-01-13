const API_KEY = "cbc16625cf1d4c162797052ebd9c2095";
const WEATHER_URL = "https://api.openweathermap.org";
const FIVE_DAY_FORECAST_PATH = "/data/2.5/forecast?";
const CURRENT_WEATHER_PATH = "/data/2.5/weather?"
const GEOCODE_PATH = "/geo/1.0/direct?"

function fetchCityCoordinates(cityName) {
    return fetch(`${WEATHER_URL}${GEOCODE_PATH}q=${cityName}&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => data)
}

function handleSearch(event) {
    if (event.target.tagName === "BUTTON") {
        const cityInput = document.querySelector("#city-input");
        fetchCityCoordinates(cityInput.value)
            .then(coordinates => {
                fetchFiveDayForecast(coordinates[0].lat, coordinates[0].lon)
            })
    }
}

function fetchFiveDayForecast(lat, lon) {
    fetch(`${WEATHER_URL}${FIVE_DAY_FORECAST_PATH}lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`)
        .then(response => response.json())
        .then(data => console.log(data))
}

window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    const searchSection = document.querySelector(".search-engine");
    searchSection.addEventListener("click", handleSearch);
});