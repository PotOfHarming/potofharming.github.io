var routes = [];
var positions = [];

function placeRoutes() {
    fetch('locations.json')
    .then(response => {
        if (!response.ok) throw new Error("HTTP Error: " + response.status);
        return response.json();
    })
    .then(data => {
        var airports = [];
        for (ap of data) {
            if (routes.length>0 && routes.includes(ap.iata)) {
                drawMarker([ap.lat, ap.lon], ap.name, `${ap.iata} - ${ap.icao}`, true);
                airports[ap.iata] = [[ap.lat, ap.lon], ap.iata, ap.icao, ap.name, ap.country];
                getAirport(ap.icao)
            } else drawMarker([ap.lat, ap.lon], ap.name, `${ap.iata} - ${ap.icao}`, false);
        }
        
        if (routes.length==0 || airports.length==0) return;
        var [maxN, maxE, maxS, maxW] = [null, null, null, null];
        for (r of routes) {
            r = r.toUpperCase();
            positions.push(airports[r][0]);
            if (maxN < getMax(maxN, airports[r][0][0]) || maxN==null) maxN = airports[r][0][0];
            if (maxS > getMin(maxS, airports[r][0][0]) || maxS==null) maxS = airports[r][0][0];
            if (maxE < getMax(maxE, airports[r][0][1]) || maxE==null) maxE = airports[r][0][1];
            if (maxW > getMin(maxW, airports[r][0][1]) || maxW==null) maxW = airports[r][0][1];
        }
        setScreenView([maxS, maxW], [maxN, maxE]);
        if (positions.length>1) {
            for (var p=0; p<positions.length-1; p++){
                drawLine(
                    [positions[p], positions[p+1]], 
                    `<h3>${airports[routes[p]][3]} (${routes[p]}) to ${airports[routes[p+1]][3]} (${routes[p+1]})</h3>`, 
                    "red");
            }
        }
    })
    .catch(error => {
        console.error('Error loading JSON:', error);
    });
}

function getRoutes() {
    var main = window.location.protocol+"//"+window.location.hostname+(window.location.port!=""?":"+window.location.port:"")+window.location.pathname;
    if (!window.location.href.startsWith(main+"?")) console.log("No routes possible");
    var locations = window.location.href.replace(main+"?", "");
    if (locations.split(',')!=""&&locations!=null) {
        routes = locations.split(',');
    }
    placeRoutes();
}

getRoutes();