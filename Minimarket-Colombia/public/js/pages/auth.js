const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PATRON_DOCUMENTO = /^\d{6,15}$/;
const PATRON_TELEFONO = /^\+?[0-9 ]{7,20}$/;

const RUTAS_POR_ROL = {
  admin: "/dashboard/admin",
  trabajador: "/dashboard/worker",
  cliente: "/dashboard/client",
};

function mostrarMensaje(texto, esError = true) {
  const mensaje = document.getElementById("mensaje-de-estado");
  if (!mensaje) return;

  mensaje.textContent = texto;
  mensaje.hidden = !texto;
  mensaje.classList.toggle("error", esError && Boolean(texto));
  mensaje.classList.toggle("exito", !esError && Boolean(texto));
}

function marcarCampo(input, esValido) {
  if (!input) return;
  input.classList.toggle("valido", esValido === true);
  input.classList.toggle("invalido", esValido === false);
  input.setAttribute("aria-invalid", esValido === false ? "true" : "false");
}

function setEnviando(boton, enviando, textoIdle) {
  if (!boton) return;
  boton.disabled = enviando;
  boton.dataset.idleText = textoIdle;
  boton.textContent = enviando ? "Enviando…" : textoIdle;
}

function rutaParaRol(rol) {
  return RUTAS_POR_ROL[String(rol || "").trim().toLowerCase()] || "/dashboard/client";
}

function configurarPestanasDeRol() {
  const pestanas = [...document.querySelectorAll(".tab")];
  if (!pestanas.length) return;

  const roleInput = document.getElementById("role-value");

  // El backend asigna siempre el rol "cliente" al registrarse.
  pestanas.forEach((tab) => {
    if (tab.dataset.role !== "Cliente") tab.hidden = true;
  });

  const visibles = pestanas.filter((tab) => !tab.hidden);

  const seleccionar = (tab) => {
    visibles.forEach((otro) => {
      const activo = otro === tab;
      otro.classList.toggle("active", activo);
      otro.setAttribute("aria-pressed", String(activo));
      otro.tabIndex = activo ? 0 : -1;
    });

    if (roleInput) roleInput.value = tab.dataset.role || tab.textContent.trim();
  };

  visibles.forEach((tab, indice) => {
    tab.setAttribute("aria-pressed", "false");
    tab.tabIndex = indice === 0 ? 0 : -1;

    tab.addEventListener("click", () => seleccionar(tab));

    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const siguiente = visibles[(visibles.indexOf(tab) + delta + visibles.length) % visibles.length];
      seleccionar(siguiente);
      siguiente.focus();
    });
  });

  const inicial = roleInput?.value.trim();
  seleccionar(visibles.find((tab) => tab.dataset.role === inicial) || visibles[0]);
}

function validarRegistro() {
  const nombres = document.getElementById("nombres").value.trim();
  const apellidos = document.getElementById("apellidos").value.trim();
  const documento = document.getElementById("documento").value.trim();
  const telefono = document.getElementById("telefono")?.value.trim() || "";
  const correo = document.getElementById("gmail").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!nombres || !apellidos || !documento || !correo || !password) {
    return { error: "Todos los campos son obligatorios (excepto teléfono)." };
  }

  if (!PATRON_DOCUMENTO.test(documento)) {
    marcarCampo(document.getElementById("documento"), false);
    return { error: "El documento debe contener entre 6 y 15 dígitos." };
  }

  if (!PATRON_CORREO.test(correo)) {
    marcarCampo(document.getElementById("gmail"), false);
    return { error: "El correo no tiene un formato válido." };
  }

  if (telefono && !PATRON_TELEFONO.test(telefono)) {
    marcarCampo(document.getElementById("telefono"), false);
    return { error: "El teléfono no tiene un formato válido." };
  }

  if (password.length < 8) {
    marcarCampo(document.getElementById("password"), false);
    return { error: "La contraseña debe contener al menos 8 caracteres." };
  }

  if (password !== confirmPassword) {
    marcarCampo(document.getElementById("confirmPassword"), false);
    return { error: "Las contraseñas no coinciden." };
  }

  return {
    datos: {
      nombre: `${nombres} ${apellidos}`.trim(),
      documento,
      telefono,
      correo,
      password,
    },
  };
}

document.addEventListener("DOMContentLoaded", () => {
  configurarPestanasDeRol();

  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const correo = document.getElementById("gmail").value.trim();
      const password = document.getElementById("password").value;
      const boton = document.getElementById("btn-submit");

      if (!correo || !password) {
        mostrarMensaje("Ingresa correo y contraseña.");
        return;
      }

      setEnviando(boton, true, "Ingresar");
      mostrarMensaje("");

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, password }),
        });

        const resultado = await response.json().catch(() => ({}));

        if (!response.ok) {
          mostrarMensaje(resultado.message || "Credenciales inválidas.");
          return;
        }

        localStorage.setItem("token", resultado.token);
        localStorage.setItem("usuario", JSON.stringify(resultado.user));

        mostrarMensaje("Sesión iniciada. Redirigiendo…", false);
        window.location.href = rutaParaRol(resultado.user?.rol);
      } catch (error) {
        console.error("Error al iniciar sesión:", error);
        mostrarMensaje("No se pudo conectar con el servidor.");
      } finally {
        setEnviando(boton, false, "Ingresar");
      }
    });
  }

  const registerForm = document.querySelector(".register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const boton = document.getElementById("btn-submit");
      const { datos, error } = validarRegistro();

      if (error) {
        mostrarMensaje(error);
        return;
      }

      setEnviando(boton, true, "Registrar");
      mostrarMensaje("");

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        });

        const resultado = await response.json().catch(() => ({}));

        if (!response.ok) {
          mostrarMensaje(resultado.message || "No se pudo crear la cuenta.");
          return;
        }

        mostrarMensaje("Cuenta creada. Ahora inicia sesión.", false);
        window.setTimeout(() => { window.location.href = "/login"; }, 900);
      } catch (error) {
        console.error("Error al registrar:", error);
        mostrarMensaje("No se pudo conectar con el servidor.");
      } finally {
        setEnviando(boton, false, "Registrar");
      }
    });
  }
});
