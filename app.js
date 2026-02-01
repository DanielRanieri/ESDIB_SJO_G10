const API_BASE = '/api'; // Backend relativo (funciona local y en Azure)

const API_KEY = 'f447cd5956f8e91962cb965ebd9ab3e5666ba6a8b74d31bfa3ea1f2b277aee8d'; //API KEY del backend

// Estado
let editingId = null;

// Helpers
const q = (id) => document.getElementById(id);
const val = (id) => (q(id)?.value ?? '').trim();
const toIntOrNull = s => (s && s.trim() !== '' ? parseInt(s, 10) : null);
function toNullIfEmpty(s) { if (s == null) return null; const t = String(s).trim(); return t === '' ? null : t; }
function normId(p) {
  if (!p || !p._id) return null;
  if (typeof p._id === 'string') return p._id;
  if (typeof p._id === 'object' && p._id.$oid) return p._id.$oid;
  try { return String(p._id); } catch { return null; }
}

// Fetch con headers
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY, ...(options.headers || {}) }
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => 'Error');
    throw new Error(msg || 'Error de red');
  }
  return res.status !== 204 ? res.json() : null;
}

// Renderizar foto principal para overlay
async function renderOverlayPhoto(pet, container) {
  container.innerHTML = '';
  let url = null;
  // 1. Intentar buscar en el objeto mismo
  if (Array.isArray(pet.photos) && pet.photos.length > 0) {
    const found = pet.photos.find(ph => ph && ph.url);
    if (found) url = found.url;
  }

  // 2. Si no, fetch
  if (!url) {
    const id = normId(pet);
    if (id) {
      try {
        const arr = await apiFetch(`/pets/${id}/photos`, { method: 'GET' });
        if (Array.isArray(arr) && arr.length > 0) {
          const found = arr.find(ph => ph && ph.url);
          if (found) url = found.url;
        }
      } catch (e) {
        console.warn('Error fetching photos', e);
      }
    }
  }

  if (url) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = pet.nombre || 'foto';
    container.appendChild(img);
  } else {
    container.innerHTML = '<span class="no-photo">Sin imagen</span>';
  }
}

// Cargar lista con diseño Overlay
async function cargarLista() {
  try {
    const data = await apiFetch('/pets', { method: 'GET' });
    const pets = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
    const list = q('pets-list');
    if (!list) return;
    list.innerHTML = '';

    for (const p of pets) {
      const li = document.createElement('li');
      li.className = 'pet-overlay-card';

      // -- IZQUIERDA: FOTO --
      const left = document.createElement('div');
      left.className = 'pet-overlay-left';
      // Carga asíncrona de la foto
      renderOverlayPhoto(p, left);

      // -- DERECHA: INFO --
      const right = document.createElement('div');
      right.className = 'pet-overlay-right';

      // CABECERA (Nombre + Botones)
      const headerRow = document.createElement('div');
      headerRow.className = 'pet-header-row';

      const titleBlock = document.createElement('h3');
      const nombre = p?.nombre || '(sin nombre)';
      const cientifico = p?.nombreCientifico || p?.nombre_cientifico || '';
      titleBlock.innerHTML = `${nombre} <small>${cientifico}</small>`;

      const actions = document.createElement('div');
      actions.className = 'pet-actions';

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Editar';
      editBtn.onclick = () => startEdit(p);

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Eliminar';
      delBtn.onclick = async () => {
        const id = normId(p);
        if (!id) return alert('ID no válido');
        if (!confirm('¿Eliminar este registro?')) return;
        try {
          await apiFetch(`/pets/${id}`, { method: 'DELETE' });
          await cargarLista();
          if (editingId === id) resetForm();
        } catch (e) {
          alert('Error al eliminar: ' + e.message);
        }
      };

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      headerRow.appendChild(titleBlock);
      headerRow.appendChild(actions);

      // DATOS (Grid)
      const grid = document.createElement('div');
      grid.className = 'pet-data-grid';

      // Helper para items
      const addItem = (label, val) => {
        if (!val) return;
        const div = document.createElement('div');
        div.className = 'pet-data-item';
        div.innerHTML = `<strong>${label}</strong> ${val}`;
        grid.appendChild(div);
      };

      addItem('Grupo', p.grupo);

      addItem('Clase', p.clase);
      addItem('Familia', p.familia);
      addItem('Dieta', p.dieta);
      addItem('Tamaño', p.tamaño);
      addItem('Peso', p.peso);
      addItem('Esperanza de vida', p.esperanzaVida);
      addItem('Distribución', p.distribucion);
      addItem('Hábitat', p.habitat);
      addItem('Estado', p.estadoExtincion);
      addItem('Rasgos', p.rasgos);

      right.appendChild(headerRow);
      right.appendChild(grid);

      li.appendChild(left);
      li.appendChild(right);
      list.appendChild(li);
    }
  } catch (e) {
    console.error(e);
    alert('Error al cargar la lista');
  }
}

