document.addEventListener('DOMContentLoaded', () => {
    // Recupera usuario del localStorage
    const userStr = localStorage.getItem('user');

    // 1. Redirige si no hay usuario
    if (!userStr) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const user = JSON.parse(userStr);

        // 2. Verifica integridad del usuario
        if (!user || !user.username || !user._id) {
            throw new Error('User data is corrupt or incomplete');
        }

        // 3. Muestra información del perfil
        const nameEl = document.getElementById('profile-name');
        const userEl = document.getElementById('profile-username');
        if (nameEl) nameEl.textContent = user.name + ' ' + (user.lastname || '');
        if (userEl) userEl.textContent = '@' + user.username;

        const img = document.getElementById('profile-img');
        const icon = document.getElementById('profile-icon');

        if (img && icon) {
            if (user.photo) {
                img.src = user.photo;
                img.style.display = 'block';
                icon.style.display = 'none';
            } else {
                img.style.display = 'none';
                icon.style.display = 'block';
            }
        }

        // 4. Cierre de sesión
        const logoutBtn = document.getElementById('logout-btn-page');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('user');
                alert('Sesión cerrada');
                window.location.href = 'index.html';
            });
        }

    } catch (e) {
        console.error('Auth Error:', e);
        // Limpia datos corruptos y redirige
        localStorage.removeItem('user');
        alert('Tu sesión ha expirado o es inválida. Por favor inicia sesión nuevamente.');
        window.location.href = 'login.html';
    }
});
