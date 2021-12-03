document.getElementsByTagName("body").height = window.innerHeight;

var realTimeDisp = document.getElementById("realTime");
var fakeTimeDisp = document.getElementById("chrisTime");
var sunriseDisp = document.getElementById("sunrise");
var sunsetDisp = document.getElementById("sunset");
var x = document.getElementById("test");
var dayLength;
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  var lat = position.coords.latitude;
  var long = position.coords.longitude;
  // x.innerHTML = "Latitude: " + lat + "<br>Longitude: " + long;

  let request = new XMLHttpRequest();
  request.open(
    "GET",
    "https://api.sunrise-sunset.org/json?lat=" +
      lat +
      "&lng=" +
      long +
      "&date=today&formatted=0",
    true
  );
  request.onload = function function2(lat, long, unix) {
    // Convert JSON data to an object
    let result = JSON.parse(this.response);
    var sunriseUTC = result.results.sunrise;
    var sunsetUTC = result.results.sunset;
    dayLength = /* 86400 -  */ result.results.day_length;

    postTime(sunriseUTC, sunsetUTC, result);
  };
  request.send();
}

getLocation();

function parseTime(originalTime) {
  //Create variables for year,month,day,hour,minute,second
  var year = originalTime.slice(0, 4);
  var month = originalTime.slice(5, 7);
  var day = originalTime.slice(8, 10);
  var hour = originalTime.slice(11, 13);
  var minute = originalTime.slice(14, 16);
  var second = originalTime.slice(17, 19);

  //Convert UTC to local time
  //format into a UTC format to run JS function to find local time (depends on local clock)
  var localsunsettime = new Date(
    month +
      "/" +
      day +
      "/" +
      year +
      " " +
      hour +
      ":" +
      minute +
      ":" +
      second +
      " UTC"
  );
  var timestringed = localsunsettime.toString();
  var time = timeTo12HrFormat(timestringed.slice(16, 24));

  function timeTo12HrFormat(time) {
    // Take a time in 24 hour format and format it in 12 hour format
    var time_part_array = time.split(":");
    var ampm = "AM";
    if (time_part_array[0] >= 12) {
      ampm = "PM";
    }
    if (time_part_array[0] > 12) {
      time_part_array[0] = time_part_array[0] - 12;
    }

    var formatted_time =
      time_part_array[0] +
      ":" +
      time_part_array[1] +
      ":" +
      time_part_array[2] +
      " " +
      ampm;
    return formatted_time;
  }

  return [time, localsunsettime];
}

function postTime(sunriseUTC, sunsetUTC, result) {
  let sunrise = parseTime(sunriseUTC);
  let sunset = parseTime(sunsetUTC);

  sunriseDisp.innerHTML = sunrise[0];
  sunsetDisp.innerHTML = sunset[0];
  // x.innerHTML += "<br>Sunrise: " + sunrise[0] + " in your local time";
  // x.innerHTML += "<br>Sunset: " + sunset[0] + " in your local time";

  let today = new Date();
  let seconds =
    today.getSeconds() + 60 * today.getMinutes() + 60 * 60 * today.getHours();
  let sunriseSeconds =
    sunrise[1].getSeconds() +
    60 * sunrise[1].getMinutes() +
    60 * 60 * sunrise[1].getHours();
  let sunsetSeconds =
    sunset[1].getSeconds() +
    60 * sunset[1].getMinutes() +
    60 * 60 * sunset[1].getHours();

  if (seconds < sunriseSeconds || seconds > sunsetSeconds) {
    dayLength = 86400 - dayLength;
  }

  let sinceSunrise = seconds - sunriseSeconds;
  sinceSunrise /= dayLength;
  sinceSunrise *= 43200;

  let newTime = new Date(sinceSunrise * 1000).toISOString().substr(11, 8);

  newTime = newTime.split(":").map(function (i) {
    return parseInt(i, 10);
  });

  newTime[0] = parseInt(newTime[0], 10) + 7;
  if (newTime[0].toString().length === 1) {
    newTime[0] = "0" + newTime[0];
  }
  if (newTime[1].toString().length === 1) {
    newTime[1] = "0" + newTime[1];
  }
  if (newTime[2].toString().length === 1) {
    newTime[2] = "0" + newTime[2];
  }

  //let newTimeStr = newTime.toString().replace(/,/g, ":");

  fakeTimeDisp.innerHTML = newTime.toString().replace(/,/g, ":");
  //x.innerHTML = "<br>Time in Chris Standard Time: " + newTimeStr;

  // eslint-disable-next-line
  var fakeInterval = setInterval(increase, (dayLength / 43200) * 1000);
  // eslint-disable-next-line
  var realInterval = setInterval(function () {
    realTimeDisp.innerHTML = new Date().toString().substr(15, 9);
  }, 1000);

  function increase() {
    if (newTime[2] === 59) {
      newTime[1]++;
      newTime[2] = "00";

      if (newTime[1].toString().length === 1) {
        newTime[1] = "0" + newTime[1];
      }
      if (newTime[1] === 59) {
        newTime[0]++;
        newTime[1] = "00";

        if (newTime[0].toString().length === 1) {
          newTime[0] = "0" + newTime[0];
        }
      }
    } else {
      newTime[2]++;

      if (newTime[2].toString().length === 1) {
        newTime[2] = "0" + newTime[2];
      }
    }

    fakeTimeDisp.innerHTML = newTime.toString().replace(/,/g, ":");
    /*     x.innerHTML =
      "<br>Time in Chris Standard Time: " +
      newTime.toString().replace(/,/g, ":"); */
  }
}
