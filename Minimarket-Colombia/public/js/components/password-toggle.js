// Función para ver la contraseña
function viewPassword() {
    const passwordInput = document.getElementById("password");
    if (!passwordInput) return;

    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
}

window.ViewPassword = viewPassword;
window.viewPassword = viewPassword;

document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const toggle = document.getElementById('showPassword');

    if (passwordInput && toggle) {
        const togglePassword = () => {
            const isVisible = passwordInput.type === 'text';
            passwordInput.type = isVisible ? 'password' : 'text';

            if (toggle.tagName === 'INPUT') {
                toggle.checked = !isVisible;
            }

            toggle.classList.toggle('is-applied', !isVisible);
            toggle.setAttribute('aria-pressed', String(!isVisible));
        };

        if (toggle.tagName === 'INPUT') {
            toggle.addEventListener('change', togglePassword);
        } else {
            toggle.addEventListener('click', togglePassword);
            toggle.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    togglePassword();
                }
            });
        }
    }

    const emailInput = document.getElementById('gmail');
    const mensaje = document.getElementById('mensaje-de-estado');

    function checkGmail(email) {
        const patron = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return patron.test(email);
    }

    if (emailInput && mensaje) {
        emailInput.addEventListener('input', () => {
            const value = emailInput.value.trim();

            if (value === '') {
                mensaje.textContent = '';
                mensaje.className = 'mensaje';
                emailInput.classList.remove('valido', 'invalido');
                return;
            }

            if (checkGmail(value)) {
                mensaje.textContent = '✓ Correo válido';
                mensaje.className = 'mensaje exito';
                emailInput.classList.remove('invalido');
                emailInput.classList.add('valido');
            } else {
                mensaje.textContent = '✕ Formato de correo no válido (ej: usuario@dominio.com)';
                mensaje.className = 'mensaje error';
                emailInput.classList.remove('valido');
                emailInput.classList.add('invalido');
            }
        });
    }
});

