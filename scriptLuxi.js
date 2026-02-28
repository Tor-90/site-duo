// ===== PHRASE DU JOUR (Firestore) =====
// Luxi LIT la phrase écrite par Toratino, et ÉCRIT une phrase pour Toratino

// Écouter en temps réel la phrase que Toratino a écrite pour Luxi
db.collection('phrasesDuJour').doc('luxi')
  .onSnapshot(function (doc) {
    const el = document.getElementById('messageOfDay');
    if (doc.exists && doc.data().phrase) {
      el.textContent = '"' + doc.data().phrase + '"';
    } else {
      el.textContent = '"Aucune phrase pour le moment... 💭"';
    }
  });

// Envoyer une phrase pour Toratino
function envoyerPhrase() {
  const input = document.getElementById('phraseInput');
  const phrase = input.value.trim();
  if (!phrase) return;
  db.collection('phrasesDuJour').doc('toratino').set({
    phrase: phrase,
    auteur: 'Luxi',
    date: new Date().toISOString()
  }).then(function () {
    input.value = '';
    alert('Phrase envoyée à Toratino ! 🌙');
  }).catch(function (err) {
    alert('Erreur : ' + err.message);
  });
}

// ===== TOGETHER COUNTER =====
const startDate = new Date('2026-01-27'); // Change this to your real date!
function updateCounter() {
  const now = new Date();
  const diff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  document.getElementById('daysTogether').textContent = diff;
}
updateCounter();
setInterval(updateCounter, 60000);

// ===== COUNTDOWN =====
function addCountdown() {
  const emoji = document.getElementById('cdEmoji').value || '🎯';
  const name = document.getElementById('cdName').value.trim();
  const date = document.getElementById('cdDate').value;
  if (!name || !date) return alert('Remplis le nom et la date !');
  const card = document.createElement('div');
  card.className = 'card countdown-card';
  card.dataset.date = date;
  card.innerHTML = `
    <button onclick="this.parentElement.remove()" style="position:absolute;top:8px;right:12px;background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;font-size:1.2em;" title="Supprimer">✕</button>
    <div class="event-emoji">${emoji}</div>
    <div class="event-name">${name}</div>
    <div class="countdown-time">
      <div class="unit"><span class="number cd-days">--</span><span class="label">jours</span></div>
      <div class="unit"><span class="number cd-hours">--</span><span class="label">heures</span></div>
      <div class="unit"><span class="number cd-mins">--</span><span class="label">min</span></div>
      <div class="unit"><span class="number cd-secs">--</span><span class="label">sec</span></div>
    </div>
  `;
  document.getElementById('countdownGrid').appendChild(card);
  updateCountdowns();
  document.getElementById('cdEmoji').value = '';
  document.getElementById('cdName').value = '';
  document.getElementById('cdDate').value = '';
}

