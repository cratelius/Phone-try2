// ===== 1. JAM DAN TANGGAL =====
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hours}:${minutes}`;

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  document.getElementById('date').textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}
updateClock();
setInterval(updateClock, 1000);

// ===== 2. BUKA & KUNCI LAYAR =====
const lockscreen = document.getElementById('lockscreen');
const homeScreen = document.getElementById('home-screen');

function unlockScreen() { lockscreen.classList.add('unlocked'); }
function lockScreen() { lockscreen.classList.remove('unlocked'); }

// Geser Lockscreen (Buka)
let touchStartY = 0;
lockscreen.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
lockscreen.addEventListener('touchend', (e) => { if (touchStartY - e.changedTouches[0].clientY > 80) unlockScreen(); });
let mouseStartY = 0, isMouseDown = false;
lockscreen.addEventListener('mousedown', (e) => { mouseStartY = e.clientY; isMouseDown = true; });
lockscreen.addEventListener('mouseup', (e) => { if (isMouseDown && mouseStartY - e.clientY > 80) unlockScreen(); isMouseDown = false; });

// Geser Home (Kunci)
let homeTouchStartY = 0;
homeScreen.addEventListener('touchstart', (e) => { homeTouchStartY = e.touches[0].clientY; }, { passive: true });
homeScreen.addEventListener('touchend', (e) => { if (e.changedTouches[0].clientY - homeTouchStartY > 80) lockScreen(); });
let homeMouseStartY = 0, isHomeMouseDown = false;
homeScreen.addEventListener('mousedown', (e) => { homeMouseStartY = e.clientY; isHomeMouseDown = true; });
homeScreen.addEventListener('mouseup', (e) => { if (isHomeMouseDown && e.clientY - homeMouseStartY > 80) lockScreen(); isHomeMouseDown = false; });

// ===== 3. BUKA APLIKASI DARI HOME =====
document.querySelectorAll('.app').forEach(app => {
  app.addEventListener('click', () => {
    const appName = app.dataset.app;
    if (appName === 'chat') {
      document.getElementById('chat-screen').classList.add('active');
    } else if (appName === 'kamera') {
      document.getElementById('camera-screen').classList.add('active');
      generateMockImage(); // Set gambar awal
    } else if (appName === 'galeri') {
      document.getElementById('gallery-screen').classList.add('active');
      renderGallery();
    }
  });
});

// Tombol Kamera di Lockscreen
document.getElementById('camera-btn-lockscreen').addEventListener('click', () => {
  document.getElementById('camera-screen').classList.add('active');
  generateMockImage();
});

// ===== 4. TOMBOL KEMBALI =====
document.querySelectorAll('.back-btn[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    document.getElementById(targetId).classList.remove('active');
    if (targetId === 'chat-screen') {
      document.getElementById('chat-room-view').style.display = 'none';
      document.getElementById('chat-list-view').style.display = 'block';
    }
  });
});

// ===== 5. LOGIKA CHAT =====
const chatListView = document.getElementById('chat-list-view');
const chatRoomView = document.getElementById('chat-room-view');
const chatMessages = document.getElementById('chat-messages');
const chatTitle = document.getElementById('chat-title');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

document.querySelectorAll('.chat-item').forEach(item => {
  item.addEventListener('click', () => {
    chatListView.style.display = 'none';
    chatRoomView.style.display = 'flex';
    chatTitle.textContent = `${item.dataset.avatar} ${item.dataset.contact}`;
    chatMessages.innerHTML = '';
    addMessage(`Halo, ini ${item.dataset.contact}. Ada apa?`, 'received');
  });
});

function addMessage(text, type) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', type);
  msgDiv.textContent = text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendBtn.addEventListener('click', () => {
  const text = chatInput.value.trim();
  if (!text) return;
  addMessage(text, 'sent');
  chatInput.value = '';
  setTimeout(() => addMessage("Hah? Maksudnya gimana?", 'received'), 1000);
});
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendBtn.click(); });

// ===== 6. LOGIKA KAMERA =====
const viewfinder = document.getElementById('camera-viewfinder');
const shutterBtn = document.getElementById('shutter-btn');
const flashOverlay = document.getElementById('flash-overlay');

// Array warna sebagai "Foto" dummy (biar ga perlu internet)
const dummyColors = ['#ff9a9e', '#fecfef', '#a18cd1', '#fbc2eb', '#84fab0', '#8fd3f4', '#cfd9df'];
let currentPhotoColor = '';

function generateMockImage() {
  currentPhotoColor = dummyColors[Math.floor(Math.random() * dummyColors.length)];
  // Buat gambar SVG murni menggunakan data URI (tanpa internet)
  viewfinder.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="700"><rect width="100%" height="100%" fill="${currentPhotoColor}"/><text x="50%" y="50%" font-family="sans-serif" font-size="30" fill="white" text-anchor="middle">FOTO SIMULASI</text></svg>`;
}

shutterBtn.addEventListener('click', () => {
  // 1. Efek Flash
  flashOverlay.classList.add('active');
  setTimeout(() => flashOverlay.classList.remove('active'), 150);

  // 2. Simpan foto ke LocalStorage
  const fotoUrl = viewfinder.src;
  let savedPhotos = JSON.parse(localStorage.getItem('auPhotos')) || [];
  savedPhotos.unshift(fotoUrl);
  localStorage.setItem('auPhotos', JSON.stringify(savedPhotos));

  // 3. Ganti gambar untuk foto selanjutnya
  setTimeout(() => generateMockImage(), 300);
});

// ===== 7. LOGIKA GALERI =====
const galleryGrid = document.getElementById('gallery-grid');

function renderGallery() {
  galleryGrid.innerHTML = '';
  let savedPhotos = JSON.parse(localStorage.getItem('auPhotos')) || [];

  if (savedPhotos.length === 0) {
    galleryGrid.innerHTML = '<div class="empty-gallery">Belum ada foto.</div>';
    return;
  }

  savedPhotos.forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    img.addEventListener('click', () => alert('Foto dibuka!'));
    galleryGrid.appendChild(img);
  });
}
