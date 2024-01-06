// Declaring global variables needed 
var uniqueAPIkey = "f9bc46eb053c2b8f4fbf88f93fc11976";
var cityHistory = document.querySelector(".city-search");
var city = document.getElementById("chosenCity");
var countryCode = document.getElementById("chosenCountry");
var fiveDayForecast = document.getElementById("cards")
var enteredCity;
var enteredCountryCode;
var forecastCity;

// Function to call the API, using backticks to dynamically substitute in the values of city and country
function callApi(city, country) { 
    var requestEndpoint = `https://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&appid=${uniqueAPIkey}`;

    fetch(requestEndpoint)
    .then(function (response) {
        return response.json();
    }) // Takes the latitude and longitude of given city and substitute values into the forecast URL variable
    .then(function (data) {
        var latitude = data[0].lat;
        var longitude = data[0].lon;
        
        var forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${uniqueAPIkey}`;
        
        getForecast(forecastURL);
    }) 
    .catch(function (error) {
        // Handles TypeError
        if (error instanceof TypeError) {
            alert('Please enter a valid city or ISO 3166 country code.');
        }
    });
}

function getForecast(URL) {

    fetch(URL)
        .then(function (response) {
            return response.json();
        })  // Organizes returned data to only include data points that include 12:00:00, meaning mid day of that day to filter data down
        .then(function (totalForecastData) {
            var forecastData = totalForecastData.list.filter(x => x.dt_txt.includes("12:00:00"));

            var cityName;
            var cityDate;
            var weatherId;    

            for (var i = 0; i < forecastData.length-1; i++) {
                cityName = totalForecastData.city.name;
                cityDate = forecastData[i].dt_txt.split(' ')[0];
                weatherId = forecastData[i].weather[0].id;   
            }
            appendData(cityName, cityDate, forecastData);
        });
}

// Uses the returned weather ID from the API to dynamically and conditionally set the iconImage.src icon, roughly following the documentation guidelines for appropriate images
function setIconImageSource(iconImage, weatherId) {
    var baseUrl = "./assets/images/";

    if (weatherId >= 200 && weatherId < 300) {
        // Thunderstorm 
        iconImage.src = baseUrl + 'thunderstorm.png';
    } else if (weatherId >= 300 && weatherId < 500) {
        // Drizzle
        iconImage.src = baseUrl + 'drizzle.png';
    } else if (weatherId >= 500 && weatherId < 600) {
        // Rain
        iconImage.src = baseUrl + 'rain.png';
    } else if (weatherId >= 600 && weatherId < 700) {
        // Snow
        iconImage.src = baseUrl + 'snow.png';
    } else if (weatherId >= 700 && weatherId < 800) {
        // Atmosphere (fog, mist, etc.)
        iconImage.src = baseUrl + 'atmosphere.png';
    } else if (weatherId === 800) {
        // Clear sky 
        iconImage.src = baseUrl + 'clear-sky.png';
    } else if (weatherId > 800 && weatherId < 900) {
        // Cloudy
        iconImage.src = baseUrl + 'cloudy.png';
    }
}

// Appends data to the respective div dynamically
function appendData(cityName, cityDate, forecastData) {
    
    var cityInformation = document.querySelector(".city-information");
    
    cityInformation.innerHTML = '';

// Creates a loop to iterate through the filtered forecast data, which now only has 5 data points as opposed to 40, setting the image source to reflect that of the returned weather ID
    for (i = 0; i < forecastData.length; i++) {
        var iconImage = document.createElement("img");
        iconImage.alt = 'Weather Icon';
        setIconImageSource(iconImage, forecastData[i].weather[0].id);
        // Splits the string into an array using each instance of a space as the reference point, taking the first part of the string of dx_txt, which gives the date exclusively
        var cityDate = forecastData[i].dt_txt.split(' ')[0];
        // Creates a div to fit the dynamically generated elements to come
        var innerDiv = document.createElement("div");
        cityInformation.appendChild(innerDiv);
        // Returns the temperature from Kelvin to Celsius
        var temperatureInCelsius = forecastData[i].main.temp - 273.15;
        // Appends elemnts to the innerDiv, including the necessary data points and the associated calculations
        innerDiv.appendChild(document.createElement('h3')).textContent = cityName;
        innerDiv.appendChild(document.createElement('h3')).textContent = cityDate;
        innerDiv.appendChild(document.createElement('br'));
        innerDiv.appendChild(document.createTextNode('Temperature: ' + temperatureInCelsius.toFixed(2) + '°C, '));
        innerDiv.appendChild(document.createElement('br'));
        innerDiv.appendChild(document.createTextNode('Wind Speed: ' + forecastData[i].wind.speed + ' m/s, '));
        innerDiv.appendChild(document.createElement('br'));
        innerDiv.appendChild(document.createTextNode('Humidity: ' + forecastData[i].main.humidity + '%'));
        innerDiv.appendChild(document.createElement('br'));
        innerDiv.appendChild(iconImage);
    }

    var cityHistory = document.querySelector(".city-search");

    // Checks to see if a button with the same name already exists, if not create a Bootstrap button and set a data attribute to identify said button
    if (!cityHistory.querySelector('button[data-city="' + cityName + '"]')) {
        var button = document.createElement('button');
        button.textContent = cityName;
        button.classList.add('btn', 'btn-outline-success'); 
        button.setAttribute('data-city', cityName);
        button.setAttribute('data-country', enteredCountryCode);
        cityHistory.appendChild(button);
        button.style.marginLeft = '20px';
        // Local storage mechanism
        var cityCountryData = JSON.parse(localStorage.getItem("cityCountryData")) || {};
        cityCountryData[cityName] = enteredCountryCode;
        localStorage.setItem("cityCountryData", JSON.stringify(cityCountryData));

        button.addEventListener('click', function (event) {
            var clickedCityName = event.target.getAttribute('data-city');
            var clickedCountryCode = event.target.getAttribute('data-country');
            callApi(clickedCityName, clickedCountryCode);
        });
    }
}

// Alert if no values given, if value was given, use those given values to call the API.
document.querySelector(".search-bar").addEventListener("submit", function(event) {
    event.preventDefault();

    enteredCity = city.value;
    enteredCountryCode = countryCode.value;

    if (!enteredCity || !enteredCountryCode) {
        alert("Please enter a city name or country code.");
    } else {
        callApi(enteredCity, enteredCountryCode);
    }
}); 

// Clears input fields on page load 
window.addEventListener('load', function() {
    
    enteredCity = city.value;
    enteredCountryCode = countryCode.value;

    city.value = "";
    countryCode.value = "";
// Loads the storage data upon page load so it persists 
    var cityCountryData = JSON.parse(localStorage.getItem("cityCountryData")) || {};
    for (var cityName in cityCountryData) {
        var country = cityCountryData[cityName];

        var button = document.createElement('button');
        button.textContent = cityName;
        button.classList.add('btn', 'btn-outline-success');
        button.setAttribute('data-city', cityName);
        button.setAttribute('data-country', country);
        cityHistory.appendChild(button);
        button.style.marginLeft = '20px';

        button.addEventListener('click', function (event) {
            var clickedCityName = event.target.getAttribute('data-city');
            var clickedCountryCode = event.target.getAttribute('data-country');
            callApi(clickedCityName, clickedCountryCode);
        });
    }

    var clearBtn = document.querySelector('.search-bar .btn-secondary');
    clearBtn.addEventListener('click', function () {
        // Clear the dynamically generated buttons in the search-history div
        var cityHistory = document.querySelector('.search-history');
        var dynamicallyGeneratedButtons = cityHistory.querySelectorAll('button[data-city]');
        
        dynamicallyGeneratedButtons.forEach(function(button) {
            button.remove();
        });

        // Clear the data from local storage
        localStorage.removeItem('cityCountryData');

        // Reloads the page which gives a blank slate for user to work with again
        location.reload();
    });
});

