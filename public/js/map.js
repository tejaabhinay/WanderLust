const mapData = document.getElementById("map-data");

const coordinates = JSON.parse(mapData.dataset.coordinates);
const mapToken = mapData.dataset.token;
const title = mapData.dataset.title;
const listingLocation = mapData.dataset.location;  // FIXED
const price = mapData.dataset.price;

mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map',
    style: "mapbox://styles/mapbox/streets-v11",
    center: coordinates,
    zoom: 10
});

// Popup content
const popupHTML = `
    <h4 class="mb-1">${title}</h4>
    <p class="mb-0">${listingLocation}</p>
    <p class="mb-0">₹${Number(price).toLocaleString("en-IN")}</p>
`;

new mapboxgl.Marker({ color: "red" })
    .setLngLat(coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML)
    )
    .addTo(map);
