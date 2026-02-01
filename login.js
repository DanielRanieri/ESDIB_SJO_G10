const loginForm = document.getElementById('loginForm');

const API_BASE = '/api';
const API_KEY = 'f447cd5956f8e91962cb965ebd9ab3e5666ba6a8b74d31bfa3ea1f2b277aee8d';

// LOGIC FOR VIEW SWITCHING (Moved from inline script to ensure execution)
document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');

    const loginSec = document.getElementById('login-section');
    const logoutSec = document.getElementById('logout-section');

    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (!user || !user.username) throw new Error('Invalid User Data');

            // MODO: LOGUEADO -> REDIRECCIONAR AL PERFIL
            // Ya no mostramos la ficha aquí, sino que enviamos al usuario a la página de perfil dedicada
            const currentPath = window.location.pathname;
            // Verificar que no entremos en bucle si ya estamos en profile (aunque este script es de login)
            if (!currentPath.includes('profile.html')) {
                window.location.href = 'profile.html';
            }
            return;

            // (Legacy code below removed for clarity as we now have profile.html)

        } catch (e) {
            console.error('Error loading user profile:', e);
            localStorage.removeItem('user'); // Auto-cleanup
            if (loginSec) loginSec.style.display = 'block';
            if (logoutSec) logoutSec.style.display = 'none';
        }
    } else {
        // MODO: NO LOGUEADO
        if (loginSec) loginSec.style.display = 'block';
        if (logoutSec) logoutSec.style.display = 'none';
    }
});

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_BASE}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                if (!data.user) {
                    throw new Error('Respuesta del servidor incompleta (falta objeto user)');
                }

                // Save user data
                localStorage.setItem('user', JSON.stringify(data.user));

                alert(`Login exitoso. Bienvenido, ${data.user.username}`);
                window.location.reload(); // Reload to trigger the view switch logic above
            } else {
                alert(data.error || 'Error al iniciar sesión');
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión con el servidor (localhost:4000)');
        }
    });
}
