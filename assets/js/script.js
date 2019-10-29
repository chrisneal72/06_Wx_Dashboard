var apiKey = "dbf364bc39a4580a03a0dd92d999aa37";
var currentWxQueryURL = "";
var currentUVQueryURL = "";
var $currentCityDisplay = $("#current-city-display");
var $currentDateDisplay = $("#current-date-display");
var $currentLocalTimeDisplay = $("#current-local-time-display");
var $currentTempDisplay = $("#current-temp-display");
var $currentHumidityDisplay = $("#current-humidity-display");
var $currentWindDisplay = $("#current-wind-display");
var $currentUvDisplay = $("#current-uv-display");
var storedCityList = JSON.parse(localStorage.getItem("city-list"));
if (!storedCityList) { storedCityList = [] }
var $wxIcon = $("#wx-icon");
var $searchSaveDiv = $("#search-saves");
var fromLandingPage = 1;

function getWx() {

    $.ajax({
        url: currentWxQueryURL,
        method: "GET"
    }).then(function (response) {
        //UPDATING THE CURRENT WEATHER FOR THE CURRENT CITY
        $currentCityDisplay.text(response.name);
        $currentDateDisplay.text(moment.unix(response.dt).format("M/D/YYYY"));
        $currentLocalTimeDisplay.text(moment.unix(response.dt + response.timezone).utc().format("h:mm a"));
        $currentTempDisplay.text(response.main.temp.toFixed(1));
        $currentHumidityDisplay.text(response.main.humidity);
        $currentWindDisplay.text(response.wind.speed);
        $wxIcon.attr("src", "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png")
        searchLocation = response.name;
        
        //ADJUSTING OUR SAVE LIST IF WE DO A TEXT SEARCH OR CLICK A SAVED CITY
        if (fromLandingPage == 0) {
            //IF THE CURRENT CITY BEING PROCESSED IN IN OUT LIST WE REMOVE IT
            if ($.inArray(searchLocation, storedCityList) >= 0) {
                storedCityList = jQuery.grep(storedCityList, function (value) {
                    return value != searchLocation;
                });
            }
            //WE ADD THE CURENT CITY TO THE TOP OF THE LIST
            storedCityList.unshift(searchLocation);
            //IF OUR LIST HAS MORE THAN 5 CITIES, DROP THE LAST ONE
            while (storedCityList.length > 5) { storedCityList.pop() }
            //STORE IN LOCAL STORAGE
            localStorage.setItem("city-list", JSON.stringify(storedCityList))
        }
        //BUILD THE BUTTON LIST
        $searchSaveDiv.empty();
        for (i = 0; i < storedCityList.length; i++) {
            $searchSaveDiv.append(
                $("<button>")
                    .attr("class", "my-btn btn-info search-button")
                    .attr("value", storedCityList[i])
                    .text(storedCityList[i])
            );
        }
        //PASSING THE NAME TO THE FORCAST AS WE ARE NOT SURE IF THE SEARCH WAS A CITY NAME OR A GEOLOCATION
        //GETTING IT FROM THE RESULT ENSURES THEY MATCH
        getForecast(searchLocation);
        //UV INDEX CALL ONLY ACCEPTS LAT AND LON SO GETTING THAT FROM OUR SEARCH RESULT
        //GETTING IT FROM THE RESULT ENSURES THEY MATCH
        getUvIndex(response.coord.lat, response.coord.lon);
    });
}

