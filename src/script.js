// array to hold our data for local storage
let storage = [];

// helper function which simply adds up to 2 extra zeroes (.00) if the number has less than two decimal places
// any argument that is passed into this function must be in a string format as it uses .split which is a string methods
function addZeroes(num) {
  const dec = num.split('.')[1]; // isolate the whole number from the decimal
  const len = 2; // set length of decimal places to two
  // pass len to the .toFixed function called on num, which automatically formats a number using fixed-point notation, then convert back to a number
  return Number(num).toFixed(len);
}

// function to retrieve todays data from the weather API
function getToday(searchInput) {
  fetch('https://api.openweathermap.org/data/2.5/weather?q=' + searchInput +
    '&appid=9bbe868aa95e2e05ff8a18fa3fab1fc7&units=imperial') // fetch data from our api substituting the search-input as the links endpoint-parameter
    .then(function (response) { // return the response
      return response.json();
    })
    .then(function (data) { // now we can work with the data

      if (storage.indexOf(searchInput) === -1) { // if the searchInput doesn't exist within the storage array
        storage.push(searchInput); // then push searchInput to the storage array
        localStorage.setItem('history', JSON.stringify(storage)); // set our local storage to the edited storage array
        addToList(searchInput); // call the addToList function, passing the searchInput in as the text argument
      }

      $('#today').empty(); // empty the #today div so that every time we get todays weather for a new location it doesn't add an extra city
      // create a title header with the locations name and todays date
      let card = $('<div>').addClass('card'); // create a div that holds todays weather data in a "card" format
      let cardBody = $('<div>').addClass('card-body'); // create a div that holds the entire card
      let title = $('<h3>').addClass('card-title').text(data.name + ' (' + new Date().toLocaleDateString() + ')');
      // create a weather icon image that correlates to the current weather
      let img = $('<img>').attr('src', 'https://openweathermap.org/img/w/' + data.weather[0].icon + '.png');
      // create variables that hold todays weather data
      let temp = $('<p>').addClass('card-text').text('Temperature: ' + addZeroes(String(data.main.temp)) + ' °F');
      let wind = $('<p>').addClass('card-text').text('Wind Speed: ' + addZeroes(String(data.wind.speed)) + ' MPH');
      let humid = $('<p>').addClass('card-text').text('Humidity: ' + data.main.humidity + '%');
      // create variables that hold the selected locations coordinates
      let lat = data.coord.lat;
      let lon = data.coord.lon;

      // create the weather card for today
      getUVIndex(lat, lon, cardBody); // append the uv index to the card
      title.append(img); // append the weather icon to the title
      cardBody.append(title, temp, humid, wind); // append the weathers data to the cardbody
      card.append(cardBody); // append the cardbody to the card
      $('#today').append(card); // append the card to the today id
    })

}

// function to retrieve the uv index
function getUVIndex(lat, lon, cardBody) {
  fetch('https://api.openweathermap.org/data/2.5/uvi?appid=9bbe868aa95e2e05ff8a18fa3fab1fc7&lat='
    + lat + '&lon=' + lon) // fetch data from our api substituting the selected locations cooridinates as the links endpoint-parameters
    .then((response) => response.json()) // return the response
    .then(data => { // now we can work with the data

      let uvIndexValue = data.value; // retrieve the uv index value
      let uvIndexBody = $('<p>').addClass('card-text').text('UV Index: '); // create the uv index body
      let uvIndexDisplay = $('<span>').addClass('btn btn-sm text-dark font-weight-bold disabled').text(uvIndexValue); // create the uv index display

      if (uvIndexValue < 3) { // if uv index is lower than 3, set color to green
        uvIndexDisplay.addClass('btn-success');
      } else if (uvIndexValue < 7) { // if uv index is greater than 3 and lower than 7, set color to yellow
        uvIndexDisplay.addClass('btn-warning');
      } else { // if uv index is greater than 7, set color to red and text color to white
        uvIndexDisplay.addClass('btn-danger');
        uvIndexDisplay.removeClass('text-dark');
        uvIndexDisplay.addClass('text-white');
      }

      cardBody.append(uvIndexBody); //append the uvIndexBody to the main cardBody
      $('#today .card-body').append(uvIndexBody.append(uvIndexDisplay)); // append the uvIndexDisplay to the uvIndexBody, then append that to the today id
      $('#today .card-body').addClass('bg-light'); // give the entire today display a light white background
    })

}

