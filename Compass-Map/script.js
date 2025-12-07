// OpenStreetMap standard
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
});

// OpenTopoMap
const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenTopoMap contributors'
});

// Satellite (from Esri)
const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/' +
  'World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri'
});

// OpenBusMap
const bus = L.tileLayer('https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenBusMap contributors'
});

const baseMaps = {
    "OpenStreetMap": osm,
    "Topo Map": topo,
    "Satellite": esriSat,
    "Buslines map": bus
}


// OpenRailwayMap Infrastructure
const railwayi = L.tileLayer('https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenRailwayMap contributors'
});
// OpenRailwayMap Max Speeds
const railwayms = L.tileLayer('https://tiles.openrailwaymap.org/maxspeed/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenRailwayMap contributors'
});
// OpenRailwayMap Signals
const railways = L.tileLayer('https://tiles.openrailwaymap.org/signals/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenRailwayMap contributors'
});
// OpenRailwayMap Electrification
const railwaye = L.tileLayer('https://tiles.openrailwaymap.org/electrified/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenRailwayMap contributors'
});
// OpenRailwayMap Track Gauge
const railwaytg = L.tileLayer('https://tiles.openrailwaymap.org/gauge/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenRailwayMap contributors'
});

// OpenSeaMap
const sea = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenSeaMap contributors'
});

// OpenSkiMap
const ski = L.tileLayer('https://tiles.opensnowmap.org/pistes/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; OpenSnowMap contributors'
});


const overlayMaps = {
    "Railway infrastructure": railwayi,
    "Railway max speeds": railwayms,
    "Railway signaling": railways,
    "Railway electification": railwaye,
    "Railway track gauge": railwaytg,
    "Sea": sea,
    "Ski": ski
}

var map = L.map('map', {
        center: [51.5, -0.125],
        zoom: 9,
        layers: [osm]
    });

L.control.layers(baseMaps, overlayMaps).addTo(map);


function isValidCoordinates(input) {
  input = input.trim();
  let parts = input.split(/[\s,]+/);
  if (parts.length !== 2) return false;
  const lat = parseFloat(parts[0]);
  const lon = parseFloat(parts[1]);
  if (isNaN(lat)||isNaN(lon)) return false;
  return [lat>=-90&&lat<=90 && lon>=-180&&lon<=180, lat, lon];
}

let markers = [];
var size = Math.min(window.innerWidth, window.innerHeight)*0.75;
const compassIcon = L.icon({
    iconUrl: 'compass.png',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
})
function placeCompass(coords) {
    markers.forEach(m => {
        m.remove();
    })
    const marker = L.marker(
            [coords[0], coords[1]], 
            { icon: compassIcon }
        )
        .addTo(map)
    markers.push(marker);
}


document.getElementById("buttonCoordinates").addEventListener("click" , function(){
    var coordsInput = document.getElementById("inputCoordinates");
    var validCoordinates = isValidCoordinates(coordsInput.value);
    if (!validCoordinates[0]) {
        alert("Please input valid coordinates!");
        return;
    }
    map.flyTo([validCoordinates[1], validCoordinates[2]], 13)
    placeCompass(validCoordinates.slice(1));
    coordsInput.value = "";
})

