const API_KEY = "cbc16625cf1d4c162797052ebd9c2095";
const WEATHER_URL = "https://api.openweathermap.org";
const FIVE_DAY_FORECAST_PATH = "/data/2.5/forecast?";
const CURRENT_WEATHER_PATH = "/data/2.5/weather?"
const GEOCODE_PATH = "/geo/1.0/direct?"
const SEARCH_HISTORY_KEY = "search-history"
const searchHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || []
const searchHistoryDiv = document.querySelector("#search-history")
const searchBtn = document.querySelector("#search-btn");

//this function gets the coordinates
function fetchCityCoordinates(cityName) {
    return fetch(`${WEATHER_URL}${GEOCODE_PATH}q=${cityName}&appid=${API_KEY}`) //this is the url
        .then(response => response.json()) //takes the response and turns it to json
        .then(data => data) //gets the lat and lon from the response
}

//this function get the value from the input when they click on button
function handleSearch(event) {
    if (event.target.tagName === "BUTTON") { //this makes sure they clicked on the html tag button
        const cityInput = document.querySelector("#city-input"); //this where the value lives
        if (!cityInput.value) {
            return alert('Please insert a valid city')
        }
        fetchCityCoordinates(cityInput.value) //this puts the value into the fetchCityCoordinates function
            .then((coordinates) => { //once we've got the coordinates and do the next thing
                if (Array.isArray(coordinates)) {
                    fetchWeather(coordinates[0].lat, coordinates[0].lon, coordinates[0].name)
                    saveToSearchHistory(coordinates[0])
                }
            })
    }
}

//this gets the hourly forecast
function fetchHourlyForecast(lat, lon) { //we pass in the lat and lon to get the weather for said city
    return fetch(`${WEATHER_URL}${FIVE_DAY_FORECAST_PATH}lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`)
        .then(response => response.json()) 
        .then(data => data);
}

function getFiveDayForecast(hourlyForecast) {
    const fiveDayForecast = []
    for (let i = 0; i < hourlyForecast.length; i++) {
        if (fiveDayForecast.length === 5) {
            break;
        }
        const forecastObj = hourlyForecast[i]
        const currForecastDate = new Date(forecastObj.dt_txt)
        const forecastExists = fiveDayForecast.some((forecast) => {
            return new Date(forecast.dt_txt).toDateString() === currForecastDate.toDateString()
        })

        if (fiveDayForecast.length < 5 && !forecastExists) {
            fiveDayForecast.push(forecastObj)
        }
    }

    return fiveDayForecast
}

function fetchCurrentWeather(lat, lon) {
    return fetch(`${WEATHER_URL}${CURRENT_WEATHER_PATH}lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`)
        .then(response => response.json()) 
        .then(data => data);
}

function renderCurrentWeather(weatherObj, cityName) {
    const temp = document.querySelector("#temp")
    const wind = document.querySelector("#wind")
    const humidity = document.querySelector("#humidity")
    const city = document.querySelector("#city")
    const icon = document.querySelector("#icon")
    const date = document.querySelector("#date")
    temp.innerText = `Temp: ${weatherObj.main.temp} °F`
    wind.innerText = `Wind: ${weatherObj.wind.speed} MPH`
    humidity.innerText = `Humidity: ${weatherObj.main.humidity} %`
    city.innerText = `${cityName}`
    icon.src = getWeatherIcon(weatherObj.weather[0].icon)
    date.innerText = `${new Date().toDateString()}`
}

function getWeatherIcon(iconPath) {
    return `http://openweathermap.org/img/w/${iconPath}.png`
}

function renderFiveDayForecast(fiveDayForecastList) {
    const fiveDay = document.querySelector("#five-day")
    fiveDay.innerHTML = ""
    fiveDayForecastList.forEach(forecast => {
        const forecastDiv = `
            <div class="fivecast">
                <h4 id="date-five"> ${new Date(forecast.dt_txt).toDateString()} </h4>
                <img src="${getWeatherIcon(forecast.weather[0].icon)}" alt="Weather Icon">
                <section class="content-five">
                    <p id="temp-five"> Temp: ${forecast.main.temp} °F </p>
                    <p id="wind-five"> Wind: ${forecast.wind.speed} MPH </p>
                    <p id="humidity-five"> Humidity: ${forecast.main.humidity} % </p>
                </section>
            </div>
        `
        fiveDay.innerHTML += forecastDiv
    })
}

function fetchWeather(lat, lon, cityName) {
    searchBtn.disabled = true;
    fetchCurrentWeather(lat, lon)
        .then(currentWeather => {
            renderCurrentWeather(currentWeather, cityName)
        })
    fetchHourlyForecast(lat, lon) //putting the coordinates into fetchFiveDayForecast function
        .then(hourlyForecast => { 
            const fiveDayForecast = getFiveDayForecast(hourlyForecast.list)//once we get the hourly forecast we're gonna put it into the getFiveDayForecast function
            renderFiveDayForecast(fiveDayForecast)
            searchBtn.disabled = false;
        })
}

function renderSearchHistory(searchHistoryList) {
    searchHistoryDiv.innerHTML = ""
    for (let i = 0; i < searchHistoryList.length; i++) {
        const cityObj = searchHistoryList[i]
        searchHistoryDiv.innerHTML += createCityTag(cityObj.name, cityObj.lat, cityObj.lon)
    }
}

function createCityTag(cityName, lat, lon) {
    return `
    <p data-lat="${lat}" data-lon="${lon}" class="city-name">${cityName}</p>
    `
}

function saveToSearchHistory(coordinates) {
    const city = {name: coordinates.name, lat: coordinates.lat, lon: coordinates.lon}
    searchHistory.unshift(city)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory))
    renderSearchHistory(searchHistory)
}

function handleOnCityClick(event) {
    if (event.target.className === "city-name") {
        const lat = event.target.dataset.lat
        const lon = event.target.dataset.lon
        const cityName = event.target.innerText
        fetchWeather(lat, lon, cityName)
    }
}

window.addEventListener('DOMContentLoaded', (event) => {
    const searchSection = document.querySelector(".search-engine");
    const clearHistory = document.querySelector("#clear-history")
    searchSection.addEventListener("click", handleSearch);
    searchHistoryDiv.addEventListener("click", handleOnCityClick)
    clearHistory.addEventListener("click", () => {
        localStorage.setItem(SEARCH_HISTORY_KEY, null)
        renderSearchHistory([])
    })
    renderSearchHistory(searchHistory)
});