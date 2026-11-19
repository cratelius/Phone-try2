// ===== FUNGSI GLOBAL UNTUK TUTUP KAMERA =====
function tutupKamera() {
  document.getElementById('camera-screen').classList.remove('active');
  stopCamera();
}

// ===== 1. JAM DAN TANGGAL REAL-TIME =====
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  document.getElementById('date').textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  const iosTime = document.getElementById('ios-time');
  if (iosTime) iosTime.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
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
      exitSelectMode();
      renderGallery();

      // ===== FITUR PANGGILAN ERINE =====
      if (!sessionStorage.getItem('erineCallTriggered')) {
        sessionStorage.setItem('erineCallTriggered', 'true');
        
        setTimeout(() => {
          document.getElementById('gallery-screen').classList.remove('active');
          const callScreen = document.getElementById('incoming-call-screen');
          callScreen.style.display = 'flex';
        }, 7000);
      }
      // =================================

    } else if (appName === 'blockblast') {
      document.getElementById('blockblast-screen').classList.add('active');
      if (board.every(row => row.every(cell => cell === 0))) startGame();
    } else {
      alert(`Aplikasi ${appName} belum tersedia.`);
    }
  });
});

// ===== LOGIKA TOMBOL PANGGILAN ERINE =====
document.getElementById('decline-call-btn').addEventListener('click', () => {
  document.getElementById('incoming-call-screen').style.display = 'none';
});

document.getElementById('accept-call-btn').addEventListener('click', () => {
  document.getElementById('incoming-call-screen').style.display = 'none';
  
  // ==========================================
  // DI SINI NANTI ANDA BISA MENAMBAHKAN SUARA
  // ==========================================
  // Contoh: 
  // const suaraErine = new Audio('suara-erine.mp3');
  // suaraErine.play();
  
  alert("📞 Panggilan tersambung dengan Erine...\n\n(Nanti suara bisa ditambahkan di sini)");
});

// ===== TOMBOL LAINNYA =====
document.getElementById('camera-btn-lockscreen').addEventListener('click', () => {
  lockscreen.classList.add('unlocked');
  document.getElementById('camera-screen').classList.add('active');
  startCamera();
});

document.getElementById('emergency-btn').addEventListener('click', () => {
  const nomor = prompt('🚨 TELEPON DARURAT\n\n• 112 — Darurat umum\n• 110 — Polisi\n• 113 — Pemadam Kebakaran\n• 118 — Ambulans\n\nKetik nomor:');
  if (nomor) alert(`📞 Memanggil ${nomor}...\n\n(Ini simulasi.)`);
});

