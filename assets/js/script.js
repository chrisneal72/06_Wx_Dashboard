var apiKey = "dbf364bc39a4580a03a0dd92d999aa37";
var currentCityToSearch = "Honolulu"
var currentWxQueryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + currentCityToSearch + "&units=imperial&appid=" + apiKey;
var currentForecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + currentCityToSearch + "&units=imperial&appid=" + apiKey;
var currentUVQueryURL = "";
var $currentCityDisplay = $("#current-city-display");
var $currentDateDisplay = $("#current-date-display");
var $currentTempDisplay = $("#current-temp-display");
var $currentHumidityDisplay = $("#current-humidity-display");
var $currentWindDisplay = $("#current-wind-display");
var $currentUvDisplay = $("#current-uv-display");
var $wxIcon = $("#wx-icon");
var temp = new Date();

function getWx() {
    $.ajax({
        url: currentWxQueryURL,
        method: "GET"
    }).then(function (response) {
        var thisDate = response.dt;// - response.timezone;
        $currentCityDisplay.text(response.name);
        $currentDateDisplay.text(moment.unix(thisDate).format("DD/MM/YYYY"));
        $currentTempDisplay.text(response.main.temp);
        $currentHumidityDisplay.text(response.main.humidity);
        $currentWindDisplay.text(response.wind.speed);
        $currentUvDisplay.text(response.name);
        $wxIcon.attr("src", "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png")
        getForecast();
        getUvIndex(response.coord.lat, response.coord.lon);
    });
}

function getForecast() {
    $.ajax({
        url: currentForecastQueryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        // var thisDate = new Date(response.dt * 1000);
        // $currentCityDisplay.text(response.name);
        // $currentDateDisplay.text(thisDate.getDate() + "/" + (thisDate.getMonth() + 1) + "/" + thisDate.getFullYear());
        // $currentTempDisplay.text(response.main.temp);
        // $currentHumidityDisplay.text(response.main.humidity);
        // $currentWindDisplay.text(response.wind.speed);
        // $currentUvDisplay.text(response.name);
        // $wxIcon.attr("src", "http://openweathermap.org/img/w/" + response.weather[0].icon + ".png")
        // console.log(response.coord.lat, response.coord.lon);
        // getForecast(response.coord.lat, response.coord.lon);
        // getUvIndex(response.coord.lat, response.coord.lon);
    });
}

function getUvIndex(lat, lon) {
    currentUVQueryURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + apiKey;
    $.ajax({
        url: currentUVQueryURL,
        method: "GET"
    }).then(function (response) {
        $currentUvDisplay.text(response.value);
        switch (true) {
            case (response.value < 3):
                $currentUvDisplay.addClass("uv-12");
                break;
            case response.value < 6:
                $currentUvDisplay.addClass("uv-35");
                break;
            case response.value < 8:
                $currentUvDisplay.addClass("uv-67");
                break;
            case response.value < 11:
                $currentUvDisplay.addClass("uv-810");
                break;
            default:
                $currentUvDisplay.addClass("uv-11");
        }
    });
}

$(document).ready(function () {
    getWx();
})