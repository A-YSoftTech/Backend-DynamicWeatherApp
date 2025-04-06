let lightningInterval;
let searchBox = document.querySelector("input");
let searchButton = document.getElementById("but");
let image = document.getElementById("img");
let cross = document.getElementById("empty-box");
let cloud = document.getElementById("cld");

let convert = document.getElementById("convert");
let favourite = document.getElementById("favourite");
let gps = document.getElementById("gps");


//lightining effect on cloud click
cloud.addEventListener("click", () => {
  let lightning = document.getElementsByClassName("lightining")[0];
  lightning.style.animation = "lightningFlash1 0.6s 2";

  lightning.addEventListener("animationend", () => {
    lightning.style.animation = "";
  }, { once: true });
});

//convert temperature to °F and °c
async function convertTemp(data, sunrise, sunset, calender) {
  convert.replaceWith(convert.cloneNode(true));
  convert = document.getElementById("convert");
  if (convert.style.color === "black") {
    await convertToFahrenheit(data, sunrise, sunset, calender);
  } else {
    await convertToCelsius(data, sunrise, sunset, calender);
  }
  convert.addEventListener("click", async () => {
    try {
      if (convert.style.color === "black") {
        await convertToFahrenheit(data, sunrise, sunset, calender);
        convert.style.color = "white";
      } else {
        await convertToCelsius(data, sunrise, sunset, calender);
        convert.style.color = "black";
      }
    } catch (error) {
      console.error("Error in temperature conversion:", error);
    }
  });
}

async function convertToFahrenheit(data, sunrise, sunset, calender) {
  document.getElementById("temp").innerHTML = Math.round(((data.main.temp) * 1.8) + 32) + "°F";
  document.getElementById("f-l").innerHTML = `${(((data.main.feels_like) * 1.8) + 32).toFixed(2)}°F`;
  document.getElementById("mx-t").innerHTML = `${(((data.main.temp_max) * 1.8) + 32).toFixed(2)}°F`;
  document.getElementById("mn-t").innerHTML = `${(((data.main.temp_min) * 1.8) + 32).toFixed(2)}°F`;

  document.getElementById("pre").innerHTML = `${data.main.pressure} mb`;
  document.getElementById("g-l").innerHTML = `${data.main.grnd_level} mb`;
  document.getElementById("s-l").innerHTML = `${data.main.sea_level} mb`;

  document.getElementById("s-r").innerHTML = `${sunrise.time24}`;
  document.getElementById("s-s").innerHTML = `${sunset.time24}`;

  document.getElementById("date").innerHTML = `${calender.fullDate} ${calender.time24}`;
}
async function convertToCelsius(data, sunrise, sunset, calender) {
  document.getElementById("temp").innerHTML = Math.round(data.main.temp) + "°c";
  document.getElementById("f-l").innerHTML = `${data.main.feels_like}°c`;
  document.getElementById("mx-t").innerHTML = `${data.main.temp_max}°c`;
  document.getElementById("mn-t").innerHTML = `${data.main.temp_min}°c`;

  document.getElementById("pre").innerHTML = `${data.main.pressure} hPa`;
  document.getElementById("g-l").innerHTML = `${data.main.grnd_level} hPa`;
  document.getElementById("s-l").innerHTML = `${data.main.sea_level} hPa`;

  document.getElementById("s-r").innerHTML = `${sunrise.time12}`;
  document.getElementById("s-s").innerHTML = `${sunset.time12}`;

  document.getElementById("date").innerHTML = `${calender.fullDate} ${calender.time12}`;
}

//search function
function search() {
  favourite.style.color = "black";
  gps.style.color = "black";

  const city = searchBox.value;
  checkwhether(city);

}
//search events
searchButton.addEventListener("click", search);
document.addEventListener("keydown", (e) => {
  if (e.key === 'Enter') {
    search();
  }
});

//delete search data
cross.addEventListener("click", () => {
  searchBox.value = "";
})

// add and delete to favourite list
function storeCity(city) {
  favourite.style.color = "yellow";
  let MaxCities = 10;

  if (!city) {
    favourite.style.color = "red";
  }
  else {
    city = city.toLowerCase();
    let cities = JSON.parse(localStorage.getItem('favourite')) || [];
    if (cities.length >= MaxCities) {
      cities.shift();
    }
    cities.push(city);
    localStorage.setItem('favourite', JSON.stringify(cities));
  }
}
function deleteCity(city) {
  city = city.toLowerCase();
  let cities = JSON.parse(localStorage.getItem('favourite')) || [];
  cities = cities.filter(c => c !== city);
  localStorage.setItem('favourite', JSON.stringify(cities));
  favourite.style.color = "black"
}