// ===== 4. TOMBOL BACK (KEMBALI) =====
document.querySelectorAll('.back-btn[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;

    if (targetId === 'gallery-screen' && document.getElementById('gallery-grid').classList.contains('select-mode')) {
      exitSelectMode();
      return;
    }

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
const video = document.getElementById('camera-viewfinder');
const shutterBtn = document.getElementById('shutter-btn');
const flashOverlay = document.getElementById('flash-overlay');
let stream = null;

async function startCamera() {
  if (stream) return;
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
    stream = null;
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

// ===== 7. LOGIKA GALERI =====
const galleryGrid = document.getElementById('gallery-grid');
const menuBtn = document.getElementById('menu-gallery-btn');
const actionBar = document.getElementById('gallery-action-bar');
const cancelSelectBtn = document.getElementById('cancel-select-btn');
const deleteSelectedBtn = document.getElementById('delete-selected-btn');
const selectedCountText = document.getElementById('selected-count');

const photoViewScreen = document.getElementById('photo-view-screen');
const fullPhotoImg = document.getElementById('full-photo');
const closePhotoBtn = document.getElementById('close-photo-btn');
const deletePreviewBtn = document.getElementById('delete-preview-btn');

let isSelectMode = false;
let currentPreviewSrc = '';

const defaultPhotos = ["foto1.jpg","foto2.jpg","foto3.jpg","foto4.jpg","foto5.jpg","foto6.jpg","foto7.jpg","foto8.jpg","foto9.jpg","foto10.jpg","foto11.jpg","foto12.jpg"];

function getAllPhotos() {
  let userPhotos = JSON.parse(localStorage.getItem('auPhotos')) || [];
  let deletedDefaults = JSON.parse(localStorage.getItem('deletedDefaults')) || [];
  let activeDefaults = defaultPhotos.filter(photo => !deletedDefaults.includes(photo));
  return [...userPhotos, ...activeDefaults];
}

function renderGallery() {
  galleryGrid.innerHTML = '';
  let allPhotos = getAllPhotos();

  if (allPhotos.length === 0) {
    galleryGrid.innerHTML = '<div class="empty-gallery">Belum ada foto.</div>';
    return;
  }

  allPhotos.forEach((photoUrl, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'gallery-item';
    itemDiv.dataset.index = index;
    itemDiv.dataset.src = photoUrl;

    const img = document.createElement('img');
    img.src = photoUrl;
    img.onerror = () => { if (defaultPhotos.includes(photoUrl)) itemDiv.style.display = 'none'; };

    const checkCircle = document.createElement('div');
    checkCircle.className = 'check-circle';
    checkCircle.innerHTML = '✓';

    itemDiv.addEventListener('click', () => {
      if (isSelectMode) {
        itemDiv.classList.toggle('selected');
        updateSelectedCount();
      } else {
        currentPreviewSrc = photoUrl;
        fullPhotoImg.src = photoUrl;
        photoViewScreen.classList.add('active');
      }
    });

    itemDiv.appendChild(img);
    itemDiv.appendChild(checkCircle);
    galleryGrid.appendChild(itemDiv);
  });
}

closePhotoBtn.addEventListener('click', () => {
  photoViewScreen.classList.remove('active');
  fullPhotoImg.src = '';
});

deletePreviewBtn.addEventListener('click', () => {
  if (confirm("Hapus foto ini?")) {
    deletePhotoFromStorage(currentPreviewSrc);
    photoViewScreen.classList.remove('active');
    fullPhotoImg.src = '';
  }
});

function updateSelectedCount() {
  const count = document.querySelectorAll('.gallery-item.selected').length;
  selectedCountText.textContent = `${count} dipilih`;
}

menuBtn.addEventListener('click', () => {
  if (document.querySelectorAll('.gallery-item').length === 0) return;
  isSelectMode = true;
  galleryGrid.classList.add('select-mode');
  actionBar.style.display = 'flex';
  updateSelectedCount();
});

cancelSelectBtn.addEventListener('click', exitSelectMode);

function exitSelectMode() {
  isSelectMode = false;
  galleryGrid.classList.remove('select-mode');
  actionBar.style.display = 'none';
  document.querySelectorAll('.gallery-item').forEach(item => item.classList.remove('selected'));
}

function deletePhotoFromStorage(photoUrl) {
  let userPhotos = JSON.parse(localStorage.getItem('auPhotos')) || [];
  let deletedDefaults = JSON.parse(localStorage.getItem('deletedDefaults')) || [];

  if (defaultPhotos.includes(photoUrl)) {
    if (!deletedDefaults.includes(photoUrl)) deletedDefaults.push(photoUrl);
  } else {
    const index = userPhotos.indexOf(photoUrl);
    if (index > -1) userPhotos.splice(index, 1);
  }

  localStorage.setItem('auPhotos', JSON.stringify(userPhotos));
  localStorage.setItem('deletedDefaults', JSON.stringify(deletedDefaults));
  renderGallery();
}

deleteSelectedBtn.addEventListener('click', () => {
  const selected = document.querySelectorAll('.gallery-item.selected');
  if (selected.length === 0) return alert("Pilih minimal satu foto terlebih dahulu.");
  if (confirm(`Hapus ${selected.length} foto ini?`)) {
    let urlsToDelete = [];
    selected.forEach(item => urlsToDelete.push(item.dataset.src));
    urlsToDelete.forEach(url => deletePhotoFromStorage(url));
    exitSelectMode();
    renderGallery();
  }
});

// ===== 8. LOGIKA GAME BLOCK BLAST =====
const boardCanvas = document.getElementById('game-board');
const ctx = boardCanvas.getContext('2d');
const blockCanvases = [document.getElementById('block-1'), document.getElementById('block-2'), document.getElementById('block-3')];
const scoreDisplay = document.getElementById('bb-score');
const restartBtn = document.getElementById('restart-bb');

const GRID_SIZE = 8;
const CELL_SIZE = boardCanvas.width / GRID_SIZE;

let board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
let score = 0;
let availableBlocks = [null, null, null];

const SHAPES = [
  [[1, 1, 1, 1]], [[1, 1], [1, 1]], [[1, 1, 1], [0, 1, 0]],
  [[1, 1, 0], [0, 1, 1]], [[0, 1, 1], [1, 1, 0]], [[1, 1, 1], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1]], [[1], [1], [1]]
];
const COLORS = ['#ff3b30', '#34C759', '#007aff', '#FFD700', '#FF9500', '#AF52DE'];

function drawBoard() {
  ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] !== 0) {
        ctx.fillStyle = board[r][c];
        roundRect(ctx, c * CELL_SIZE + 2, r * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4, 5);
        ctx.fill();
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

function generateBlock(index) {
  const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  availableBlocks[index] = { shape: randomShape, color: randomColor };
  drawMiniBlock(blockCanvases[index], availableBlocks[index]);
}

function drawMiniBlock(canvas, blockData) {
  const miniCtx = canvas.getContext('2d');
  miniCtx.clearRect(0, 0, canvas.width, canvas.height);
  if (!blockData) return;
  const shape = blockData.shape;
  const miniCellSize = 20;
  const startX = (canvas.width - (shape[0].length * miniCellSize)) / 2;
  const startY = (canvas.height - (shape.length * miniCellSize)) / 2;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        miniCtx.fillStyle = blockData.color;
        roundRect(miniCtx, startX + c * miniCellSize + 1, startY + r * miniCellSize + 1, miniCellSize - 2, miniCellSize - 2, 3);
        miniCtx.fill();
      }
    }
  }
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