function getForecast(searchLocation) {
    currentForecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + searchLocation + "&units=imperial&appid=" + apiKey;
    $.ajax({
        url: currentForecastQueryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response)
        //WE GET 40 RESULTS IN THE FORECAST I ONLY WANT 5.
        //USING THIS VAR TO TRAK THEM
        var boxCount = 1;
        var timeOffset = 12;
        var timeZone = response.city.timezone / 60 / 60
        
        //MAKE TIME OFFSET FOR THE FORECAST BE FOR MID DAY AT THE CURRENT SEARCHED LOCATION
        switch (true) {
            case timeZone <= 0 && timeZone > -3 : timeOffset = 12;
            break;
            case timeZone <= -3 && timeZone > -6 : timeOffset = 15;
            break;
            case (timeZone <= -6 && timeZone > -9) : timeOffset = 18;
            break;
            case timeZone <= -9 && timeZone > -12 : timeOffset = 21;
            break;
            case timeZone >= 0 && timeZone > 3 : timeOffset = 00;
            break;
            case timeZone >= 3 && timeZone > 6 : timeOffset = 03;
            break;
            case timeZone >= 6 && timeZone > 9 : timeOffset = 06;
            break;
            case timeZone >= 9 && timeZone > 12 : timeOffset = 09;
            break;
        }
        console.log(timeOffset);

        //LOOPING THROUGH THE RESULTS TO FIND THE 5 I WANT
        for (i = 0; i < response.list.length; i++) {
            //READING WHICH 3 HOUR FORCAST IS BEING PROCESSED
            var hourCheck = moment(response.list[i].dt_txt).format("HH");

            //ONLY PROCESSING THE RESUL IF IT IS FOR MID DAY BASED ON LOGIC ABOVE
            if (hourCheck == timeOffset) {
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
        //THIS SWITCH IS CHANGING THE UV INDEX COLOR TO THE APPROPRIATE LEVEL
        switch (true) {
            case (response.value < 3):
                $currentUvDisplay.addClass("uv-12");
                $currentUvDisplay.removeClass("uv-35");
                $currentUvDisplay.removeClass("uv-67");
                $currentUvDisplay.removeClass("uv-810");
                $currentUvDisplay.removeClass("uv-11");
                break;
            case (response.value < 6):
                $currentUvDisplay.removeClass("uv-12");
                $currentUvDisplay.addClass("uv-35");
                $currentUvDisplay.removeClass("uv-67");
                $currentUvDisplay.removeClass("uv-810");
                $currentUvDisplay.removeClass("uv-11");
                break;
            case (response.value < 8):
                $currentUvDisplay.removeClass("uv-12");
                $currentUvDisplay.removeClass("uv-35");
                $currentUvDisplay.addClass("uv-67");
                $currentUvDisplay.removeClass("uv-810");
                $currentUvDisplay.removeClass("uv-11");
                break;
            case (response.value < 11):
                $currentUvDisplay.removeClass("uv-12");
                $currentUvDisplay.removeClass("uv-35");
                $currentUvDisplay.removeClass("uv-67");
                $currentUvDisplay.addClass("uv-810");
                $currentUvDisplay.removeClass("uv-11");
                break;
            default:
                $currentUvDisplay.removeClass("uv-12");
                $currentUvDisplay.removeClass("uv-35");
                $currentUvDisplay.removeClass("uv-67");
                $currentUvDisplay.removeClass("uv-810");
                $currentUvDisplay.addClass("uv-11");
        }
    });
}

function prepSearch(searchCity) {
    //BUILDING THE SEARCH STRING FROM THE SAVED CITY BUTTON PRESS OR TEXT SEARCH
    currentWxQueryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchCity + "&units=imperial&appid=" + apiKey;
    $("#seach-input").val("");
    //IF THE LINK IS COMING FROM A REFRESH, LETTING THE CODE KNOW THIS IS NOT FROM THE LANDING PAGE
    fromLandingPage = 0;
    getWx();
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

    currentWxQueryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchCity + "&units=imperial&appid=" + apiKey;
    prepSearch(searchCity)
});

$searchSaveDiv.on("click", function (evt) {
    if (evt.target.matches("button")) {
        prepSearch(evt.target.value);
    }
});

$(document).ready(function () {
    //THIS IS WHERE THE CODE REALL STARTS, AFTER THE PAGE LOADS
    if ("geolocation" in navigator) {
        /* geolocation is available */
        //THE SEARCH STRIN IS DIFFERENT FOR LAT LON VS A CITY SEARCH
        //SETTING IT IN A GLOBAL VAR RATHER THAN TRYING TO PASS IT AND TRACE WHERE IT IS
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            currentWxQueryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + apiKey;
            //IF THE LINK IS COMING FROM A REFRESH, I DON'T WANT TO STORE IT IN SAVED SO USING THIS FLAG
            fromLandingPage = 1;
            getWx();
        })
    } else {
        //IF WE CAN NOT GET GEOLOCATION THEN WE DEFAULT TO HONOLULU
        currentWxQueryURL = "https://api.openweathermap.org/data/2.5/weather?q=Honolulu&units=imperial&appid=" + apiKey;
        //IF THE LINK IS COMING FROM A REFRESH, I DON'T WANT TO STORE IT IN SAVED SO USING THIS FLAG
        fromLandingPage = 1;
        getWx();
    }
})