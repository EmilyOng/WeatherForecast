const INPUT_ERROR = "Error processing inputs!";
const API_KEY = "6fa15815d560d199f7eb72b39925a1b1";

function setUpForecast (data) {
  var weatherList = data.list;
  var temperatureTrace = {x: [], y: [], mode: "lines+markers", name: "Temperature"};
  var minTemperatureTrace = {x: [], y: [], mode: "lines+markers", name: "Min Temperature"};
  var maxTemperatureTrace = {x: [], y: [], mode: "lines+markers", name: "Max Temperature"};
  var feelsLikeTrace = {x: [], y: [], mode: "lines+markers", name: "Feels like"};
  var infoTable = "<ul class='list-group' style='width:80%;'>\
                    <li class='list-group-item disabled' id='forecastSunrise'></li>\
                    <li class='list-group-item' id='forecastSunset'></li>\
                  </ul><br/>"
  infoTable += "<table class='table table-bordered'>"
  infoTable += "<tr>\
                  <th>Date & Time</th>\
                  <th>Humidity (%)</th>\
                  <th>Weather</th>\
                  <th>Wind Degree (&deg;)</th>\
                  <th>Wind Speed (km/h)</th>\
                </tr>"


  for (var i=0; i<weatherList.length; i++) {
    temperatureTrace.y.push(weatherList[i].main.temp);
    temperatureTrace.x.push(weatherList[i].dt_txt);

    minTemperatureTrace.y.push(weatherList[i].main.temp_min);
    minTemperatureTrace.x.push(weatherList[i].dt_txt);

    maxTemperatureTrace.y.push(weatherList[i].main.temp_max);
    maxTemperatureTrace.x.push(weatherList[i].dt_txt);

    feelsLikeTrace.y.push(weatherList[i].main.feels_like);
    feelsLikeTrace.x.push(weatherList[i].dt_txt);

    infoTable += "<tr>\
                    <td>"+weatherList[i].dt_txt+"</td>\
                    <td>"+weatherList[i].main.humidity+"</td>\
                    <td>"+weatherList[i].weather[0].main+"<br/>"+weatherList[i].weather[0].description+"</td>\
                    <td>"+weatherList[i].wind.deg+"</td>\
                    <td>"+weatherList[i].wind.speed+"</td>\
                  </tr>"
  }
  infoTable.innerHTML += "</table>";
  document.getElementById("infoArea").innerHTML = infoTable;
  document.getElementById("forecastSunrise").textContent = "Sunrise: " + new Date(parseInt(data.city.sunrise) * 1000);
  document.getElementById("forecastSunset").textContent = "Sunset: " + new Date(parseInt(data.city.sunset) * 1000);
  var plotter = [temperatureTrace, minTemperatureTrace, maxTemperatureTrace, feelsLikeTrace];
  var layout = {title: "Weather Forecast (Temperature)"};
  Plotly.newPlot("plotArea", plotter, layout);
}

function setTemperatureTable () {
  var minTemperature = document.getElementById("minTemperature");
  minTemperature.textContent = minTemperature.getAttribute("data-temp") + minTemperature.getAttribute("data-unit");
  var temperature = document.getElementById("temperature");
  temperature.textContent = temperature.getAttribute("data-temp") + temperature.getAttribute("data-unit");
  var maxTemperature = document.getElementById("maxTemperature");
  maxTemperature.textContent = maxTemperature.getAttribute("data-temp") + maxTemperature.getAttribute("data-unit");
  var feelsLike = document.getElementById("feelsLike");
  feelsLike.textContent = feelsLike.getAttribute("data-temp") + feelsLike.getAttribute("data-unit");
}

function c2k (celcius) {
  // celcius to Kelvin converter
  return Math.round((parseFloat(celcius) + 273.15) * 10) / 10;
}


function k2c (Kelvin) {
  // Kelvin to celcius converter
  return Math.round((parseFloat(Kelvin) - 273.15) * 10) / 10;
}


