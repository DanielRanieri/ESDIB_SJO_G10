const API_BASE = '/api';
const API_KEY = 'f447cd5956f8e91962cb965ebd9ab3e5666ba6a8b74d31bfa3ea1f2b277aee8d'; // From app.js
let editingId = null;

// Helpers
const q = (id) => document.querySelector(id); // Use querySelector for flexibility

async function safeFetch(url, options = {}) {
    const headers = {
        'x-api-key': API_KEY, // Optional but good practice if we enable auth later
        ...(options.headers || {})
    };

    // If body is NOT FormData, default to JSON
    // If body IS FormData, do NOT set Content-Type (browser sets it with boundary)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    return fetch(url, {
        ...options,
        headers
    });
}

// 1. Load News
async function loadNews() {
    const container = document.getElementById('news-list');
    try {
        const res = await safeFetch(`${API_BASE}/news`);
        const news = await res.json();

        if (!res.ok) throw new Error(news.error || 'Error');

        container.innerHTML = '';
        if (news.length === 0) {
            container.innerHTML = '<p>No hay noticias publicadas.</p>';
            return;
        }

        news.forEach(n => {
            const div = document.createElement('div');
            div.className = 'news-card';

            const img = n.mainImageUrl || 'imagenes/news.png';

            // Determine ID
            const id = n.id || n._id || (n._id && n._id.$oid);

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
            container.appendChild(div);
        });

        // Add event listeners for dynamic buttons to avoid inline onclick (CSP safe)
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const n = JSON.parse(e.target.dataset.news);
                startEdit(n);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                deleteNews(e.target.dataset.id);
            });
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="color:red">Error cargando noticias.</p>`;
    }
}

// 2. Submit News (Create or Update)
const newsForm = document.getElementById('newsForm');
if (newsForm) {
    newsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            let url = `${API_BASE}/news`;
            let method = 'POST';

            if (editingId) {
                url = `${API_BASE}/news/${editingId}`;
                method = 'PUT'; // or PATCH depending on backend
            }

            const res = await safeFetch(url, {
                method: method,
                body: formData // Send FormData directly (safeFetch will handle headers)
            });

            const data = await res.json();
            if (res.ok) {
                alert(editingId ? 'Noticia actualizada!' : 'Noticia publicada!');
                resetForm();
                loadNews();
            } else {
                alert(data.error || 'Error en la petición');
            }
        } catch (err) {
            console.error(err);
            alert('Error de conexión');
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// 3. Edit Logic
window.startEdit = function (n) {
    editingId = n.id || n._id || (n._id && n._id.$oid);
    const form = document.getElementById('newsForm');

    form.querySelector('[name="title"]').value = n.title || '';
    form.querySelector('[name="subtitle"]').value = n.subtitle || '';
    form.querySelector('[name="content"]').value = n.content || '';

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'ACTUALIZAR NOTICIA';
    btn.style.background = '#ffa500'; // Orange to indicate edit mode

    // Optional: Show a "Cancel" button
    let cancelBtn = document.getElementById('cancel-edit-btn');
    if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-edit-btn';
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.type = 'button';
        cancelBtn.style.marginLeft = '10px';
        cancelBtn.onclick = resetForm;
        const btnContainer = form.querySelector('.input_container_button');
        if (btnContainer) btnContainer.appendChild(cancelBtn);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 4. Delete Logic
window.deleteNews = async function (id) {
    if (!confirm('¿Seguro que quieres eliminar esta noticia?')) return;
    try {
        const res = await safeFetch(`${API_BASE}/news/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadNews();
        } else {
            alert('Error al eliminar');
        }
    } catch (e) { console.error(e); alert('Error de red'); }
};

function resetForm() {
    editingId = null;
    const form = document.getElementById('newsForm');
    form.reset();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'PUBLICAR NOTICIA';
    btn.style.background = 'var(--verde-oscuro)';

    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) cancelBtn.remove();
}

document.addEventListener('DOMContentLoaded', loadNews);

// Menu toggle
const menuBtn = document.getElementById('menu-btn');
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        const menu = document.getElementById('menu');
        if (menu) menu.classList.toggle('mostrar');
    });
}
