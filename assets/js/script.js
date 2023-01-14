const API_KEY = "cbc16625cf1d4c162797052ebd9c2095";
const WEATHER_URL = "https://api.openweathermap.org";
const FIVE_DAY_FORECAST_PATH = "/data/2.5/forecast?";
const CURRENT_WEATHER_PATH = "/data/2.5/weather?"
const GEOCODE_PATH = "/geo/1.0/direct?"


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
        fetchCityCoordinates(cityInput.value) //this puts the value into the fetchCityCoordinates function
            .then((coordinates) => { //once we've got the coordinates and do the next thing
                fetchCurrentWeather(coordinates[0].lat, coordinates[0].lon)
                    .then(currentWeather => {
                        renderCurrentWeather(currentWeather)
                    })
                fetchHourlyForecast(coordinates[0].lat, coordinates[0].lon) //putting the coordinates into fetchFiveDayForecast function
                    .then(hourlyForecast => { 
                        const fiveDayForecast = getFiveDayForecast(hourlyForecast.list)//once we get the hourly forecast we're gonna put it into the getFiveDayForecast function
                        renderFiveDayForecast(fiveDayForecast)
                    })
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

function renderCurrentWeather(weatherObj) {
    const temp = document.querySelector("#temp")
    const wind = document.querySelector("#wind")
    const humidity = document.querySelector("#humidity")
    const city = document.querySelector("#city")
    const icon = document.querySelector("#icon")
    const date = document.querySelector("#date")
    temp.innerText = `Temp: ${weatherObj.main.temp} °F`
    wind.innerText = `Wind: ${weatherObj.wind.speed} MPH`
    humidity.innerText = `Humidity: ${weatherObj.main.humidity} %`
    city.innerText = `${weatherObj.name}`
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
            <div>
                <h4 id="date-five"> ${new Date(forecast.dt_txt).toDateString()} </h4>
                <img src="${getWeatherIcon(forecast.weather[0].icon)}" alt="Weather Icon">
                <ul>
                    <li id="temp-five"> Temp: ${forecast.main.temp} °F </li>
                    <li id="wind-five"> Wind: ${forecast.wind.speed} MPH </li>
                    <li id="humidity-five"> Humidity: ${forecast.main.humidity} % </li>
                </ul>
            </div>
        `
        fiveDay.innerHTML += forecastDiv
    })
}

window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    const searchSection = document.querySelector(".search-engine");
    searchSection.addEventListener("click", handleSearch);
});