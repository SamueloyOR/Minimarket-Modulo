//funcion para ver la contrasena
function ViewPassword() {
    const passwordInput = document.getElementById("password");
    if (!passwordInput) return;

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
}

window.ViewPassword = ViewPassword;
window.viewPassword = ViewPassword;