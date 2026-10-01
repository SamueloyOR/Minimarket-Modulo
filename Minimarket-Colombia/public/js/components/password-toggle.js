(function () {
  const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function configurarAlternarPassword() {
    const passwordInput = document.getElementById("password");
    const toggle = document.getElementById("showPassword");

    if (!passwordInput || !toggle) return;

    const esCheckbox = toggle.tagName === "INPUT";

    if (!esCheckbox) {
      toggle.setAttribute("role", "button");
      toggle.setAttribute("aria-pressed", "false");
    }

    const alternar = () => {
      const visible = passwordInput.type === "text";
      passwordInput.type = visible ? "password" : "text";

      if (esCheckbox) {
        toggle.checked = !visible;
      } else {
        toggle.setAttribute("aria-pressed", String(!visible));
      }

      toggle.classList.toggle("is-applied", !visible);
      passwordInput.focus({ preventScroll: true });
    };

    if (esCheckbox) {
      toggle.addEventListener("change", alternar);
      return;
    }

    toggle.addEventListener("click", (evento) => {
      evento.preventDefault();
      alternar();
    });

    toggle.addEventListener("keydown", (evento) => {
      if (evento.key !== "Enter" && evento.key !== " ") return;
      evento.preventDefault();
      alternar();
    });
  }

  function configurarValidacionCorreo() {
    const emailInput = document.getElementById("gmail");
    const mensaje = document.getElementById("mensaje-de-estado");

    if (!emailInput) return;

    emailInput.addEventListener("input", () => {
      const valor = emailInput.value.trim();

      if (valor === "") {
        if (mensaje && mensaje.dataset.origen === "correo") {
          mensaje.textContent = "";
          mensaje.hidden = true;
          mensaje.className = "mensaje";
          delete mensaje.dataset.origen;
        }
        emailInput.classList.remove("valido", "invalido");
        emailInput.removeAttribute("aria-invalid");
        return;
      }

      const esValido = PATRON_CORREO.test(valor);
      emailInput.classList.toggle("valido", esValido);
      emailInput.classList.toggle("invalido", !esValido);
      emailInput.setAttribute("aria-invalid", String(!esValido));

      if (!mensaje || mensaje.dataset.origen !== "correo") return;

      if (esValido) {
        mensaje.textContent = "";
        mensaje.className = "mensaje";
        mensaje.hidden = true;
        delete mensaje.dataset.origen;
        return;
      }

      mensaje.textContent = "Formato de correo no válido (ej: usuario@dominio.com)";
      mensaje.className = "mensaje error";
      mensaje.hidden = false;
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    configurarAlternarPassword();
    configurarValidacionCorreo();
  });
})();