// function to retrieve the 5-day forecast data from the weather API
function getForecast(searchInput) {
  fetch('https://api.openweathermap.org/data/2.5/forecast?q=' + searchInput +
    '&appid=9bbe868aa95e2e05ff8a18fa3fab1fc7&units=imperial') // fetch data from our api substituting the search-input as the links endpoint-parameter
    .then(function (response) { // return the response
      return response.json();
    })
    .then(function (data) { // now we can work with the data
      // Jquery function that allows us to add new content to the specified class
      // in this case we are adding our forecast UI to the #forecast class
      $('#forecast').html('<h4 class=\"mt-3\">5-Day Forecast:</h4><div class=\"row\">');

      // for loop to create a card for each day in the forecast
      for (let i = 0; i < data.list.length; i++) {

        // if statement that's main purpose is to simply select which hour we will pull our "daily" data from
        // it checks for if the index of dt.txt at 15:00 (24 hour time) is a valid array index
        // essentially if the current hour in the array doesn't match, the index of '15:00:00' will be -1
        // but if it does match, the index won't be -1
        if (data.list[i].dt_txt.indexOf('15:00:00') !== -1) {

          let cardFore = $('<div>').addClass('card bg-primary text-white'); // create a div that holds the forecasted days weather data in a "card" format
          let cardBodyFore = $('<div>').addClass('card-body p-2'); // create a div that holds the entire card
          let colFore = $('<div>').addClass('col-md-2'); // create a div that holds every card
          // create a title header containing the forecasted days date
          let titleFore = $('<h3>').addClass('card-title').text(new Date(data.list[i].dt_txt).toLocaleDateString());
          // create a weather icon image that correlates to the forecasted days weather
          let imgFore = $('<img>').attr('src', 'https://openweathermap.org/img/w/' + data.list[i].weather[0].icon + '.png');
          // create variables that hold the forecasted days weather data
          let tempFore = $('<p>').addClass('card-text').text('Temperature: ' + addZeroes(String(data.list[i].main.temp)) + ' °F');
          let humidFore = $('<p>').addClass('card-text').text('Humidity: ' + data.list[i].main.humidity + '%');
          let windFore = $('<p>').addClass('card-text').text('Wind Speed: ' + addZeroes(String(data.list[i].wind.speed)) + ' MPH');
          // append the forecast cards to colFore
          colFore.append(cardFore.append(cardBodyFore.append(titleFore, imgFore, tempFore, humidFore, windFore)));
          $('#forecast .row').append(colFore); // append colFore to the forecast id in a row format

        }
      }
    })

}

// function to create the list of previously searched cities
function addToList(text) {

  let listItem = $('<li>').addClass('list-group-item').text(text); // append the passed in text to a newly created list item
  $('.history').append(listItem); // append the list item to the history class
}

// function to retrieve data from local storage
function getStorage() {
  // if data is in local storage, set the storage variable to that data
  // if there is no data in local storage, set the storage variable to an empty array
  storage = JSON.parse(localStorage.getItem('history')) || [];
  
  let lastIndex = JSON.parse(localStorage.getItem('lastIndex'));  // create the variable lastIndex and retrieve the lastIndex from local storage
  if(lastIndex != null && storage.length > 0){ // if lastIndex has a legitimate value and if storage has any data in it at all...
    //... then render todays weather and the forecast, passing lastIndex in as our "searchinput"
    // this is done so that when the user exits the website it remembers the last location they had selected and shows that one upon launching the site again
    getToday(lastIndex);
    getForecast(lastIndex);
  }

  // repopulate the searches list upon opening the site again
  for (let i = 0; i < storage.length; i++) {
    addToList(storage[i]);
  }

}

// JQUERY function that checks to make sure the DOM document is ready before running the code inside it
$(document).ready(function () {
  
  $('#search-button').text("Search"); // give search button some text

  // search button click handler
  $('#search-button').on('click', function () {
    let searchInput = $('#search-value').val(); // retrieve the users search input from the input field
    // render the searches results
    getToday(searchInput);
    getForecast(searchInput);
    // set a new 'lastIndex' item when the user makes a search
    localStorage.removeItem('lastIndex');
    localStorage.setItem('lastIndex', JSON.stringify(searchInput));
  })

  getStorage(); // call getStorage function, only after the DOM is ready

  // searches list click handler
  $(".history").on("click", "li", function () {
    // render the list items associated data
    getToday($(this).text());
    getForecast($(this).text());
    // set a new 'lastIndex' item on each button press
    localStorage.removeItem('lastIndex');
    localStorage.setItem('lastIndex', JSON.stringify($(this).text()));
  });

});