function converter () {
  // Check current units
  var minTemperature = document.getElementById("minTemperature");
  var temperature = document.getElementById("temperature");
  var maxTemperature = document.getElementById("maxTemperature");
  var feelsLike = document.getElementById("feelsLike");
  if (minTemperature.getAttribute("data-unit") == "K") {
    minTemperature.setAttribute("data-temp", k2c(minTemperature.getAttribute("data-temp")));
    minTemperature.setAttribute("data-unit", "C");
    temperature.setAttribute("data-temp", k2c(temperature.getAttribute("data-temp")));
    temperature.setAttribute("data-unit", "C");
    maxTemperature.setAttribute("data-temp", k2c(maxTemperature.getAttribute("data-temp")));
    maxTemperature.setAttribute("data-unit", "C");
    feelsLike.setAttribute("data-temp", k2c(feelsLike.getAttribute("data-temp")));
    feelsLike.setAttribute("data-unit", "C");
  }
  else{
    minTemperature.setAttribute("data-temp", c2k(minTemperature.getAttribute("data-temp")));
    minTemperature.setAttribute("data-unit", "K");
    temperature.setAttribute("data-temp", c2k(temperature.getAttribute("data-temp")));
    temperature.setAttribute("data-unit", "K");
    maxTemperature.setAttribute("data-temp", c2k(maxTemperature.getAttribute("data-temp")));
    maxTemperature.setAttribute("data-unit", "K");
    feelsLike.setAttribute("data-temp", c2k(feelsLike.getAttribute("data-temp")));
    feelsLike.setAttribute("data-unit", "K");
  }
  setTemperatureTable();
}



function getWeatherData (latitude, longitude) {
  document.getElementById("errorMsg").innerHTML = "";
  document.getElementById("errorMsg").style.visibility = "hidden";
  var request = new XMLHttpRequest();
  request.open("GET", "https://api.openweathermap.org/data/2.5/weather?lat="+latitude+"&lon="+longitude+"&APPID="+API_KEY, true);
  // Weather data like current temperature, wind, rainfall, sunrise and sunset time need to be displayed
  request.onload = function() {
    var data = JSON.parse(this.response);
    var dataInformation = {"Temperature": data.main.temp,
                          "Max Temperature": data.main.temp_max,
                          "Min Temperature": data.main.temp_min,
                          "Feels like": data.main.feels_like,
                          "Humidity": data.main.humidity,
                          "Sunset": data.sys.sunset,
                          "Sunrise": data.sys.sunrise,
                          "Wind Degree": data.wind.deg,
                          "Wind Speed": data.wind.speed,
                          "Weather": data.weather[0].main,
                          "Weather Description": data.weather[0].description};
    var weatherInformation = document.getElementById("weatherInformation");
    weatherInformation.innerHTML = "";
    // Set temperature
    var weatherTable = document.createElement("table");
    var temperatureTableHTML = "<table class='table table-bordered' style='width:80%;'>\
                              <tr>\
                                <th><i class='fa fa-5x fa-thermometer-empty' aria-hidden='true'></i></th>\
                                <th>Min temperature</th>\
                                <th>Temperature</th>\
                                <th>Max temperature</th>\
                                <th>Feels like</th>\
                              </tr>\
                              <tr>\
                                <td><button class='btn btn-primary' style='width:100%' onclick='converter()'>Convert the units</button></td>\
                                <td data-unit='K' id='minTemperature'></td>\
                                <td data-unit='K' id='temperature'></td>\
                                <td data-unit='K' id='maxTemperature'></td>\
                                <td data-unit='K' id='feelsLike'></td>\
                              </tr>\
                            </table>";
    var subTableHTML = "<table class='table table-bordered' style='width:80%;'>\
                          <tr>\
                            <th><i class='fa fa-5x fa-sun-o' aria-hidden='true'></i></th>\
                            <th>Humidity</th>\
                            <th>Sunset</th>\
                            <th>Sunrise</th>\
                            <th>Wind Degree</th>\
                            <th>Wind Speed</th>\
                          </tr>\
                          <tr>\
                            <td></td>\
                            <td id='humidity'></td>\
                            <td id='sunset'></td>\
                            <td id='sunrise'></td>\
                            <td id='windDegree'></td>\
                            <td id='windSpeed'></td>\
                          </tr>\
                        </table>";

    try {
      var weatherTableHTML = "<ul class='list-group' style='width:80%;'>\
                                <li class='list-group-item disabled' id='weather'></li>\
                                <li class='list-group-item' id='weatherDescription'></li>\
                              </ul><br/>"

      weatherInformation.innerHTML += weatherTableHTML;
      document.getElementById("weather").textContent = dataInformation["Weather"];
      document.getElementById("weatherDescription").textContent = dataInformation["Weather Description"];
    }
    catch (e) {}
    weatherInformation.innerHTML += temperatureTableHTML;
    weatherInformation.innerHTML += subTableHTML;

    // Temperature table
    var minTemperature = document.getElementById("minTemperature");
    minTemperature.setAttribute("data-temp", parseFloat(dataInformation["Min Temperature"]));
    var temperature = document.getElementById("temperature");
    temperature.setAttribute("data-temp", dataInformation["Temperature"]);
    var maxTemperature = document.getElementById("maxTemperature");
    maxTemperature.setAttribute("data-temp", dataInformation["Max Temperature"]);
    var feelsLike = document.getElementById("feelsLike");
    feelsLike.setAttribute("data-temp", dataInformation["Feels like"]);

    setTemperatureTable();

    // Humidity, sunset, sunrise, wind degree, wind speed
    document.getElementById("humidity").textContent = dataInformation["Humidity"]+"%";
    document.getElementById("sunset").textContent = new Date(parseInt(dataInformation["Sunset"]) * 1000);
    document.getElementById("sunrise").textContent = new Date(parseInt(dataInformation["Sunrise"]) * 1000);
    document.getElementById("windDegree").innerHTML = dataInformation["Wind Degree"]+	"&deg";
    document.getElementById("windSpeed").textContent = dataInformation["Wind Speed"]+"km/h";

  }
  request.send();
  var request = new XMLHttpRequest();
  request.open("GET", "https://api.openweathermap.org/data/2.5/forecast?lat="+latitude+"&lon="+longitude+"&APPID="+API_KEY, true);
  request.onload = function() {
    var data = JSON.parse(this.response);
    setUpForecast(data);
  }
  request.send();
}


