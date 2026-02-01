// Configuración igual que en app.js
const API_BASE = '/api';
const API_KEY = 'f447cd5956f8e91962cb965ebd9ab3e5666ba6a8b74d31bfa3ea1f2b277aee8d';

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirm_password').value;

        if (password !== confirm) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        const formData = new FormData(e.target);
        // Convert FormData to JSON because standard fetch with FormData sets multipart/form-data
        // but our API Key requires headers, and some backends prefer JSON for pure data. 
        // IF backend expects Form Data, we must append API key to header.

        // Strategy: Use JSON if possible for consistency, assuming backend supports it.
        // If 'users/register' expects multipart (e.g. avatar upload), we keep body: formData
        // and just add header.

        try {
            // Usamos la URL completa para evitar errores de puerto (405/404)
            const res = await fetch(`${API_BASE}/users/register`, {
                method: 'POST',
                headers: {
                    'x-api-key': API_KEY
                    // Let browser set Content-Type for FormData (boundary)
                },
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                alert('Usuario registrado correctamente en la Base de Datos');
                window.location.href = 'login.html';
            } else {
                alert(data.error || 'Error al registrar');
            }
        } catch (err) {
            console.error(err);
            alert('Error de conexión con el servidor (Azure)');
        }
    });
}

const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('menu');
if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
        menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
    });
}
