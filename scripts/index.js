document.getElementById("search").addEventListener("click", search);
window.addEventListener("load", onPageLoad);

function search() {
    const flights = document.getElementsByClassName("flight");
    let final_url = `?destinations=${flights.length}&currentSearch=1&currency=EUR`;
    let flight_list = [];
    let num = 1;
    for (let flight of flights)
    {
        const origin = flight.children[0].value;
        const destination = flight.children[1].value;
        const date = flight.children[2].value;
        if (origin==""||destination==""||date=="")
        {
            alert("You need to provide information to the missing fields!");
            return;
        }
        const url = `&origin${num}=${origin}&destination${num}=${destination}&depart${num}=${date}`;
        final_url += url;
        flight_list.push([origin, destination, date]);
        num++;
    }

    showLoading("./pages/search.htm"+final_url);
    localStorage.setItem("flights", JSON.stringify(flight_list));
    localStorage.removeItem("selected_flights");
}

function createNewFlight(orig="", dest="", dat="")
{
    var article = document.createElement("article");
    article.classList.add("flight");

    var origin = document.createElement("input");
    origin.type = "text";
    origin.placeholder = "Origin";
    if (orig!=="") origin.value = orig;
    origin.classList.add("origin_input");
    var destination = document.createElement("input");
    destination.type = "text";
    destination.placeholder = "Destination";
    if (dest!=="") destination.value = dest;
    destination.classList.add("destination_input");
    var date = document.createElement("input");
    date.type = "date";
    if (dat!=="") date.value = dat;
    date.classList.add("date_input");

    var deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.innerText = "-";
    deleteBtn.addEventListener("click", function(){
        this.parentElement.remove();
    });
    deleteBtn.classList.add("deleteBtn");

    article.appendChild(origin);
    article.appendChild(destination);
    article.appendChild(date);
    article.appendChild(deleteBtn);

    document.getElementById("flights_form").insertBefore(article ,document.getElementById("main_buttons"));
}

function onPageLoad()
{
    if (localStorage.getItem("flights").toString()=="") return;
    let flight_list = JSON.parse(localStorage.getItem("flights"));
    for (let flight of flight_list)
    {
        if (flight==flight_list[0])
        {
            console.log(flight)
            document.getElementsByClassName("origin_input")[0].value = flight[0];
            document.getElementsByClassName("destination_input")[0].value = flight[1];
            document.getElementsByClassName("date_input")[0].value = flight[2];
        }
        else
        {
            createNewFlight(flight[0], flight[1], flight[2]);
        }
    }
}