let draggedBlockIndex = -1;
let dragX = 0, dragY = 0;

blockCanvases.forEach((canvas, index) => {
  canvas.addEventListener('pointerdown', (e) => {
    if (!availableBlocks[index]) return;
    draggedBlockIndex = index;
    canvas.setPointerCapture(e.pointerId);
    const rect = boardCanvas.getBoundingClientRect();
    dragX = e.clientX - rect.left; dragY = e.clientY - rect.top;
  });

  canvas.addEventListener('pointermove', (e) => {
    if (draggedBlockIndex !== index) return;
    const rect = boardCanvas.getBoundingClientRect();
    dragX = e.clientX - rect.left; dragY = e.clientY - rect.top;
    drawBoard(); drawDraggedBlock();
  });

  canvas.addEventListener('pointerup', (e) => {
    if (draggedBlockIndex !== index) return;
    const col = Math.floor(dragX / CELL_SIZE);
    const row = Math.floor(dragY / CELL_SIZE);

    if (canPlaceBlock(availableBlocks[index].shape, row, col)) {
      placeBlock(availableBlocks[index].shape, row, col, availableBlocks[index].color);
      availableBlocks[index] = null;
      drawMiniBlock(blockCanvases[index], null);
      if (availableBlocks.every(b => b === null)) { generateBlock(0); generateBlock(1); generateBlock(2); }
      checkAndClearLines();
    }
    draggedBlockIndex = -1;
    drawBoard();
  });
});

function drawDraggedBlock() {
  if (draggedBlockIndex === -1) return;
  const block = availableBlocks[draggedBlockIndex];
  const shape = block.shape;
  const col = Math.floor(dragX / CELL_SIZE);
  const row = Math.floor(dragY / CELL_SIZE);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        const x = (col + c) * CELL_SIZE;
        const y = (row + r) * CELL_SIZE;
        ctx.fillStyle = block.color + '80';
        roundRect(ctx, x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 5);
        ctx.fill();
      }
    }
  }
}

function canPlaceBlock(shape, row, col) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        let targetRow = row + r;
        let targetCol = col + c;
        if (targetRow < 0 || targetRow >= GRID_SIZE || targetCol < 0 || targetCol >= GRID_SIZE) return false;
        if (board[targetRow][targetCol] !== 0) return false;
      }
    }
  }
  return true;
}

function placeBlock(shape, row, col, color) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) board[row + r][col + c] = color;
    }
  }
}

function checkAndClearLines() {
  let linesCleared = 0;
  let rowsToClear = [], colsToClear = [];
  for (let r = 0; r < GRID_SIZE; r++) { if (board[r].every(cell => cell !== 0)) { rowsToClear.push(r); linesCleared++; } }
  for (let c = 0; c < GRID_SIZE; c++) {
    let isFull = true;
    for (let r = 0; r < GRID_SIZE; r++) { if (board[r][c] === 0) { isFull = false; break; } }
    if (isFull) { colsToClear.push(c); linesCleared++; }
  }
  rowsToClear.forEach(r => { for (let c = 0; c < GRID_SIZE; c++) board[r][c] = 0; });
  colsToClear.forEach(c => { for (let r = 0; r < GRID_SIZE; r++) board[r][c] = 0; });

  if (linesCleared > 0) {
    score += linesCleared * 10;
    scoreDisplay.textContent = score;
    boardCanvas.style.transform = 'scale(1.05)';
    setTimeout(() => boardCanvas.style.transform = 'scale(1)', 150);
  }
}

function startGame() {
  board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
  score = 0;
  scoreDisplay.textContent = score;
  generateBlock(0); generateBlock(1); generateBlock(2);
  drawBoard();
}

restartBtn.addEventListener('click', startGame);
