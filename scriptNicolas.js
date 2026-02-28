const CURRENT_USER = 'nicolas';
const OTHER_USER = 'luxi';
const rtdb = firebase.database();

// ===== PHRASE DU JOUR (Firestore) =====
// Listen for phrase written by the other user for us
db.collection('phrasesDuJour').doc(CURRENT_USER)
  .onSnapshot(function(doc) {
    const el = document.getElementById('messageOfDay');
    if (doc.exists && doc.data().phrase) {
      el.textContent = '"' + doc.data().phrase + '"';
    } else {
      el.textContent = '"Aucune phrase pour le moment... 💭"';
    }
  });

// Send phrase to the other user
function envoyerPhrase() {
  const input = document.getElementById('phraseInput');
  const phrase = input.value.trim();
  if (!phrase) return;
  db.collection('phrasesDuJour').doc(OTHER_USER).set({
    phrase: phrase,
    auteur: 'Nicolas',
    date: new Date().toISOString()
  }).then(function() {
    input.value = '';
    alert('Phrase envoyée à Luxi ! 💫');
  }).catch(function(err) {
    alert('Erreur : ' + err.message);
  });
}

// ===== TOGETHER COUNTER =====
const startDate = new Date('2026-01-27');
function updateCounter() {
  const now = new Date();
  const diff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  document.getElementById('daysTogether').textContent = diff;
}
updateCounter();
setInterval(updateCounter, 60000);

// ===== COUNTDOWN (FIREBASE) =====
function addCountdown() {
  const emoji = document.getElementById('cdEmoji').value || '🎯';
  const name = document.getElementById('cdName').value.trim();
  const date = document.getElementById('cdDate').value;
  if (!name || !date) return alert('Remplis le nom et la date !');
  rtdb.ref('countdowns').push({ emoji, name, date, addedBy: CURRENT_USER });
  document.getElementById('cdEmoji').value = '';
  document.getElementById('cdName').value = '';
  document.getElementById('cdDate').value = '';
}

function deleteCountdown(key) {
  if (confirm('Supprimer ce countdown ?')) rtdb.ref('countdowns/' + key).remove();
}

function renderCountdowns(snapshot) {
  const grid = document.getElementById('countdownGrid');
  grid.innerHTML = '';
  const data = snapshot.val();
  if (!data) return;
  Object.keys(data).forEach(key => {
    const cd = data[key];
    const card = document.createElement('div');
    card.className = 'card countdown-card';
    card.dataset.date = cd.date;
    card.dataset.key = key;
    card.innerHTML = `
      <button onclick="deleteCountdown('${key}')" style="position:absolute;top:8px;right:12px;background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;font-size:1.2em;" title="Supprimer">✕</button>
      <div class="event-emoji">${cd.emoji}</div>
      <div class="event-name">${cd.name}</div>
      <div class="countdown-time">
        <div class="unit"><span class="number cd-days">--</span><span class="label">jours</span></div>
        <div class="unit"><span class="number cd-hours">--</span><span class="label">heures</span></div>
        <div class="unit"><span class="number cd-mins">--</span><span class="label">min</span></div>
        <div class="unit"><span class="number cd-secs">--</span><span class="label">sec</span></div>
      </div>
    `;
    grid.appendChild(card);
  });
  updateCountdowns();
}

function updateCountdowns() {
  document.querySelectorAll('.countdown-card').forEach(card => {
    const target = new Date(card.dataset.date);
    const now = new Date();
    let diff = target - now;
    if (diff < 0) { target.setFullYear(target.getFullYear() + 1); diff = target - now; }
    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
    const mins = Math.floor((diff % (1000*60*60)) / (1000*60));
    const secs = Math.floor((diff % (1000*60)) / 1000);
    card.querySelector('.cd-days').textContent = days;
    card.querySelector('.cd-hours').textContent = hours;
    card.querySelector('.cd-mins').textContent = mins;
    card.querySelector('.cd-secs').textContent = secs;
  });
}
rtdb.ref('countdowns').on('value', renderCountdowns);
setInterval(updateCountdowns, 1000);

// ===== CALENDAR (FIREBASE) =====
let calMonth = new Date().getMonth();
let calYear = new Date().getFullYear();
const monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const dayNames = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
let calendarEvents = [];

