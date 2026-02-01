document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');

    // 1. Strict Auth Check
    if (!userStr) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const user = JSON.parse(userStr);

        // 2. Ghost User Check (Empty object or missing critical fields)
        if (!user || !user.username || !user._id) {
            throw new Error('User data is corrupt or incomplete');
        }

        // 3. Populate Data
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

        // 4. Logout Logic
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
        // Clean up invalid state
        localStorage.removeItem('user');
        alert('Tu sesión ha expirado o es inválida. Por favor inicia sesión nuevamente.');
        window.location.href = 'login.html';
    }
});
