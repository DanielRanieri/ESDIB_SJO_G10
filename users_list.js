const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('users-container');

    try {
        const res = await fetch(`${API_BASE}/users`);
        const users = await res.json();

        if (!res.ok) throw new Error(users.error || 'Error');

        container.innerHTML = '';
        if (users.length === 0) {
            container.innerHTML = '<p style="text-align:center;">No hay usuarios aún.</p>';
            return;
        }

        users.forEach(u => {
            const div = document.createElement('div');
            div.className = 'user-card';

            const photoHtml = u.photo
                ? `<img src="${u.photo}" alt="${u.username}">`
                : `<i class="fa-solid fa-user"></i>`;

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
        console.error(err);
        container.innerHTML = `<p style="text-align:center; color:red;">Error al cargar usuarios: ${err.message}</p>`;
    }
});
