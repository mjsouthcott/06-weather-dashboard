// Define and initialize variables
let $citySearchButton = $('#city-search-btn')
let $citySearchInput = $('#city-search-input')
let $citySearchHistory = $('#city-search-history')
let citySearchHistoryArray

// Check if `citySearchHistory` exists in localStorage. If no, initialize and set it; if yes, get it
if (!window.localStorage.getItem('citySearchHistoryArray')) {
    citySearchHistoryArray = []
    window.localStorage.setItem('citySearchHistoryArray', JSON.stringify(citySearchHistoryArray))
} else {
    citySearchHistoryArray = JSON.parse(window.localStorage.getItem('citySearchHistoryArray'))
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

// Call `displayCitySearchHistory` to display history on first page visit or page refresh
displayCitySearchHistory(citySearchHistoryArray)

// Add `click` event handler to city search button
$citySearchButton.on('click', function(event) {
    // Prevent default behaviour
    event.preventDefault()
    
    // Add city search value to `citySearchHistoryArray` if input isn't empty
    if ($citySearchInput.val() !== '') {
        citySearchHistoryArray.push($citySearchInput.val())
    }
    
    // Clear input
    $citySearchInput.val('')

    // Call `displayCitySearchHistory` to display history
    displayCitySearchHistory(citySearchHistoryArray)

    // set new `citySearchHistoryArray` in localStorage
    window.localStorage.setItem('citySearchHistoryArray', JSON.stringify(citySearchHistoryArray))
})