const home = "index.htm";
const onHome = window.location.pathname.endsWith(home);

const loadScreen = document.getElementById("loading");

if (onHome && !localStorage.getItem("enableLoadingScreen"))
{
    loadScreen.style.animation = "";
    loadScreen.style.opacity = "0";
    loadScreen.style.display = "none";
}
else
{
    localStorage.removeItem("enableLoadingScreen");
    const plane = document.getElementById("plane");
    
    plane.classList.remove("animate");
    plane.style.left = "27.5%";
    void plane.offsetWidth;
    plane.classList.add("animate");
}

document.getElementById("burger_menu-options").children[0].addEventListener("click", function()
{
    var side = document.getElementsByTagName("aside")[0];
    switch (side.style.width)
    {
        case "min(8vw, 8vh)":
            {
                side.style.width = "max(20vw, 20vh)";
                break;
            };
        case "max(20vw, 20vh)":
            {
                side.style.width = "min(8vw, 8vh)";
                break;
            };
        default:
            {
                side.style.width = "max(20vw, 20vh)";
                break;
            }
    }
});

const burger_opts = document.getElementsByClassName("open-page");

for (let opt of burger_opts)
{
    opt.children[0].addEventListener("click", function(e)
    {
        e.preventDefault();
        if (opt.children[0].href==window.location.href+"#") return;
        showLoading(opt.children[0].href);
    });
}

document.getElementById("logo").addEventListener("click", function(e)
{
    e.preventDefault();
    showLoading(onHome ? "./index.htm" : "../index.htm");
});

function showLoading(link) {
    const loadScreen = document.getElementById("loading");
    const plane = document.getElementById("plane");
    
    plane.classList.remove("animate");
    plane.style.left = "27.5%";
    void plane.offsetWidth;

    loadScreen.style.opacity = "";
    loadScreen.style.display = "";
    loadScreen.classList.add("initLoad");

    // Redirect after 1s
    setTimeout(() => {
        window.location.href = link;
        localStorage.setItem("enableLoadingScreen", "1");
    }, 1000);
}