function updateCountdowns() {
  document.querySelectorAll('.countdown-card').forEach(card => {
    const target = new Date(card.dataset.date);
    const now = new Date();
    let diff = target - now;
    if (diff < 0) {
      target.setFullYear(target.getFullYear() + 1);
      diff = target - now;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    card.querySelector('.cd-days').textContent = days;
    card.querySelector('.cd-hours').textContent = hours;
    card.querySelector('.cd-mins').textContent = mins;
    card.querySelector('.cd-secs').textContent = secs;
  });
}
updateCountdowns();
setInterval(updateCountdowns, 1000);

// ===== CALENDAR =====
let calMonth = new Date().getMonth();
let calYear = new Date().getFullYear();
const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
let calendarEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');

function saveCalendarEvents() {
  localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
}

function addEvent() {
  const dateVal = document.getElementById('eventDate').value;
  const emoji = document.getElementById('eventEmoji').value || '📌';
  const name = document.getElementById('eventName').value.trim();
  if (!dateVal || !name) return;
  calendarEvents.push({ date: dateVal, emoji, name });
  calendarEvents.sort((a, b) => a.date.localeCompare(b.date));
  saveCalendarEvents();
  renderCalendar();
  renderEventsList();
  document.getElementById('eventDate').value = '';
  document.getElementById('eventEmoji').value = '';
  document.getElementById('eventName').value = '';
}

function removeEvent(idx) {
  calendarEvents.splice(idx, 1);
  saveCalendarEvents();
  renderCalendar();
  renderEventsList();
}

function renderEventsList() {
  const list = document.getElementById('eventsList');
  list.innerHTML = '';
  if (calendarEvents.length === 0) {
    list.innerHTML = '<p style="opacity:0.5;text-align:center;">Aucun événement pour l\'instant</p>';
    return;
  }
  calendarEvents.forEach((ev, idx) => {
    const d = new Date(ev.date + 'T00:00:00');
    const dayNum = d.getDate();
    const monthStr = monthNames[d.getMonth()].substring(0, 3);
    const item = document.createElement('div');
    item.className = 'calendar-event-item';
    item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';
    item.innerHTML = `<span><span class="dot"></span> ${dayNum} ${monthStr} ${d.getFullYear()} — ${ev.name} ${ev.emoji}</span><button onclick="removeEvent(${idx})" style="background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:16px;">✕</button>`;
    list.appendChild(item);
  });
}

function getEventsForMonth(month, year) {
  const set = new Set();
  calendarEvents.forEach(ev => {
    const d = new Date(ev.date + 'T00:00:00');
    if (d.getMonth() === month && d.getFullYear() === year) set.add(d.getDate());
  });
  return set;
}

function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';
  document.getElementById('calendarTitle').textContent = `${monthNames[calMonth]} ${calYear}`;
  dayNames.forEach(d => {
    const el = document.createElement('div');
    el.className = 'day-name';
    el.textContent = d;
    grid.appendChild(el);
  });
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const shift = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();
  const eventDays = getEventsForMonth(calMonth, calYear);
  for (let i = 0; i < shift; i++) {
    const el = document.createElement('div');
    el.className = 'day empty';
    grid.appendChild(el);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const el = document.createElement('div');
    el.className = 'day';
    el.textContent = d;
    if (d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()) {
      el.classList.add('today');
    }
    if (eventDays.has(d)) el.classList.add('has-event');
    grid.appendChild(el);
  }
}
function changeMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
}
renderCalendar();
renderEventsList();

// ===== JOURNAL =====
function parseJournalDate(dateStr) {
  const months = { janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5, juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11 };
  const parts = dateStr.trim().split(' ');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), months[parts[1].toLowerCase()] || 0, parseInt(parts[0]));
  }
  return new Date(0);
}

function sortJournalEntries() {
  const container = document.getElementById('journalEntries');
  const entries = Array.from(container.querySelectorAll('.journal-entry'));
  entries.sort((a, b) => {
    const dateA = parseJournalDate(a.querySelector('.date').textContent);
    const dateB = parseJournalDate(b.querySelector('.date').textContent);
    return dateB - dateA;
  });
  entries.forEach(e => container.appendChild(e));
}

function addJournalEntry() {
  const input = document.getElementById('journalInput');
  if (!input.value.trim()) return;
  const entry = document.createElement('div');
  entry.className = 'card journal-entry';
  const dateInput = document.getElementById('journalDate');
  const selectedDate = dateInput.value ? new Date(dateInput.value + 'T12:00:00') : new Date();
  entry.innerHTML = `
    <div class="date">${selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    <div class="content">${input.value}</div>
  `;
  document.getElementById('journalEntries').appendChild(entry);
  sortJournalEntries();
  input.value = '';
  dateInput.value = '';
}

document.addEventListener('DOMContentLoaded', sortJournalEntries);

// ===== PHOTO =====
function addPhoto(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const item = createPhotoItem(e.target.result);
      const grid = document.getElementById('photoGrid');
      grid.insertBefore(item, grid.lastElementChild);
      savePhotos();
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function createPhotoItem(src) {
  const item = document.createElement('div');
  item.className = 'photo-item';
  item.style.backgroundImage = `url(${src})`;
  item.style.backgroundSize = 'cover';
  item.style.backgroundPosition = 'center';
  item.style.position = 'relative';
  item.innerHTML = '';

  const del = document.createElement('span');
  del.textContent = '✕';
  del.className = 'photo-delete-btn';
  del.style.cssText = 'position:absolute;top:6px;right:6px;background:rgba(0,0,0,0.7);color:white;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;z-index:10;opacity:0.7;transition:opacity 0.2s;';
  del.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Supprimer cette photo ?')) {
      item.parentNode.removeChild(item);
      savePhotos();
    }
  });
  item.appendChild(del);

  return item;
}

