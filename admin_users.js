// URL base del API
const API_BASE = '/api';

// ---------------------------
// 1. Cargar lista de usuarios
// ---------------------------
async function loadUsers() {
    const container = document.getElementById('users-list'); // Contenedor donde se mostrará la lista
    try {
        const res = await fetch(`${API_BASE}/users`); // Llamada al endpoint de usuarios
        const users = await res.json(); // Parsear respuesta JSON

        if (!res.ok) throw new Error(users.error || 'Error'); // Manejo de error

        container.innerHTML = ''; // Limpiar contenido previo
        if (users.length === 0) {
            container.innerHTML = '<p>No hay usuarios registrados.</p>';
            return;
        }

        // Recorrer cada usuario y crear tarjeta
        users.forEach(u => {
            const div = document.createElement('div');
            div.className = 'user-card';

            // Imagen de usuario o icono por defecto
            const photoHtml = u.photo
                ? `<img src="${u.photo}" alt="Foto">`
                : `<i class="fa-solid fa-user" style="color:#ccc; font-size: 1.5rem;"></i>`;

            // Contenido HTML de la tarjeta
            div.innerHTML = `
                <div class="user-left">${photoHtml}</div>
                <div class="user-right">
                    <h3>${u.name} ${u.lastname}</h3>
                    <div class="user-data">
                        <strong>User:</strong> ${u.username} | <strong>Rol:</strong> ${u.role || 'user'}
                    </div>
                </div>
            `;
            container.appendChild(div); // Añadir tarjeta al contenedor
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="color:red">Error cargando lista (¿Servidor 4000 encendido?)</p>`;
    }
}

// ---------------------------
// 2. Manejar formulario de registro de usuario
// ---------------------------
const adminDesc = document.getElementById('adminRegisterForm');
if (adminDesc) {
    adminDesc.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitar recarga de página

        // Validar que las contraseñas coincidan
        const pass = document.getElementById('password').value;
        const conf = document.getElementById('confirm_password').value;
        if (pass !== conf) {
            alert('Las contraseñas no coinciden');
            return;
        }

        // Crear FormData desde el formulario
        const formData = new FormData(e.target);
        try {
            const res = await fetch(`${API_BASE}/users/register`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                alert('Usuario creado con éxito');
                e.target.reset(); // Limpiar formulario
                loadUsers(); // Recargar lista de usuarios
            } else {
                alert(data.error || 'Error al crear');
            }
        } catch (err) {
            alert('Error de conexión');
        }
    });
}

// ---------------------------
// 3. Inicialización al cargar la página
// ---------------------------
document.addEventListener('DOMContentLoaded', loadUsers);

