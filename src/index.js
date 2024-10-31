/**
 * Gefið efni fyrir verkefni 9, ekki er krafa að nota nákvæmlega þetta en nota
 * verður gefnar staðsetningar.
 */

import { el, empty } from "./lib/elements.js";
import { weatherSearch } from "./lib/weather.js";

/**
 * @typedef {Object} SearchLocation
 * @property {string} title
 * @property {number} lat
 * @property {number} lng
 */

/**
 * Allar staðsetning sem hægt er að fá veður fyrir.
 * @type Array<SearchLocation>
 */
const locations = [
  {
    title: "Reykjavík",
    lat: 64.1355,
    lng: -21.8954,
  },
  {
    title: "Akureyri",
    lat: 65.6835,
    lng: -18.0878,
  },
  {
    title: "New York",
    lat: 40.7128,
    lng: -74.006,
  },
  {
    title: "Tokyo",
    lat: 35.6764,
    lng: 139.65,
  },
  {
    title: "Sydney",
    lat: 33.8688,
    lng: 151.2093,
  },
];

/**
 * Hreinsar fyrri niðurstöður, passar að niðurstöður séu birtar og birtir element.
 * @param {Element} element
 */
function renderIntoResultsContent(element) {
  const resultsContainer = document.querySelector(".results");
  const resultsHeader = el("h2", { class: "results__header" }, `Results `);

  if (resultsContainer) {
    empty(resultsContainer);
    resultsContainer.appendChild(resultsHeader)
    resultsContainer.appendChild(element);
  }
}

/**
 * Birtir niðurstöður í viðmóti.
 * @param {SearchLocation} location
 * @param {Array<import('./lib/weather.js').Forecast>} results
 */
function renderResults(location, results) {
  const resultsParagr = el(
    "p",
    { class: "results__text" },
    `Forecast for ${location.title} with longitude: ${location.lng} and latitude: ${location.lat}`,
  );
  console.log(results);

  const table = el(
    "table",
    { class: "forecast" },
    el(
      "thead",
      {},
      el(
        "tr",
        {},
        el("th", {}, "Time"),
        el("th", {}, "Temperature (°C)"),
        el("th", {}, "Precipitation (mm)"),
      ),
    ),
    el(
      "tbody",
      {},
      ...results.map(({ time, temperature, precipitation }) =>
        el(
          "tr",
          {},
          el("td", {}, time),
          el("td", {}, temperature.toFixed(1)),
          el("td", {}, precipitation.toFixed(1)),
        ),
      ),
    ),
  );
  const resultsContainer = el(
    "div",
    { class: "results" },
    resultsParagr,
    table,
  );

  renderIntoResultsContent(resultsContainer);

}
/**
 * Birta villu í viðmóti.
 * @param {Error} error
 */
function renderError(error) {
  const errorMessage = el("div", { class: "error" }, `Error: ${error.message}`);

  renderIntoResultsContent(errorMessage);
}

/**
 * Birta biðstöðu í viðmóti.
 */
function renderLoading() {
  const loadingElement = el("div", { class: "loading" }, "Loading...");
  renderIntoResultsContent(loadingElement);
}

/**
 * Framkvæmir leit að veðri fyrir gefna staðsetningu.
 * Birtir biðstöðu, villu eða niðurstöður í viðmóti.
 * @param {SearchLocation} location Staðsetning sem á að leita eftir.
 */
async function onSearch(location) {
  console.log("onSearch", location);

  const container = document.querySelector(".results");
  if (container) {
    container.classList.remove("hidden");
  }
  // Birta loading state
  renderLoading();


  try {
    const results = await weatherSearch(location.lat, location.lng);
    renderResults(location, results);
  } catch (error) {
    renderError(error);
  }

  // TODO útfæra
  // Hér ætti að birta og taka tillit til mismunandi staða meðan leitað er.
}

/**
 * Framkvæmir leit að veðri fyrir núverandi staðsetningu.
 * Biður notanda um leyfi gegnum vafra.
 */
