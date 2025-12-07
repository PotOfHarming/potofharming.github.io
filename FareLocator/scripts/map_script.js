// OpenStreetMap standard
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

// Satellite (from Esri)
const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { 
  attribution: '© Esri' 
});

const baseMaps = {
  "OpenStreetMap": osm,
  "Satellite": esriSat
}

const openAirportMap = L.tileLayer(
  'https://tiles.openairportmap.org/tiles/{z}/{x}/{y}.png',
  {
    maxZoom: 17,
    attribution: '© OpenAirportMap, © OpenStreetMap contributors'
  }
);

const overlays = {
  "Airports": openAirportMap
}

var map = L.map('map', {
        center: [51.5, -0.125],
        zoom: 9,
        minZoom: 3,
        layers: [osm]
    });

L.control.layers(baseMaps, overlays).addTo(map);


function drawLine(positions, description=null, clr="blue") {
  var line = L.polyline(
    positions,
    {
      color: clr,
      smoothFactor: 0.2,
      weight: 6
    }
  );
  if (description!=null && description != "") line.bindPopup(description)
  line.addTo(map);
}

const dot = L.divIcon({
    html: '<div style="width:10px; height:10px; background:blue; border-radius:50%;"></div>',
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 20]
});

function drawMarker(pos, name, desc, selected=false) {
  var marker = L.marker(
    [pos[0], pos[1]],
    {
      title: name,
      description: desc,
      opacity: selected ? 1 : 0.25
    }
  )
  .bindPopup(`<h3>${name}</h3>\n<hr>\n<h5>${desc}</h5>`);
  if (!selected) marker.setIcon(dot);
  marker.addTo(map);
}

function setScreenView(pos1, pos2) {
  var sw = [getMin(pos1[0], pos2[0]), getMin(pos1[1], pos2[1])];
  var ne = [getMax(pos1[0], pos2[0]), getMax(pos1[1], pos2[1])];

  map.fitBounds([sw, ne]);
}