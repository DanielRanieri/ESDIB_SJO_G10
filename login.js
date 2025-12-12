document.getElementById("loginForm").addEventListener("submit", function(e){
    e.preventDefault();

    const user = document.getElementById("usuario").value;
    const pass = document.getElementById("contrasena").value;

    if (user === "admin" && pass === "1234") {
        window.location.href = "index.html"; 
    } else {
        alert("Usuario o contraseña incorrectos");
    }
});