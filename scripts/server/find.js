const RYANAIR_URL = "https://services-api.ryanair.com/farfnd/3/oneWayFares";

class Flight {
    constructor(origin, destination, transfers, depart, arrive, daysLater, flightNumbers, price, currency) {
        this.origin = origin;
        this.destination = destination;
        this.transfers = transfers;
        this.depart = depart;
        this.arrive = arrive;
        this.daysLater = daysLater;
        this.flightNumbers = flightNumbers;
        this.price = parseFloat(price).toFixed(2);
        this.currency = currency;
    }

    toList() {
        return {
            origin: this.origin,
            destination: this.destination,
            transfers: this.transfers,
            depart: this.depart,
            arrive: this.arrive,
            daysLater: this.daysLater,
            flightnumber: this.flightNumbers,
            price: this.price,
            currency: this.currency
        };
    }

    info() {
        let transfer_txt = this.transfers.length > 0
            ? `${this.origin}-${this.transfers.join("-")}-${this.destination}`
            : "Direct";
        return `Flight ${this.origin} (${this.depart}) to ${this.destination} (${this.arrive}) via ${transfer_txt} for ${this.price} ${this.currency}.`;
    }

    static createFromFare(fare) {
        return new Flight(
            fare["outbound"]["departureAirport"]["iataCode"],
            fare["outbound"]["arrivalAirport"]["iataCode"],
            [],
            fare["outbound"]["departureDate"],
            fare["outbound"]["arrivalDate"],
            0,
            "RYR",
            parseFloat(fare["summary"]["price"]["value"]),
            fare["summary"]["price"]["currencyCode"]
        );
    }
}

