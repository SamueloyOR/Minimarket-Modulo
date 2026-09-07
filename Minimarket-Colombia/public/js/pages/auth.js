
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

//funcion para cambiar el estilo del icono

const showPsw = document.querySelector(".btn-toggle-show");

if (showPsw) {
  showPsw.addEventListener('click', function(event){
    const element = event.currentTarget;

    if (element.classList.contains('btn-toggle-show')){
      element.classList.toggle('is-applied');
      element.disabled = false;
    }
  });
}