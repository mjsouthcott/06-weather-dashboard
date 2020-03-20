// Define and initialize variables
let $citySearchButton = $('#city-search-btn')
let $citySearchInput = $('#city-search-input')
let $citySearchHistory = $('#city-search-history')
let $currentWeather = $('#current-weather')
let citySearchHistoryArray

// Check if `citySearchHistory` exists in localStorage. If no, initialize and set it; if yes, get it
if (!window.localStorage.getItem('citySearchHistoryArray')) {
    citySearchHistoryArray = []
    window.localStorage.setItem('citySearchHistoryArray', JSON.stringify(citySearchHistoryArray))
} else {
    citySearchHistoryArray = JSON.parse(window.localStorage.getItem('citySearchHistoryArray'))
}

// Define function to properly format name character cases
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

// Define function to display city search history in left aside
function displayCitySearchHistory (citySearchHistoryArray) {
    // Remove all child nodes and content from aside
    $citySearchHistory.empty()

    // Iterate over `citySearchHistoryArray` to display info
    for (let i = 0; i < citySearchHistoryArray.length; i++) {
        let $city = $(`<li class="list-group-item">${citySearchHistoryArray[i]}</li>`)
        $citySearchHistory.append($city)
    }
}

// TODO
// Define function to display forecast in content box
function displayForecast(city) {
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=970722c9c17b1555897b1f01e3ca49fb`,
        method: "GET"
    }).then(function(response) {
        let cityName = response.city.name
        $('#current-weather .city-name').text(cityName)

        let temperatureF = ((response.list[0].main.temp - 273.15) * (9 / 5) + 32).toFixed(1) + ' °F'
        $('#current-weather .temperature').text('Temperature: ' + temperatureF)

        let humidity = response.list[0].main.humidity + '%'
        $('#current-weather .humidity').text('Humidity: ' + humidity)

        let windSpeed = response.list[0].wind.speed + " MPH"
        $('#current-weather .wind-speed').text('Wind Speed: ' + windSpeed)

        return response.city.coord
    /*}).then(function(coord) {
        let UVIndex = response.list[0].main

        $UVIndexCardBodyContent = $(`<p class="card-text">UV Index: <span class="badge badge-danger">${UVIndex}</span>`)

        $currentWeather.append()*/
    })
}

// Call `displayCitySearchHistory` to display history on first page visit or page refresh
displayCitySearchHistory(citySearchHistoryArray)

// Add `click` event handler to city search button
$citySearchButton.on('click', function(event) {
    // Prevent default behaviour
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
        displayForecast(city)
    }  
})

// Add `click` event handler to cities
$citySearchHistory.on('click', '.list-group-item', function() {
    displayForecast($(this).text())
})