function timeDifference(date1, date2, debug = false) {
    if (debug) console.log(date1, date2);
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    const diffMs = Math.abs(d2 - d1);
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const dayDiff = Math.abs(
        d2.getDate() - d1.getDate() +
        31 * (d2.getMonth() - d1.getMonth()) +
        372 * (d2.getFullYear() - d1.getFullYear())
    );

    return [`${hours}h ${minutes}m`, dayDiff];
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function fetchSpecificFlight(origin, arrival, sDate, eDate = sDate, sTime = "00%3A00", eTime = "23%3A59", currency = "EUR") {
    const params = `?departureAirportIataCode=${origin}&arrivalAirportIataCode=${arrival}` +
                   `&outboundDepartureDateFrom=${sDate}&outboundDepartureDateTo=${eDate}` +
                   `&outboundDepartureTimeFrom=${sTime}&outboundDepartureTimeTo=${eTime}` +
                   `&currency=${currency}`;

    const FETCH_URL = RYANAIR_URL + params;
    console.log(FETCH_URL);

    try {
        const response = await fetch(FETCH_URL);
        if (response.status === 429 || response.status === 500) {
            console.log("Rate limited or server error — retrying in 3s...");
            await delay(3000);
            return fetchSpecificFlight(origin, arrival, sDate, eDate, sTime, eTime, currency);
        }

        const data = await response.json();
        if (!data || !data.fares || data.fares.length === 0) return null;

        // Return all flights instead of only the first one
        return data.fares.map(fl => Flight.createFromFare(fl));

    } catch (err) {
        console.error(`Error when fetching flight (${origin}-${arrival}):`, err);
        return null;
    }
}


async function fetchAvailableRoutes(origin, arrival, sDate, eDate = sDate, sTime = "00%3A00", eTime = "23%3A59", currency = "EUR", betweenAirport = false) {
    const params = `?departureAirportIataCode=${origin}` +
                   `&outboundDepartureDateFrom=${sDate}&outboundDepartureDateTo=${eDate}` +
                   `&outboundDepartureTimeFrom=${sTime}&outboundDepartureTimeTo=${eTime}` +
                   `&currency=${currency}`;
    const FETCH_URL = RYANAIR_URL + params;
    console.log(FETCH_URL);

    try {
        const response = await fetch(FETCH_URL);
        if (response.status === 429 || response.status === 500) {
            console.log("Rate limited — retrying in 3s...");
            await delay(3000);
            return fetchAvailableRoutes(origin, arrival, sDate, eDate, sTime, eTime, currency, betweenAirport);
        }

        const flights = await response.json();
        if (!flights || !flights.fares) return null;

        let flight_list = [];
        let found = false;

        for (let flight of flights.fares) {
            if (betweenAirport) {
                if (flight["outbound"]["arrivalAirport"]["iataCode"] !== arrival) continue;
                found = true;
            } else {
                const f = Flight.createFromFare(flight);
                flight_list.push(f);
            }
        }

        if (betweenAirport) return found;
        return flight_list;

    } catch (err) {
        console.error(`Error when fetching routes (${origin}-${arrival}):`, err);
        return null;
    }
}


async function findTransferringFlight(origin, arrival, date, currency = "EUR", createCard = false) {
    console.log(origin, arrival, date, currency);
    const dest_list = [];
    let cheapest = 0;

    const results = await fetchAvailableRoutes(origin, arrival, date, date, "00%3A00", "23%3A59", currency);
    if (!results) {
        console.log("Error fetching available routes — retrying...");
        await delay(1000);
        return findTransferringFlight(origin, arrival, date, currency, createCard);
    }

    for (let flight of results) dest_list.push({ dest: flight.destination, flight });

    const directFlights = await fetchSpecificFlight(origin, arrival, date, date, "00%3A00", "23%3A59", currency);
    if (directFlights && directFlights.length > 0) {
        const flight = directFlights[0];
        const f = new Flight(
            origin,
            arrival,
            [],
            flight.depart,
            flight.arrive,
            timeDifference(flight.depart, flight.arrive)[1],
            [],
            parseFloat(flight.price),
            currency
        );

        const dep = new Date(f.depart);
        const arr = new Date(f.arrive);
        const timeDiff = timeDifference(f.depart, f.arrive)[0];
        if (cheapest==0 || cheapest > f.price) cheapest = f.price;

        createFlight(
            timeDiff,
            f.origin,
            `${String(dep.getHours()).padStart(2, "0")}:${String(dep.getMinutes()).padStart(2, "0")}`,
            f.transfers,
            f.destination,
            `${String(arr.getHours()).padStart(2, "0")}:${String(arr.getMinutes()).padStart(2, "0")}`,
            f.daysLater,
            ["Ryanair"],
            `€${f.price}`,
            999,
            "-",
            0
        );
    }

    for (let { dest: DEST, flight: FLIGHT } of dest_list) {
        const fl_arrival = new Date(FLIGHT.arrive);
        const newStart = new Date(fl_arrival.getTime() + 2 * 60 * 60 * 1000); // +2h layover
        const newEnd = new Date(fl_arrival.getTime() + 24 * 60 * 60 * 1000);  // +24h search window

        const newSDate = `${newStart.getFullYear()}-${String(newStart.getMonth() + 1).padStart(2, "0")}-${String(newStart.getDate()).padStart(2, "0")}`;
        const newSTime = `${String(newStart.getHours()).padStart(2, "0")}%3A${String(newStart.getMinutes()).padStart(2, "0")}`;
        const newEDate = `${newEnd.getFullYear()}-${String(newEnd.getMonth() + 1).padStart(2, "0")}-${String(newEnd.getDate()).padStart(2, "0")}`;
        const newETime = `${String(newEnd.getHours()).padStart(2, "0")}%3A${String(newEnd.getMinutes()).padStart(2, "0")}`;

        const flights2 = await fetchSpecificFlight(DEST, arrival, newSDate, newEDate, newSTime, newETime, currency);
        if (!flights2) continue;

        const flight2 = flights2.find(f => {
            const dep2 = new Date(f.depart);
            const min = fl_arrival.getTime() + 2 * 60 * 60 * 1000;   // +2h
            const max = fl_arrival.getTime() + 24 * 60 * 60 * 1000;
            return dep2 >= min && dep2 <= max;
        });

        if (!flight2) continue;

        const f = new Flight(
            origin,
            arrival,
            [DEST],
            FLIGHT.depart,
            flight2.arrive,
            timeDifference(FLIGHT.depart, flight2.arrive)[1],
            [],
            parseFloat(FLIGHT.price) + parseFloat(flight2.price),
            currency
        );
        if (cheapest==0 || cheapest > f.price) cheapest = f.price;

        const dep = new Date(f.depart);
        const arr = new Date(f.arrive);
        const timeDiff = timeDifference(f.depart, f.arrive)[0];

        console.log(`Transfer route found: ${origin} → ${DEST} → ${arrival}`);

        createFlight(
            timeDiff,
            f.origin,
            `${String(dep.getHours()).padStart(2, "0")}:${String(dep.getMinutes()).padStart(2, "0")}`,
            f.transfers,
            f.destination,
            `${String(arr.getHours()).padStart(2, "0")}:${String(arr.getMinutes()).padStart(2, "0")}`,
            f.daysLater,
            Array(f.transfers.length + 1).fill("Ryanair"),
            `€${f.price}`,
            999,
            "-",
            0
        );
    }
    // console.log("Cheapest flight costst ", cheapest)
    console.log("Loaded all flights!");

    if (!createCard) return cheapest;
}

// findTransferringFlight("EIN", "STN", "2025-12-12");