favourite.addEventListener("click", () => {
  const city = searchBox.value.trim();
  if (favourite.style.color == "yellow") {
    deleteCity(city);
  }
  else {
    storeCity(city);
  }
})

// get weather data
async function checkwhether(city) {
  let citiesList = JSON.parse(localStorage.getItem('favourite')) || [];
  if (citiesList.includes(city)) {
    favourite.style.color = "yellow";
  } else {
    favourite.style.color = "black";
  }
  try {
    const response = await fetch(`/weather?city=${city}`);

    if (response.status == 404) {
      document.getElementById("city").innerHTML = "Invalid city name!";
    }
    else {
      let data = await response.json();

      document.getElementById("city").innerHTML = `${data.name}, ${data.sys.country}`;
      document.getElementById("description").innerHTML = data.weather[0].description;

      document.getElementById("w-b").innerHTML = `${data.wind.speed}km/h`;
      document.getElementById("d-n").innerHTML = `${data.wind.deg}°`;
      document.getElementById("hum").innerHTML = `${data.main.humidity}%`;


      let sun = data.sys.sunrise;
      let moon = data.sys.sunset;
      let sunrise = convertUnixToIST(sun);
      let sunset = convertUnixToIST(moon);


      Array.from(document.getElementsByClassName("cloud")).forEach(element => { element.style.display = "none"; });
      Array.from(document.getElementsByClassName("rain-hr")).forEach(element => { element.style.display = "none" });
      Array.from(document.getElementsByClassName("snow-hr")).forEach(element => { element.style.display = "none" });
      Array.from(document.getElementsByClassName("dust")).forEach(element => { element.style.display = "none"; })
      Array.from(document.getElementsByClassName("fog")).forEach(element => { element.style.display = "none"; })

      image.style.background = "rgba(255, 255, 255, 0.1)";
      // Haze
      if (data.weather[0].main == "Haze") {
        image.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        Array.from(document.getElementsByClassName("dust")).forEach(element => { element.style.display = "flex"; })

        if (lightningInterval) {
          clearInterval(lightningInterval);
          lightningInterval = null;
        }
      }
      else if (data.weather[0].main == "Rain") {
        image.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        function light() {
          let lightning = document.getElementsByClassName("lightining")[0];
          lightning.style.animation = "lightningFlash1 0.6s 2 ";

          lightning.addEventListener("animationend", () => {
            lightning.style.animation = "";
          }, { once: true });
        }

        if (!lightningInterval) {
          lightningInterval = setInterval(light, 5000);
        }

        let hrElement;
        let counter = 200;
        let rain = document.getElementsByClassName("rain")[0];
        for (let i = 0; i < counter; i++) {
          hrElement = document.createElement("HR");
          hrElement.style.left = Math.floor(Math.random() * window.innerWidth + 100) + "px";
          hrElement.style.animationDuration = 0.4 + Math.random() * 3 + "s";
          hrElement.style.animationDelay = Math.random() * 5 + "s";
          hrElement.classList.add("rain-hr");
          rain.appendChild(hrElement);
        }

      }
      // Mist
      else if (data.weather[0].main == "Mist") {
        image.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        Array.from(document.getElementsByClassName("fog")).forEach(element => { element.style.display = "flex"; })
        if (lightningInterval) {
          clearInterval(lightningInterval);
          lightningInterval = null;
        }
      }

      // Clear
      else if (data.weather[0].main == "Clear") {
        image.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        if (lightningInterval) {
          clearInterval(lightningInterval);
          lightningInterval = null;
        }
      }

      // Clouds
      else if (data.weather[0].main == "Clouds") {
        image.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        Array.from(document.getElementsByClassName("cloud")).forEach(element => { element.style.display = "flex"; });

        if (lightningInterval) {
          clearInterval(lightningInterval);
          lightningInterval = null;
        }
      }

      // Snow
      else if (data.weather[0].main == "Snow") {
        image.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        let hrElement;
        let counter = 100;
        let rain = document.getElementsByClassName("rain")[0];
        for (let i = 0; i < counter; i++) {
          hrElement = document.createElement("HR");
          hrElement.style.left = Math.floor(Math.random() * window.innerWidth + 90) + "px";
          hrElement.style.animationDuration = 0.4 + Math.random() * 7 + "s";
          hrElement.style.animationDelay = Math.random() * 5 + "s";
          hrElement.style.display = "flex";
          hrElement.style.width = "10px";
          hrElement.style.height = "10px";
          hrElement.style.color = "white";
          hrElement.classList.add("snow-hr");
          rain.appendChild(hrElement);
        }
        if (lightningInterval) {
          clearInterval(lightningInterval);
          lightningInterval = null;
        }
      }

      //convert to local time
      let tarikh = data.dt;
      let calender = convertUnixToIST(tarikh);

      convertTemp(data, sunrise, sunset, calender)

      function convertTime12ToSeconds(time12) {
        const [time, modifier] = time12.split(' ');
        let [hours, minutes, seconds] = time.split(':').map(Number);

        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        return hours * 3600 + minutes * 60 + seconds;
      }

      //switching day and night according to time
      const nowSeconds = convertTime12ToSeconds(calender.time12);
      const sunriseSeconds = convertTime12ToSeconds(sunrise.time12);
      const sunsetSeconds = convertTime12ToSeconds(sunset.time12);

      if (nowSeconds >= sunsetSeconds || nowSeconds < sunriseSeconds) {
        Array.from(document.getElementsByClassName("day")).forEach(element => {
          element.style.display = "none";
        });
        Array.from(document.getElementsByClassName("night")).forEach(element => {
          element.style.display = "block";
        });
      } else {
        Array.from(document.getElementsByClassName("day")).forEach(element => {
          element.style.display = "block";
        });
        Array.from(document.getElementsByClassName("night")).forEach(element => {
          element.style.display = "none";
        });
      }

      initMap(data);

    }
  } catch (error) {
    console.error("error is from : ", error);
    document.getElementById("city").innerHTML = "Invalid city name!";
  }
}

