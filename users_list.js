const API_BASE = '/api';

// Espera a que el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('users-container');

    try {
        // Solicita la lista de usuarios a la API
        const res = await fetch(`${API_BASE}/users`);
        const users = await res.json();

        // Manejo de error de respuesta
        if (!res.ok) throw new Error(users.error || 'Error');

        container.innerHTML = '';

        // Mensaje si no hay usuarios
        if (users.length === 0) {
            container.innerHTML = '<p style="text-align:center;">No hay usuarios aún.</p>';
            return;
        }

        // Crea una tarjeta por cada usuario
        users.forEach(u => {
            const div = document.createElement('div');
            div.className = 'user-card';

            // Usa foto del usuario o icono por defecto
            const photoHtml = u.photo
                ? `<img src="${u.photo}" alt="${u.username}">`
                : `<i class="fa-solid fa-user"></i>`;

            // Estructura HTML de la tarjeta
            div.innerHTML = `
                <div class="user-left">
                    ${photoHtml}
                </div>
                <div class="user-right">
                    <h3>${u.name} ${u.lastname}</h3>
                    <div class="user-data">
                        <strong>Usuario:</strong> ${u.username}<br>
                        <strong>Rol:</strong> ${u.role || 'user'}<br>
                        <strong>ID:</strong> ${u._id}
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        // Muestra error en consola y en la interfaz
        console.error(err);
        container.innerHTML = `<p style="text-align:center; color:red;">Error al cargar usuario
;

