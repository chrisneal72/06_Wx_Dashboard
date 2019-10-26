var apiKey = "dbf364bc39a4580a03a0dd92d999aa37";
var currentUVQueryURL = "";
var $currentCityDisplay = $("#current-city-display");
var $currentDateDisplay = $("#current-date-display");
var $currentTempDisplay = $("#current-temp-display");
var $currentHumidityDisplay = $("#current-humidity-display");
var $currentWindDisplay = $("#current-wind-display");
var $currentUvDisplay = $("#current-uv-display");
var storedCityList = JSON.parse(localStorage.getItem("city-list"));
if (!storedCityList) { storedCityList = [] }
var $wxIcon = $("#wx-icon");
var $searchSaveDiv = $("#search-saves");

function getWx(searchLocation) {
    console.log(searchLocation)

    //build buttons
    //<button id="button-addon6" type="submit" class="my-btn btn-info search-button">Phoenix</button>
    $searchSaveDiv.empty();
    for (i = 0; i < storedCityList.length; i++) {
        $searchSaveDiv.append(
            $("<button>")
                .attr("class", "my-btn btn-info search-button")
                .attr("value", storedCityList[i])
                .text(storedCityList[i])
        );
    }

    currentWxQueryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchLocation + "&units=imperial&appid=" + apiKey;
    $.ajax({
        url: currentWxQueryURL,
        method: "GET"
    }).then(function (response) {
        var thisDate = response.dt;// - response.timezone;
        $currentCityDisplay.text(response.name);
        $currentDateDisplay.text(moment.unix(thisDate).format("M/D/YYYY"));
        $currentTempDisplay.text(response.main.temp.toFixed(1));
        $currentHumidityDisplay.text(response.main.humidity);
        $currentWindDisplay.text(response.wind.speed);
        $wxIcon.attr("src", "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png")
        getForecast(searchLocation);
        getUvIndex(response.coord.lat, response.coord.lon);
    });
}

function getForecast(searchLocation) {
    currentForecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + searchLocation + "&units=imperial&appid=" + apiKey;
    $.ajax({
        url: currentForecastQueryURL,
        method: "GET"
    }).then(function (response) {
        var boxCount = 1;
        for (i = 0; i < response.list.length; i++) {
            var hourCheck = moment(response.list[i].dt_txt).format("HH");
            if (hourCheck == 12) {
                $("#forecast-date-" + boxCount).text(moment(response.list[i].dt_txt).format("M/D/YYYY"));
                $("#wx-icon-" + boxCount).attr("src", "https://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png")
                $("#forecast-temp-" + boxCount).text(response.list[i].main.temp.toFixed(1));
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

function prepSearch(searchCity){
    $("#seach-input").val("");
    if ($.inArray(searchCity, storedCityList) >= 0) {
        storedCityList = jQuery.grep(storedCityList, function (value) {
            return value != searchCity;
        });
    }
    storedCityList.unshift(searchCity);
    while (storedCityList.length > 5) { storedCityList.pop() }
    localStorage.setItem("city-list", JSON.stringify(storedCityList))
    console.log(storedCityList)
    getWx(searchCity);
}

$("#wx-search-form").submit(function (event) {
    event.preventDefault();
    var searchCity = $("#seach-input").val().trim();
    if (!searchCity) {
        return false;
    }
    searchCity = searchCity.toLowerCase().replace(/\b[a-z]/g, function (txtVal) {
        return txtVal.toUpperCase();
    });
    prepSearch(searchCity)
});

$searchSaveDiv.on("click", function (evt) {
    if (evt.target.matches("button")) {
        prepSearch(evt.target.value);
    }
});

$(document).ready(function () {
    getWx("Honolulu");
})