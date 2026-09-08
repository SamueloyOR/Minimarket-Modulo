
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
  const roleInput = document.getElementById("role");

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