const API_BASE = '/api'; // Base API
const API_KEY = 'f447cd5956f8e91962cb965ebd9ab3e5666ba6a8b74d31bfa3ea1f2b277aee8d'; // API Key
let editingId = null; // ID en edición

// Helpers
const q = (id) => document.querySelector(id); // Query selector

async function safeFetch(url, options = {}) {
    const headers = {
        'x-api-key': API_KEY, // API key
        ...(options.headers || {})
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json'; // JSON por defecto
    }

    return fetch(url, { ...options, headers }); // Fetch seguro
}

// 1. Load News
async function loadNews() {
    const container = document.getElementById('news-list'); // Contenedor noticias
    try {
        const res = await safeFetch(`${API_BASE}/news`); // Fetch noticias
        const news = await res.json();

        if (!res.ok) throw new Error(news.error || 'Error');

        container.innerHTML = ''; // Limpiar contenedor
        if (news.length === 0) {
            container.innerHTML = '<p>No hay noticias publicadas.</p>'; // Sin noticias
            return;
        }

        news.forEach(n => {
            const div = document.createElement('div');
            div.className = 'news-card'; // Card noticia

            const img = n.mainImageUrl || 'imagenes/news.png'; // Imagen

            const id = n.id || n._id || (n._id && n._id.$oid); // Determinar ID

            div.innerHTML = `
                <div class="news-left">
                    <img src="${img}" alt="News Image" onerror="this.src='imagenes/news.png'">
                </div>
                <div class="news-right">
                     <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <h3 style="margin:0;">${n.title}</h3>
                        <div style="min-width:120px; text-align:right;">
                            <button class="edit-btn" data-news='${JSON.stringify(n).replace(/'/g, "&#39;")}' style="padding:5px 10px; cursor:pointer; background:#ffa500; border:none; color:white; border-radius:3px; margin-right:5px;">Editar</button>
                            <button class="delete-btn" data-id="${id}" style="padding:5px 10px; cursor:pointer; background:darkred; border:none; color:white; border-radius:3px;">X</button>
                        </div>
                    </div>
                    <small>${new Date(n.date).toLocaleDateString()}</small>
                    <p>${n.subtitle || ''}</p>
                </div>
            `;
            container.appendChild(div); // Añadir card
        });

        // Botones dinámicos
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const n = JSON.parse(e.target.dataset.news);
                startEdit(n); // Editar noticia
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                deleteNews(e.target.dataset.id); // Eliminar noticia
            });
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="color:red">Error cargando noticias.</p>`; // Error
    }
}

// 2. Submit News
const newsForm = document.getElementById('newsForm');
if (newsForm) {
    newsForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevenir reload
        const formData = new FormData(e.target); // FormData
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true; // Deshabilitar

        try {
            let url = `${API_BASE}/news`;
            let method = 'POST';

            if (editingId) {
                url = `${API_BASE}/news/${editingId}`;
                method = 'PUT'; // Actualizar
            }

            const res = await safeFetch(url, { method, body: formData }); // Enviar datos
            const data = await res.json();

            if (res.ok) {
                alert(editingId ? 'Noticia actualizada!' : 'Noticia publicada!'); // Mensaje
                resetForm(); // Reset form
                loadNews(); // Recargar
            } else {
                alert(data.error || 'Error en la petición'); // Error API
            }
        } catch (err) {
            console.error(err);
            alert('Error de conexión'); // Error red
        } finally {
            submitBtn.disabled = false; // Habilitar
        }
    });
}

// 3. Edit Logic
window.startEdit = function (n) {
    editingId = n.id || n._id || (n._id && n._id.$oid); // Guardar ID
    const form = document.getElementById('newsForm');

    form.querySelector('[name="title"]').value = n.title || ''; // Título
    form.querySelector('[name="subtitle"]').value = n.subtitle || ''; // Subtítulo
    form.querySelector('[name="content"]').value = n.content || ''; // Contenido

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'ACTUALIZAR NOTICIA'; // Cambiar texto
    btn.style.background = '#ffa500'; // Color edición

    // Botón cancelar
    let cancelBtn = document.getElementById('cancel-edit-btn');
    if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-edit-btn';
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.type = 'button';
        cancelBtn.style.marginLeft = '10px';
        cancelBtn.onclick = resetForm; // Reset
        const btnContainer = form.querySelector('.input_container_button');
        if (btnContainer) btnContainer.appendChild(cancelBtn); // Añadir
    }
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll top
};

// 4. Delete Logic
window.deleteNews = async function (id) {
    if (!confirm('¿Seguro que quieres eliminar esta noticia?')) return; // Confirm
    try {
        const res = await safeFetch(`${API_BASE}/news/${id}`, { method: 'DELETE' }); // Delete
        if (res.ok) loadNews(); // Recargar
        else alert('Error al eliminar'); // Error
    } catch (e) { console.error(e); alert('Error de red'); } // Catch
};

function resetForm() {
    editingId = null; // Reset ID
    const form = document.getElementById('newsForm');
    form.reset(); // Limpiar form
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'PUBLICAR NOTICIA'; // Texto default
    btn.style.background = 'var(--verde-oscuro)'; // Color default

    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) cancelBtn.remove(); // Eliminar cancelar
}

document.addEventListener('DOMContentLoaded', loadNews); // Cargar noticias

// Menu toggle
const menuBtn = document.getElementById('menu-btn');
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        const menu = document.getElementById('menu');
        if (menu) menu.classList.toggle('mostrar'); // Toggle menú
    });
}
