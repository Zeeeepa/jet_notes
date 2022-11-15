let map;
let marker;
let geocoder;
let responseDiv;
let response;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 8,
    center: { lat: -34.397, lng: 150.644 },
    mapTypeControl: false,
  });
  geocoder = new google.maps.Geocoder();

  const inputText = document.createElement("input");

  inputText.type = "text";
  inputText.placeholder = "Enter a location";

  const submitButton = document.createElement("input");

  submitButton.type = "button";
  submitButton.value = "Geocode";
  submitButton.classList.add("button", "button-primary");

  const clearButton = document.createElement("input");

  clearButton.type = "button";
  clearButton.value = "Clear";
  clearButton.classList.add("button", "button-secondary");
  response = document.createElement("pre");
  response.id = "response";
  response.innerText = "";
  responseDiv = document.createElement("div");
  responseDiv.id = "response-container";
  responseDiv.appendChild(response);

  const instructionsElement = document.createElement("p");

  instructionsElement.id = "instructions";
  instructionsElement.innerHTML =
    "<strong>Instructions</strong>: Enter an address in the textbox to geocode or click on the map to reverse geocode.";
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputText);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(submitButton);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(clearButton);
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(instructionsElement);
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(responseDiv);
  marker = new google.maps.Marker({
    map,
  });
  map.addListener("click", (e) => {
    geocode({ location: e.latLng });
  });
  submitButton.addEventListener("click", async () => {
    const results = await geocode({ address: inputText.value });

    console.log("RESULTS", results);
  });
  clearButton.addEventListener("click", () => {
    clear();
  });
  clear();
}

function clear() {
  marker.setMap(null);
  responseDiv.style.display = "none";
}

function geocode(request) {
  clear();

  return new Promise((resolve, reject) => {
    geocoder
      .geocode(request)
      .then((result) => {
        const { results } = result;

        map.setCenter(results[0].geometry.location);
        marker.setPosition(results[0].geometry.location);
        marker.setMap(map);
        responseDiv.style.display = "block";
        response.innerText = JSON.stringify(result, null, 2);
        return result;
      })
      .then((result) => {
        const { results } = result;

        console.log("GEOCODER RESULTS", results);

        // map.setCenter(results[0].geometry.location);
        // marker.setPosition(results[0].geometry.location);
        // marker.setMap(map);
        // responseDiv.style.display = 'block';
        // response.innerText = JSON.stringify(result, null, 2);

        const geometry = results[0]?.geometry || {};
        const {
          location: { lat: latitude, lng: longitude } = {},
          location_type: locationType,
          bounds,
          viewport,
        } = geometry;

        if (location) {
          resolve({
            location: latitude &&
              longitude && {
                latitude: latitude(),
                longitude: longitude(),
              },
            locationType,
            bounds,
            viewport,
          });
        }
      })
      .catch((e) => {
        console.error("GEOCODER ERROR", e);

        reject(e);
      });
  });
}

window.initMap = initMap;
