var apiKey = "dbf364bc39a4580a03a0dd92d999aa37";
var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=Phoenix&units=imperial&appid=" + apiKey;
var $currentCityDisplay = $("#current-city-display");
var $currentDateDisplay = $("#current-date-display");
var $currentTempDisplay = $("#current-temp-display");
var $currentHumidityDisplay = $("#current-humidity-display");
var $currentWindDisplay = $("#current-wind-display");
var $currentUvDisplay = $("#current-uv-display");
var $wxIcon = $("#wx-icon");

$.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    console.log(response);
    console.log(Date(response.dt));
    $currentCityDisplay.text(response.name);
    // $currentDateDisplay.text(Date(response.dt));
    $currentTempDisplay.text(response.main.temp);
    $currentHumidityDisplay.text(response.main.humidity);
    $currentWindDisplay.text(response.wind.speed);
    $currentUvDisplay.text(response.name);
    $wxIcon.attr("src", "http://openweathermap.org/img/w/" + response.weather[0].icon + ".png")
  });