//map
async function checkMap() {
  const response = await fetch(`/map`);
  const data = await response.json();
  (g => {
    var h, a, k, p = "The Google Maps JavaScript API",
      c = "google",
      l = "importLibrary",
      q = "__ib__",
      m = document,
      b = window;
    b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}),
      r = new Set,
      e = new URLSearchParams,
      u = () => h || (h = new Promise(async (f, n) => {
        await (a = m.createElement("script")); e.set("libraries", [...r] + "");
        for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]);
        e.set("callback", c + ".maps." + q);
        a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
        d[q] = f;
        a.onerror = () => h = n(Error(p + " could not load."));
        a.nonce = m.querySelector("script[nonce]")?.nonce || "";
        m.head.append(a)
      }));
    d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n))
  })
    ({ key: data.apiKey, v: "weekly" });
}
checkMap();

let map;
async function initMap(data) {
  const response = await fetch("/map");
  const key = await response.json();
  const { Map } = await google.maps.importLibrary("maps");

  const map = new Map(document.getElementById("map"), {
    center: { lat: data.coord.lat, lng: data.coord.lon },
    zoom: 18,
    mapTypeId: "satellite",
    mapId: key.mapid,
    tilt: 45,
  });
  map.setTilt(45);
  map.setHeading(90);


  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  const marker = new AdvancedMarkerElement({
    position: { lat: data.coord.lat, lng: data.coord.lon },
    map: map,
    title: `Weather for ${data.name}`,
    draggable: false,
  });

  // Create a custom label element
  const label = document.createElement('div');
  label.textContent = data.name.slice(0, 1);

  // Apply the bouncing effect
  label.classList.add('bouncing-marker');
  label.classList.add('marker-label');
  document.getElementById("map").appendChild(label);
    

  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div style="background-color: #1E90FF; color: white; padding: 10px; font-size: 16px; border-radius: 5px;text-align: center;">
        <p>Temperature in ${data.name}</p>
        <p> is ${data.main.temp}°c</p>
        <p> ${data.weather[0].description}</p>
      </div>`
  });
  infoWindow.open(map, marker);
}

// function to convert IST to local time
function convertUnixToIST(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);

  const hours24 = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const time24 = `${hours24}:${minutes}:${seconds}`;

  let hours12 = date.getHours() % 12 || 12;
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  hours12 = String(hours12).padStart(2, '0');
  const time12 = `${hours12}:${minutes}:${seconds} ${ampm}`;

  let month = ["Jan", "Fed", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fullDate = `${date.toLocaleString('en-IN', { weekday: 'long' })}  ${String(date.getDate()).padStart(2, '0')} ${month[String(date.getMonth())]}, ${date.getFullYear()}`;

  return {
    time24,
    time12,
    fullDate
  };
}


// load map before getting geolocation
async function checkMapNew() {
  try {
    const response = await fetch(`/map`);
    const data = await response.json();

    if (!data.apiKey) {
      throw new Error("API key missing from response");
    }

    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      script.onerror = () => reject("Google Maps API failed to load.");
      document.head.appendChild(script);
      script.onload = () => resolve();
    });
  } catch (error) {
    console.error("Error loading Google Maps API:", error);
  }
}

async function initGoogleMaps() {
  await google.maps.importLibrary("geocoding");

  gps.addEventListener("click", () => {

    useLocation().then((city) => {
      searchBox.value = city;
      checkwhether(city);
    });
    gps.style.color = "white";
  })
}

// Ensure Google Maps loads first before using location services
checkMapNew().then(() => {
  initGoogleMaps();
}).catch(error => console.error(error));

//function that provide geo coordinates
async function getUserLocation() {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 5000,
        enableHighAccuracy: true,
        maximumAge: 0
      });
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

  } catch (error) {
    console.error("Error getting geolocation:", error);
    return null;
  }
}

// fetching adderss(city name) from geo coordinates
async function useLocation() {
  const userLocation = await getUserLocation();

  if (userLocation) {
    let lat = userLocation.latitude;
    let lng = userLocation.longitude;

    try {
      // Ensure Geocoder is available
      const { Geocoder } = await google.maps.importLibrary("geocoding");
      const geocoder = new Geocoder();

      return new Promise((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {

            // Extract city from address_components
            let city = "";
            for (let component of results[0].address_components) {
              if (component.types.includes("locality")) {
                city = component.long_name.toLowerCase();
                break;
              }
            }

            resolve(city || "City not found");
          } else {
            console.error("Geocoder failed:", status);
            reject("Geocoder failed");
          }
        });
      });
    } catch (error) {
      console.error("Error with Geocoder:", error);
      return "Error retrieving city";
    }
  } else {
    console.log("Could not retrieve the location.");
    return "Location unavailable";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const cityResults = document.getElementById("cityResults");

  // Fetch cities from the backend
  async function fetchCities() {
    try {
      const response = await fetch("/cities");
      const cities = await response.json();
      return cities;
    } catch (error) {
      console.error("Error fetching city list:", error);
      return [];
    }
  }

  const cityList = await fetchCities();

  // Function to filter cities
  function filterCities() {
    cityResults.innerHTML = "";
    const searchText = searchBox.value.trim().toLowerCase();
    if (searchText === '') return;

    const filteredCities = cityList.filter(city =>
      city.toLowerCase().includes(searchText)
    );

    filteredCities.slice(0, 20).forEach(city => {
      const li = document.createElement("li");
      li.textContent = city;
      li.onclick = () => selectCity(city);
      cityResults.appendChild(li);
    });
  }

  // Listen for input in the search box
  searchBox.addEventListener("keyup", filterCities);

  // Function to handle city selection
  function selectCity(city) {
    searchBox.value = city;
    cityResults.innerHTML = "";
  }
});

function favouriteList(){
  const cityFav = document.getElementById("cityFav");
  cityFav.innerHTML = '';
  let cities = JSON.parse(localStorage.getItem('favourite')) || [];
cities.forEach(city => {
  const li = document.createElement("li");
      li.textContent = city;
      li.onclick = () => selectCity(city);
      cityFav.appendChild(li);

      function selectCity(city) {
        searchBox.value = city;
        cityFav.innerHTML = "";
      }
})}


document.addEventListener("keydown", (e) => {
  if (e.key === 'F' || e.key === 'f') {
    favouriteList();
  }
});

document.getElementsByClassName('base')[0].addEventListener('click', ()=>{
  document.getElementById("cityFav").innerHTML = "";
})
