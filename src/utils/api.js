import {
  GUEST_ID,
  API_BASE_URL,
  SEARCH_RESULTS_LIMIT,
  STORAGE_KEYS,
  DEFAULT_NOTES,
} from "./constants";

function checkResponse(res) {
  if (res.ok) {
    return res.json();
  }
  return Promise.reject(`Error: ${res.status}`);
}

function sendRequest(url, options) {
  return fetch(url, options).then(checkResponse);
}

function formatDateString(date) {
  const padNumber = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

// DummyJSON posts have no date, so derive a stable one from the id.
function convertPostToNote(post) {
  const date = formatDateString(new Date(2026, 9, 30 - (post.id % 28)));
  return {
    id: `api-${post.id}`,
    title: post.title,
    text: post.body,
    tags: post.tags,
    createdAt: date,
    updatedAt: date,
  };
}

export function fetchNotes(keyword) {
  const query = encodeURIComponent(keyword);
  return sendRequest(
    `${API_BASE_URL}/search?q=${query}&limit=${SEARCH_RESULTS_LIMIT}`
  ).then((data) => data.posts.map(convertPostToNote));
}

// Stage 1 has no backend yet: user notes and saved notes live in
// localStorage behind promise-based functions so stage 2 can swap in
// real requests without touching the components.
function readList(key, userId) {
  const all = JSON.parse(localStorage.getItem(key) || "{}");
  return all[userId];
}

function writeList(key, userId, list) {
  const all = JSON.parse(localStorage.getItem(key) || "{}");
  all[userId] = list;
  localStorage.setItem(key, JSON.stringify(all));
  return list;
}

export function getMyNotes(userId) {
  let notes = readList(STORAGE_KEYS.notes, userId);
  if (!notes) {
    notes = writeList(
      STORAGE_KEYS.notes,
      userId,
      DEFAULT_NOTES.map((note, i) => ({ ...note, id: `note-${Date.now()}-${i}`, isOwn: true }))
    );
  }
  return Promise.resolve(notes);
}

function getToday() {
  return formatDateString(new Date());
}

export function createNote(userId, fields) {
  const note = {
    ...fields,
    id: `note-${Date.now()}`,
    createdAt: getToday(),
    updatedAt: getToday(),
    isOwn: true,
  };
  const notes = readList(STORAGE_KEYS.notes, userId) || [];
  writeList(STORAGE_KEYS.notes, userId, [note, ...notes]);
  return Promise.resolve(note);
}

export function updateNote(userId, noteId, fields) {
  const notes = readList(STORAGE_KEYS.notes, userId) || [];
  const existing = notes.find((note) => note.id === noteId);
  if (!existing) return Promise.reject(`Note ${noteId} not found`);
  const note = { ...existing, ...fields, updatedAt: getToday(), isSample: false };
  writeList(
    STORAGE_KEYS.notes,
    userId,
    notes.map((item) => (item.id === noteId ? note : item))
  );
  return Promise.resolve(note);
}

export function deleteNote(userId, noteId) {
  const notes = readList(STORAGE_KEYS.notes, userId) || [];
  writeList(
    STORAGE_KEYS.notes,
    userId,
    notes.filter((note) => note.id !== noteId)
  );
  return Promise.resolve(noteId);
}

// Moves the notes a guest wrote on this device into their account.
// Untouched sample notes stay behind since every account gets its own copy.
export function migrateGuestNotes(userId) {
  const guestNotes = (readList(STORAGE_KEYS.notes, GUEST_ID) || []).filter(
    (note) => !note.isSample
  );
  if (guestNotes.length === 0) return Promise.resolve(0);
  return getMyNotes(userId).then((notes) => {
    writeList(STORAGE_KEYS.notes, userId, [...guestNotes, ...notes]);
    writeList(STORAGE_KEYS.notes, GUEST_ID, undefined);
    return guestNotes.length;
  });
}

export function getSavedNotes(userId) {
  return Promise.resolve(readList(STORAGE_KEYS.saved, userId) || []);
}

export function saveNote(userId, note) {
  const saved = readList(STORAGE_KEYS.saved, userId) || [];
  writeList(STORAGE_KEYS.saved, userId, [note, ...saved]);
  return Promise.resolve(note);
}

export function removeSavedNote(userId, noteId) {
  const saved = readList(STORAGE_KEYS.saved, userId) || [];
  writeList(
    STORAGE_KEYS.saved,
    userId,
    saved.filter((note) => note.id !== noteId)
  );
  return Promise.resolve(noteId);
}