function addEvent() {
  const dateVal = document.getElementById('eventDate').value;
  const emoji = document.getElementById('eventEmoji').value || '📌';
  const name = document.getElementById('eventName').value.trim();
  if (!dateVal || !name) return;
  rtdb.ref('calendarEvents').push({ date: dateVal, emoji, name, addedBy: CURRENT_USER });
  document.getElementById('eventDate').value = '';
  document.getElementById('eventEmoji').value = '';
  document.getElementById('eventName').value = '';
}

function removeEvent(key) {
  if (confirm('Supprimer cet événement ?')) rtdb.ref('calendarEvents/' + key).remove();
}

function renderCalendarData(snapshot) {
  calendarEvents = [];
  const data = snapshot.val();
  if (data) {
    Object.keys(data).forEach(key => {
      calendarEvents.push({ ...data[key], key });
    });
    calendarEvents.sort((a, b) => a.date.localeCompare(b.date));
  }
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
  calendarEvents.forEach(ev => {
    const d = new Date(ev.date + 'T00:00:00');
    const dayNum = d.getDate();
    const monthStr = monthNames[d.getMonth()].substring(0, 3);
    const item = document.createElement('div');
    item.className = 'calendar-event-item';
    item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';
    item.innerHTML = `<span><span class="dot"></span> ${dayNum} ${monthStr} ${d.getFullYear()} — ${ev.name} ${ev.emoji}</span><button onclick="removeEvent('${ev.key}')" style="background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:16px;">✕</button>`;
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
    if (d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()) el.classList.add('today');
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

rtdb.ref('calendarEvents').on('value', renderCalendarData);

// ===== JOURNAL (FIREBASE) =====
function addJournalEntry() {
  const input = document.getElementById('journalInput');
  if (!input.value.trim()) return;
  const dateInput = document.getElementById('journalDate');
  const selectedDate = dateInput.value || new Date().toISOString().split('T')[0];
  rtdb.ref('journal').push({
    date: selectedDate,
    content: input.value.trim(),
    addedBy: CURRENT_USER,
    timestamp: new Date().getTime()
  });
  input.value = '';
  dateInput.value = '';
}

function deleteJournal(key) {
  if (confirm('Supprimer cette entrée ?')) rtdb.ref('journal/' + key).remove();
}

function renderJournal(snapshot) {
  const container = document.getElementById('journalEntries');
  container.innerHTML = '';
  const data = snapshot.val();
  if (!data) {
    container.innerHTML = '<p style="opacity:0.5;text-align:center;">Aucune entrée pour le moment ✍️</p>';
    return;
  }
  // Sort by date descending
  const entries = Object.keys(data).map(key => ({ ...data[key], key }));
  entries.sort((a, b) => b.date.localeCompare(a.date));
  entries.forEach(entry => {
    const d = new Date(entry.date + 'T00:00:00');
    const dateStr = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const div = document.createElement('div');
    div.className = 'card journal-entry';
    div.innerHTML = `
      <button onclick="deleteJournal('${entry.key}')" style="position:absolute;top:8px;right:12px;background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;font-size:1.1em;" title="Supprimer">✕</button>
      <div class="date">${dateStr}</div>
      <div class="content">${entry.content}</div>
    `;
    container.appendChild(div);
  });
}

rtdb.ref('journal').on('value', renderJournal);

// ===== PHOTO =====
function addPhoto(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
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

  const del = document.createElement('span');
  del.textContent = '✕';
  del.className = 'photo-delete-btn';
  del.style.cssText = 'position:absolute;top:6px;right:6px;background:rgba(0,0,0,0.7);color:white;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;z-index:10;opacity:0.7;transition:opacity 0.2s;';
  del.addEventListener('click', function(e) {
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
  localStorage.setItem(CURRENT_USER + '_photos', JSON.stringify(photos));
}

function loadPhotos() {
  const saved = localStorage.getItem(CURRENT_USER + '_photos');
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

// ===== RANDOM WHEEL (FIREBASE) =====
let wheelOptions = [];
let wheelAngle = 0;
let wheelSpinning = false;

function generateWheelColors(count) {
  const isNicolas = CURRENT_USER === 'nicolas';
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = isNicolas ? (240 + (i * 30) % 60) : (320 + (i * 25) % 50);
    const sat = 50 + (i * 7) % 30;
    const light = 25 + (i * 5) % 20;
    colors.push(`hsl(${hue}, ${sat}%, ${light}%)`);
  }
  return colors;
}

function drawWheel() {
  const canvas = document.getElementById('wheelCanvas');
  const ctx = canvas.getContext('2d');
  const cx = 140, cy = 140, r = 130;
  ctx.clearRect(0, 0, 280, 280);

  if (wheelOptions.length === 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ajoute des options !', cx, cy);
    ctx.textAlign = 'start';
    return;
  }

  const colors = generateWheelColors(wheelOptions.length);
  const arc = (2 * Math.PI) / wheelOptions.length;
  wheelOptions.forEach((opt, i) => {
    const start = wheelAngle + i * arc;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + arc);
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.stroke();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + arc / 2);
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.fillText(opt.length > 18 ? opt.substring(0, 16) + '..' : opt, 30, 4);
    ctx.restore();
  });
  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.stroke();
}

function addWheelOption() {
  const input = document.getElementById('wheelOptionInput');
  const val = input.value.trim();
  if (!val) return;
  rtdb.ref('wheelOptions').push({ text: val });
  input.value = '';
}

function removeWheelOption(key) {
  rtdb.ref('wheelOptions/' + key).remove();
}

function renderWheelOptions(snapshot) {
  wheelOptions = [];
  const list = document.getElementById('wheelOptionsList');
  list.innerHTML = '';
  const data = snapshot.val();
  if (data) {
    Object.keys(data).forEach(key => {
      wheelOptions.push(data[key].text);
      const tag = document.createElement('span');
      tag.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(255,255,255,0.1);border-radius:16px;font-size:0.85em;';
      tag.innerHTML = `${data[key].text} <span onclick="removeWheelOption('${key}')" style="cursor:pointer;opacity:0.6;">✕</span>`;
      list.appendChild(tag);
    });
  }
  drawWheel();
}

rtdb.ref('wheelOptions').on('value', renderWheelOptions);

// Listen for wheel result from the other user
rtdb.ref('wheelResult').on('value', (snapshot) => {
  const data = snapshot.val();
  if (data && data.text) {
    document.getElementById('wheelResult').textContent = data.text + ' !';
  }
});

function spinWheel() {
  if (wheelSpinning || wheelOptions.length === 0) return;
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
      const result = wheelOptions[index];
      document.getElementById('wheelResult').textContent = result + ' !';
      // Save result to Firebase so the other user sees it
      rtdb.ref('wheelResult').set({ text: result, spinner: CURRENT_USER, time: new Date().getTime() });
    }
  }
  requestAnimationFrame(animate);
}

// ===== REAL-TIME CHAT (FIREBASE) =====
function sendChat() {
  const input = document.getElementById('chatInput');
  if (!input.value.trim()) return;
  const now = new Date();
  rtdb.ref('chat').push({
    text: input.value.trim(),
    sender: CURRENT_USER,
    time: now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'),
    timestamp: now.getTime()
  });
  input.value = '';
}

function initChat() {
  const chatContainer = document.getElementById('chatMessages');
  rtdb.ref('chat').orderByChild('timestamp').on('child_added', (snapshot) => {
    const data = snapshot.val();
    const msg = document.createElement('div');
    msg.className = 'chat-message ' + (data.sender === CURRENT_USER ? 'sent' : 'received');
    msg.innerHTML = `<div>${data.text}</div><div class="msg-time">${data.time}</div>`;
    chatContainer.appendChild(msg);
    chatContainer.scrollTop = 999999;
  });
}

// ===== BUCKET LIST (FIREBASE) =====
function addBucketItem() {
  const input = document.getElementById('bucketInput');
  if (!input.value.trim()) return;
  rtdb.ref('bucketlist').push({ text: input.value.trim(), completed: false, addedBy: CURRENT_USER });
  input.value = '';
}

function toggleBucketItem(key, currentState) {
  rtdb.ref('bucketlist/' + key).update({ completed: !currentState });
}

function deleteBucketItem(key) {
  if (confirm('Supprimer ce rêve ?')) rtdb.ref('bucketlist/' + key).remove();
}

function renderBucketList(snapshot) {
  const list = document.getElementById('bucketList');
  list.innerHTML = '';
  const data = snapshot.val();
  if (!data) {
    list.innerHTML = '<li style="opacity:0.5;text-align:center;list-style:none;">Aucun rêve pour le moment... Ajoutez-en un ! ✨</li>';
    return;
  }
  Object.keys(data).forEach(key => {
    const item = data[key];
    const li = document.createElement('li');
    li.className = 'bucket-item' + (item.completed ? ' completed' : '');
    li.innerHTML = `
      <div class="bucket-check ${item.completed ? 'done' : ''}" onclick="toggleBucketItem('${key}', ${item.completed})">${item.completed ? '✓' : ''}</div>
      <span class="text">${item.text}</span>
      <span onclick="deleteBucketItem('${key}')" style="cursor:pointer;opacity:0.4;margin-left:auto;font-size:0.9em;">✕</span>
    `;
    list.appendChild(li);
  });
}

rtdb.ref('bucketlist').on('value', renderBucketList);

// ===== MAP (LEAFLET + FIREBASE) =====
let leafletMap;
let addingPin = false;

// Custom colored markers
const blueIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

function initMap() {
  leafletMap = L.map('leafletMap').setView([46.603354, 1.888334], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(leafletMap);

  rtdb.ref('pins').on('value', (snapshot) => {
    leafletMap.eachLayer((layer) => {
      if (layer instanceof L.Marker) leafletMap.removeLayer(layer);
    });
    document.getElementById('mapPins').innerHTML = '';
    const pins = snapshot.val();
    if (pins) {
      Object.keys(pins).forEach(key => {
        const pin = pins[key];
        const icon = pin.addedBy === 'nicolas' ? blueIcon : redIcon;
        const marker = L.marker([pin.lat, pin.lng], { icon }).addTo(leafletMap);
        marker.bindPopup(`<b>${pin.name}</b><br><small>par ${pin.addedBy === 'nicolas' ? 'Nicolas' : 'Luxi'}</small>`);
        addPinToList(pin.name, key, pin.addedBy);
      });
    }
  });

  leafletMap.on('click', function(e) {
    if (!addingPin) return;
    const name = document.getElementById('pinName').value.trim();
    if (!name) { alert('Donne un nom au lieu !'); return; }
    rtdb.ref('pins').push({
      lat: e.latlng.lat, lng: e.latlng.lng, name: name,
      addedBy: CURRENT_USER, date: new Date().toISOString()
    });
    document.getElementById('pinName').value = '';
    addingPin = false;
    document.getElementById('pinInstruction').style.display = 'none';
    document.getElementById('addPinBtn').textContent = '📍 Ajouter un lieu';
  });
}

function addPinToList(name, key, addedBy) {
  const color = addedBy === 'nicolas' ? '🔵' : '🔴';
  const div = document.createElement('div');
  div.className = 'map-pin';
  div.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(255,255,255,0.08);border-radius:20px;font-size:0.9em;margin:4px;';
  div.innerHTML = `${color} ${name} <span onclick="deletePin('${key}')" style="cursor:pointer;margin-left:4px;opacity:0.6;">✕</span>`;
  document.getElementById('mapPins').appendChild(div);
}

function startAddPin() {
  const name = document.getElementById('pinName').value.trim();
  if (!name) { alert('Écris d\'abord le nom du lieu !'); return; }
  addingPin = true;
  document.getElementById('pinInstruction').style.display = 'block';
  document.getElementById('addPinBtn').textContent = '⏳ Clique sur la carte...';
}

function deletePin(key) {
  if (confirm('Supprimer ce lieu ?')) rtdb.ref('pins/' + key).remove();
}

// ===== INIT =====
function initAll() {
  initChat();
  initMap();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  setTimeout(initAll, 100);
}

// ===== NAV HIGHLIGHT =====
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', function() {
    document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    // Auto-close mobile menu
    document.querySelector('.nav-links').classList.remove('open');
  });
});
