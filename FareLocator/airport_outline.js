function getAirport(icao) {
  fetch('https://openairportmap.org/api/airport/'+icao)
  .then(res => res.json())
  .then(osm => {
    const nodes = {};
    const features = [];
    osm.elements.forEach(el => { if (el.type === "node") nodes[el.id] = el; });
    osm.elements.forEach(el => {
      if (el.type === "node" && el.tags?.aeroway) {
        features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [el.lon, el.lat]
          },
          properties: el.tags
        });
      }
      if (el.type === "way" && el.tags?.aeroway) {

        const coords = el.nodes
          .map(id => nodes[id])
          .filter(n => n)
          .map(n => [n.lon, n.lat]);

        const isPolygon = coords.length > 3 && coords[0][0] === coords.at(-1)[0];

        features.push({
          type: "Feature",
          geometry: {
            type: isPolygon ? "Polygon" : "LineString",
            coordinates: isPolygon ? [coords] : coords
          },
          properties: el.tags
        });
      }
    });

    const geojson = {
      type: "FeatureCollection",
      features
    };

    drawAirportGeoJSON(geojson);
  })
  .catch(err => console.error("Airport load failed:", err));


}

function drawAirportGeoJSON(geojson) {
  L.geoJSON(geojson, {
    style: feature => {
        const t = feature.properties.aeroway;

        // just set colors, no pixel weight
        if (t === "runway") return { color: "white" };
        if (t === "taxiway") return { color: "yellow" };
        if (t === "apron") return { color: "#888" };

        return { color: "gray" };
    },

    pointToLayer: (feature, latlng) => {
        // For points, if you want them as geographic sizes, use L.circle (radius in meters)
        const t = feature.properties.aeroway;
        if (t === "parking_position") return L.circle(latlng, { radius: 10, color: "lime", fillOpacity: 0.7 });
        if (t === "threshold") return L.circle(latlng, { radius: 10, color: "red", fillOpacity: 0.7 });

        return L.circle(latlng, { radius: 5, color: "cyan", fillOpacity: 0.7 });
    },

    onEachFeature: (feature, layer) => {
        if (feature.properties.ref) layer.bindTooltip(feature.properties.ref);
    }

    }).addTo(map);
}
