const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
});

var map = L.map('map', {
        center: [51.5, -0.125],
        zoom: 3,
        minZoom: 1,
        layers: [osm]
    });

const styles = [
    "Dots", "Rectangles"
]

let style = styles[1];

let dots = [];

function intensityToColor(intensity) {
    let maxIntensity = 50;
    let value = Math.min(intensity / maxIntensity, 1);
    let red = Math.floor(255 * value);
    let green = Math.floor(255 * (1 - value));
    if (green < 25 && red < 25) return false;
    return `rgb(${red},${green},0)`;
}

function drawTile(tile) {
    if (tile.intensity < 0.2) return;
    var clr = intensityToColor(tile.intensity);
    if (!clr) return;
    tile.lon > 180 ? tile.lon = tile.lon - 360 : tile.lon = tile.lon;
    if (tile.lat < 25 && tile.lat > -25) return;
    if (style==styles[0]) {
        var dot = L.circle([tile.lat, tile.lon], {
            radius: 5000,
            color: clr,
            opacity: 0.5,
            fillColor: clr
        })
        .bindPopup(`Tile info:\nLatittude: ${tile.lat}\nLongtitude:${tile.lon}\nIntensity:${tile.intensity}`)
        .addTo(map);
    } else if (style==styles[1]) {
        const delta = 0.5;
        const bounds = [
            [tile.lat - delta, tile.lon - delta],
            [tile.lat + delta, tile.lon + delta]
        ];
        var dot = L.rectangle(bounds, {
            color: clr,
            opacity: 0.25,
            fillColor: clr,
            weight: 0
        })
        .bindPopup(`Tile info:\nLatittude: ${tile.lat}\nLongtitude:${tile.lon}\nIntensity:${tile.intensity}`)
        .addTo(map);
    }

    dots.push(dot);
}

class Tile {
    constructor(lat, lon, intensity) {
        this.lat = lat;
        this.lon = lon;
        this.intensity = intensity;
    }

}

function fetchTiles() {
    fetch("https://services.swpc.noaa.gov/json/ovation_aurora_latest.json?"+new Date().getTime())
        .then(data => data.json())
        .then(json => {
            locations = json["coordinates"];
            let tileList = [];
            maxIntensity = 0;
            for (loc of locations) {
                var t = new Tile(loc[1], loc[0], loc[2],)
                tileList.push(t);
                drawTile(t);
            }
        })
        .catch(err => console.log("Something went wrong, error: ", err));
}

fetchTiles();