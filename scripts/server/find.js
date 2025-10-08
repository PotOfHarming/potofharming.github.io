const RYANAIR_URL = "https://services-api.ryanair.com/farfnd/3/oneWayFares";

class Flight
{
    constructor(origin, destination, transfers, depart, arrive, daysLater, flightNumbers, price, currency)
    {
        this.origin = origin
        this.destination = destination
        this.transfers = transfers
        this.depart = depart
        this.arrive = arrive
        this.daysLater = daysLater
        this.flightNumbers = flightNumbers
        this.price = parseFloat(price).toFixed(2)
        this.currency = currency
    }

    toList()
    {
        return {
            "origin": this.origin,
            "destination": this.destination,
            "transfers": this.transfers,
            "depart": this.depart,
            "arrive": this.arrive,
            "daysLater": this.daysLater,
            "flightnumber": this.flightNumbers,
            "price": this.price,
            "currency": this.currency
        }
    }
    
    info()
    {
        let transfer_txt = this.transfers.length > 0 ? `${this.origin}${"-" + this.transfers.join("-")+"-"}${this.destination}` : "Direct";
        return `Flight ${this.origin} (${this.depart}) to ${this.destination} (${this.arrive}) via ${transfer_txt} for ${this.price} ${this.currency}.`
    }

    static createFromFare(fare)
    {
        return new Flight(
                        fare["outbound"]["departureAirport"]["iataCode"],
                        fare["outbound"]["arrivalAirport"]["iataCode"],
                        [],
                        fare["outbound"]["departureDate"],
                        fare["outbound"]["arrivalDate"],
                        0,
                        "KL123",
                        parseFloat(fare["summary"]["price"]["value"]),
                        fare["summary"]["price"]["currencyCode"]
                    );
    }
}

function timeDifference(date1, date2, a=false) {
    if (a) console.log(date1, date2);
    
    // Convert to Date objects (in case they're strings)
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    // Get the total difference in milliseconds
    const diffMs = Math.abs(d2 - d1);

    // Convert to hours & minutes
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Get the day difference (based on calendar days)
    const dayDiff = Math.abs(
        d2.getDate() - d1.getDate() +
        31 * (d2.getMonth() - d1.getMonth()) +
        372 * (d2.getFullYear() - d1.getFullYear())
    );

    // Format as "XXh XXm"
    const formatted = `${hours}h ${minutes}m`;

    return [ formatted, dayDiff ];
}


function fetchSpecificFlight(origin, arrival, sDate, eDate=sDate, sTime="00%3A00", eTime="23%3A59", currency="EUR")
{
    let params_1 = `?departureAirportIataCode=${origin}&arrivalAirportIataCode=${arrival}`;
    let params_2 = `&outboundDepartureDateFrom=${sDate}&outboundDepartureDateTo=${eDate}`;
    let params_3 = `&outboundDepartureTimeFrom=${sTime}&outboundDepartureTimeTo=${eTime}&currency=${currency}`;

    let params = params_1 + params_2 + params_3;
    let FETCH_URL = RYANAIR_URL+params;
    console.log(FETCH_URL);
    
    return fetch(FETCH_URL, { 
            method: "GET"
        })
        .then(async response => {
            if (response.status==429||response.status==500) 
            {
                try {
                    console.log("something went wrong, retrying in 1 second...");
                    return delay(3000).then( d => { return fetchSpecificFlight(origin, arrival, sDate, eDate, sTime, eTime, currency) });
                } catch (err) 
                {
                    console.log(`Retrying search of flight ${origin}-${arrival}...`);
                    throw err
                };
            }
            return await response.json();
        })
        .then(data => {
            if (data==null||data["fares"]==null||data["fares"].length==0) return null;
            fl = data["fares"][0]
            let f = Flight.createFromFare(fl);
            console.log("Flight found!");
            return f;
        })
        .catch(err => {
            console.error(`Error when fetching flight (${origin}-${arrival}): ${err}`);
            return null;
        })
}

function fetchAvailableRoutes(origin, arrival, sDate, eDate=sDate, sTime="00%3A00", eTime="23%3A59", currency="EUR", betweenAirport=false)
{
    
    let params_1 = `?departureAirportIataCode=${origin}&outboundDepartureDateFrom=${sDate}`;
    let params_2 = `&outboundDepartureDateTo=${eDate}&outboundDepartureTimeFrom=${sTime}`;
    let params_3 = `&outboundDepartureTimeTo=${eTime}&currency=${currency}`;

    let params = params_1 + params_2 + params_3;
    let FETCH_URL = RYANAIR_URL+params;
    console.log(FETCH_URL);
    return fetch(FETCH_URL, { 
        method: "GET"
    })
        .then(async response => {
            if (response.status==429||response.status==500) 
            {
                try {
                    console.log("something went wrong, retrying in 3 seconds...");
                    return delay(3000).then( d => { return fetchAvailableRoutes(origin, arrival, sDate, eDate, sTime, eTime, currency, betweenAirport) });
                } catch (err) {
                    console.log(`Retrying search of flight ${origin}-${arrival}...`);
                    throw err;
                };
            }
            return await response.json();
        })
        .then(flights => {
            flight_list = [];
            var found = false;
            for (flight of flights["fares"])
            {
                if (betweenAirport)
                {
                    if (flight["outbound"]["arrivalAirport"]["iataCode"]!=arrival) continue;
                    else found = true;
                } 
                else
                {
                    let f = Flight.createFromFare(flight);
                    flight_list.push(f);
                }
            }
            if (found&&flight_list.length>0&&flight_list[0]!=undefined&&flight_list[0]!=null) console.log("Flight found!");
            if (betweenAirport) return found;
            else return flight_list;
        })
        .catch(err => {
            console.error(`Error when fetching flight (${origin}-${arrival})`, err);
            return null;
        });
}

