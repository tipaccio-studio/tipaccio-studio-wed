// ===== YEAR =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== AURORA / MESH GRADIENT CANVAS =====
// Replaces the old particles with a smoother, organic moving gradient feel
const canvas = document.getElementById('aurora-canvas');
const ctx = canvas.getContext('2d');
let w, h;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Blob {
  constructor(color, radius, speed) {
    this.color = color;
    this.radius = radius;
    this.speed = speed;
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.angle = Math.random() * Math.PI * 2;
  }
  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    
    // Slow turning
    this.angle += (Math.random() - 0.5) * 0.05;

    // Bounce off edges gently
    if (this.x < -this.radius) this.x = w + this.radius;
    if (this.x > w + this.radius) this.x = -this.radius;
    if (this.y < -this.radius) this.y = h + this.radius;
    if (this.y > h + this.radius) this.y = -this.radius;
  }
  draw() {
    ctx.beginPath();
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    // 21st.dev style uses very subtle, deep colors.
    grad.addColorStop(0, this.color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Deep space reds and purples
const blobs = [
  new Blob('rgba(225, 29, 72, 0.12)', 400, 0.4),
  new Blob('rgba(159, 18, 57, 0.1)', 600, 0.3),
  new Blob('rgba(255, 77, 77, 0.08)', 350, 0.5)
];

function animateAurora() {
  ctx.clearRect(0, 0, w, h);
  blobs.forEach(b => {
    b.update();
    b.draw();
  });
  requestAnimationFrame(animateAurora);
}
animateAurora();

// ===== SPOTLIGHT EFFECT FOR BENTO CARDS =====
document.querySelectorAll('.bento-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
  });
});

// ===== MAGNETIC BUTTONS PHYSICS =====
// Inspired by 21st.dev premium interactions
document.querySelectorAll('.magnetic').forEach(btn => {
  const text = btn.querySelector('.btn-text');
  
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const h = rect.width / 2;
    const v = rect.height / 2;
    
    // Calculate distance from center
    const x = e.clientX - rect.left - h;
    const y = e.clientY - rect.top - v;
    
    // Apply translate to the button wrapper
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    // Apply deeper translate to the text for parallax
    if(text) text.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    // Reset transform on leave
    btn.style.transform = `translate(0px, 0px)`;
    if(text) text.style.transform = `translate(0px, 0px)`;
  });
});

// ===== INTERSECTION OBSERVER (Scroll Reveals) =====
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      
      // Animate skill bars if present
      const skillBars = entry.target.querySelectorAll('.skill-fill');
      skillBars.forEach(bar => {
        bar.style.width = bar.getAttribute('data-width') + '%';
      });

      // Animate counters if present
      const counters = entry.target.querySelectorAll('.stat-num');
      counters.forEach(el => {
        // Prevent double animation
        if (el.classList.contains('counted')) return;
        el.classList.add('counted');
        
        const target = +el.getAttribute('data-target');
        let current = 0;
        const step = target / 24;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { 
            el.textContent = target + '+'; 
            clearInterval(timer); 
          } else {
            el.textContent = Math.floor(current);
          }
        }, 24);
      });
      
      // Stop observing once visible
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.blur-reveal').forEach(el => {
  observer.observe(el);
});

// ===== NAVBAR, ACTIVE SECTION & READING PROGRESS =====
const nav = document.getElementById('navbar');
const progress = document.querySelector('.scroll-progress span');
const navAnchors = [...document.querySelectorAll('.nav-links a')];
const navSections = navAnchors
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function updateNavigation() {
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;

  let current = navSections[0]?.id;
  navSections.forEach(section => {
    if (window.scrollY >= section.offsetTop - window.innerHeight * 0.38) current = section.id;
  });
  navAnchors.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
}

window.addEventListener('scroll', updateNavigation, { passive: true });
updateNavigation();
