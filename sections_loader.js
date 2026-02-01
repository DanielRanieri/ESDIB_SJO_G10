// IMPORTANT: Set to full URL to allow different ports
const API_PETS = '/api/pets';
const API_KEY = 'f447cd5956f8e91962cb965ebd9ab3e5666ba6a8b74d31bfa3ea1f2b277aee8d'; // Copied from app.js

const PLACEHOLDER_PET = '/imagenes/news.png';

// Helper to get ID
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

// Global fetch helper with headers
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

// Fetch photos for a specific pet (if not embedded)
async function fetchPetPhoto(id) {
    try {
        const res = await safeFetch(`${API_PETS}/${id}/photos`);
        const photos = await res.json();
        if (Array.isArray(photos) && photos.length > 0) return photos[0].url;
        return null;
    } catch (e) { return null; }
}

// MODAL LOGIC
function openModal(animal) {
    // Remove existing
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    // Image logic for modal
    let imgUrl = PLACEHOLDER_PET;
    if (animal.photos && animal.photos.length > 0 && animal.photos[0].url) {
        imgUrl = animal.photos[0].url;
    }

    // If we only have placeholder but a real ID, we might have fetched the photo in the list view?
    // For simplicity, re-use what we have in the object. If missing, it's missing.

    overlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${animal.nombre}</h3>
                <button class="modal-close" style="background:none; border:none; color:white; font-size:2rem; cursor:pointer;">&times;</button>
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
                    <hr style="margin: 10px 0; border:0; border-top:1px solid #eee;">
                    <p><strong>Rasgos:</strong> ${animal.rasgos || 'N/A'}</p>
                    <p><strong>Distribución:</strong> ${animal.distribucion || 'N/A'}</p>
                </div>
            </div>
        </div>
    `;

    // Close on background click
    // Close on background click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });

    // Close on X button click (Explicit Event Listener)
    const closeBtn = overlay.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            overlay.remove();
        });
    }

    document.body.appendChild(overlay);
    overlay.style.display = 'flex';
}

async function renderSections() {
    const container = document.getElementById('animal-list-container');
    if (!container) return;

    const targetGroup = container.dataset.group; // e.g., "carnivoros"
    if (!targetGroup) {
        container.innerHTML = '<p>Error: No hay grupo especificado.</p>';
        return;
    }

    container.innerHTML = '<p style="text-align:center">Cargando animales...</p>';

    let petsToRender = [];
    try {
        // 1. Try server-side filter first
        const queryRes = await safeFetch(`${API_PETS}?grupo=${targetGroup}`);
        const json = await queryRes.json();
        petsToRender = Array.isArray(json) ? json : (json.items || []);

        // 2. Fallback if empty
        if (petsToRender.length === 0) {
            console.log('Server query empty, fetching all for fuzzy match...');
            petsToRender = await fetchPets();
        }

        if (!Array.isArray(petsToRender)) petsToRender = [];

        // 3. Client-side normalization filter
        const normalize = str => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
        const targetNorm = normalize(targetGroup);

        petsToRender = petsToRender.filter(p => {
            return (p.grupo === targetGroup) || (normalize(p.grupo) === targetNorm);
        });

        // SORT ALPHABETICALLY BY NAME
        petsToRender.sort((a, b) => {
            const nameA = (a.nombre || '').toUpperCase();
            const nameB = (b.nombre || '').toUpperCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });

    } catch (e) {
        console.error(e);
        petsToRender = await fetchPets();
    }

    const filtered = petsToRender;

    if (filtered.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:20px;">No hay animales en la categoría: <strong>${targetGroup}</strong></p>`;
        return;
    }

    container.innerHTML = '';

    // Render
    for (const p of filtered) {
        const div = document.createElement('div');
        div.className = 'news-card-dynamic';

        // Image logic
        let imgUrl = PLACEHOLDER_PET;
        if (p.photos && p.photos.length > 0 && p.photos[0].url) {
            imgUrl = p.photos[0].url;
        }

        const id = getPetId(p);

        div.innerHTML = `
            <div class="news-card-left">
                <img src="${imgUrl}" alt="${p.nombre}" id="img-${id}" onerror="this.onerror=null;this.src='${PLACEHOLDER_PET}';">
            </div>
            <div class="news-card-right">
                <h3>${p.nombre}</h3>
                <div class="news-subtitle">${p.familia || ''} | ${p.habitat || ''}</div>
                <div class="news-excerpt">
                    ${p.rasgos || ''}
                </div>
                <small style="color:#084834; font-weight:bold; margin-top:10px;">Click para detalles</small>
            </div>
        `;

        // Add Click Handler
        div.onclick = () => openModal(p);

        container.appendChild(div);

        // Async Photo Load if needed
        if (imgUrl === PLACEHOLDER_PET && id) {
            fetchPetPhoto(id).then(url => {
                if (url) {
                    const imgEl = document.getElementById(`img-${id}`);
                    if (imgEl) {
                        imgEl.src = url;
                        // Update local object so modal opens with correct image
                        if (!p.photos) p.photos = [];
                        p.photos[0] = { url: url };
                    }
                }
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', renderSections);