function savePhotos() {
  const items = document.querySelectorAll('#photoGrid .photo-item');
  const photos = [];
  items.forEach(item => {
    const bg = item.style.backgroundImage;
    const match = bg.match(/url\(["']?(.+?)["']?\)/);
    if (match) photos.push(match[1]);
  });
  localStorage.setItem('luxi_photos', JSON.stringify(photos));
}

function loadPhotos() {
  const saved = localStorage.getItem('luxi_photos');
  if (saved) {
    const photos = JSON.parse(saved);
    const grid = document.getElementById('photoGrid');
    photos.forEach(src => {
      const item = createPhotoItem(src);
      grid.insertBefore(item, grid.lastElementChild);
    });
  }
}
loadPhotos();



// ===== RANDOM WHEEL =====
const wheelOptions = ['Restaurant 🍕', 'Film 🎬', 'Balade 🚶', 'Jeu de société 🎲', 'Cuisine ensemble 👩‍🍳', 'Massage 💆', 'Musée 🖼️', 'Pique-nique 🧺'];
const wheelColors = ['#8e3a6e', '#b84a8e', '#6e3a5e', '#a04a7e', '#7e2a5e', '#c85a9e', '#5e2a4e', '#9e3a7e'];
let wheelAngle = 0;
let wheelSpinning = false;

function drawWheel() {
  const canvas = document.getElementById('wheelCanvas');
  const ctx = canvas.getContext('2d');
  const cx = 140, cy = 140, r = 130;
  ctx.clearRect(0, 0, 280, 280);
  const arc = (2 * Math.PI) / wheelOptions.length;
  wheelOptions.forEach((opt, i) => {
    const start = wheelAngle + i * arc;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + arc);
    ctx.fillStyle = wheelColors[i];
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.stroke();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + arc / 2);
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.fillText(opt, 30, 4);
    ctx.restore();
  });
  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.stroke();
}

function spinWheel() {
  if (wheelSpinning) return;
  wheelSpinning = true;
  const spinAmount = Math.random() * Math.PI * 8 + Math.PI * 10;
  const duration = 4000;
  const startAngle = wheelAngle;
  const startTime = performance.now();
  function animate(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    wheelAngle = startAngle + spinAmount * ease;
    drawWheel();
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      wheelSpinning = false;
      const arc = (2 * Math.PI) / wheelOptions.length;
      const normalized = ((2 * Math.PI - (wheelAngle % (2 * Math.PI))) + Math.PI * 1.5) % (2 * Math.PI);
      const index = Math.floor(normalized / arc) % wheelOptions.length;
      document.getElementById('wheelResult').textContent = wheelOptions[index] + ' !';
    }
  }
  requestAnimationFrame(animate);
}
drawWheel();

// ===== CHAT =====
function sendChat() {
  const input = document.getElementById('chatInput');
  if (!input.value.trim()) return;
  const msg = document.createElement('div');
  msg.className = 'chat-message sent';
  const now = new Date();
  msg.innerHTML = `<div>${input.value}</div><div class="msg-time">${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}</div>`;
  document.getElementById('chatMessages').appendChild(msg);
  input.value = '';
  document.getElementById('chatMessages').scrollTop = 999999;
}

// ===== BUCKET LIST =====
function toggleBucket(el) {
  el.classList.toggle('completed');
  const check = el.querySelector('.bucket-check');
  check.classList.toggle('done');
  check.textContent = check.classList.contains('done') ? '✓' : '';
}
function addBucketItem() {
  const input = document.getElementById('bucketInput');
  if (!input.value.trim()) return;
  const li = document.createElement('li');
  li.className = 'bucket-item';
  li.onclick = function () { toggleBucket(this); };
  li.innerHTML = `<div class="bucket-check"></div><span class="text">${input.value}</span>`;
  document.getElementById('bucketList').appendChild(li);
  input.value = '';
}

// ===== NAV HIGHLIGHT =====
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', function () {
    document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});