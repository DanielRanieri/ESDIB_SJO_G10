document.addEventListener('DOMContentLoaded', () => {
    // Espera a que todo el DOM se cargue antes de ejecutar el script

    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('menu-close-btn'); // Botón para cerrar el menú
    const menu = document.getElementById('menu'); // Menú lateral

    // Abrir menú lateral al hacer click en el botón hamburguesa
    if (menuBtn && menu) {
        menuBtn.addEventListener('click', () => {
            menu.classList.add('mostrar'); // Añade clase "mostrar" para mostrar el menú
        });
    }

    // Cerrar menú lateral al hacer click en el botón de cerrar
    if (closeBtn && menu) {
        closeBtn.addEventListener('click', () => {
            menu.classList.remove('mostrar'); // Quita clase "mostrar" para ocultar el menú
        });
    }

    // Lógica para desplegar/plegar submenús
    const menuHeaders = document.querySelectorAll('.menu-item-head'); // Todos los encabezados de menú
    menuHeaders.forEach(head => {
        head.addEventListener('click', () => {
            const subMenu = head.nextElementSibling; // Submenú relacionado
            const icon = head.querySelector('i'); // Icono + o -

            if (subMenu && subMenu.classList.contains('sub-menu')) {
                // Si el submenú está visible, se oculta; si está oculto, se muestra
                if (subMenu.style.display === 'block') {
                    subMenu.style.display = 'none';
                    if (icon) {
                        icon.classList.remove('fa-minus'); // Cambia icono de "-" a "+"
                        icon.classList.add('fa-plus');
                    }
                } else {
                    subMenu.style.display = 'block';
                    if (icon) {
                        icon.classList.remove('fa-plus'); // Cambia icono de "+" a "-"
                        icon.classList.add('fa-minus');
                    }
                }
            }
        });
    });

    // Lógica para mostrar estado de autenticación del usuario en el header
    const userStr = localStorage.getItem('user'); // Obtiene datos de usuario desde localStorage
    if (userStr) {
        try {
            const user = JSON.parse(userStr); // Convierte el string JSON en objeto

            // Validar que el objeto user exista realmente
            if (user && typeof user === 'object') {
                const loginBtn = document.getElementById('login-btn-header'); // Botón de login en header
                if (loginBtn) {
                    if (user.photo) {
                        // Si el usuario tiene foto, mostrarla
                        loginBtn.innerHTML = `<img src="${user.photo}" alt="Perfil" style="width:30px; height:30px; border-radius:50%; object-fit:cover; border: 2px solid white;">`;
                    } else {
                        // Usuario logueado sin foto, mostrar icono
                        loginBtn.innerHTML = `<i class="fa-solid fa-user" style="color: #2ecc71;"></i>`;
                    }

                    // Cambiar enlace del botón para ir a perfil en vez de login
                    const currentHref = loginBtn.getAttribute('href');
                    if (currentHref && currentHref.includes('login.html')) {
                        loginBtn.href = currentHref.replace('login.html', 'profile.html');
                    } else {
                        loginBtn.href = 'profile.html'; // Fallback si no se encuentra login.html
                    }

                    // Agrega título con nombre del usuario para referencia visual
                    loginBtn.title = `Hola, ${user.name || user.username}`;
                }
            }
        } catch (e) {
            console.error('Error parsing user data', e);
            // Si hay error al parsear, se limpia localStorage para evitar estado corrupto
            localStorage.removeItem('user');
        }
    }
});
