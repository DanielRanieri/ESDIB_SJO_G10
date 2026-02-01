const API_BASE = '/api';

// 1. Cargar Lista
async function loadUsers() {
    const container = document.getElementById('users-list');
    try {
        const res = await fetch(`${API_BASE}/users`);
        const users = await res.json();

        if (!res.ok) throw new Error(users.error || 'Error');

        container.innerHTML = '';
        if (users.length === 0) {
            container.innerHTML = '<p>No hay usuarios registrados.</p>';
            return;
        }

        users.forEach(u => {
            const div = document.createElement('div');
            div.className = 'user-card';

            const photoHtml = u.photo
                ? `<img src="${u.photo}" alt="Foto">`
                : `<i class="fa-solid fa-user" style="color:#ccc; font-size: 1.5rem;"></i>`;

            div.innerHTML = `
                <div class="user-left">${photoHtml}</div>
                <div class="user-right">
                    <h3>${u.name} ${u.lastname}</h3>
                    <div class="user-data">
                        <strong>User:</strong> ${u.username} | <strong>Rol:</strong> ${u.role || 'user'}
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="color:red">Error cargando lista (¿Servidor 4000 encendido?)</p>`;
    }
}

// 2. Manejar Formulario
const adminDesc = document.getElementById('adminRegisterForm');
if (adminDesc) {
    adminDesc.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pass = document.getElementById('password').value;
        const conf = document.getElementById('confirm_password').value;

        if (pass !== conf) {
            alert('Las contraseñas no coinciden');
            return;
        }

        const formData = new FormData(e.target);
        try {
            const res = await fetch(`${API_BASE}/users/register`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                alert('Usuario creado con éxito');
                e.target.reset();
                loadUsers(); // Recargar lista
            } else {
                alert(data.error || 'Error al crear');
            }
        } catch (err) {
            alert('Error de conexión');
        }
    });
}

// 3. Init
document.addEventListener('DOMContentLoaded', loadUsers);
