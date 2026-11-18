// ===== Jam dan tanggal real-time =====
function updateClock() {
  const now = new Date();

  // Jam format 24 jam
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hours}:${minutes}`;

  // Tanggal dalam bahasa Indonesia
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

// Perbarui setiap detik
updateClock();
setInterval(updateClock, 1000);

// ===== Tombol kamera =====
document.getElementById('camera-btn').addEventListener('click', () => {
  alert('📷 Kamera dibuka (placeholder)\nNanti di sini bisa diarahkan ke halaman kamera.');
});

// ===== Tombol telepon darurat =====
document.getElementById('emergency-btn').addEventListener('click', () => {
  const nomor = prompt(
    '🚨 TELEPON DARURAT\n\nMasukkan nomor darurat:\n• 112 — Darurat umum\n• 110 — Polisi\n• 113 — Pemadam Kebakaran\n• 118 — Ambulans\n\nKetik nomor:'
  );
  if (nomor) {
    alert(`📞 Memanggil ${nomor}...\n\n(Ini simulasi. Di ponsel asli, panggilan akan tersambung.)`);
  }
});

// ===== Geser ke atas untuk membuka (placeholder) =====
// Deteksi swipe sederhana di layar lockscreen
let touchStartY = 0;
const lockscreen = document.querySelector('.lockscreen');

lockscreen.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
});

lockscreen.addEventListener('touchend', (e) => {
  const touchEndY = e.changedTouches[0].clientY;
  // Jika geser ke atas lebih dari 100px
  if (touchStartY - touchEndY > 100) {
    alert('🔓 Membuka layar utama...\n(Nanti di sini akan masuk ke home screen AU.)');
  }
});