function generateMap (pos) {
  var latitude = pos.latitude;
  var longitude = pos.longitude;
  var altitude = pos.altitude;
  var streetMapContainer = document.getElementById("streetMapContainer");
  streetMapContainer.removeChild(streetMapContainer.childNodes[0]);
  var mapChild = document.createElement("div");
  mapChild.setAttribute("id", "streetMap");
  mapChild.setAttribute("style", "height:180px;");
  streetMapContainer.appendChild(mapChild);
  // Create street map
  var streetMap = L.map("streetMap").setView([latitude, longitude], 13);
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    maxZoom: 13,
    id: "mapbox/streets-v11",
    accessToken: "pk.eyJ1IjoiZW9ocSIsImEiOiJjazViM2NuNnIxNnFuM2ZvM2ZlMGlkNTRrIn0.rwD8ADA7qb2rckvNqlyw5w"
  }).addTo(streetMap);
  var marker = L.marker([latitude, longitude]).addTo(streetMap);
  // Add location information
  var locationInformation = document.getElementById("locationInformation");
  locationInformation.innerHTML = "<table class='table table-striped' style='width:80%;'>\
                                      <tr>\
                                        <th>Latitude</th>\
                                        <td id='latitude'></td>\
                                      </tr>\
                                      <tr>\
                                        <th>Longitude</th>\
                                        <td id='longitude'></td>\
                                      </tr>\
                                      <tr>\
                                        <th>Altitude</th>\
                                        <td id='altitude'></td>\
                                      </tr>\
                                    </table>\
                                  </br/>";
    document.getElementById("latitude").textContent += latitude;
    document.getElementById("longitude").textContent += longitude;
    document.getElementById("altitude").textContent += altitude;
    getWeatherData(latitude, longitude);
}


function getUserLocation () {
  function success (pos) {
    generateMap(pos.coords);
  }
  function error (err) {
    console.log(err, "Error getting current location.");
  }
  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }
  navigator.geolocation.getCurrentPosition(success, error, options);
}


function processGeolocation () {
  var form = document.forms.namedItem("getGeolocation");
  try {
    var latitude = parseFloat(form.elements.namedItem("inputLatitude").value);
    var longitude = parseFloat(form.elements.namedItem("inputLongitude").value);
    var pos = {"latitude": latitude,
              "longitude": longitude,
              "altitude": ""};
    generateMap(pos);
  }
  catch (e) {
    document.getElementById("errorMsg").style.visibility = "visible";
    document.getElementById("errorMsg").innerHTML = INPUT_ERROR;
    document.getElementById("errorMsg").innerHTML += " Expected numbers (either integer or float) for geolocation."
  }
  event.preventDefault();
}


function processCity () {
  var form = document.forms.namedItem("getCity");
  var city = form.elements.namedItem("inputCity").value;

  var request = new XMLHttpRequest();
  request.open("GET", "https://api.openweathermap.org/data/2.5/weather?q="+city+"&APPID="+API_KEY, true);
  request.onload = function() {
    var data = JSON.parse(this.response);
    if (data.coord != undefined) {
      var pos = {"latitude": data.coord.lat,
                "longitude": data.coord.lon,
                "altitude": ""};
      generateMap(pos);
    }
    else {
      document.getElementById("errorMsg").style.visibility = "visible";
      document.getElementById("errorMsg").innerHTML = INPUT_ERROR;
      document.getElementById("errorMsg").innerHTML += " Expected a valid city name."
    }
  }
  request.send();
  event.preventDefault();
}

// Main program
window.addEventListener("load", function () {
  getUserLocation();
}, false);
