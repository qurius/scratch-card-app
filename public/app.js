// Global variables
let canvas, ctx;
let isScratching = false;
let isRevealed = false;
let userId = null;
let userEmail = null;
let userOrderId = null;
let prize = null;
const SCRATCH_THRESHOLD = 50; // Percentage of canvas scratched to auto-reveal

// Config from server
let appConfig = {};

// Audio elements
let scratchSound, revealSound, celebrationSound, errorSound;

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  canvas = document.getElementById('scratchCanvas');
  ctx = canvas.getContext('2d');
  
  // Initialize audio
  scratchSound = document.getElementById('scratchSound');
  revealSound = document.getElementById('revealSound');
  celebrationSound = document.getElementById('celebrationSound');
  errorSound = document.getElementById('errorSound');
  
  // Set audio volumes
  if (scratchSound) scratchSound.volume = 0.3;
  if (revealSound) revealSound.volume = 0.5;
  if (celebrationSound) celebrationSound.volume = 0.6;
  if (errorSound) errorSound.volume = 0.4;
  
  // Set canvas size
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Load config from server
  await loadConfig();
  
  // Check if user already has order data stored
  const storedOrderId = localStorage.getItem('scratchCardOrderId');
  const storedEmail = localStorage.getItem('scratchCardEmail');
  const storedUserId = localStorage.getItem('scratchCardUserId');
  
  console.log('Checking localStorage on load:', { storedOrderId, storedEmail, storedUserId });
  
  if (storedOrderId && storedEmail && storedUserId) {
    // User has order stored, validate it
    userOrderId = storedOrderId;
    userEmail = storedEmail;
    userId = storedUserId;
    console.log('Existing order detected, validating...');
    
    const validation = await validateOrder(storedOrderId, storedEmail);
    if (validation.valid && !validation.alreadyUsed) {
      document.getElementById('orderModal').classList.add('hidden');
      await initSession();
      setupEventListeners();
    } else {
      // Order already used or invalid, clear storage and show modal
      clearLocalStorage();
      showOrderModal();
    }
  } else {
    // Show order modal
    console.log('New user, showing order modal');
    showOrderModal();
  }
});

// Load configuration from server
async function loadConfig() {
  try {
    const response = await fetch('/api/config');
    appConfig = await response.json();
    
    // Update UI with config
    const minAmountEl = document.getElementById('minAmount');
    if (minAmountEl) {
      minAmountEl.textContent = appConfig.minPurchaseAmount;
    }
    
    console.log('Config loaded:', appConfig);
  } catch (error) {
    console.error('Failed to load config:', error);
    appConfig = { minPurchaseAmount: 500 };
  }
}

// Clear local storage
function clearLocalStorage() {
  localStorage.removeItem('scratchCardOrderId');
  localStorage.removeItem('scratchCardEmail');
  localStorage.removeItem('scratchCardUserId');
}

// Show order validation modal
function showOrderModal() {
  const modal = document.getElementById('orderModal');
  const form = document.getElementById('orderForm');
  const validationMsg = document.getElementById('validationMessage');
  
  modal.classList.remove('hidden');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const orderIdInput = document.getElementById('orderIdInput');
    const emailInput = document.getElementById('emailInput');
    
    const orderId = orderIdInput.value.trim();
    const email = emailInput.value.trim();
    
    if (!orderId || !email) {
      showValidationMessage('Please enter both Order ID and Email', 'error');
      return;
    }
    
    if (!validateEmail(email)) {
      showValidationMessage('Please enter a valid email address', 'error');
      return;
    }
    
    // Validate order with server
    showValidationMessage('Validating order...', 'info');
    
    const validation = await validateOrder(orderId, email);
    
    if (validation.valid) {
      showValidationMessage('✅ ' + validation.message, 'success');
      
      // Store order details
      userOrderId = orderId;
      userEmail = email;
      localStorage.setItem('scratchCardOrderId', orderId);
      localStorage.setItem('scratchCardEmail', email);
      
      // Hide modal and proceed
      setTimeout(async () => {
        modal.classList.add('hidden');
        await initSession();
        setupEventListeners();
      }, 1000);
    } else {
      // Play error sound
      playSound(errorSound);
      showValidationMessage('❌ ' + validation.message, 'error');
    }
  });
}

