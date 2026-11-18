// ===== Jam dan tanggal real-time =====
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

// ===== Elemen =====
const lockscreen = document.getElementById('lockscreen');
const homeScreen = document.getElementById('home-screen');

// ===== Tombol kamera (lockscreen) =====
document.getElementById('camera-btn').addEventListener('click', () => {
  alert('📷 Kamera dibuka (placeholder)');
});

// ===== Tombol telepon darurat (lockscreen) =====
document.getElementById('emergency-btn').addEventListener('click', () => {
  const nomor = prompt(
    '🚨 TELEPON DARURAT\n\nMasukkan nomor darurat:\n• 112 — Darurat umum\n• 110 — Polisi\n• 113 — Pemadam Kebakaran\n• 118 — Ambulans\n\nKetik nomor:'
  );
  if (nomor) {
    alert(`📞 Memanggil ${nomor}...\n\n(Ini simulasi.)`);
  }
});

// ===== Fungsi buka / kunci layar =====
function unlockScreen() {
  lockscreen.classList.add('unlocked');
}

function lockScreen() {
  lockscreen.classList.remove('unlocked');
}

// ===== Gesture geser ke atas (touch) =====
let touchStartY = 0;
lockscreen.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

lockscreen.addEventListener('touchend', (e) => {
  const touchEndY = e.changedTouches[0].clientY;
  if (touchStartY - touchEndY > 80) unlockScreen();
});

// ===== Gesture geser ke atas (mouse) =====
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

// ===== Gesture geser ke bawah di home screen =====
let homeTouchStartY = 0;
homeScreen.addEventListener('touchstart', (e) => {
  homeTouchStartY = e.touches[0].clientY;
}, { passive: true });

homeScreen.addEventListener('touchend', (e) => {
  const homeTouchEndY = e.changedTouches[0].clientY;
  if (homeTouchEndY - homeTouchStartY > 80) lockScreen();
});

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

// ===== Klik aplikasi di home screen =====
document.querySelectorAll('.app').forEach((app) => {
  app.addEventListener('click', () => {
    const nama = app.dataset.app;
    alert(`Membuka aplikasi: ${nama}`);
  });
});
