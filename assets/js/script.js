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
        $currentDateDisplay.text(moment.unix(thisDate).format("M/D/YYYY"));
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
        var boxCount = 1;
        for (i=0; i < response.list.length; i++){
            var hourCheck = moment(response.list[i].dt_txt).format("HH");
            if (hourCheck == 12){
                $("#forecast-date-" + boxCount).text(moment(response.list[i].dt_txt).format("M/D/YYYY"));
                $("#wx-icon-" + boxCount).attr("src", "https://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png")
                $("#forecast-temp-" + boxCount).text(response.list[i].main.temp);
                $("#forecast-humidity-" + boxCount).text(response.list[i].main.humidity);
                boxCount++;
            }
        }
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