// Construir payload JSON
function buildJsonPayloadFromForm() {
  return {
    nombre_cientifico: val('nombre_cientifico'),
    nombre: val('nombre'),
    tamaño: val('tamaño'),
    peso: val('peso'),
    rasgos: val('rasgos'),
    clase: val('clase'),
    familia: val('familia'),
    dieta: val('dieta'),
    esperanza: val('esperanza'), // <-- coincidencia exacta
    distribucion: val('distribucion'),
    habitat: val('habitat'),
    estado_extincion: val('estado_extincion'), // <-- ID corregido, era estado-extincion
    grupo: val('grupo')
  };
}


// Enviar formulario
async function onSubmitForm(ev) {
  ev.preventDefault();
  const btn = q('upload-button');
  btn.disabled = true;

  try {
    if (!val('nombre') || !val('nombre_cientifico')) {
      alert('Los campos "Nombre" y "Nombre científico" son obligatorios');
      return;
    }

    if (editingId) {
      const payload = buildJsonPayloadFromForm();
      await apiFetch(`/pets/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      alert('Registro actualizado');
      await cargarLista();
      resetForm();
      return;
    }

    const fd = new FormData();
    for (const key of ['nombre_cientifico', 'nombre', 'tamaño', 'peso', 'rasgos', 'clase', 'familia', 'dieta', 'esperanza', 'distribucion', 'habitat', 'estado_extincion', 'grupo']) {
      fd.append(key, val(key));
    }

    const fileInput = q('files');
    if (fileInput.files && fileInput.files.length > 0) {
      for (const f of fileInput.files) fd.append('files', f, f.name);
    }

    const res = await fetch(`${API_BASE}/pets`, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY },
      body: fd
    });

    if (!res.ok) throw new Error(await res.text());
    alert('Registro creado');
    await cargarLista();
    resetForm();
  } catch (e) {
    console.error(e);
    alert('Error al guardar: ' + e.message);
  } finally {
    btn.disabled = false;
  }
}

// Reset formulario
function resetForm() {
  q('alta_pet')?.reset();
  editingId = null;
  const label = document.querySelector('#upload-button label');
  if (label) label.textContent = 'GUARDAR';
  q('cancel-edit').style.display = 'none';
  const title = document.querySelector('.title');
  if (title) title.textContent = 'UPLOAD PET';
}

// Rellenar formulario para edición
function startEdit(p) {
  const id = normId(p);
  if (!id) return alert('ID no válido');
  editingId = id;

  q('nombre_cientifico').value = p.nombreCientifico || '';
  q('nombre').value = p.nombre || '';
  q('tamaño').value = p.tamaño || '';
  q('peso').value = p.peso || '';
  q('rasgos').value = p.rasgos || '';
  q('clase').value = p.clase || '';
  q('familia').value = p.familia || '';
  q('dieta').value = p.dieta || '';
  q('esperanza').value = p.esperanzaVida || '';
  q('distribucion').value = p.distribucion || '';
  q('habitat').value = p.habitat || '';
  q('estado_extincion').value = p.estadoExtincion || '';
  q('grupo').value = p.grupo || '';

  const label = document.querySelector('#upload-button label');
  if (label) label.textContent = 'ACTUALIZAR';
  q('cancel-edit').style.display = 'inline-block';
  const title = document.querySelector('.title');
  if (title) title.textContent = 'EDIT PET';

  q('nombre_cientifico').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Arranque
document.addEventListener('DOMContentLoaded', () => {
  cargarLista();
  q('alta_pet')?.addEventListener('submit', onSubmitForm);
  q('cancel-edit')?.addEventListener('click', resetForm);
});