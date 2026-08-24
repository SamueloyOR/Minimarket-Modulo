//toggle para mostrar y ocultar contraseña
function togglePasswordVisibility(input, icon) {
  if (!input) return;

  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";

  if (icon) {
    icon.classList.toggle("visible", isPassword);
    icon.setAttribute("aria-pressed", String(isPassword));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleContainer = document.querySelector(".password-toggle");
  if (!toggleContainer) return;

  const input = toggleContainer.querySelector(
    'input[type="password"], input[type="text"]',
  );
  const btn = toggleContainer.querySelector("i");

  if (!input || !btn) return;

  btn.addEventListener("click", () => {
    togglePasswordVisibility(input, btn);
  });

});

//funcion para cambiar el estilo del icono

function icontheme(){
    
    const backgroundColorIcon = document.querySelector("i");

    if (backgroundColorIcon) {
        backgroundColorIcon.addEventListener("click", () => {
            backgroundColorIcon.innerHTML `<svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  stroke-width="1"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                  <path
                    d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"
                  />
                </svg>`
        });
    }
}
