import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ─── Firebase Config ──────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyALENlTfWhQH0yojUhfZqNL6Miffal6Qlg",
  authDomain: "studysync-fe395.firebaseapp.com",
  projectId: "studysync-fe395",
  storageBucket: "studysync-fe395.firebasestorage.app",
  messagingSenderId: "154793782966",
  appId: "1:154793782966:web:84ebcd17771be3a2958017"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tasksCol = collection(db, "tasks");

// ─── State ───────────────────────────────────────────────
let tasks = [];
let filter = 'all';
let editId = null;

// ─── Date ─────────────────────────────────────────────────
document.getElementById('currentDate').textContent =
  new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

document.getElementById('assignmentsList').innerHTML =
  `<div class="empty-state"><div class="emoji">⏳</div>Loading your tasks...</div>`;

// ─── Real-time sync from Firestore ────────────────────────
onSnapshot(tasksCol, (snapshot) => {
  tasks = snapshot.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
  renderList();
});

// ─── Firestore Helpers ────────────────────────────────────
async function saveToFirestore(data) {
  await addDoc(tasksCol, data);
}

async function updateInFirestore(firestoreId, data) {
  await updateDoc(doc(db, "tasks", firestoreId), data);
}

async function deleteFromFirestore(firestoreId) {
  await deleteDoc(doc(db, "tasks", firestoreId));
}

// ─── Compute Status ───────────────────────────────────────
function computeStatus(task) {
  if (task.status === 'done') return 'done';
  if (task.status === 'in-progress') return 'in-progress';
  if (task.due){
    const dueDate = new Date(task.due);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (dueDate < today) return 'overdue';
    }
    return 'pending';
               }

