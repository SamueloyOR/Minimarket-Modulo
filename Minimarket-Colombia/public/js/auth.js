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

const showPsw = document.querySelector(".btn-toggle-show")


showPsw.addEventListener('click', function(event){
  const element = event.target

  if (element.classList.contains('btn-toggle-show')){
    element.classList.add('is-applied')
    element.disabled = true
  }
})