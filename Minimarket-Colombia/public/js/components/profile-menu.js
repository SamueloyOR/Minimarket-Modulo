(function () {
  const RUTAS_PANEL_POR_ROL = {
    admin: "/dashboard/admin",
    trabajador: "/dashboard/worker",
    cliente: "/dashboard/client",
  };

  function leerUsuario() {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null");
    } catch {
      return null;
    }
  }

  function cerrarSesion(evento) {
    evento.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  }

  function configurarDropdown(dropdown, cerrarTodos) {
    const toggle = dropdown.querySelector(".profile-toggle, #dropdown-toggle, #profile-dropdown-menu");
    const menu = dropdown.querySelector(".profile-menu, #dropdown-menu, .dropdown-menu");

    if (!toggle || !menu || toggle === menu) return;

    toggle.setAttribute("aria-haspopup", "true");
    toggle.setAttribute("aria-expanded", "false");
    if (!toggle.getAttribute("aria-controls") && menu.id) {
      toggle.setAttribute("aria-controls", menu.id);
    }

    const abrir = (estado) => {
      dropdown.classList.toggle("open", estado);
      toggle.setAttribute("aria-expanded", String(estado));
    };

    toggle.addEventListener("click", (evento) => {
      evento.preventDefault();
      const vaAAbrir = !dropdown.classList.contains("open");
      cerrarTodos(dropdown);
      abrir(vaAAbrir);
    });

    dropdown.addEventListener("keydown", (evento) => {
      if (evento.key !== "Escape") return;
      abrir(false);
      toggle.focus();
    });

    const usuario = leerUsuario();
    const sesionActiva = Boolean(localStorage.getItem("token"));

    menu.querySelectorAll(".dropdown-item").forEach((item) => {
      if (!sesionActiva && item.id !== "btn-sign-out") {
        item.setAttribute("aria-disabled", "true");
      }
    });

    const panel = menu.querySelector("#btn-dashboard");
    if (panel) {
      panel.href = RUTAS_PANEL_POR_ROL[String(usuario?.rol || "").toLowerCase()] || "/dashboard";
    }

    const perfil = menu.querySelector("#btn-my-profile");
    if (perfil) perfil.href = "/profile";

    const pagos = menu.querySelector("#btn-payments");
    if (pagos) pagos.href = "/payment-methods";

    const salir = menu.querySelector("#btn-sign-out");
    if (salir) {
      salir.addEventListener("click", cerrarSesion);
    }

    menu.addEventListener("click", (evento) => {
      if (evento.target.closest("#btn-sign-out")) return;
      if (evento.target.closest("a, button")) abrir(false);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const dropdowns = [...document.querySelectorAll(".profile-dropdown")];
    if (!dropdowns.length) return;

    const cerrarTodos = (excepto) => {
      dropdowns.forEach((otro) => {
        if (otro === excepto) return;
        otro.classList.remove("open");
        otro.querySelector(".profile-toggle, #dropdown-toggle, #profile-dropdown-menu")
          ?.setAttribute("aria-expanded", "false");
      });
    };

    dropdowns.forEach((dropdown) => configurarDropdown(dropdown, cerrarTodos));

    document.addEventListener("click", (evento) => {
      if (dropdowns.some((dropdown) => dropdown.contains(evento.target))) return;
      cerrarTodos(null);
    });
  });
})();
