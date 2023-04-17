const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grandAccessContainer = document.querySelector(
  ".grant-location-conatiner"
);
const searchForm = document.querySelector("[data-searchForm]");
const userInfoContainer = document.querySelector(".user-info-container");
const loadingScreen = document.querySelector(".loading-container");

const apiErrorContainer = document.querySelector(".api-error-container");
const apiErrorImg = document.querySelector("[data-notFoundImg]");
const apiErrorMessage = document.querySelector("[data-apiErrorText]");
const apiErrorBtn = document.querySelector("[data-apiErrorBtn]");
// initially variables needs

let CurrentTab = userTab;
const API_KEY = "0120bce0a4663bd3438a7a893eb48a19";
CurrentTab.classList.add("current-tab");
getFromSessionStorage();

function switchTab(clickTab) {
  if (clickTab != CurrentTab) {
    CurrentTab.classList.remove("current-tab");
    CurrentTab = clickTab;
    CurrentTab.classList.add("current-tab");

    if (!searchForm.classList.contains("active")) {
      //kya search form wala container is invisible,if yes then make it viusiable
      userInfoContainer.classList.remove("active");
      grandAccessContainer.classList.remove("active");
      searchForm.classList.add("active");
      apiErrorContainer.classList.remove("active");
    } else {
      //main pahle search wala tab pr han,ab your weather tab visualbe kena h
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");
      // ab main your weather tab me aagaya hu,toh weather bhi diplay karna padhega ,so lets check local storage for coordinate,if we haved saved them there,
      getFromSessionStorage();
    }
  }
}

searchTab.addEventListener("click", () => {
  switchTab(searchTab);
});

userTab.addEventListener("click", () => {
  switchTab(userTab);
});

//check if cordinates are already presend in session storage
function getFromSessionStorage() {
  const localcordinates = sessionStorage.getItem("user-coordinates");
  if (!localcordinates) {
    //agar local coordinates nhi mile
    grandAccessContainer.classList.add("active");
  } else {
    const coordinates = JSON.parse(localcordinates);
    fetchUserWeatherInfo(coordinates);
  }
}

async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;
  //make grandcontainer invisiable
  grandAccessContainer.classList.remove("active");
  //make loader visiable
  loadingScreen.classList.add("active");

  // API call
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await res.json();
    console.log("User - Api Fetch Data", data);
    if (!data.sys) {
      throw data;
    }
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (e) {
    loadingScreen.classList.remove("active");
    apiErrorContainer.classList.add("active");
    apiErrorImg.style.display = "none";
    apiErrorMessage.innerText = `Error: ${error?.message}`;
    apiErrorBtn.addEventListener("click", fetchUserWeatherInfo);
  }
}

function renderWeatherInfo(weatherInfo) {
  // firsly we have to fetch the data
  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const description = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windSpeed = document.querySelector("[data-windSpeed]");
  const huminity = document.querySelector("[data-huminity]");
  const cloudiness = document.querySelector("[data-clound]");

  console.log(weatherInfo);
  // fetch value from weatherinfo object and ut it ui elements
  cityName.innerText = weatherInfo?.name;
  countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  description.innerText = weatherInfo?.weather?.[0]?.description;
  weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
  temp.innerText = ` ${weatherInfo?.main?.temp}°C`;
  windSpeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
  huminity.innerText = `${weatherInfo?.main?.humidity}%`;
  cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    //hw all an alert for no geolocation suppoert available
    grantAccessButton.style.display = "none";
    messageText.innerText = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };

  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeatherInfo(userCoordinates);
}

const grandAccessButton = document.querySelector("[data-grandtAccess]");
grandAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // if (e.value === "") return;
  let cityName = searchInput.value;
  if (cityName === "") return;
  else fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city) {
  loadingScreen.classList.add("active");
  userInfoContainer.classList.remove("active");
  grandAccessContainer.classList.remove("active");

  try {
    const reponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    let data = await reponse.json();
    console.log("Search - Api Fetch Data", data);
    if (!data.sys) {
      throw data;
    }
    console.log(data.sys);
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (e) {
    loadingScreen.classList.remove("active");
    apiErrorContainer.classList.add("active");
    apiErrorMessage.innerText = `${error?.message}`;
    apiErrorBtn.style.display = "none";
  }
}
