// Define and initialize variables
let $citySearchButton = $('#city-search-btn')
let $citySearchInput = $('#city-search-input')
let $citySearchHistory = $('#city-search-history')
let $currentWeather = $('#current-weather')
let citySearchHistoryArray
let apiID = '970722c9c17b1555897b1f01e3ca49fb'

// Set up localStorage. Get `citySearchHistoryArray` if it already exists
if (!window.localStorage.getItem('citySearchHistoryArray')) {
    citySearchHistoryArray = []
    window.localStorage.setItem('citySearchHistoryArray', JSON.stringify(citySearchHistoryArray))
} else {
    citySearchHistoryArray = JSON.parse(window.localStorage.getItem('citySearchHistoryArray'))
}

// Function to properly format name character cases
function formatName(string) {
    let capitalizedString = ''
    for (let i = 0; i < string.length; i++) {
        if (i === 0 || string[i - 1] === " ") {
            capitalizedString += string[i].toUpperCase()
        } else {
            capitalizedString += string[i].toLowerCase()
        }
    }
    return capitalizedString
}

// Function to display city search history in `aside` div
function displayCitySearchHistory (citySearchHistoryArray) {
    // Remove all child nodes and content after `form` div from `aside`
    $('.aside form').nextAll().remove()

    // Construct city search history list
    let citySearchHistory = `<br><div class="card"><ul class="list-group list-group-flush" id="city-search-history">`
    for (let i = 0; i < citySearchHistoryArray.length; i++) {
        citySearchHistory +=`<li class="list-group-item">${citySearchHistoryArray[i]}</li>`
    }
    citySearchHistory += `</ul></div>`

    // Append results to `aside`
    $('.aside').append($.parseHTML(citySearchHistory))
}

// Function to display current weather in `content` div
function displayCurrentWeather(city) {
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiID}`,
        method: "GET"
    }).then(function(response) {
        // Remove all child nodes and content from `content`
        $('#content').empty()

        // Initialize variables with propertoes of returned JSON object
        let name = response.name
        let date = new Date()
        let year = date.getFullYear()
        let month = date.getMonth() + 1
        if (month < 10) {
            month = '0' + month
        }
        let day = date.getDate()
        let iconCode = response.weather[0].icon
        let iconDescription = response.weather[0].description
        let temperature = (response.main.temp - 273.15).toFixed(1)
        let humidity = response.main.humidity
        let windSpeed = (response.wind.speed / 1.61).toFixed(2)

        // Construct current weather display
        let currentWeather = `<div class="card" id="current-weather"><div class="card-body">`
        currentWeather += `<h3 class="card-title city-name float-left">${name} (${day}/${month}/${year})</h3>`
        currentWeather += `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${iconDescription}">`
        currentWeather += `<p class="card-text temperature">Temperature: ${temperature} °C</p>`
        currentWeather += `<p class="card-text humidity">Humidity: ${humidity}%</p>`
        currentWeather += `<p class="card-text wind-speed">Wind Speed: ${windSpeed} km/h</p>`
        currentWeather += `<p class="card-text uv-index">UV Index: <span class="badge"></span></div></div>`
        
        // Append results to `content`
        $('#content').append($.parseHTML(currentWeather))

        // Call `displayUVIndex` with city coords
        displayUVIndex(response.coord.lat, response.coord.lon)
    })
}

// Function to add UV index to current weather display
function displayUVIndex(lat, lon) {
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/uvi?appid=${apiID}&lat=${lat}&lon=${lon}`,
        method: "GET"
    }).then(function(response) {
        $('#current-weather .uv-index .badge').text(response.value)
    
        // Set UV index badge color based on severity
        if (UVIndex <= 2) {
            $UVIndexBadge.attr('class', 'badge green')
        } else if (UVIndex <= 5) {
            $UVIndexBadge.attr('class', 'badge yellow')
        } else if (UVIndex <= 7) {
            $UVIndexBadge.attr('class', 'badge orange')
        } else if (UVIndex <= 10) {
            $UVIndexBadge.attr('class', 'badge red')
        } else {
            $UVIndexBadge.attr('class', 'badge purple')
        }
    })   
}

// Function to display 5-day forecast in `content` div
function displayFiveDayForecast(city) {
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiID}`,
        method: "GET"
    }).then(function(response) {
        // Construct 5-day forecast display
        let futureWeather = `<div id="five-day-forecast"><h4>5-Day Forecast:</h4>`
        for (let i = 0; i < response.list.length; i++) {
            // Create cards for JSON object array elements for weather conditions at 15:00 each day
            if (response.list[i].dt_txt.includes('15:00')) {
                // Initialize variables with propertoes of returned JSON object 
                let dateTime = response.list[i].dt_txt
                let year = dateTime.substr(0, 4)
                let month = dateTime.substr(5, 2)
                let day = dateTime.substr(8, 2)
                let iconCode = response.list[i].weather[0].icon
                let iconDescription = response.list[i].weather[0].description
                let temperature = (response.list[i].main.temp - 273.15).toFixed(1)
                let humidity = response.list[i].main.humidity
                
                // Construct card
                futureWeather += `<div class="card text-white bg-primary float-left" id="${i + 1}">`
                futureWeather += `<div class="card-body"><h5 class="card-title day">${day}/${month}/${year}</h5>`
                futureWeather += `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${iconDescription}">`
                futureWeather += `<p class="card-text temperature">Temp: ${temperature} °C</p>`
                futureWeather += `<p class="card-text humidity">Humidity: ${humidity}%</p></div></div>`               
            }
        }
        futureWeather += `</div>`

        // Append results to `content`
        $('#content').append($.parseHTML(futureWeather))
    })
}

// If a city was previously searched for
if (citySearchHistoryArray.length !== 0) {
    // Call `displayCitySearchHistory` to display history on first page visit or page refresh
    displayCitySearchHistory(citySearchHistoryArray)

    // Call `displayForecast` to display forecast for that city
    let lastCity = citySearchHistoryArray.slice(-1)[0]
    displayCurrentWeather(lastCity)
    displayFiveDayForecast(lastCity)
}

// Add `click` event handler to city search button
$citySearchButton.on('click', function(event) {
    event.preventDefault() 
    let city = formatName($citySearchInput.val())
    
    // If input isn't empty
    if (city !== '') {
        // If city isn't in `citySearchHistoryArray`
        if (!citySearchHistoryArray.includes(city)) {
            // Add city search value to `citySearchHistoryArray`
            citySearchHistoryArray.push(city)
        }
        // Clear input
        $citySearchInput.val('')
 
        // Call `displayCitySearchHistory` to display history
        displayCitySearchHistory(citySearchHistoryArray)
    
        // Set new `citySearchHistoryArray` in localStorage
        window.localStorage.setItem('citySearchHistoryArray', JSON.stringify(citySearchHistoryArray))
    
        // Call `displayForecast` function to display current and 5-day forecasts
        displayCurrentWeather(city)
        displayFiveDayForecast(city)
    }  
})

// Add `click` event handler to cities in search history
$('.aside').on('click', '.list-group-item', function() {
    displayCurrentWeather($(this).text())
    displayFiveDayForecast($(this).text())
})