// Validate order with backend
async function validateOrder(orderId, email) {
  try {
    const response = await fetch('/api/validate-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, email })
    });
    
    const data = await response.json();
    console.log('Order validation:', data);
    return data;
  } catch (error) {
    console.error('Order validation error:', error);
    return {
      valid: false,
      message: 'Failed to validate order. Please try again.'
    };
  }
}

// Show validation message
function showValidationMessage(message, type) {
  const msgEl = document.getElementById('validationMessage');
  msgEl.textContent = message;
  msgEl.className = 'validation-message ' + type;
}

// Validate email format
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Resize canvas to match container
function resizeCanvas() {
  const wrapper = canvas.parentElement;
  const rect = wrapper.getBoundingClientRect();
  
  canvas.width = rect.width;
  canvas.height = rect.height;
  
  if (!isRevealed) {
    drawScratchOverlay();
  }
}

// Initialize user session
async function initSession() {
  try {
    console.log('Initializing session with email:', userEmail, 'userId:', userId);
    
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: userId,
        email: userEmail 
      })
    });
    
    const data = await response.json();
    console.log('Session response:', data);
    
    userId = data.userId;
    // Preserve email if server didn't return it (failsafe)
    if (data.email) {
      userEmail = data.email;
    }
    
    // Store in localStorage with verification
    localStorage.setItem('scratchCardUserId', userId);
    if (userEmail) {
      localStorage.setItem('scratchCardEmail', userEmail);
    }
    
    // Verify storage
    console.log('Stored in localStorage:', {
      userId: localStorage.getItem('scratchCardUserId'),
      email: localStorage.getItem('scratchCardEmail')
    });
    
    if (data.hasPlayed) {
      // User already played
      prize = data.prize;
      showAlreadyPlayed();
    } else {
      // New user - fetch prize but don't reveal yet
      await fetchPrize();
      drawScratchOverlay();
    }
  } catch (error) {
    console.error('Session error:', error);
    showError('Failed to initialize. Please refresh.');
  }
}

// Fetch prize from server
async function fetchPrize() {
  try {
    const response = await fetch('/api/scratch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId,
        email: userEmail,
        orderId: userOrderId 
      })
    });
    
    const data = await response.json();
    
    if (data.alreadyPlayed) {
      prize = data.prize;
      showAlreadyPlayed();
    } else {
      prize = data.prize;
      document.getElementById('prizeText').textContent = prize;
    }
  } catch (error) {
    console.error('Prize fetch error:', error);
    showError('Failed to load prize. Please refresh.');
  }
}

// Draw scratch overlay
function drawScratchOverlay() {
  // Create golden/orange Diwali gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#ff6b35');
  gradient.addColorStop(0.3, '#ffd700');
  gradient.addColorStop(0.6, '#ff9f1c');
  gradient.addColorStop(1, '#ff6b35');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add decorative border
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
  
  // Add text overlay with diya pattern
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  for (let i = 0; i < 4; i++) {
    ctx.fillText('🪔 DIWALI 🪔', canvas.width / 2, canvas.height / 4 * (i + 0.5));
  }
}

// Set up event listeners
function setupEventListeners() {
  // Touch events (mobile)
  canvas.addEventListener('touchstart', handleStart, { passive: false });
  canvas.addEventListener('touchmove', handleMove, { passive: false });
  canvas.addEventListener('touchend', handleEnd);
  
  // Mouse events (desktop)
  canvas.addEventListener('mousedown', handleStart);
  canvas.addEventListener('mousemove', handleMove);
  canvas.addEventListener('mouseup', handleEnd);
  canvas.addEventListener('mouseleave', handleEnd);
}

