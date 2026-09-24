document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".profile-dropdown").forEach(function (dropdown) {
        var toggle = dropdown.querySelector(".profile-toggle, #dropdown-toggle, #profile-dropdown-menu");
        var menu = dropdown.querySelector(".profile-menu, #dropdown-menu, .dropdown-menu");

        if (!toggle || !menu || toggle === menu) return;

        toggle.setAttribute("aria-haspopup", "true");
        toggle.setAttribute("aria-expanded", "false");

        toggle.addEventListener("click", function (event) {
            event.preventDefault();
            var open = dropdown.classList.toggle("open");
            toggle.setAttribute("aria-expanded", String(open));
        });

        document.addEventListener("click", function (event) {
            if (!dropdown.contains(event.target)) {
                dropdown.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
            }
        });

        toggle.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                dropdown.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
                toggle.focus();
            }
        });
    });
});
