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
    $('.aside form').nextAll().remove()

    let citySearchHistory = `<div class="card clear-both"><ul class="list-group list-group-flush" id="city-search-history">`

    // Iterate over `citySearchHistoryArray` to display info
    for (let i = 0; i < citySearchHistoryArray.length; i++) {
        citySearchHistory +=`<li class="list-group-item">${citySearchHistoryArray[i]}</li>`
    }

    citySearchHistory += `</ul></div>`

    $('.aside').append($.parseHTML(citySearchHistory))
}

// Define function to display current weather in content div
function displayCurrentWeather(city) {
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiID}`,
        method: "GET"
    }).then(function(response) {
        $('#current-weather .card-body').empty()
        console.log('test')
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

        let currentWeather = `<h3 class="card-title city-name float-left">${name} (${day}/${month}/${year})</h3>`
        currentWeather += `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${iconDescription}">`
        currentWeather += `<p class="card-text temperature">Temperature: ${temperature} °C</p>`
        currentWeather += `<p class="card-text humidity">Humidity: ${humidity}%</p>`
        currentWeather += `<p class="card-text wind-speed">Wind Speed: ${windSpeed} km/h</p>`
        currentWeather += `<p class="card-text uv-index">UV Index: <span class="badge"></span>`
        
        $('#current-weather .card-body').append($.parseHTML(currentWeather))

        displayUVIndex(response.coord.lat, response.coord.lon)
    })
}

// Define function to display UV index in current weather div
function displayUVIndex(lat, lon) {
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/uvi?appid=${apiID}&lat=${lat}&lon=${lon}`,
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
}

// Define function to display 5-day forecast in `5-day-forecast` div
function displayFiveDayForecast(city) {
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiID}`,
        method: "GET"
    }).then(function(response) {
        $('#five-day-forecast h4').nextAll().remove()

        for (let i = 0; i < response.list.length; i++) {
            if (response.list[i].dt_txt.includes('15:00')) {
                let dateTime = response.list[i].dt_txt
                let year = dateTime.substr(0, 4)
                let month = dateTime.substr(5, 2)
                let day = dateTime.substr(8, 2)
                let iconCode = response.list[i].weather[0].icon
                let iconDescription = response.list[i].weather[0].description
                let temperature = (response.list[i].main.temp - 273.15).toFixed(1)
                let humidity = response.list[i].main.humidity
        
                let futureWeather = `<div class="card text-white bg-primary float-left" id="${i + 1}">`
                futureWeather += `<div class="card-body"><h5 class="card-title day">${day}/${month}/${year}</h5>`
                futureWeather += `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${iconDescription}">`
                futureWeather += `<p class="card-text temperature">Temp: ${temperature} °C</p>`
                futureWeather += `<p class="card-text humidity">Humidity: ${humidity}%</p></div></div>`
        
                $('#five-day-forecast').append($.parseHTML(futureWeather))
            }
        }
    })
}

// Call `displayCitySearchHistory` to display history on first page visit or page refresh
displayCitySearchHistory(citySearchHistoryArray)

// If a city was previously searched for
if (citySearchHistoryArray) {
    // Call `displayForecast` to display forecast for that city
    let lastCity = citySearchHistoryArray.slice(-1)[0]
    displayCurrentWeather(lastCity)
    displayFiveDayForecast(lastCity)
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
        displayCurrentWeather(city)
        displayFiveDayForecast(city)
    }  
})

// Add `click` event handler to cities
$('.aside').on('click', '.list-group-item', function() {
    displayCurrentWeather($(this).text())
    displayFiveDayForecast($(this).text())
})