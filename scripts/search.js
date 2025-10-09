var minimum_seats = 11;

function createFlight(val_duration, val_departure, val_depart_time, val_transfers, val_arrival, val_arrival_time, val_days_later, val_operators, val_economy_cost, val_economy_seats, val_business_cost, val_business_seats)
{
    /* Container */
    var flight = document.createElement("article");
    flight.classList.add("flight");



    /* Container items */
    var info = document.createElement("button");
    info.innerText = "+";
    info.classList.add("info");
    var route = document.createElement("section");
    route.classList.add("route");
    var classes = document.createElement("ul");
    classes.classList.add("classes");



    /* route content */
    var start_ball = document.createElement("hr");
    start_ball.classList.add("start", "ball");
    var timeline = document.createElement("hr");
    timeline.classList.add("timeline");
    var end_ball = document.createElement("hr");
    end_ball.classList.add("end", "ball");
    var duration = document.createElement("p");
    duration.classList.add("duration");
    duration.innerText = val_duration;

    var departure = document.createElement("section");
    departure.classList.add("departure", "flight-segment");
    var transfers = document.createElement("ul");
    transfers.classList.add("transfers");
    var arrival = document.createElement("section");
    arrival.classList.add("arrival", "flight-segment");
    var operators = document.createElement("p");
    operators.classList.add("operator");
    /* all operators */
    if (val_operators.length == 1)
    {
        operators.innerText = "Operated by "
        var operator_1 = document.createElement("span");
        operator_1.classList.add("operator-text");
        operator_1.innerText = val_operators[0];
        operators.appendChild(operator_1);
    }
    else if (val_operators.length == 2)
    {
        operators.innerText = "Operated by "
        var operator_1 = document.createElement("span");
        operator_1.classList.add("operator-text");
        operator_1.innerText = val_operators[0];
        operators.appendChild(operator_1);
        operators.append(" and ");
        var operator_2 = document.createElement("span");
        operator_2.classList.add("operator-text");
        operator_2.innerText = val_operators[1];
        operators.appendChild(operator_2);

    }
    else if (val_operators.length >= 3)
    {
        operators.innerText = "Operated by "
        var operator_1 = document.createElement("span");
        operator_1.classList.add("operator-text");
        operator_1.innerText = val_operators[0];
        operators.appendChild(operator_1);
        operators.append(", ");
        var operator_2 = document.createElement("span");
        operator_2.classList.add("operator-text");
        operator_2.innerText = val_operators[1];
        operators.appendChild(operator_2);
        operators.append(" and ");
        var operator_3 = document.createElement("span");
        operator_3.classList.add("operator-text");
        operator_3.innerText = "+"+(val_operators.length-2);
        operators.appendChild(operator_3);
    }

    
    /* departure content */
    var departure_airport = document.createElement("p");
    departure_airport.classList.add("airport");
    departure_airport.innerText = val_departure;
    var departure_time = document.createElement("p");
    departure_time.classList.add("time");
    departure_time.innerText = val_depart_time;

    /* appending departure content */
    departure.appendChild(departure_airport);
    departure.appendChild(departure_time);


    /* transfers content */
    if (val_transfers.length>0)
    {
        for (let val_transfer of val_transfers)
        {
            var transfer = document.createElement("li");
            transfer.classList.add("transfer");
            transfer.innerText = val_transfer;
            transfers.appendChild(transfer);
        }
    }


    /* arrival content */
    var arrival_airport = document.createElement("p");
    arrival_airport.classList.add("airport");
    arrival_airport.innerText = val_arrival;
    var arrival_time = document.createElement("p");
    arrival_time.classList.add("time");
    arrival_time.append(val_arrival_time);
    if (parseInt(val_days_later)>0)
    {
        var more_days = document.createElement("sup");
        more_days.innerText = "+"+val_days_later;
        arrival_time.appendChild(more_days)
    }

    /* appending arrival content */
    arrival.appendChild(arrival_airport);
    arrival.appendChild(arrival_time);

    
    /* appending route content */
    route.appendChild(start_ball);
    route.appendChild(timeline);
    route.appendChild(end_ball);
    route.appendChild(duration);
    route.appendChild(departure);
    route.appendChild(duration);
    route.appendChild(transfers);
    route.appendChild(arrival);
    route.appendChild(operators);



    /* classes content */
    var economy_section = document.createElement("li");
    economy_section.classList.add("class", "economy");

    var economy_name = document.createElement("p");
    economy_name.classList.add("name");
    economy_name.innerText = "Economy";
    var economy_cost = document.createElement("p");
    economy_cost.classList.add("cost");
    economy_cost.innerText = val_economy_cost;
    if (parseInt(val_economy_seats)<minimum_seats&&parseInt(val_economy_seats)>0)
    {
        var economy_seats = document.createElement("p");
        economy_seats.classList.add("seats-left");
        economy_seats.innerText = `${val_economy_seats} seats left!`;
        economy_section.appendChild(economy_seats);
    }

    economy_section.appendChild(economy_name);
    economy_section.appendChild(economy_cost);


    var business_section = document.createElement("li");
    business_section.classList.add("class", "business");

    var business_name = document.createElement("p");
    business_name.classList.add("name");
    business_name.innerText = "Business";
    var business_cost = document.createElement("p");
    business_cost.classList.add("cost");
    business_cost.innerText = val_business_cost;
    if (parseInt(val_business_seats)<minimum_seats&&parseInt(val_business_seats)>0)
    {
        var business_seats = document.createElement("p");
        business_seats.classList.add("seats-left");
        business_seats.innerText = `${val_business_seats} seats left!`;
        business_section.appendChild(business_seats);
    }

    business_section.appendChild(business_name);
    business_section.appendChild(business_cost);

    /* append classes */
    classes.appendChild(economy_section);
    classes.appendChild(business_section);


    
    /* append to container */
    flight.appendChild(info);
    flight.appendChild(route);
    flight.appendChild(classes);



    document.getElementById("flight_list").appendChild(flight);
}






