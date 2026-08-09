const mapElement = document.getElementById("map");

const mapToken = mapElement.getAttribute("data-token");
const coordinates = JSON.parse(mapElement.getAttribute("data-coordinates"));

mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: coordinates,
    zoom: 9
});

new mapboxgl.Marker({ color: 'red' })
    .setLngLat(coordinates)
    .addTo(map);