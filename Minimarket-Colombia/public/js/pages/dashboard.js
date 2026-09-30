

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const usuarioRaw = localStorage.getItem("usuario");

  const rolesPorRuta = {
    "/dashboard/admin": "admin",
    "/dashboard/worker": "trabajador",
    "/dashboard/client": "cliente",
  };
  const rolEsperado = rolesPorRuta[window.location.pathname];

  let usuario = null;
  if (rolEsperado) {
    if (!token || !usuarioRaw) {
      window.location.href = "/login";
      return;
    }

    try {
      usuario = JSON.parse(usuarioRaw);
    } catch (error) {
      window.location.href = "/login";
      return;
    }

    if (usuario.rol !== rolEsperado) {
      const rutaSegura = usuario.rol === "admin" ? "admin" : usuario.rol === "trabajador" ? "worker" : "client";
      window.location.href = `/dashboard/${rutaSegura}`;
      return;
    }
  }

  const nombreEl = document.querySelector("[data-user-name]");
  if (nombreEl) {
    nombreEl.textContent = usuario.nombre || "";
  }

  const btnSignOut = document.getElementById("btn-sign-out");
  if (btnSignOut) {
    btnSignOut.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.href = "/login";
    });
  }
});
