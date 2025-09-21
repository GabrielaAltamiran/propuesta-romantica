// =========================
// Utilidades y navegación
// =========================
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

let current = 1;
const pages = $$('.page');

function showPage(n){
  current = n;
  pages.forEach(p => p.classList.toggle('active', +p.dataset.page === n));

  // Mostrar confeti solo en la página 5
  const confetti = $('#confetti');
  confetti.style.display = (n === 5) ? 'block' : 'none';
  if(n === 5) launchConfetti();
  if(n !== 5) stopConfetti();
}

// Botones "Siguiente"
$$('.btn[data-next]').forEach(btn => {
  btn.addEventListener('click', () => showPage(Math.min(current+1, 5)));
});

// Página 4: Sí / No
const yesBtn = $('#yesBtn');
yesBtn.addEventListener('click', () => showPage(5));

// --- Interacción avanzada del botón NO ---
const noBtn  = $('#noBtn');
const noMsg  = $('#noMsg');

let noScale  = 1;
let yesScale = 1;
let noClicks = 0;

const frases = [
  "¿De verdad me dirías que no? 😢",
  "¿Ni un poquito sí? 🙈",
  "¿Segura que no…? 💙🧡",
  "¿Por qué no? 🥺💔",
  "¿Y si te digo que eres mi todo? 💌"
];

noBtn.addEventListener('click', () => {
  noClicks++;

  // Frase aleatoria
  const frase = frases[Math.floor(Math.random() * frases.length)];
  noMsg.textContent = frase;

  // Achicar NO y agrandar SÍ
  noScale  *= 0.8;   // 20% más pequeño cada vez
  yesScale *= 1.1;   // 10% más grande cada vez

  noBtn.style.transform  = `scale(${noScale})`;
  yesBtn.style.transform = `scale(${yesScale})`;

  // Desaparecer NO tras 3 clics
  if(noClicks >= 3){
    noBtn.style.display = 'none';
    noMsg.textContent = "Ya no hay escapatoria 😏💙";
  }
});

// Repetir
$('#replay').addEventListener('click', () => {
  stopConfetti();
  // Reset NO/SÍ y mensaje
  noScale = 1;
  yesScale = 1;
  noClicks = 0;
  noBtn.style.display = 'inline-block';
  noBtn.style.transform  = 'scale(1)';
  yesBtn.style.transform = 'scale(1)';
  noMsg.textContent = '';
  showPage(1);
});

// =========================
// Carrusel
// =========================
(function initCarousel(){
  const carousel = $('#carousel');
  if(!carousel) return;
  const imgs = $$('img', carousel);
  const dotsWrap = $('.dots', carousel);
  let idx = 0, timer;

  // Crear dots
  imgs.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i===0?' active':'');
    d.addEventListener('click', () => go(i));
    dotsWrap.appendChild(d);
  });

  function go(n){
    imgs[idx].classList.remove('active');
    dotsWrap.children[idx].classList.remove('active');
    idx = (n + imgs.length) % imgs.length;
    imgs[idx].classList.add('active');
    dotsWrap.children[idx].classList.add('active');
    reset();
  }
  function next(){ go(idx+1); }
  function reset(){
    clearInterval(timer);
    timer = setInterval(next, 3000);
  }
  reset();
})();

// =========================
// Confeti (canvas sin libs)
// =========================
const confettiCanvas = $('#confetti');
const ctx = confettiCanvas.getContext('2d');
let particles = [];
let rafId = null;

function resizeCanvas(){
  confettiCanvas.width = confettiCanvas.clientWidth;
  confettiCanvas.height = confettiCanvas.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function random(min, max){ return Math.random()*(max-min)+min; }
function createParticle(){
  const colors = ['#ff7e5f','#feb47b','#4facfe','#00f2fe','#38bdf8','#f59e0b','#60a5fa','#f97316'];
  return {
    x: random(0, confettiCanvas.width),
    y: random(-40, -10),
    size: random(4, 9),
    speedY: random(2, 5.5),
    speedX: random(-1.5, 1.5),
    color: colors[Math.floor(random(0, colors.length))],
    rotation: random(0, Math.PI*2),
    rotSpeed: random(-0.1, 0.1),
    shape: Math.random() < 0.5 ? 'rect' : 'circle'
  };
}

function drawParticle(p){
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.fillStyle = p.color;
  if(p.shape==='rect'){
    ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, p.size/2, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function update(){
  ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  particles.forEach(p => {
    p.y += p.speedY;
    p.x += p.speedX;
    p.rotation += p.rotSpeed;
  });
  particles = particles.filter(p => p.y < confettiCanvas.height + 20);
  while(particles.length < 180){
    particles.push(createParticle());
  }
  particles.forEach(drawParticle);
  rafId = requestAnimationFrame(update);
}

function launchConfetti(){
  particles = Array.from({length:220}, createParticle);
  if(!rafId) update();
  // auto fade out suave tras 7s
  setTimeout(() => fadeOutConfetti(900), 7000);
}
function fadeOutConfetti(duration=800){
  const start = performance.now();
  (function fade(now){
    const t = (now-start)/duration;
    confettiCanvas.style.opacity = String(1 - Math.min(t,1));
    if(t < 1) requestAnimationFrame(fade);
    else stopConfetti();
  })(performance.now());
}
function stopConfetti(){
  cancelAnimationFrame(rafId);
  rafId = null;
  particles.length = 0;
  ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  confettiCanvas.style.opacity = '1';
  confettiCanvas.style.display = 'none';
  // se vuelve a mostrar al entrar a la página 5
}