/* Use to prevent too many requests (429) */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function findTransferringFlight(origin, arrival, date, currency="EUR")
{
    console.log(origin, arrival, date, currency)
    let dest_list = [];

    await fetchAvailableRoutes(origin, arrival, date, date, "00%3A00", "23%3A59", currency, false)
            .then(results => {
                if (results==null)
                {
                    console.log("something went wrong, retrying in 1 second...");
                    return delay(1000).then( d => {return findTransferringFlight(origin, arrival, date, currency); } );
                    
                }
                for (let flight of results) dest_list.push({"dest":flight.destination, "flight":flight});
            });

    await fetchSpecificFlight(origin, arrival, date, date, "00%3A00", "23%3A59", currency)
            .then(flight => {
                if (flight==null) return null;

                let f = new Flight(
                    origin,
                    arrival,
                    [],
                    flight.depart,
                    flight.arrive,
                    timeDifference(flight.depart, flight.arrive)[1],
                    [],
                    parseFloat(flight.price) + parseFloat(flight.price),
                    currency
                );
                let dep = new Date(f.depart);
                let arr = new Date(f.arrive);
                let timeDiff = timeDifference(f.depart, f.arrive)[0];
                createFlight(
                    timeDiff,
                    f.origin, 
                    `${String(dep.getHours()).padStart(2, "0")}:${String(dep.getMinutes()).padStart(2, "0")}`, 
                    f.transfers, 
                    f.destination, 
                    `${String(arr.getHours()).padStart(2, "0")}:${String(arr.getMinutes()).padStart(2, "0")}`, 
                    f.daysLater, 
                    Array(1).fill("Ryanair"), 
                    `€${f.price}`, 
                    999, 
                    "-", 
                    0
                );
            });
    
    console.log(dest_list)
    for (let destination in dest_list)
    {
        const DEST = dest_list[destination]["dest"];
        const FLIGHT = dest_list[destination]["flight"];
        console.log(DEST)
        let fl_arrival = new Date(FLIGHT["arrive"]);

        let newStart = new Date(fl_arrival.getTime() + 2*60*60*1000);
        let newEnd   = new Date(fl_arrival.getTime() + 24*60*60*1000);

        let newSDate = `${newStart.getFullYear()}-${String(newStart.getMonth()+1).padStart(2)}-${String(newStart.getDate()).padStart(2)}`.replaceAll(" ", "0");
        let newSTime = `${String(newStart.getHours()).padStart(2,"0")}%3A${String(newStart.getMinutes()).padStart(2)}`;
        let newEDate = `${newEnd.getFullYear()}-${String(newEnd.getMonth()+1).padStart(2,"0")}-${String(newEnd.getDate()).padStart(2)}`.replaceAll(" ", "0");
        let newETime = `${String(newEnd.getHours()).padStart(2)}%3A${String(newEnd.getMinutes()).padStart(2)}`;
        console.log(newSDate)
        console.log(newEDate)

        await fetchSpecificFlight(DEST, arrival, newSDate, newEDate, newSTime, newETime, currency, false)
                .then(flight2 => {
                    if (flight2==null) return null;
                    flight1 = FLIGHT;

                    let f = new Flight(
                        origin,
                        arrival,
                        [DEST],
                        flight1.depart,
                        flight2.arrive,
                        timeDifference(flight1.depart, flight2.arrive)[1],
                        [],
                        parseFloat(flight1.price) + parseFloat(flight2.price),
                        currency
                    );
                    let dep = new Date(f.depart);
                    let arr = new Date(f.arrive);
                    let timeDiff = timeDifference(f.depart, f.arrive)[0];
                    createFlight(
                        timeDiff,
                        f.origin, 
                        `${String(dep.getHours()).padStart(2, "0")}:${String(dep.getMinutes()).padStart(2, "0")}`, 
                        f.transfers, 
                        f.destination, 
                        `${String(arr.getHours()).padStart(2, "0")}:${String(arr.getMinutes()).padStart(2, "0")}`, 
                        f.daysLater, 
                        Array(f.transfers.length+1).fill("Ryanair"), 
                        `€${f.price}`, 
                        999, 
                        "-", 
                        0
                    );
                });
    }
    console.log("Loaded all flights!");
}

// findTransferringFlight("EIN", "STN", "2025-12-12")