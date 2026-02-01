// Endpoints y configuración básica
const API_PETS = '/api/pets';
const API_KEY = 'f447cd5956f8e91962cb965ebd9ab3e5666ba6a8b74d31bfa3ea1f2b277aee8d';
const PLACEHOLDER_PET = '/imagenes/news.png';

// Obtiene el ID del animal en distintos formatos
function getPetId(p) {
    if (!p) return null;
    if (p.id) return p.id;
    if (p._id) {
        if (typeof p._id === 'string') return p._id;
        if (typeof p._id === 'object' && p._id.$oid) return p._id.$oid;
        return String(p._id);
    }
    return null;
}

// Fetch con cabeceras comunes y control de errores
async function safeFetch(url) {
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        }
    });
    if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
    return res;
}

// Obtiene la lista de animales
async function fetchPets() {
    try {
        const res = await safeFetch(API_PETS);
        const data = await res.json();
        return Array.isArray(data) ? data : (data.items || []);
    } catch (e) {
        console.error(e);
        return [];
    }
}

// Obtiene la primera foto de un animal
async function fetchPetPhoto(id) {
    try {
        const res = await safeFetch(`${API_PETS}/${id}/photos`);
        const photos = await res.json();
        return Array.isArray(photos) && photos.length > 0 ? photos[0].url : null;
    } catch (e) { return null; }
}

// Abre el modal con la información del animal
function openModal(animal) {
    // Elimina modal previo si existe
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    // Imagen principal del modal
    let imgUrl = PLACEHOLDER_PET;
    if (animal.photos && animal.photos[0]?.url) {
        imgUrl = animal.photos[0].url;
    }

    // Contenido del modal
    overlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${animal.nombre}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-img-container">
                    <img src="${imgUrl}" alt="${animal.nombre}">
                </div>
                <div class="modal-info">
                    <p><strong>Científico:</strong> ${animal.nombre_cientifico || 'N/A'}</p>
                    <p><strong>Familia:</strong> ${animal.familia || 'N/A'}</p>
                    <p><strong>Hábitat:</strong> ${animal.habitat || 'N/A'}</p>
                    <p><strong>Dieta:</strong> ${animal.dieta || 'N/A'}</p>
                    <p><strong>Estado:</strong> ${animal.estado_extincion || 'N/A'}</p>
                    <hr>
                    <p><strong>Rasgos:</strong> ${animal.rasgos || 'N/A'}</p>
                    <p><strong>Distribución:</strong> ${animal.distribucion || 'N/A'}</p>
                </div>
            </div>
        </div>
    `;

    // Cierra al hacer click fuera
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.remove();
    });

    // Cierra con el botón X
    overlay.querySelector('.modal-close')
        .addEventListener('click', () => overlay.remove());

    document.body.appendChild(overlay);
}

// Renderiza los animales por sección
async function renderSections() {
    const container = document.getElementById('animal-list-container');
    if (!container) return;

    const targetGroup = container.dataset.group;
    if (!targetGroup) {
        container.innerHTML = '<p>Error: No hay grupo especificado.</p>';
        return;
    }

    container.innerHTML = '<p>Cargando animales...</p>';

    let petsToRender = [];

    try {
        // Intenta filtrar desde servidor
        const queryRes = await safeFetch(`${API_PETS}?grupo=${targetGroup}`);
        const json = await queryRes.json();
        petsToRender = Array.isArray(json) ? json : (json.items || []);

        // Fallback si no hay resultados
        if (petsToRender.length === 0) {
            petsToRender = await fetchPets();
        }

        // Normaliza y filtra por grupo
        const normalize = str =>
            str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

        const targetNorm = normalize(targetGroup);

        petsToRender = petsToRender.filter(p =>
            p.grupo === targetGroup || normalize(p.grupo) === targetNorm
        );

        // Ordena alfabéticamente
        petsToRender.sort((a, b) =>
            (a.nombre || '').localeCompare(b.nombre || '')
        );

    } catch (e) {
        console.error(e);
        petsToRender = await fetchPets();
    }

    if (petsToRender.length === 0) {
        container.innerHTML = `<p>No hay animales en ${targetGroup}</p>`;
        return;
    }

    container.innerHTML = '';

    // Render de tarjetas
    for (const p of petsToRender) {
        const div = document.createElement('div');
        div.className = 'news-card-dynamic';

        let imgUrl = PLACEHOLDER_PET;
        if (p.photos && p.photos[0]?.url) {
            imgUrl = p.photos[0].url;
        }

        const id = getPetId(p);

        div.innerHTML = `
            <div class="news-card-left">
                <img src="${imgUrl}" alt="${p.nombre}" id="img-${id}">
            </div>
            <div class="news-card-right">
                <h3>${p.nombre}</h3>
                <div class="news-subtitle">${p.familia || ''} | ${p.habitat || ''}</div>
                <div class="news-excerpt">${p.rasgos || ''}</div>
                <small>Click para detalles</small>
            </div>
        `;

        // Abre modal al hacer click
        div.onclick = () => openModal(p);
        container.appendChild(div);

        // Carga diferida de imagen si es placeholder
        if (imgUrl === PLACEHOLDER_PET && id) {
            fetchPetPhoto(id).then(url => {
                if (url) {
                    const imgEl = document.getElementById(`img-${id}`);
                    if (imgEl) imgEl.src = url;
                    p.photos = [{ url }];
                }
            });
        }
    }
}

// Inicializa al cargar el DOM
document.addEventListener('DOMContentLoaded', renderSections);
