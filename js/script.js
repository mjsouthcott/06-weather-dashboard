// Define and initialize variables
let $citySearchButton = $('#city-search-btn')
let $citySearchInput = $('#city-search-input')
let $citySearchHistory = $('#city-search-history')
let $currentWeather = $('#current-weather')
let citySearchHistoryArray
let apiID = '970722c9c17b1555897b1f01e3ca49fb'

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

// Define function to display forecast in content box
function displayForecast(city) {
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=970722c9c17b1555897b1f01e3ca49fb`,
        method: "GET"
    }).then(function(response) {
        // Set current weather
        $('#current-weather .city-name').text(response.city.name)
        $('#current-weather .temperature').text('Temperature: ' + ((response.list[0].main.temp - 273.15) * (9 / 5) + 32).toFixed(1) + ' °F')
        $('#current-weather .humidity').text('Humidity: ' + response.list[0].main.humidity + '%')
        $('#current-weather .wind-speed').text('Wind Speed: ' + response.list[0].wind.speed + " MPH")

        // Set 5-day forecast
        
        return response
    }).then(function(response) {
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/uvi?appid=${apiID}&lat=${response.city.coord.lat}&lon=${response.city.coord.lon}`,
            method: "GET"
        }).then(function(response) {
            let $UVIndexBadge = $('#current-weather .uv-index .badge')
            let UVIndex = response.value
            
            // Set UV index badge value
            $UVIndexBadge.text(UVIndex)

            // Set UV index badge color based on value
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
    })
}

// Call `displayCitySearchHistory` to display history on first page visit or page refresh
displayCitySearchHistory(citySearchHistoryArray)

// If a city was previously searched for
if (citySearchHistoryArray) {
    // Call `displayForecast` to display forecast for that city
    displayForecast(citySearchHistoryArray.slice(-1)[0])
}

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