function formatShortDate(dateString) {
    const date = new Date(dateString);

    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", 
                    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    const day = weekdays[date.getDay()];
    const dayNum = String(date.getDate()).padStart(2, "0");
    const month = months[date.getMonth()];

    return `${day} ${dayNum} ${month}`;
}



async function loadSearch()
{
    document.getElementById("flight_list").innerHTML = '';
    let tags = window.location.href.split(window.location.pathname)[1].replaceAll("?", "").split("&");
    let values = []
    for (let tag of tags)
    {
        key = tag.split("=")[0];
        val = tag.split("=")[1];
        values[key]=val;
    }

    let orig, dest, dat, curr;
    
    var destinations = values["destinations"]
    if (destinations==2)
    {
        var origin = values["origin1"].toUpperCase();
        var destination = values["destination1"].toUpperCase();
        var date_out = values["depart1"];
        var date_in = values["depart2"];
        var currency = values["currency"];
        document.getElementById("outbound_date").innerText = date_out;
        document.getElementById("flight_outbound").innerText = `${getAirport(origin)} ${origin}`;
        document.getElementById("inbound_date").innerText = date_in;
        document.getElementById("flight_inbound").innerText = `${getAirport(destination)} ${destination}`;
        [orig, dest, dat, curr] = [origin, destination, date_out, currency];

        findTransferringFlight(origin, destination, date_out, currency, true);
    }
    else
    {
        var currentSearch = values["currentSearch"];
        var origin = values["origin"+currentSearch].toUpperCase();
        var destination = values["destination"+currentSearch].toUpperCase();
        var date = values["depart"+currentSearch];
        var currency = values["currency"];
        document.getElementById("inbound").remove();
        document.getElementById("flight_inbound").innerText = `${getAirport(origin)} ${origin}`;
        document.getElementById("outbound_date").innerText = date;
        document.getElementById("flight_outbound").innerText = `${getAirport(destination)} ${destination}`;
        [orig, dest, dat, curr] = [origin, destination, date_out, currency];

        findTransferringFlight(origin, destination, date, currency, true);
    }


    for (let i = 0; i < 5; i++)
    {
        const flight_date = new Date(new Date(dat).setDate(new Date(dat).getDate() + (i-2))).toISOString().split('T')[0];
        
        await findTransferringFlight(orig, dest, flight_date, curr, false)
            .then(val => {
                val = val===0 ? val = "-" : `€${val}`;
                document.querySelectorAll(".date .price")[i].innerText = val;
                document.querySelectorAll(".date .day")[i].innerText = formatShortDate(flight_date);
                document.querySelectorAll(".date")[i].dataset.date = val == "-" ? "-" : flight_date;
                if (val=="-") document.querySelectorAll(".date")[i].dataset.disabled = "true";
            });
    }
}

const getAirport = (iata) => {
    return AIRPORTS[iata]!=null ? AIRPORTS[iata] : "UNKNOWN";
};

async function fetchFlights(origin, destination, date, currency = "EUR") {
    const apiUrl = `http://127.0.0.1:5000/flights?origin=${origin}&destination=${destination}&date=${date}&currency=${currency}`;

    await fetch(apiUrl)
    .then(response => { if (response.ok) return response.json() })
    .then(flights => {
        for (let flight of flights)
        {
            if (!flight) return; // skip undefined
            
            createFlight(
                flight.duration.replace("-", "") || "",                     // val_duration
                flight.origin || "",                        // val_departure
                flight.departureTime || "",                 // val_depart_time
                flight.transfers || [],                     // val_transfers
                flight.destination || "",                   // val_arrival
                flight.arrivalTime || "",                   // val_arrival_time
                (flight.daysLater !== undefined ? flight.daysLater.toString() : "0"), // val_days_later
                ["Ryanair"],                               // val_operators
                (flight.price !== undefined ? flight.price.toFixed(2) : "0.00"), // val_economy_cost
                99,                                          // val_economy_seats
                0,                                          // val_business_cost
                0                                           // val_business_seats
            );
        }
    })
    .catch(err => console.error(err))
}

document.querySelectorAll(".date").forEach(el => {
    el.addEventListener("click", () => {
        let tags = window.location.href.split(window.location.pathname)[1].replaceAll("?", "").split("&");
        let values = []
        if (el.dataset.date=="-") return;
        for (let tag of tags)
        {
            key = tag.split("=")[0];
            val = tag.split("=")[1];
            values[key]=val;
        }
            
        var currentSearch = values["currentSearch"];
        var oldDate = values["depart"+currentSearch];

        const newUrl = ("?"+String(tags).replace(`depart${currentSearch}=${oldDate}`, `depart${currentSearch}=${el.dataset.date}`)).toString().replaceAll(",", "&");
        showLoading(newUrl);
    })
});

loadSearch()
