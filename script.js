// ===== 1. JAM DAN TANGGAL =====
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  document.getElementById('date').textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}
updateClock();
setInterval(updateClock, 1000);

// ===== 2. BUKA / KUNCI LAYAR =====
const lockscreen = document.getElementById('lockscreen');
const homeScreen = document.getElementById('home-screen');

function addSwipe(element, direction, callback) {
  let startY = 0, isDown = false;
  element.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
  element.addEventListener('touchend', (e) => {
    const dist = startY - e.changedTouches[0].clientY;
    if (direction === 'up' && dist > 60) callback();
    if (direction === 'down' && dist < -60) callback();
  });
  element.addEventListener('mousedown', (e) => { startY = e.clientY; isDown = true; });
  element.addEventListener('mouseup', (e) => {
    if (!isDown) return; isDown = false;
    const dist = startY - e.clientY;
    if (direction === 'up' && dist > 60) callback();
    if (direction === 'down' && dist < -60) callback();
  });
}

addSwipe(lockscreen, 'up', () => lockscreen.classList.add('unlocked'));
addSwipe(homeScreen, 'down', () => lockscreen.classList.remove('unlocked'));

// ===== 3. BUKA APLIKASI =====
document.querySelectorAll('.app').forEach(app => {
  app.addEventListener('click', () => {
    const appName = app.dataset.app;
    if (appName === 'chat') {
      document.getElementById('chat-screen').classList.add('active');
    } else if (appName === 'kamera') {
      document.getElementById('camera-screen').classList.add('active');
      startCamera();
    } else if (appName === 'galeri') {
      document.getElementById('gallery-screen').classList.add('active');
      exitSelectMode(); // Pastikan selalu normal saat dibuka
      renderGallery();
    }
  });
});

document.getElementById('camera-btn-lockscreen').addEventListener('click', () => {
  document.getElementById('camera-screen').classList.add('active');
  startCamera();
});

// ===== 4. TOMBOL BACK =====
document.querySelectorAll('.back-btn[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    
    // Jika di Galeri sedang mode pilih, Back = Batal Pilih
    if (targetId === 'gallery-screen' && document.getElementById('gallery-grid').classList.contains('select-mode')) {
      exitSelectMode();
      return; 
    }

    document.getElementById(targetId).classList.remove('active');
    if (targetId === 'chat-screen') {
      document.getElementById('chat-room-view').style.display = 'none';
      document.getElementById('chat-list-view').style.display = 'block';
    }
    if (targetId === 'camera-screen') stopCamera();
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
const video = document.getElementById('camera-viewfinder');
const shutterBtn = document.getElementById('shutter-btn');
const flashOverlay = document.getElementById('flash-overlay');
let stream = null; 

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    video.srcObject = stream;
  } catch (err) {
    alert("Kamera tidak bisa diakses. Pastikan menggunakan Live Server dan memberi izin.");
  }
}
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}
shutterBtn.addEventListener('click', () => {
  if (!stream) return;
  flashOverlay.classList.add('active');
  setTimeout(() => flashOverlay.classList.remove('active'), 150);
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  let savedPhotos = JSON.parse(localStorage.getItem('auPhotos')) || [];
  savedPhotos.unshift(canvas.toDataURL('image/jpeg', 0.8));
  localStorage.setItem('auPhotos', JSON.stringify(savedPhotos));
});

// ===== 7. LOGIKA GALERI (MODE PILIH) =====
const galleryGrid = document.getElementById('gallery-grid');
const menuBtn = document.getElementById('menu-gallery-btn');
const actionBar = document.getElementById('gallery-action-bar');
const cancelSelectBtn = document.getElementById('cancel-select-btn');
const deleteSelectedBtn = document.getElementById('delete-selected-btn');
const selectedCountText = document.getElementById('selected-count');

let isSelectMode = false;

function renderGallery() {
  galleryGrid.innerHTML = '';
  let savedPhotos = JSON.parse(localStorage.getItem('auPhotos')) || [];

  if (savedPhotos.length === 0) {
    galleryGrid.innerHTML = '<div class="empty-gallery">Belum ada foto.</div>';
    return;
  }

  savedPhotos.forEach((photoUrl, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'gallery-item';
    itemDiv.dataset.index = index; 

    const img = document.createElement('img');
    img.src = photoUrl;

    const checkCircle = document.createElement('div');
    checkCircle.className = 'check-circle';
    checkCircle.innerHTML = '✓';

    itemDiv.addEventListener('click', () => {
      if (isSelectMode) {
        itemDiv.classList.toggle('selected');
        updateSelectedCount();
      } else {
        const win = window.open();
        win.document.write(`<img src="${photoUrl}" style="max-width:100%; max-height:100vh; display:block; margin:auto;">`);
      }
    });

    itemDiv.appendChild(img);
    itemDiv.appendChild(checkCircle);
    galleryGrid.appendChild(itemDiv);
  });
}

function updateSelectedCount() {
  const count = document.querySelectorAll('.gallery-item.selected').length;
  selectedCountText.textContent = `${count} dipilih`;
}

// Aktifkan Mode Pilih saat Titik Tiga diklik
menuBtn.addEventListener('click', () => {
  if (document.querySelectorAll('.gallery-item').length === 0) return;
  isSelectMode = true;
  galleryGrid.classList.add('select-mode');
  actionBar.style.display = 'flex'; // Tampilkan bar bawah
  updateSelectedCount();
});

// Tombol Batal
cancelSelectBtn.addEventListener('click', exitSelectMode);

function exitSelectMode() {
  isSelectMode = false;
  galleryGrid.classList.remove('select-mode');
  actionBar.style.display = 'none'; // Sembunyikan bar bawah
  document.querySelectorAll('.gallery-item').forEach(item => item.classList.remove('selected'));
}

// Tombol Hapus di Bar Bawah
deleteSelectedBtn.addEventListener('click', () => {
  const selected = document.querySelectorAll('.gallery-item.selected');
  if (selected.length === 0) {
    alert("Pilih minimal satu foto.");
    return;
  }

  if (confirm(`Hapus ${selected.length} foto ini?`)) {
    let savedPhotos = JSON.parse(localStorage.getItem('auPhotos')) || [];
    let indexes = [];
    selected.forEach(item => indexes.push(parseInt(item.dataset.index)));
    
    // Hapus dari belakang agar index tidak bergeser
    indexes.sort((a, b) => b - a).forEach(i => savedPhotos.splice(i, 1));

    localStorage.setItem('auPhotos', JSON.stringify(savedPhotos));
    exitSelectMode();
    renderGallery();
  }
});
