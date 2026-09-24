//document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".profile-toggle");
    var menu = document.querySelector(".profile-menu");
    if (!toggle || !dropdown || !menu) return;
    toggle.addEventListener("click", function () {
        var open = dropdown.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll(".profile-option").forEach(function (option) {
        option.addEventListener("click", function () {
            var routes = { user: "/dashboard/client", admin: "/dashboard/admin", worker: "/dashboard/worker" };
            var roles = { user: "cliente", admin: "admin", worker: "trabajador" };
            var user;
            try { user = JSON.parse(localStorage.getItem("usuario") || "null"); } catch (error) { user = null; }
            if (!user || user.rol !== roles[option.dataset.profile]) { window.location.href = "/login"; return; }
            window.location.href = routes[option.dataset.profile];
        });
    });
    document.addEventListener("click", function (event) {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
        }
    });
//});

//Funcion para agregar interaccion al dropdown menu

document.addEventListener("DOMcontentloaded", function (){
    var toggle
    var menu
})
