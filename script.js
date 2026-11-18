// ===== 1. JAM DAN TANGGAL REAL-TIME =====
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

// ===== 2. BUKA & KUNCI LAYAR (GESTUR GESER) =====
const lockscreen = document.getElementById('lockscreen');
const homeScreen = document.getElementById('home-screen');

function unlockScreen() { lockscreen.classList.add('unlocked'); }
function lockScreen() { lockscreen.classList.remove('unlocked'); }

function addSwipeListener(element, direction, callback) {
  let startY = 0;
  let isPointerDown = false;

  element.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
  element.addEventListener('touchend', (e) => {
    const distance = startY - e.changedTouches[0].clientY;
    if (direction === 'up' && distance > 60) callback();
    if (direction === 'down' && distance < -60) callback();
  });

  element.addEventListener('mousedown', (e) => { startY = e.clientY; isPointerDown = true; });
  element.addEventListener('mouseup', (e) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    const distance = startY - e.clientY;
    if (direction === 'up' && distance > 60) callback();
    if (direction === 'down' && distance < -60) callback();
  });
}

addSwipeListener(lockscreen, 'up', unlockScreen);
addSwipeListener(homeScreen, 'down', lockScreen);

// ===== 3. BUKA APLIKASI DARI HOME =====
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
      exitSelectMode(); // Pastikan galeri selalu terbuka di mode normal
      renderGallery();
    } else {
      alert(`Aplikasi ${appName} belum tersedia.`);
    }
  });
});

document.getElementById('camera-btn-lockscreen').addEventListener('click', () => {
  document.getElementById('camera-screen').classList.add('active');
  startCamera();
});

// ===== 4. TOMBOL KEMBALI (BACK) =====
document.querySelectorAll('.back-btn[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    
    // Jika di Galeri sedang Mode Pilih, tombol Back hanya membatalkan pilihan
    if (targetId === 'gallery-screen' && document.getElementById('gallery-grid').classList.contains('select-mode')) {
      exitSelectMode();
      return; 
    }

    document.getElementById(targetId).classList.remove('active');
    
    if (targetId === 'chat-screen') {
      document.getElementById('chat-room-view').style.display = 'none';
      document.getElementById('chat-list-view').style.display = 'block';
    }
    if (targetId === 'camera-screen') {
      stopCamera();
    }
  });
});

// ===== 5. LOGIKA APLIKASI CHAT =====
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
  setTimeout(() => {
    let balasan = "Hah? Maksudnya gimana?";
    const lowerText = text.toLowerCase();
    if (lowerText.includes('halo')) balasan = "Halo juga! Apa kabar?";
    else if (lowerText.includes('dimana')) balasan = "Aku lagi di rumah nih.";
    addMessage(balasan, 'received');
  }, 1000);
});
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendBtn.click(); });

// ===== 6. LOGIKA KAMERA ASLI (LIVE) =====
const video = document.getElementById('camera-viewfinder');
const shutterBtn = document.getElementById('shutter-btn');
const flashOverlay = document.getElementById('flash-overlay');
let stream = null; 

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: "environment" }, 
      audio: false 
    });
    video.srcObject = stream;
  } catch (err) {
    console.error("Kamera gagal dinyalakan:", err);
    alert("Kamera tidak bisa diakses.\n\nPastikan Anda:\n1. Memberi izin (Allow) pada browser.\n2. Membuka file melalui 'Live Server' (http://localhost), bukan klik dua kali file (file:///).");
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
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);

  let savedPhotos = JSON.parse(localStorage.getItem('auPhotos')) || [];
  savedPhotos.unshift(photoDataUrl);
  localStorage.setItem('auPhotos', JSON.stringify(savedPhotos));
});

// ===== 7. LOGIKA GALERI (MODE PILIH & HAPUS) =====
const galleryGrid = document.getElementById('gallery-grid');
const menuBtn = document.getElementById('menu-gallery-btn');
const actionBar = document.getElementById('gallery-action-bar');
const cancelSelectBtn = document.getElementById('cancel-select-btn');
const deleteSelectedBtn = document.getElementById('delete-selected-btn');
const selectedCountText = document.getElementById('selected-count');

let isSelectMode = false;

// Fungsi Render Galeri
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
    itemDiv.dataset.index = index; // Simpan index asli foto

    const img = document.createElement('img');
    img.src = photoUrl;

    // Lingkaran centang (untuk mode pilih)
    const checkCircle = document.createElement('div');
    checkCircle.className = 'check-circle';
    checkCircle.innerHTML = '✓';

    // Aksi saat foto diklik
    itemDiv.addEventListener('click', () => {
      if (isSelectMode) {
        // Jika mode pilih, klik berarti memilih/batal memilih
        itemDiv.classList.toggle('selected');
        updateSelectedCount();
      } else {
        // Jika mode normal, klik berarti zoom foto (buka tab baru)
        const win = window.open();
        win.document.write(`<img src="${photoUrl}" style="max-width:100%; max-height:100vh; display:block; margin:auto;">`);
      }
    });

    itemDiv.appendChild(img);
    itemDiv.appendChild(checkCircle);
    galleryGrid.appendChild(itemDiv);
  });
}

// Fungsi Update Jumlah yang Dipilih
function updateSelectedCount() {
  const selected = document.querySelectorAll('.gallery-item.selected').length;
  selectedCountText.textContent = `${selected} dipilih`;
}

// Aktifkan Mode Pilih (Klik Titik Tiga)
menuBtn.addEventListener('click', () => {
  // Jika galeri kosong, jangan aktifkan mode pilih
  if (document.querySelectorAll('.gallery-item').length === 0) return;

  isSelectMode = true;
  galleryGrid.classList.add('select-mode');
  actionBar.style.display = 'flex';
  updateSelectedCount();
});

// Batalkan Mode Pilih
cancelSelectBtn.addEventListener('click', exitSelectMode);

function exitSelectMode() {
  isSelectMode = false;
  galleryGrid.classList.remove('select-mode');
  actionBar.style.display = 'none';
  document.querySelectorAll('.gallery-item').forEach(item => item.classList.remove('selected'));
}

// Hapus Foto yang Dipilih
deleteSelectedBtn.addEventListener('click', () => {
  const selectedItems = document.querySelectorAll('.gallery-item.selected');
  if (selectedItems.length === 0) {
    alert("Pilih minimal satu foto untuk dihapus.");
    return;
  }

  if (confirm(`Hapus ${selectedItems.length} foto ini?`)) {
    let savedPhotos = JSON.parse(localStorage.getItem('auPhotos')) || [];
    
    // Kumpulkan index foto yang akan dihapus
    const indexesToDelete = [];
    selectedItems.forEach(item => indexesToDelete.push(parseInt(item.dataset.index)));

    // Urutkan index dari terbesar ke terkecil (PENTING: agar saat di-splice, index foto lain tidak bergeser)
    indexesToDelete.sort((a, b) => b - a);

    // Hapus foto dari array
    indexesToDelete.forEach(index => {
      savedPhotos.splice(index, 1);
    });

    // Simpan kembali ke localStorage
    localStorage.setItem('auPhotos', JSON.stringify(savedPhotos));
    
    // Keluar dari mode pilih dan render ulang galeri
    exitSelectMode();
    renderGallery();
  }
});
