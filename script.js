// ── 3D Cursor Tilt Effect (from Chatkara Chowk source) ────────
const card3d = document.getElementById('birthday-card');

card3d?.addEventListener('mousemove', (e) => {
  const r = card3d.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;

  card3d.classList.add('is-hovering');

  const isFlipped = card3d.classList.contains('is-flipped');
  const flipDeg = isFlipped ? 180 : 0;

  card3d.style.transform = `rotateY(${flipDeg + x * 18}deg) rotateX(${-y * 18}deg) translateY(-10px)`;

  // Read current theme glow color from CSS variable
  const computedStyle = getComputedStyle(document.body);
  const glowRGB = computedStyle.getPropertyValue('--glow-color').trim() || '168, 85, 247';

  // Dynamic glow shadow follows the tilt direction
  const glowX = x * 20;
  const glowY = y * 20;
  card3d.style.boxShadow = `
    0 0 0 1px rgba(${glowRGB}, 0.3),
    ${glowX}px ${glowY}px 8px 2px rgba(${glowRGB}, 0.4),
    ${glowX * 1.5}px ${glowY * 1.5}px 20px 6px rgba(${glowRGB}, 0.25),
    ${glowX * 2}px ${glowY * 2}px 45px 12px rgba(${glowRGB}, 0.12),
    0 12px 40px rgba(0,0,0,0.3)
  `;

  // Move the glow reflection on card face
  const mx = ((e.clientX - r.left) / r.width) * 100;
  const my = ((e.clientY - r.top) / r.height) * 100;
  card3d.style.setProperty('--mouse-x', mx + '%');
  card3d.style.setProperty('--mouse-y', my + '%');
});

card3d?.addEventListener('mouseleave', () => {
  card3d.classList.remove('is-hovering');
  const isFlipped = card3d.classList.contains('is-flipped');
  const flipDeg = isFlipped ? 180 : 0;
  card3d.style.transform = `rotateY(${flipDeg}deg) rotateX(0) translateY(0)`;
  card3d.style.boxShadow = '';
});

// ── Card Flip (open/close) ─────────────────────────────────────
function flipCard() {
  const wasFlipped = card3d.classList.contains('is-flipped');
  if (wasFlipped) {
    card3d.classList.remove('is-flipped');
    card3d.style.transform = 'rotateY(0) rotateX(0) translateY(0)';
  } else {
    card3d.classList.add('is-flipped');
    card3d.style.transform = 'rotateY(180deg) rotateX(0) translateY(-10px)';
    // Auto confetti burst on open
    setTimeout(() => launchConfetti(80), 300);
  }
}

// Click front face to open
document.querySelector('.card-front')?.addEventListener('click', (e) => {
  if (!card3d.classList.contains('is-flipped')) flipCard();
});

// Close button inside card
document.getElementById('close-card')?.addEventListener('click', (e) => {
  e.stopPropagation();
  if (card3d.classList.contains('is-flipped')) flipCard();
});

// ── Confetti System ────────────────────────────────────────────
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas?.getContext('2d');
let confettiParticles = [];
let confettiAnimating = false;