// ─── Render List ──────────────────────────────────────────
function renderList() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  let filtered = tasks.map(t => ({ ...t, computed: computeStatus(t) }));
  if (filter !== 'all') filtered = filtered.filter(t => t.computed === filter);
  if (query) filtered = filtered.filter(t =>
    t.title.toLowerCase().includes(query) ||
    (t.subject||'').toLowerCase().includes(query) ||
    (t.type||'').toLowerCase().includes(query)
  );

  const list = document.getElementById('assignmentsList');
  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="emoji">📭</div>No tasks here yet. Add one above!</div>`;
    updateStats();
    return;
  }
  list.innerHTML = filtered.map(t => cardHTML(t)).join('');
  updateStats();

  // attach listeners to dynamic card buttons
  filtered.forEach(t => {
    document.getElementById(`check-${t.firestoreId}`)
      .addEventListener('click', () => toggleDone(t.firestoreId));
    document.getElementById(`edit-${t.firestoreId}`)
      .addEventListener('click', () => editTask(t.firestoreId));
    document.getElementById(`delete-${t.firestoreId}`)
      .addEventListener('click', () => deleteTask(t.firestoreId));
  });
}

// ─── Card HTML ────────────────────────────────────────────
function cardHTML(t) {
  const status = t.computed;
  const pillClass = { done:'pill-done', pending:'pill-pending', overdue:'pill-overdue', 'in-progress':'pill-in-progress' }[status];
  const pillLabel = { done:'Done', pending:'Pending', overdue:'Overdue', 'in-progress':'In Progress' }[status];

  let dueStr = '', dueCls = '';
  if (t.due) {
    const d = new Date(t.due);
    const today = new Date(); today.setHours(0,0,0,0);
    const diff = Math.round((d - today) / 86400000);
    if (status === 'overdue') { dueStr = `Overdue by ${Math.abs(diff)}d`; dueCls = 'overdue'; }
    else if (diff === 0) { dueStr = 'Due Today'; dueCls = 'soon'; }
    else if (diff <= 2) { dueStr = `Due in ${diff}d`; dueCls = 'soon'; }
    else { dueStr = `Due ${d.toLocaleDateString('en-US', {month:'short', day:'numeric'})}`; }
  }

  return `
  <div class="assignment-card status-${status} card-enter">
    <div class="checkbox" id="check-${t.firestoreId}">${status === 'done' ? '✓' : ''}</div>
    <div class="assignment-info">
      <div class="assignment-title" style="${status==='done'?'text-decoration:line-through;color:#6b6b80':''}">${escHtml(t.title)}</div>
      <div class="assignment-meta">
        ${t.subject ? `<span class="tag subject">${escHtml(t.subject)}</span>` : ''}
        ${t.type ? `<span class="tag">${escHtml(t.type)}</span>` : ''}
        ${dueStr ? `<span class="due-date ${dueCls}">${dueStr}</span>` : ''}
        ${t.notes ? `<span class="due-date" title="${escHtml(t.notes)}">📝 Note</span>` : ''}
      </div>
    </div>
    <div class="assignment-actions">
      <span class="status-pill ${pillClass}">${pillLabel}</span>
      <button class="icon-btn" id="edit-${t.firestoreId}">✎</button>
      <button class="icon-btn delete" id="delete-${t.firestoreId}">✕</button>
    </div>
  </div>`;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Stats ────────────────────────────────────────────────
function updateStats() {
  const all = tasks.map(t => ({ ...t, computed: computeStatus(t) }));
  const total = all.length;
  const done = all.filter(t => t.computed === 'done').length;
  const pending = all.filter(t => ['pending','in-progress'].includes(t.computed)).length;
  const overdue = all.filter(t => t.computed === 'overdue').length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statDone').textContent = done;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statOverdue').textContent = overdue;

  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('ringPct').textContent = pct + '%';
  const circumference = 276.46;
  document.getElementById('progressRing').style.strokeDashoffset = circumference - (pct / 100 * circumference);

  document.getElementById('progressMsg').textContent =
    pct === 100 ? "🎉 Everything done! You're crushing it!" :
    pct >= 75 ? `Almost there! ${total - done} task${total-done>1?'s':''} left.` :
    pct >= 50 ? "Halfway! Keep the momentum going." :
    pct > 0 ? `Good start! ${done} of ${total} complete.` :
    `${total} task${total>1?'s':''} waiting. Start with the earliest due date!`;
}

// ─── Actions ──────────────────────────────────────────────
async function toggleDone(firestoreId) {
  const t = tasks.find(x => x.firestoreId === firestoreId);
  if (!t) return;
  await updateInFirestore(firestoreId, { status: t.status === 'done' ? 'pending' : 'done' });
}

async function deleteTask(firestoreId) {
  if (!confirm('Delete this task?')) return;
  await deleteFromFirestore(firestoreId);
}

function editTask(firestoreId) {
  const t = tasks.find(x => x.firestoreId === firestoreId);
  if (!t) return;
  editId = firestoreId;
  document.getElementById('modalTitle').textContent = 'Edit Assignment';
  document.getElementById('inputTitle').value = t.title;
  document.getElementById('inputSubject').value = t.subject || '';
  document.getElementById('inputType').value = t.type || 'Assignment';
  document.getElementById('inputDue').value = t.due || '';
  document.getElementById('inputStatus').value = t.status;
  document.getElementById('inputNotes').value = t.notes || '';
  openModal();
}

// ─── Modal ────────────────────────────────────────────────
function openModal() {
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  editId = null;
  document.getElementById('modalTitle').textContent = 'New Assignment';
  ['inputTitle','inputSubject','inputNotes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('inputType').value = 'Assignment';
  document.getElementById('inputDue').value = '';
  document.getElementById('inputStatus').value = 'pending';
}

async function saveTask() {
  const title = document.getElementById('inputTitle').value.trim();
  if (!title) { document.getElementById('inputTitle').focus(); return; }

  const data = {
    title,
    subject: document.getElementById('inputSubject').value.trim(),
    type: document.getElementById('inputType').value,
    due: document.getElementById('inputDue').value,
    status: document.getElementById('inputStatus').value,
    notes: document.getElementById('inputNotes').value.trim(),
    createdAt: new Date().toISOString()
  };

  if (editId) {
    await updateInFirestore(editId, data);
  } else {
    await saveToFirestore(data);
  }
  closeModal();
}

// ─── Event Listeners ──────────────────────────────────────
document.getElementById('addBtn').addEventListener('click', () => {
  editId = null;
  openModal();
});
document.getElementById('cancelBtn').addEventListener('click', closeModal);
document.getElementById('saveBtn').addEventListener('click', saveTask);
document.getElementById('searchInput').addEventListener('input', renderList);

document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

['all','pending','in-progress','done','overdue'].forEach(f => {
  document.getElementById(`filter-${f}`).addEventListener('click', function() {
    filter = f;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('listHead').textContent = f.toUpperCase().replace('-',' ') + ' ASSIGNMENTS';
    renderList();
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter' && document.getElementById('modalOverlay').classList.contains('open')) saveTask();
});