const API_BASE = 'http://localhost:3001';

let notes = [];
let activeNoteId = null;

const qs = sel => document.querySelector(sel);

function escHtml(s) {
  return (s || '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

function logRequest(method, path, statusCode, body = {}) {
  const log = qs('#debugLog');
  const ts  = new Date().toLocaleTimeString('en-GB', { hour12: false });

  const entry = document.createElement('div');
  entry.className = 'debug-entry';

  entry.innerHTML =
    `<span style="color:#555">${ts}</span>` +
    `<span class="method-${method.toLowerCase()}">  ${method}</span>` +
    `<span class="key">  ${path}</span>` +
    `  →  <span class="${statusCode < 300 ? 'status-2xx' : 'status-4xx'}">${statusCode}</span>` +
    `<span style="color:#555">  ${JSON.stringify(body).slice(0, 80)}</span>`;

  if (log.firstChild && log.firstChild.textContent.includes('Awaiting')) {
    log.innerHTML = '';
  }

  log.prepend(entry);
}

function showSection(id) {
  ['createSection', 'detailSection', 'editSection'].forEach(s => {
    qs('#' + s).classList.toggle('show', s === id);
  });
}

function getToken() {
  return qs('#tokenInput').value.trim();
}

async function checkToken() {
  const token = getToken();
  const dot = qs('#tokenStatus');

  if (!token) {
    dot.className = 'token-status';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/check`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    dot.className = 'token-status ' + (res.ok ? 'ok' : 'bad');
  } catch {
    dot.className = 'token-status bad';
  }
}

async function fetchNotes() {
  try {
    const res = await fetch(`${API_BASE}/api/notes`);
    const data = await res.json();

    logRequest('GET', '/api/notes', res.status, data);

    notes = data;
    renderNotesList();
  } catch {
    console.log('Backend error');
  }
}

async function createNote() {
  const title = qs('#createTitle').value.trim();
  const content = qs('#createContent').value.trim();

  if (!title || !content) return alert('Missing data');

  const res = await fetch(`${API_BASE}/api/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ title, content })
  });

  if (res.status === 401) {
    alert('Invalid token');
    return;
  }

  const data = await res.json();

  logRequest('POST', '/api/notes', res.status, data);

  notes.push(data);
  renderNotesList();
  clearCreateForm();
}

async function updateNote() {
  const res = await fetch(`${API_BASE}/api/notes/${activeNoteId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      title: qs('#editTitle').value,
      content: qs('#editContent').value
    })
  });

  if (res.status === 401) {
    alert('Invalid token');
    return;
  }

  const data = await res.json();

  // 🔥 ADD
  logRequest('PATCH', `/api/notes/${activeNoteId}`, res.status, data);

  const idx = notes.findIndex(n => n.id === activeNoteId);
  if (idx !== -1) notes[idx] = data;

  renderNotesList();

  openDetail(activeNoteId);
}

async function deleteNote(id) {
  const res = await fetch(`${API_BASE}/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  if (res.status === 401) {
    alert('Invalid token');
    return;
  }

  const data = await res.json();

  logRequest('DELETE', `/api/notes/${id}`, res.status, data);

  notes = notes.filter(n => n.id !== id);
  renderNotesList();
  showCreateForm();
}

function renderNotesList() {
  const list = qs('#notesList');
  const count = qs('#notesCount');

  count.textContent = `${notes.length} Notes`;

  if (!notes.length) {
    list.innerHTML = '<div class="empty-list">No notes yet</div>';
    return;
  }

  list.innerHTML = '';

  notes.forEach(note => {
    const item = document.createElement('div');
    item.className = 'note-item' + (note.id === activeNoteId ? ' active' : '');

    item.innerHTML = `
      <div class="note-item-title">${escHtml(note.title)}</div>
      <div class="note-item-preview">${escHtml(note.content)}</div>
      <button class="note-item-del">✕</button>
    `;

    item.onclick = () => openDetail(note.id);

    item.querySelector('.note-item-del').onclick = e => {
      e.stopPropagation();
      deleteNote(note.id);
    };

    list.appendChild(item);
  });
}

function openDetail(id) {
  activeNoteId = id;
  const note = notes.find(n => n.id === id);
  if (!note) return;

  qs('#detailTitle').textContent = note.title;
  qs('#detailContent').textContent = note.content;

  showSection('detailSection');
  renderNotesList();
}

function closeDetail() {
  activeNoteId = null;
  showSection('createSection');
  renderNotesList();
}

function showEditForm() {
  const note = notes.find(n => n.id === activeNoteId);
  if (!note) return;

  qs('#editTitle').value = note.title;
  qs('#editContent').value = note.content;

  showSection('editSection');
}

function cancelEdit() {
  showSection('detailSection');
}

function showCreateForm() {
  activeNoteId = null;
  showSection('createSection');
  renderNotesList();
}

function clearCreateForm() {
  qs('#createTitle').value = '';
  qs('#createContent').value = '';
}

showSection('createSection');
fetchNotes();