function resizeCanvas() {
  if (!confettiCanvas) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const CONFETTI_COLORS = [
  '#e11d48', '#f97316', '#fbbf24', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f43f5e', '#a855f7', '#06b6d4', '#eab308'
];

class ConfettiPiece {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 16;
    this.vy = Math.random() * -18 - 4;
    this.gravity = 0.35;
    this.friction = 0.99;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 12;
    this.color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    this.size = Math.random() * 8 + 4;
    this.opacity = 1;
    this.decay = Math.random() * 0.005 + 0.003;
    this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
    this.wobble = Math.random() * 10;
    this.wobbleSpeed = Math.random() * 0.1 + 0.05;
  }

  update() {
    this.vy += this.gravity;
    this.vx *= this.friction;
    this.x += this.vx + Math.sin(this.wobble) * 0.8;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    this.opacity -= this.decay;
    this.wobble += this.wobbleSpeed;
    return this.opacity > 0 && this.y < confettiCanvas.height + 50;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;

    if (this.shape === 'rect') {
      ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

function launchConfetti(count = 60) {
  if (!ctx) return;
  const cx = confettiCanvas.width / 2;
  const cy = confettiCanvas.height * 0.4;

  for (let i = 0; i < count; i++) {
    const offsetX = (Math.random() - 0.5) * 300;
    const offsetY = (Math.random() - 0.5) * 100;
    confettiParticles.push(new ConfettiPiece(cx + offsetX, cy + offsetY));
  }

  if (!confettiAnimating) {
    confettiAnimating = true;
    animateConfetti();
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles = confettiParticles.filter(p => {
    const alive = p.update();
    if (alive) p.draw();
    return alive;
  });

  if (confettiParticles.length > 0) {
    requestAnimationFrame(animateConfetti);
  } else {
    confettiAnimating = false;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

// Confetti button
document.getElementById('confetti-btn')?.addEventListener('click', () => {
  launchConfetti(120);
});

// ── Floating Particles Background ──────────────────────────────
const particlesContainer = document.getElementById('particles-container');
const PARTICLE_COLORS = [
  'rgba(168, 85, 247, 0.5)',
  'rgba(236, 72, 153, 0.4)',
  'rgba(251, 191, 36, 0.5)',
  'rgba(14, 165, 233, 0.4)',
  'rgba(139, 92, 246, 0.4)',
  'rgba(244, 63, 94, 0.3)',
];

function createParticles() {
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 6 + 2;
    const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    const left = Math.random() * 100;
    const duration = Math.random() * 8 + 6;
    const delay = Math.random() * 8;

    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      background: ${color};
      --duration: ${duration}s;
      --delay: ${delay}s;
      box-shadow: 0 0 ${size * 2}px ${color};
    `;
    particlesContainer?.appendChild(particle);
  }
}
createParticles();

// ── Theme Switcher ─────────────────────────────────────────────
const themes = ['', 'theme-rose', 'theme-ocean', 'theme-sunset', 'theme-emerald'];
const themeNames = ['Purple', 'Rose', 'Ocean', 'Sunset', 'Emerald'];
let currentTheme = 0;

document.getElementById('theme-btn')?.addEventListener('click', () => {
  // Remove current theme
  document.body.classList.remove(themes[currentTheme]);

  // Cycle to next
  currentTheme = (currentTheme + 1) % themes.length;

  // Apply new theme
  if (themes[currentTheme]) {
    document.body.classList.add(themes[currentTheme]);
  }

  // Update button text
  const btn = document.getElementById('theme-btn');
  const label = btn?.querySelector('span:last-child');
  if (label) label.textContent = themeNames[currentTheme];

  // Burst of confetti on theme change
  launchConfetti(30);
});

// ── Music Toggle (visual feedback) ─────────────────────────────
let musicPlaying = false;
document.getElementById('music-btn')?.addEventListener('click', () => {
  musicPlaying = !musicPlaying;
  const btn = document.getElementById('music-btn');
  const icon = btn?.querySelector('.material-symbols-outlined');
  const label = btn?.querySelector('span:last-child');

  if (musicPlaying) {
    btn?.classList.add('active');
    if (icon) icon.textContent = 'music_note';
    if (label) label.textContent = 'Playing';
  } else {
    btn?.classList.remove('active');
    if (icon) icon.textContent = 'music_off';
    if (label) label.textContent = 'Music';
  }
});

// ── Touch Support for Mobile ───────────────────────────────────
card3d?.addEventListener('touchmove', (e) => {
  if (card3d.classList.contains('is-flipped')) return;
  e.preventDefault();
  const touch = e.touches[0];
  const r = card3d.getBoundingClientRect();
  const x = (touch.clientX - r.left) / r.width - 0.5;
  const y = (touch.clientY - r.top) / r.height - 0.5;

  card3d.classList.add('is-hovering');
  const flipDeg = 0;

  // Milder tilt on mobile
  card3d.style.transform = `rotateY(${flipDeg + x * 10}deg) rotateX(${-y * 10}deg) translateY(-5px)`;
}, { passive: false });

card3d?.addEventListener('touchend', () => {
  card3d.classList.remove('is-hovering');
  const isFlippedNow = card3d.classList.contains('is-flipped');
  const flipDeg = isFlippedNow ? 180 : 0;
  card3d.style.transform = `rotateY(${flipDeg}deg) rotateX(0) translateY(0)`;
  card3d.style.boxShadow = '';
});

// ── Keyboard Accessibility ─────────────────────────────────────
card3d?.setAttribute('tabindex', '0');
card3d?.setAttribute('role', 'button');
card3d?.setAttribute('aria-label', 'Birthday card. Press Enter or Space to open.');

card3d?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    flipCard();
  }
});

// ── Initial small confetti burst on load ──────────────────────
setTimeout(() => launchConfetti(40), 1200);