/**
 * Framkvæmir leit að veðri fyrir núverandi staðsetningu.
 * Biður notanda um leyfi gegnum vafra.
 */
async function onSearchMyLocation() {
  renderLoading();
  if (!navigator.geolocation) {
    console.log("Geolocation is not supported by this browser.");
    renderError(new Error("Geolocation is not supported by this browser."));

    return;
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const location = { title: "My Location", lat: latitude, lng: longitude };
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

    await onSearch(location);
  } catch (error) {
    renderError(
      new Error(
        `Please make sure you allow location sharing for this website, ${error.message}`,
      ),
    );
  }
}

/**
 * Býr til takka fyrir staðsetningu.
 * @param {string} locationTitle
 * @param {() => void} onSearch
 * @returns {HTMLElement}
 */
function renderLocationButton(locationTitle, onSearch) {
  // Notum `el` fallið til að búa til element og spara okkur nokkur skref.
  const locationElement = el(
    "li",
    { class: "locations__location" },
    el(
      "button",
      { class: "locations__button", click: onSearch },
      locationTitle,
    ),
  );

  /* Til smanburðar við el fallið ef við myndum nota DOM aðgerðir
  const locationElement = document.createElement('li');
  locationElement.classList.add('locations__location');
  const locationButton = document.createElement('button');
  locationButton.appendChild(document.createTextNode(locationTitle));
  locationButton.addEventListener('click', onSearch);
  locationElement.appendChild(locationButton);
  */

  return locationElement;
}

/**
 * Býr til grunnviðmót: haus og lýsingu, lista af staðsetningum og niðurstöður (falið í byrjun).
 * @param {Element} container HTML element sem inniheldur allt.
 * @param {Array<SearchLocation>} locations Staðsetningar sem hægt er að fá veður fyrir.
 * @param {(location: SearchLocation) => void} onSearch
 * @param {() => void} onSearchMyLocation
 */
function render(container, locations, onSearch, onSearchMyLocation) {
  // Búum til <main> og setjum `weather` class
  const parentElement = document.createElement("main");
  parentElement.classList.add("weather");

  // Búum til <header> með beinum DOM aðgerðum
  const headerElement = document.createElement("header");
  const heading = document.createElement("h1");
  heading.textContent = "🌨️ Weather ☀️";
  headerElement.appendChild(heading);
  parentElement.appendChild(headerElement);

  const introText = document.createElement("p");
  introText.textContent = "Choose a location to check the weather forecast.";
  parentElement.appendChild(introText);

  // Búa til <div class="loctions">
  const locationsElement = document.createElement("div");
  locationsElement.classList.add("locations");

  const locationsHeader = document.createElement("h2");
  locationsHeader.textContent = "Locations";
  locationsElement.appendChild(locationsHeader);
  // Búa til <ul class="locations__list">
  const locationsListElement = document.createElement("ul");
  locationsListElement.classList.add("locations__list");

  const liButtonElement = renderLocationButton(
    "My location (Needs permission)",
    () => onSearchMyLocation(),
  );
  locationsListElement.appendChild(liButtonElement);
  // <div class="loctions"><ul class="locations__list"><li><li><li></ul></div>

  for (const location of locations) {
    const liButtonElement = renderLocationButton(location.title, () =>
      onSearch(location),
    );
    locationsListElement.appendChild(liButtonElement);
  }
  // <div class="loctions"><ul class="locations__list"></ul></div>
  locationsElement.appendChild(locationsListElement);
  parentElement.appendChild(locationsElement);

  // útfæra niðurstöðu element
  const resultsContainer = document.createElement("div");
  resultsContainer.classList.add("results", "hidden");

  parentElement.appendChild(resultsContainer);

  container.appendChild(parentElement);
}
// Þetta fall býr til grunnviðmót og setur það í `document.body`
render(document.body, locations, onSearch, onSearchMyLocation);
