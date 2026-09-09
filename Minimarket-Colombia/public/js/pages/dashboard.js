

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const usuarioRaw = localStorage.getItem("usuario");

  if (!token || !usuarioRaw) {
    window.location.href = "/login";
    return;
  }

  let usuario;
  try {
    usuario = JSON.parse(usuarioRaw);
  } catch (error) {
    window.location.href = "/login";
    return;
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
