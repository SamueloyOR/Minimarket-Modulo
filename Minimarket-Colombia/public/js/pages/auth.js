
document.addEventListener("DOMContentLoaded", () => {
  const toggleContainer = document.querySelector(".password-toggle");
  if (toggleContainer) {
    const input = toggleContainer.querySelector(
      'input[type="password"], input[type="text"]',
    );
    const btn = toggleContainer.querySelector("i");

    if (input && btn) {
      btn.addEventListener("click", () => {
        togglePasswordVisibility(input, btn);
      });
    }
  }

  const profileDropdown = document.querySelector(".profile-dropdown");
  const profileToggle = document.querySelector(".profile-toggle");
  const profileMenu = document.getElementById("profileMenu");
  const profileSelect = document.getElementById("profile");

  if (profileDropdown && profileToggle && profileMenu && profileSelect) {
    const setProfile = (value) => {
      profileSelect.value = value;

      profileMenu.querySelectorAll(".profile-option").forEach((button) => {
        const isSelected = button.dataset.profile === value;
        button.classList.toggle("selected", isSelected);
        button.setAttribute("aria-checked", String(isSelected));
      });
    };

    profileToggle.addEventListener("click", () => {
      const isOpen = profileDropdown.classList.toggle("open");
      profileToggle.setAttribute("aria-expanded", String(isOpen));
    });

    profileMenu.querySelectorAll(".profile-option").forEach((button) => {
      button.addEventListener("click", () => {
        setProfile(button.dataset.profile);
        profileDropdown.classList.remove("open");
        profileToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (event) => {
      if (!profileDropdown.contains(event.target)) {
        profileDropdown.classList.remove("open");
        profileToggle.setAttribute("aria-expanded", "false");
      }
    });
  }
});


//Seleccionar rol
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const roleInput = document.getElementById("role-value");

  const applyRoleStyle = (selectedTab) => {
    const roleColors = {
      Cliente: { backgroundColor: "green", color: "white" },
      Trabajador: { backgroundColor: "blue", color: "white" },
      Admin: { backgroundColor: "red", color: "white" },
    };

    tabs.forEach((tab) => {
      const isActive = tab === selectedTab;
      tab.classList.toggle("active", isActive);

      const role = tab.dataset.role || tab.textContent.trim();
      const colorConfig = roleColors[role];

      if (colorConfig && isActive) {
        tab.style.backgroundColor = colorConfig.backgroundColor;
        tab.style.color = colorConfig.color;
      } else {
        tab.style.backgroundColor = "";
        tab.style.color = "";
      }
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const role = tab.dataset.role || tab.textContent.trim();

      if (roleInput) {
        roleInput.value = role;
      }

      applyRoleStyle(tab);
    });
  });

  const initialRole = roleInput ? roleInput.value.trim() : "";
  const activeTab = [...tabs].find(
    (tab) => (tab.dataset.role || tab.textContent.trim()) === initialRole,
  );

  if (activeTab) {
    applyRoleStyle(activeTab);
  } else if (tabs.length) {
    applyRoleStyle(tabs[0]);
  }
});

function mostrarMensaje(texto, esError = true) {
  const mensaje = document.getElementById("mensaje-de-estado");
  if (!mensaje) return;
  mensaje.textContent = texto;
  mensaje.classList.toggle("mensaje-error", esError);
  mensaje.classList.toggle("mensaje-ok", !esError);
}

const RUTAS_POR_ROL = {
  admin: "/dashboard/admin",
  trabajador: "/dashboard/worker",
  cliente: "/dashboard/client",
};

// --- LOGIN ---
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const correo = document.getElementById("gmail").value.trim();
    const password = document.getElementById("password").value;

    if (!correo || !password) {
      mostrarMensaje("Ingresa correo y contraseña.");
      return;
    }

    const btn = document.getElementById("btn-submit");
    if (btn) btn.disabled = true;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const resultado = await response.json();

      if (!response.ok) {
        mostrarMensaje(resultado.message || "Credenciales inválidas.");
        return;
      }

      localStorage.setItem("token", resultado.token);
      localStorage.setItem("usuario", JSON.stringify(resultado.user));

      window.location.href = RUTAS_POR_ROL[resultado.user.rol] || "/dashboard/client";
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      mostrarMensaje("No se pudo conectar con el servidor.");
    } finally {
      if (btn) btn.disabled = false;
    }
  });
});

// --- REGISTRO ---
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector(".register-form");
  if (!registerForm) return;

  const ROL_MAP = { Cliente: "cliente", Trabajador: "trabajador", Admin: "admin" };

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombres = document.getElementById("nombres").value.trim();
    const apellidos = document.getElementById("apellidos").value.trim();
    const documento = document.getElementById("documento").value.trim();
    const telefono = document.getElementById("telefono")?.value.trim() || "";
    const correo = document.getElementById("gmail").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const roleInput = document.getElementById("role-value");

    if (!nombres || !apellidos || !documento || !correo || !password) {
      mostrarMensaje("Todos los campos son obligatorios (excepto teléfono).");
      return;
    }

    if (password !== confirmPassword) {
      mostrarMensaje("Las contraseñas no coinciden.");
      return;
    }

    const rol = ROL_MAP[roleInput ? roleInput.value : "Cliente"] || "cliente";

    const btn = document.getElementById("btn-submit");
    if (btn) btn.disabled = true;

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: `${nombres} ${apellidos}`.trim(),
          documento,
          telefono,
          correo,
          password,
          rol,
        }),
      });

      const resultado = await response.json();

      if (!response.ok) {
        mostrarMensaje(resultado.message || "No se pudo crear la cuenta.");
        return;
      }

      window.location.href = "/login";
    } catch (error) {
      console.error("Error al registrar:", error);
      mostrarMensaje("No se pudo conectar con el servidor.");
    } finally {
      if (btn) btn.disabled = false;
    }
  });
});