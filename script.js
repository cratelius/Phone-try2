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

// ===== 2. NAVIGASI & GESER =====
const lockscreen = document.getElementById('lockscreen');
const homeScreen = document.getElementById('home-screen');

// Fungsi Buka/Tutup Layar
function unlockScreen() { lockscreen.classList.add('unlocked'); }
function lockScreen() { lockscreen.classList.remove('unlocked'); }

// Gesture Geser Atas (Lockscreen)
let touchStartY = 0;
lockscreen.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
lockscreen.addEventListener('touchend', (e) => {
  if (touchStartY - e.changedTouches[0].clientY > 80) unlockScreen();
});
let mouseStartY = 0, isMouseDown = false;
lockscreen.addEventListener('mousedown', (e) => { mouseStartY = e.clientY; isMouseDown = true; });
lockscreen.addEventListener('mouseup', (e) => {
  if (isMouseDown && mouseStartY - e.clientY > 80) unlockScreen();
  isMouseDown = false;
});

// Gesture Geser Bawah (Home Screen)
let homeTouchStartY = 0;
homeScreen.addEventListener('touchstart', (e) => { homeTouchStartY = e.touches[0].clientY; }, { passive: true });
homeScreen.addEventListener('touchend', (e) => {
  if (e.changedTouches[0].clientY - homeTouchStartY > 80) lockScreen();
});
let homeMouseStartY = 0, isHomeMouseDown = false;
homeScreen.addEventListener('mousedown', (e) => { homeMouseStartY = e.clientY; isHomeMouseDown = true; });
homeScreen.addEventListener('mouseup', (e) => {
  if (isHomeMouseDown && e.clientY - homeMouseStartY > 80) lockScreen();
  isHomeMouseDown = false;
});

// ===== 3. BUKA APLIKASI DARI HOME =====
document.querySelectorAll('.app').forEach(app => {
  app.addEventListener('click', () => {
    const appName = app.dataset.app;
    if (appName === 'chat') {
      document.getElementById('chat-screen').classList.add('active');
    } else if (appName === 'kamera') {
      document.getElementById('camera-screen').classList.add('active');
      changeViewfinder(); // Ganti gambar setiap kali kamera dibuka
    } else if (appName === 'galeri') {
      document.getElementById('gallery-screen').classList.add('active');
      renderGallery(); // Tampilkan foto terbaru
    }
  });
});

// Tombol Kamera di Lockscreen
document.getElementById('camera-btn-lockscreen').addEventListener('click', () => {
  document.getElementById('camera-screen').classList.add('active');
  changeViewfinder();
});

// ===== 4. TOMBOL BACK (Kembali ke Home) =====
document.querySelectorAll('.back-btn[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    document.getElementById(targetId).classList.remove('active');
    
    // Jika keluar dari chat, reset tampilan chat
    if (targetId === 'chat-screen') {
      document.getElementById('chat-room-view').style.display = 'none';
      document.getElementById('chat-list-view').style.display = 'block';
    }
  });
});

// ===== 5. LOGIKA CHAT =====
const chatScreen = document.getElementById('chat-screen');
const chatListView = document.getElementById('chat-list-view');
const chatRoomView = document.getElementById('chat-room-view');
const chatMessages = document.getElementById('chat-messages');
const chatTitle = document.getElementById('chat-title');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

let currentContact = '';

document.querySelectorAll('.chat-item').forEach(item => {
  item.addEventListener('click', () => {
    currentContact = item.dataset.contact;
    chatListView.style.display = 'none';
    chatRoomView.style.display = 'flex';
    chatTitle.textContent = `${item.dataset.avatar} ${currentContact}`;
    chatMessages.innerHTML = '';
    addMessage(`Halo, ini ${currentContact}. Ada apa?`, 'received');
  });
});

function addMessage(text, type) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', type);
  msgDiv.textContent = text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
  const text = chatInput.value.trim();
  if (text === '') return;
  addMessage(text, 'sent');
  chatInput.value = '';
  setTimeout(() => {
    let balasan = "Hah? Maksudnya gimana?";
    if (text.toLowerCase().includes('halo')) balasan = "Halo juga!";
    else if (text.toLowerCase().includes('dimana')) balasan = "Aku lagi di rumah nih.";
    addMessage(balasan, 'received');
  }, 1000);
}
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

// ===== 6. LOGIKA KAMERA =====
const cameraScreen = document.getElementById('camera-screen');
const viewfinder = document.getElementById('camera-viewfinder');
const shutterBtn = document.getElementById('shutter-btn');

// Simulasi stok gambar untuk viewfinder (bisa diganti URL gambar sendiri)
const stokFoto = [
  "https://picsum.photos/400/700?random=1",
  "https://picsum.photos/400/700?random=2",
  "https://picsum.photos/400/700?random=3",
  "https://picsum.photos/400/700?random=4",
  "https://picsum.photos/400/700?random=5"
];

function changeViewfinder() {
  const randomImg = stokFoto[Math.floor(Math.random() * stokFoto.length)];
  viewfinder.src = randomImg;
}

shutterBtn.addEventListener('click', () => {
  // 1. Efek Flash
  const flash = document.createElement('div');
  flash.classList.add('flash-effect', 'active');
  cameraScreen.appendChild(flash);
  setTimeout(() => flash.remove(), 300);

  // 2. Ambil gambar saat ini dan simpan ke localStorage
  const fotoUrl = viewfinder.src;
  let savedPhotos = JSON.parse(localStorage.getItem('auPhotos')) || [];
  savedPhotos.unshift(fotoUrl); // Tambahkan di paling depan
  localStorage.setItem('auPhotos', JSON.stringify(savedPhotos));

  // 3. Ganti gambar viewfinder agar bisa foto lagi
  setTimeout(() => {
    changeViewfinder();
  }, 400);
});

// ===== 7. LOGIKA GALERI =====
const galleryGrid = document.getElementById('gallery-grid');
const emptyGalleryText = document.getElementById('empty-gallery-text');

function renderGallery() {
  galleryGrid.innerHTML = ''; // Bersihkan galeri
  let savedPhotos = JSON.parse(localStorage.getItem('auPhotos')) || [];

  if (savedPhotos.length === 0) {
    galleryGrid.innerHTML = '<div class="empty-gallery">Belum ada foto. Silakan ambil foto di aplikasi Kamera.</div>';
    return;
  }

  savedPhotos.forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    img.addEventListener('click', () => {
      alert('Melihat foto (Fitur zoom bisa ditambahkan nanti)');
    });
    galleryGrid.appendChild(img);
  });
}
