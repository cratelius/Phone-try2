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

// Fungsi mendeteksi geseran (mendukung Mouse untuk PC & Touch untuk HP)
function addSwipeListener(element, direction, callback) {
  let startY = 0;
  let isPointerDown = false;

  // Layar Sentuh (HP)
  element.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
  element.addEventListener('touchend', (e) => {
    const endY = e.changedTouches[0].clientY;
    const distance = startY - endY; // Positif = Geser ke atas, Negatif = Geser ke bawah
    if (direction === 'up' && distance > 60) callback();
    if (direction === 'down' && distance < -60) callback();
  });

  // Mouse (Komputer)
  element.addEventListener('mousedown', (e) => { startY = e.clientY; isPointerDown = true; });
  element.addEventListener('mouseup', (e) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    const endY = e.clientY;
    const distance = startY - endY;
    if (direction === 'up' && distance > 60) callback();
    if (direction === 'down' && distance < -60) callback();
  });
}

// Terapkan fungsi geser
addSwipeListener(lockscreen, 'up', unlockScreen);    // Geser ke atas di lockscreen = Buka
addSwipeListener(homeScreen, 'down', lockScreen);    // Geser ke bawah di home = Kunci

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
      renderGallery();
    } else {
      alert(`Aplikasi ${appName} belum tersedia.`);
    }
  });
});

// Tombol Kamera di Lockscreen
document.getElementById('camera-btn-lockscreen').addEventListener('click', () => {
  document.getElementById('camera-screen').classList.add('active');
  startCamera();
});

// ===== 4. TOMBOL KEMBALI (BACK) =====
document.querySelectorAll('.back-btn[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    document.getElementById(targetId).classList.remove('active');
    
    // Jika keluar dari Chat, reset tampilan ke daftar kontak
    if (targetId === 'chat-screen') {
      document.getElementById('chat-room-view').style.display = 'none';
      document.getElementById('chat-list-view').style.display = 'block';
    }
    
    // Jika keluar dari Kamera, matikan kamera
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

// Pilih Kontak
document.querySelectorAll('.chat-item').forEach(item => {
  item.addEventListener('click', () => {
    chatListView.style.display = 'none';
    chatRoomView.style.display = 'flex';
    chatTitle.textContent = `${item.dataset.avatar} ${item.dataset.contact}`;
    chatMessages.innerHTML = '';
    
    // Sapaan pertama dari kontak
    addMessage(`Halo, ini ${item.dataset.contact}. Ada apa?`, 'received');
  });
});

// Fungsi Menambah Gelembung Pesan
function addMessage(text, type) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', type);
  msgDiv.textContent = text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll ke bawah
}

// Kirim Pesan & Balasan Otomatis
sendBtn.addEventListener('click', () => {
  const text = chatInput.value.trim();
  if (!text) return;

  addMessage(text, 'sent');
  chatInput.value = '';

  // Simulasi bot membalas setelah 1 detik
  setTimeout(() => {
    let balasan = "Hah? Maksudnya gimana?";
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('halo')) balasan = "Halo juga! Apa kabar?";
    else if (lowerText.includes('dimana')) balasan = "Aku lagi di rumah nih.";
    else if (lowerText.includes('ketemu')) balasan = "Boleh tuh, jam berapa?";
    else if (lowerText.includes('kamera')) balasan = "Coba buka aplikasi kameranya deh.";
    
    addMessage(balasan, 'received');
  }, 1000);
});

// Tekan Enter untuk Mengirim
chatInput.addEventListener('keypress', (e) => { 
  if (e.key === 'Enter') sendBtn.click(); 
});

// ===== 6. LOGIKA KAMERA ASLI (LIVE) =====
const video = document.getElementById('camera-viewfinder');
const shutterBtn = document.getElementById('shutter-btn');
const flashOverlay = document.getElementById('flash-overlay');
let stream = null; 

// Fungsi Menyalakan Kamera
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: "environment" }, // "environment" = belakang, "user" = depan
      audio: false 
    });
    video.srcObject = stream;
  } catch (err) {
    console.error("Kamera gagal dinyalakan:", err);
    alert("Kamera tidak bisa diakses.\n\nPastikan Anda:\n1. Memberi izin (Allow) pada browser.\n2. Membuka file melalui 'Live Server' (http://localhost), bukan klik dua kali file (file:///).");
  }
}

// Fungsi Mematikan Kamera
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}

// Tombol Jepret (Shutter)
shutterBtn.addEventListener('click', () => {
  if (!stream) return; // Jangan lakukan apa-apa jika kamera belum nyala

  // 1. Efek Flash
  flashOverlay.classList.add('active');
  setTimeout(() => flashOverlay.classList.remove('active'), 150);

  // 2. Tangkap Gambar dari Video ke Canvas
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 3. Ubah ke format Gambar (Base64 JPEG)
  const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);

  // 4. Simpan ke LocalStorage
  let savedPhotos = JSON.parse(localStorage.getItem('auPhotos')) || [];
  savedPhotos.unshift(photoDataUrl); // Tambahkan foto baru di paling depan
  localStorage.setItem('auPhotos', JSON.stringify(savedPhotos));
});

// ===== 7. LOGIKA GALERI (DENGAN TOMBOL HAPUS) =====
const galleryGrid = document.getElementById('gallery-grid');

function renderGallery() {
  galleryGrid.innerHTML = ''; // Bersihkan galeri
  let savedPhotos = JSON.parse(localStorage.getItem('auPhotos')) || [];

  if (savedPhotos.length === 0) {
    galleryGrid.innerHTML = '<div class="empty-gallery">Belum ada foto.</div>';
    return;
  }

  savedPhotos.forEach((photoUrl, index) => {
    // Buat pembungkus (div) untuk setiap foto
    const itemDiv = document.createElement('div');
    itemDiv.className = 'gallery-item';

    // Buat elemen gambar
    const img = document.createElement('img');
    img.src = photoUrl;
    
    // Fitur Zoom (Klik foto)
    img.addEventListener('click', () => {
      const win = window.open();
      win.document.write(`<img src="${photoUrl}" style="max-width:100%; max-height:100vh; display:block; margin:auto;">`);
    });

    // Buat tombol Hapus (Tong Sampah)
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.innerHTML = '🗑️';
    
    // Aksi saat tombol hapus diklik
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Mencegah foto ikut ter-zoom saat tombol diklik
      
      if (confirm("Hapus foto ini?")) {
        savedPhotos.splice(index, 1); // Hapus dari array
        localStorage.setItem('auPhotos', JSON.stringify(savedPhotos)); // Simpan ke memori
        renderGallery(); // Tampilkan ulang galeri agar foto langsung hilang
      }
    });

    // Susun elemen: Masukkan gambar & tombol ke dalam pembungkus
    itemDiv.appendChild(img);
    itemDiv.appendChild(delBtn);
    
    // Masukkan pembungkus ke galeri
    galleryGrid.appendChild(itemDiv);
  });
}
