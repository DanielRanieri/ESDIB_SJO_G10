document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('menu-close-btn'); // New close button
    const menu = document.getElementById('menu');

    if (menuBtn && menu) {
        menuBtn.addEventListener('click', () => {
            menu.classList.add('mostrar'); // Use add/remove for explicit control
        });
    }

    if (closeBtn && menu) {
        closeBtn.addEventListener('click', () => {
            menu.classList.remove('mostrar');
        });
    }

    // Submenu Toggle Logic
    const menuHeaders = document.querySelectorAll('.menu-item-head');
    menuHeaders.forEach(head => {
        head.addEventListener('click', () => {
            const subMenu = head.nextElementSibling;
            const icon = head.querySelector('i');

            if (subMenu && subMenu.classList.contains('sub-menu')) {
                // Toggle display
                if (subMenu.style.display === 'block') {
                    subMenu.style.display = 'none';
                    if (icon) {
                        icon.classList.remove('fa-minus');
                        icon.classList.add('fa-plus');
                    }
                } else {
                    subMenu.style.display = 'block';
                    if (icon) {
                        icon.classList.remove('fa-plus');
                        icon.classList.add('fa-minus');
                    }
                }
            }
        });
    });

    // Auth State in Header
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            // Validar que el objeto user exista realmente
            if (user && typeof user === 'object') {
                const loginBtn = document.getElementById('login-btn-header');
                if (loginBtn) {
                    if (user.photo) {
                        loginBtn.innerHTML = `<img src="${user.photo}" alt="Perfil" style="width:30px; height:30px; border-radius:50%; object-fit:cover; border: 2px solid white;">`;
                    } else {
                        // Usuario logueado SIN foto
                        loginBtn.innerHTML = `<i class="fa-solid fa-user" style="color: #2ecc71;"></i>`;
                    }

                    // IMPORTANT: Change the link to point to the new Profile page instead of Login page
                    // We use replace to preserve relative paths if present (e.g. ../login.html -> ../profile.html)
                    const currentHref = loginBtn.getAttribute('href');
                    if (currentHref && currentHref.includes('login.html')) {
                        loginBtn.href = currentHref.replace('login.html', 'profile.html');
                    } else {
                        loginBtn.href = 'profile.html'; // Fallback
                    }
                    // Opcional: Agregar título para debug visual hint
                    loginBtn.title = `Hola, ${user.name || user.username}`;
                }
            }
        } catch (e) {
            console.error('Error parsing user data', e);
            // Si hay error en los datos, mejor limpiar para evitar estado corrupto
            localStorage.removeItem('user');
        }
    }
});
