require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT         = process.env.PORT         || 3001;
const SECRET_TOKEN = process.env.SECRET_TOKEN || '';

app.use(cors({
  origin: "*"
}));                   
app.use(express.json());           
app.use(express.static('../frontend')); 

let notes  = [];
let nextId = 1;

// ── Auth middleware ─────────────────────────
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token      = authHeader.replace('Bearer ', '').trim();

  if (token !== SECRET_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized — invalid or missing token' });
  }
  next();
}

app.get('/api/notes', (req, res) => {
  res.status(200).json(notes);
});

app.get('/api/auth/check', requireAuth, (req, res) => {
  res.json({ ok: true });
});

app.post('/api/notes', requireAuth, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Bad Request: title and content are required' });
  }

  const note = {
    id:        nextId++,
    title:     title.trim(),
    content:   content.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  notes.push(note);
  res.status(201).json(note);
});

app.patch('/api/notes/:id', requireAuth, (req, res) => {
  const id   = parseInt(req.params.id);
  const note = notes.find(n => n.id === id);

  if (!note) return res.status(404).json({ error: 'Not Found' });

  const { title, content } = req.body;

  if (!title && !content) {
    return res.status(400).json({ error: 'Bad Request: provide title or content to update' });
  }

  if (title)   note.title   = title.trim();
  if (content) note.content = content.trim();
  note.updatedAt = new Date().toISOString();

  res.status(200).json(note);
});

app.delete('/api/notes/:id', requireAuth, (req, res) => {
  const id  = parseInt(req.params.id);
  const idx = notes.findIndex(n => n.id === id);

  if (idx === -1) return res.status(404).json({ error: 'Not Found' });

  notes.splice(idx, 1);
  res.status(200).json({ deleted: id });
});

app.listen(PORT, () => {
  console.log(`✅  SecureNote API running at http://localhost:${PORT}`);
  console.log(`🔒  SECRET_TOKEN loaded from .env`);
});
