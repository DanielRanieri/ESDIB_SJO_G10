const loginForm = document.getElementById('loginForm');
// Referencia al formulario de login en el DOM

const API_BASE = '/api';
// URL base de la API
const API_KEY = 'f447cd5956f8e91962cb965ebd9ab3e5666ba6a8b74d31bfa3ea1f2b277aee8d';
// Clave de acceso a la API

// Lógica para cambiar vistas según estado de usuario
document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    // Intenta obtener datos del usuario guardados en localStorage

    const loginSec = document.getElementById('login-section');
    const logoutSec = document.getElementById('logout-section');
    // Referencias a secciones visibles según si el usuario está logueado o no

    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            // Convierte string de JSON a objeto

            if (!user || !user.username) throw new Error('Invalid User Data');
            // Valida que el objeto tenga información válida

            // MODO: LOGUEADO -> REDIRECCIONAR AL PERFIL
            const currentPath = window.location.pathname;
            // Obtiene la ruta actual de la página

            if (!currentPath.includes('profile.html')) {
                window.location.href = 'profile.html';
                // Redirige al perfil si no estamos ya en profile.html
            }
            return; // Termina la ejecución si ya redirigimos

        } catch (e) {
            console.error('Error loading user profile:', e);
            // Si hay error, limpiar localStorage y mostrar la vista de login
            localStorage.removeItem('user');
            if (loginSec) loginSec.style.display = 'block';
            if (logoutSec) logoutSec.style.display = 'none';
        }
    } else {
        // MODO: NO LOGUEADO -> mostrar formulario de login
        if (loginSec) loginSec.style.display = 'block';
        if (logoutSec) logoutSec.style.display = 'none';
    }
});

// Lógica de envío del formulario de login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Evita que el formulario recargue la página

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        // Obtiene los valores ingresados por el usuario

        try {
            const response = await fetch(`${API_BASE}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY
                },
                body: JSON.stringify({ username, password })
                // Envía los datos de login en formato JSON con la API key
            });

            const data = await response.json();
            // Convierte la respuesta a JSON

            if (response.ok) {
                if (!data.user) {
                    throw new Error('Respuesta del servidor incompleta (falta objeto user)');
                    // Valida que la respuesta tenga el objeto user
                }

                // Guardar datos del usuario en localStorage
                localStorage.setItem('user', JSON.stringify(data.user));

                alert(`Login exitoso. Bienvenido, ${data.user.username}`);
                window.location.reload();
                // Recarga la página para que se ejecute la lógica de vista según usuario logueado
            } else {
                alert(data.error || 'Error al iniciar sesión');
                // Si hay error de servidor, mostrar mensaje
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión con el servidor (localhost:4000)');
            // Captura errores de conexión o problemas con fetch
        }
    });
}