// Handle start of scratching
function handleStart(e) {
  if (isRevealed) return;
  
  e.preventDefault();
  isScratching = true;
  
  // Hide instruction
  document.getElementById('scratchInstruction').classList.add('hidden');
  
  // Play scratch sound
  playSound(scratchSound);
  
  scratch(e);
}

// Handle scratching movement
function handleMove(e) {
  if (!isScratching || isRevealed) return;
  
  e.preventDefault();
  scratch(e);
}

// Handle end of scratching
function handleEnd(e) {
  if (!isScratching || isRevealed) return;
  
  isScratching = false;
  
  // Check scratch percentage
  checkScratchPercentage();
}

// Perform scratch action
function scratch(e) {
  const rect = canvas.getBoundingClientRect();
  let x, y;
  
  if (e.type.startsWith('touch')) {
    const touch = e.touches[0];
    x = touch.clientX - rect.left;
    y = touch.clientY - rect.top;
  } else {
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  }
  
  // Scale coordinates to canvas size
  x = (x / rect.width) * canvas.width;
  y = (y / rect.height) * canvas.height;
  
  // Use 'destination-out' to erase
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, y, 30, 0, Math.PI * 2);
  ctx.fill();
}

// Check how much has been scratched
function checkScratchPercentage() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  
  let transparentPixels = 0;
  const totalPixels = pixels.length / 4;
  
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] < 128) {
      transparentPixels++;
    }
  }
  
  const percentage = (transparentPixels / totalPixels) * 100;
  
  if (percentage > SCRATCH_THRESHOLD) {
    revealPrize();
  }
}

// Reveal the prize
function revealPrize() {
  if (isRevealed) return;
  
  isRevealed = true;
  
  // Play reveal sound
  playSound(revealSound);
  
  // Clear canvas with animation
  let opacity = 1;
  const fadeOut = setInterval(() => {
    opacity -= 0.1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = opacity;
    drawScratchOverlay();
    
    if (opacity <= 0) {
      clearInterval(fadeOut);
      ctx.globalAlpha = 1;
      canvas.style.display = 'none';
    }
  }, 50);
  
  // Show celebration
  setTimeout(() => {
    celebrate();
    showMessage('🪔 बधाई हो! Happy Diwali! 🎉');
    
    // Play celebration sound
    playSound(celebrationSound);
    
    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }, 300);
}

// Show already played message
function showAlreadyPlayed() {
  isRevealed = true;
  canvas.style.display = 'none';
  document.getElementById('scratchInstruction').classList.add('hidden');
  document.getElementById('prizeText').textContent = prize;
  showMessage('You have already claimed your Diwali gift! 🪔');
}

// Show message
function showMessage(message) {
  document.getElementById('statusMessage').textContent = message;
}

// Show error
function showError(message) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.style.color = '#ffcccc';
}

// Celebration effect - Diwali fireworks
function celebrate() {
  const confettiContainer = document.getElementById('confetti');
  const colors = ['#ff6b35', '#ffd700', '#ff4757', '#ff9f1c', '#ffcc00', '#ff5722'];
  
  for (let i = 0; i < 150; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      confetti.style.width = (Math.random() * 8 + 6) + 'px';
      confetti.style.height = confetti.style.width;
      confetti.style.borderRadius = '50%';
      confetti.style.boxShadow = '0 0 10px ' + colors[Math.floor(Math.random() * colors.length)];
      
      confettiContainer.appendChild(confetti);
      
      // Remove after animation
      setTimeout(() => confetti.remove(), 5000);
    }, i * 20);
  }
}

// Play sound helper function
function playSound(audioElement) {
  if (audioElement) {
    // Reset to start and play
    audioElement.currentTime = 0;
    audioElement.play().catch(err => {
      // Ignore autoplay errors (user needs to interact first)
      console.log('Audio play prevented:', err.message);
    });
  }
}
