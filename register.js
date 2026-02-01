// Configuración base de la API
const API_BASE = '/api';
const API_KEY = 'f447cd5956f8e91962cb965ebd9ab3e5666ba6a8b74d31bfa3ea1f2b277aee8d';

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita recarga del formulario

        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirm_password').value;

        // Validación de contraseñas
        if (password !== confirm) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        // Datos del formulario
        const formData = new FormData(e.target);

        try {
            // Envío del registro al backend
            const res = await fetch(`${API_BASE}/users/register`, {
                method: 'POST',
                headers: {
                    'x-api-key': API_KEY
                },
                body: formData
            });

            const data = await res.json();

            // Respuesta del servidor
            if (res.ok) {
                alert('Usuario registrado correctamente en la Base de Datos');
                window.location.href = 'login.html';
            } else {
                alert(data.error || 'Error al registrar');
            }
        } catch (err) {
            // Error de conexión
            console.error(err);
            alert('Error de conexión con el servidor (Azure)');
        }
    });
}

// Control del menú desplegable
const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('menu');
if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
        menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
    });
}

