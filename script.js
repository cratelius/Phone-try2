// ===== 1. JAM DAN TANGGAL REAL-TIME =====
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hours}:${minutes}`;

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const dayName = days[now.getDay()];
  const day = now.getDate();
  const monthName = months[now.getMonth()];
  const year = now.getFullYear();
  document.getElementById('date').textContent = `${dayName}, ${day} ${monthName} ${year}`;
}

updateClock();
setInterval(updateClock, 1000);

// ===== 2. ELEMEN DASAR =====
const lockscreen = document.getElementById('lockscreen');
const homeScreen = document.getElementById('home-screen');

// ===== 3. TOMBOL LOCKSCREEN =====
document.getElementById('camera-btn').addEventListener('click', () => {
  alert('📷 Kamera dibuka (placeholder)');
});

document.getElementById('emergency-btn').addEventListener('click', () => {
  const nomor = prompt(
    '🚨 TELEPON DARURAT\n\nMasukkan nomor darurat:\n• 112 — Darurat umum\n• 110 — Polisi\n• 113 — Pemadam Kebakaran\n• 118 — Ambulans\n\nKetik nomor:'
  );
  if (nomor) {
    alert(`📞 Memanggil ${nomor}...\n\n(Ini simulasi.)`);
  }
});

// ===== 4. FUNGSI BUKA / KUNCI LAYAR =====
function unlockScreen() {
  lockscreen.classList.add('unlocked');
}

function lockScreen() {
  lockscreen.classList.remove('unlocked');
}

// Gesture Geser ke Atas (Touch HP)
let touchStartY = 0;
lockscreen.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

lockscreen.addEventListener('touchend', (e) => {
  const touchEndY = e.changedTouches[0].clientY;
  if (touchStartY - touchEndY > 80) unlockScreen();
});

// Gesture Geser ke Atas (Mouse Komputer)
let mouseStartY = 0;
let isMouseDown = false;

lockscreen.addEventListener('mousedown', (e) => {
  mouseStartY = e.clientY;
  isMouseDown = true;
});

lockscreen.addEventListener('mouseup', (e) => {
  if (!isMouseDown) return;
  isMouseDown = false;
  if (mouseStartY - e.clientY > 80) unlockScreen();
});

// Gesture Geser ke Bawah di Home Screen (Touch)
let homeTouchStartY = 0;
homeScreen.addEventListener('touchstart', (e) => {
  homeTouchStartY = e.touches[0].clientY;
}, { passive: true });

homeScreen.addEventListener('touchend', (e) => {
  const homeTouchEndY = e.changedTouches[0].clientY;
  if (homeTouchEndY - homeTouchStartY > 80) lockScreen();
});

// Gesture Geser ke Bawah di Home Screen (Mouse)
let homeMouseStartY = 0;
let isHomeMouseDown = false;

homeScreen.addEventListener('mousedown', (e) => {
  homeMouseStartY = e.clientY;
  isHomeMouseDown = true;
});

homeScreen.addEventListener('mouseup', (e) => {
  if (!isHomeMouseDown) return;
  isHomeMouseDown = false;
  if (e.clientY - homeMouseStartY > 80) lockScreen();
});

// ===== 5. LOGIKA APLIKASI CHAT =====
const chatScreen = document.getElementById('chat-screen');
const chatListView = document.getElementById('chat-list-view');
const chatRoomView = document.getElementById('chat-room-view');
const chatMessages = document.getElementById('chat-messages');
const chatTitle = document.getElementById('chat-title');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const backBtn = document.getElementById('back-to-home');

let currentContact = '';

// Buka Aplikasi Chat dari Home Screen
document.querySelector('.app[data-app="chat"]').addEventListener('click', () => {
  chatScreen.classList.add('active');
  chatListView.style.display = 'block';
  chatRoomView.style.display = 'none';
  chatTitle.textContent = 'Pesan';
});

// Tombol Back (Kembali)
backBtn.addEventListener('click', () => {
  if (chatRoomView.style.display === 'flex') {
    chatRoomView.style.display = 'none';
    chatListView.style.display = 'block';
    chatTitle.textContent = 'Pesan';
  } else {
    chatScreen.classList.remove('active');
  }
});

// Pilih Kontak
document.querySelectorAll('.chat-item').forEach(item => {
  item.addEventListener('click', () => {
    currentContact = item.dataset.contact;
    const avatar = item.dataset.avatar;
    
    chatListView.style.display = 'none';
    chatRoomView.style.display = 'flex';
    chatTitle.textContent = `${avatar} ${currentContact}`;
    
    chatMessages.innerHTML = '';
    addMessage(`Halo, ini ${currentContact}. Ada apa?`, 'received');
  });
});

// Fungsi Menambah Pesan ke Layar
function addMessage(text, type) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', type);
  msgDiv.textContent = text;
  chatMessages.appendChild(msgDiv);
  
  // Scroll otomatis ke bawah
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Kirim Pesan
function sendMessage() {
  const text = chatInput.value.trim();
  if (text === '') return;

  addMessage(text, 'sent');
  chatInput.value = '';

  // Simulasi balasan otomatis (setelah 1 detik)
  setTimeout(() => {
    let balasan = "Hah? Maksudnya gimana?";
    
    if (text.toLowerCase().includes('halo')) balasan = "Halo juga! Apa kabar?";
    else if (text.toLowerCase().includes('dimana')) balasan = "Aku lagi di rumah nih.";
    else if (text.toLowerCase().includes('ketemu')) balasan = "Boleh tuh, jam berapa?";
    
    addMessage(balasan, 'received');
  }, 1000);
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
