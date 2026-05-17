
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles, stars, animFrame;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 2.2 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '#7c3aed' : '#3b82f6';
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.015 + Math.random() * 0.02;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.pulse += this.pulseSpeed;
      if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset();
    }
    draw() {
      const alpha = this.opacity * (0.7 + 0.3 * Math.sin(this.pulse));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('#7c3aed', `rgba(124,58,237,${alpha})`).replace('#3b82f6', `rgba(59,130,246,${alpha})`);
      ctx.fill();
    }
  }

  class Star {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 1.2 + 0.3;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.twinkle = Math.random() * Math.PI * 2;
      this.twinkleSpeed = 0.008 + Math.random() * 0.018;
    }
    update() { this.twinkle += this.twinkleSpeed; }
    draw() {
      const alpha = this.opacity * (0.5 + 0.5 * Math.sin(this.twinkle));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(196,181,253,${alpha})`;
      ctx.fill();
    }
  }

  function initParticles() {
    const count = Math.min(Math.floor((W * H) / 10000), 80);
    particles = Array.from({ length: count }, () => new Particle());
    stars = Array.from({ length: 120 }, () => new Star());
  }

  function drawConnections() {
    const maxDist = 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function drawNebula() {
    const time = Date.now() * 0.0002;

    const grad1 = ctx.createRadialGradient(
      W * 0.15 + Math.sin(time) * 40, H * 0.25 + Math.cos(time * 0.7) * 30, 0,
      W * 0.15, H * 0.25, W * 0.35
    );
    grad1.addColorStop(0, 'rgba(124,58,237,0.035)');
    grad1.addColorStop(1, 'transparent');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, W, H);

    const grad2 = ctx.createRadialGradient(
      W * 0.82 + Math.cos(time * 0.8) * 50, H * 0.6 + Math.sin(time * 0.6) * 40, 0,
      W * 0.82, H * 0.6, W * 0.3
    );
    grad2.addColorStop(0, 'rgba(59,130,246,0.03)');
    grad2.addColorStop(1, 'transparent');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, W, H);
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawNebula();
    stars.forEach(s => { s.update(); s.draw(); });
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animFrame = requestAnimationFrame(animate);
  }

  resize();
  initParticles();
  animate();

  const debouncedResize = debounce(() => { resize(); initParticles(); }, 200);
  window.addEventListener('resize', debouncedResize);
})();

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const allNavLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  updateActiveLink();
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

allNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  allNavLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

(function initTyping() {
  const el = document.getElementById('typed-text');
  const phrases = [
    'Where creativity meets purpose.',
    'Design is the silent ambassador.',
    'Crafting stories through visuals.',
    'Color, shape, and emotion in harmony.',
    'Turning ideas into visual poetry.'
  ];
  let pIndex = 0, cIndex = 0, isDeleting = false;
  const typingSpeed = 55, deletingSpeed = 32, pauseDelay = 2200;

  function type() {
    const current = phrases[pIndex];
    if (isDeleting) {
      el.textContent = current.substring(0, cIndex--);
      if (cIndex < 0) { isDeleting = false; pIndex = (pIndex + 1) % phrases.length; setTimeout(type, 400); return; }
      setTimeout(type, deletingSpeed);
    } else {
      el.textContent = current.substring(0, cIndex++);
      if (cIndex > current.length) { isDeleting = true; setTimeout(type, pauseDelay); return; }
      setTimeout(type, typingSpeed);
    }
  }

  setTimeout(type, 800);
})();

(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => obs.observe(el));

  document.querySelectorAll('.project-card').forEach(card => {
    card.classList.add('reveal-up');
    obs.observe(card);
  });
})();

const projectData = [
  {
    title: 'Activity 1',
    tag: ' School Activities',
    desc: 'This HTML code creates a simple webpage that displays the poem “Estudyante” by Arnel Rivera with formatted text, headings, and an image.',
    tools: ['Visual Studio'],
    category: 'School Activities',
    link: 'https://arnelprivera.github.io/activity-1/activity%201.html'   
  },
  {
    title: 'Activity 2',
    tag: ' School Activities',
    desc: 'This HTML code creates a colorful webpage about the hobby of playing guitar using headings, paragraphs, text formatting, colors, and styles to present information clearly and creatively.',
    tools: ['Visual Studio'],
    category: 'School Activities',
    link: 'https://arnelprivera.github.io/activity-2/activity%202.html' 
  },
  {
    title: 'Activity 3',
    tag: ' School Activities',
    desc: 'This HTML code creates a styled student grade report webpage that displays subjects, instructors, grades, average grade, and remarks using tables and CSS design.',
    tools: ['Visual Studio'],
    category: 'School Activities',
    link: 'https://arnelprivera.github.io/activity-3/activity%203.html' 
  },
  {
    title: 'Activity 4',
    tag: ' School Activities',
    desc: 'This HTML code creates two activities: a weekly class schedule and a student grade report, using tables and CSS styling to organize and display information neatly.',
    tools: ['Visual Studio'],
    category: 'School Activities',
    link: 'https://arnelprivera.github.io/activity-4/activity%204.html' 
  },
  {
    title: 'Activity 5',
    tag: ' School Activities',
    desc: 'This HTML code creates, which displays two small inner tables inside a larger bordered table, demonstrating the use of nested tables and CSS styling for layout and formatting.',
    tools: ['Visual Studio'],
    category: 'School Activities',
    link: 'https://arnelprivera.github.io/activity-5/activity%205.html' 
  },
  {
    title: 'Activity 6',
    tag: ' School Activities',
    desc: 'This HTML code is a bordered table layout that uses `rowspan` and `colspan` to arrange cells into sections labeled TOP, LEFT, MIDDLE, RIGHT, and BOTTOM with centered styling.',
    tools: ['Visual Studio'],
    category: 'School Activities',
    link: 'https://arnelprivera.github.io/activity-6/activity%206.html' 
  },
  {
    title: 'Activity 7',
    tag: ' School Activities',
    desc: 'This HTML code is a formatted webpage that displays different types of HTML lists inside a table, including unordered and ordered lists, to showcase favorite things and car brands with styled headers and categories.',
    tools: ['Visual Studio'],
    category: 'School Activities',
    link: 'https://arnelprivera.github.io/activity-7/activity%207.html' 
  }
];

(function initLightbox() {
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    background:rgba(4,2,12,0.92);
    backdrop-filter:blur(16px);
    display:flex;align-items:center;justify-content:center;
    opacity:0;pointer-events:none;
    transition:opacity 0.4s ease;
    padding:2rem;
  `;

  lightbox.innerHTML = `
    <button id="lb-close" style="
      position:absolute;top:1.5rem;right:1.5rem;
      width:44px;height:44px;border-radius:50%;
      background:rgba(255,255,255,0.08);
      border:1px solid rgba(124,58,237,0.4);
      color:white;font-size:1.2rem;
      cursor:pointer;display:flex;
      align-items:center;justify-content:center;
      transition:all 0.3s;z-index:10;
    "><i class="fas fa-times"></i></button>

    <button id="lb-prev" style="
      position:absolute;left:1.5rem;top:50%;transform:translateY(-50%);
      width:48px;height:48px;border-radius:50%;
      background:rgba(124,58,237,0.2);
      border:1px solid rgba(124,58,237,0.4);
      color:white;font-size:1.1rem;
      cursor:pointer;display:flex;
      align-items:center;justify-content:center;
      transition:all 0.3s;
    "><i class="fas fa-chevron-left"></i></button>

    <button id="lb-next" style="
      position:absolute;right:1.5rem;top:50%;transform:translateY(-50%);
      width:48px;height:48px;border-radius:50%;
      background:rgba(124,58,237,0.2);
      border:1px solid rgba(124,58,237,0.4);
      color:white;font-size:1.1rem;
      cursor:pointer;display:flex;
      align-items:center;justify-content:center;
      transition:all 0.3s;
    "><i class="fas fa-chevron-right"></i></button>

    <img id="lb-img" src="" alt="" style="
      max-width:90vw;max-height:85vh;
      object-fit:contain;border-radius:12px;
      box-shadow:0 0 60px rgba(124,58,237,0.3);
      transform:scale(0.85);
      transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    "/>

    <div id="lb-counter" style="
      position:absolute;bottom:1.5rem;left:50%;
      transform:translateX(-50%);
      color:rgba(255,255,255,0.5);
      font-family:'Syne',sans-serif;
      font-size:0.85rem;letter-spacing:2px;
    "></div>
  `;

  document.body.appendChild(lightbox);

  const lbImg     = document.getElementById('lb-img');
  const lbClose   = document.getElementById('lb-close');
  const lbPrev    = document.getElementById('lb-prev');
  const lbNext    = document.getElementById('lb-next');
  const lbCounter = document.getElementById('lb-counter');

  let currentIndex = 0;
  let images = [];

  function getImages() {
    return Array.from(document.querySelectorAll('.gallery-item img'));
  }

  function openLightbox(index) {
    images = getImages();
    currentIndex = index;
    showImage(currentIndex);
    lightbox.style.opacity = '1';
    lightbox.style.pointerEvents = 'all';
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.style.opacity = '0';
    lightbox.style.pointerEvents = 'none';
    document.body.style.overflow = '';
    lbImg.style.transform = 'scale(0.85)';
  }

  function showImage(index) {
    lbImg.style.transform = 'scale(0.85)';
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = images[index].src;
      lbImg.alt = images[index].alt;
      lbImg.style.transform = 'scale(1)';
      lbImg.style.opacity = '1';
      lbCounter.textContent = `${index + 1} / ${images.length}`;
    }, 150);
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
  }
  lbImg.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease';

  document.querySelectorAll('.gallery-item').forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
    item.style.cursor = 'zoom-in';
  });
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', prevImage);
  lbNext.addEventListener('click', nextImage);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.style.opacity === '0') return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });

  [lbClose, lbPrev, lbNext].forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(124,58,237,0.5)';
      btn.style.borderColor = 'rgba(124,58,237,0.8)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = btn === lbClose
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(124,58,237,0.2)';
      btn.style.borderColor = 'rgba(124,58,237,0.4)';
    });
  });
})();

const overlay = document.getElementById('modal-overlay');
const modal = document.getElementById('project-modal');
const closeBtn = document.getElementById('modal-close');

function openModal(index) {
  const data = projectData[index];
  document.getElementById('modal-tag').textContent = data.tag;
  document.getElementById('modal-title').textContent = data.title;
  document.getElementById('modal-desc').textContent = data.desc;
  document.getElementById('modal-category').textContent = data.category;

  

  const toolsEl = document.getElementById('modal-tools');
  toolsEl.innerHTML = '';
  data.tools.forEach(tool => {
    const span = document.createElement('span');
    span.textContent = tool;
    toolsEl.appendChild(span);

    
  const existingBtn = modal.querySelector('.modal-link-btn');
  if (existingBtn) existingBtn.remove();
  if (data.link) {
    const linkBtn = document.createElement('a');
    linkBtn.href = data.link;
    linkBtn.target = '_blank';
    linkBtn.className = 'btn-primary modal-link-btn';
    linkBtn.style.cssText = 'display:inline-flex;margin-top:1rem;width:fit-content;text-decoration:none;';
    linkBtn.innerHTML = '<span>Visit Website</span> <i class="fas fa-external-link-alt"></i>';
    document.querySelector('.modal-body').appendChild(linkBtn);
  }
  });

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

document.querySelectorAll('.project-card').forEach((card, i) => {
  card.addEventListener('click', () => openModal(i));
});

closeBtn.addEventListener('click', closeModal);

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

const form = document.getElementById('contact-form');
const toast = document.getElementById('toast');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('.btn-primary');
  btn.innerHTML = '<span>Sending…</span><i class="fas fa-spinner fa-spin"></i>';
  btn.disabled = true;

  const formData = new FormData(form);

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      form.reset();
      btn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
      btn.disabled = false;
      showToast();
    } else {
      btn.innerHTML = '<span>Failed. Try again</span><i class="fas fa-exclamation-circle"></i>';
      btn.disabled = false;
    }
  } catch (error) {
    btn.innerHTML = '<span>Failed. Try again</span><i class="fas fa-exclamation-circle"></i>';
    btn.disabled = false;
  }
});

function showToast() {
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3800);
}

(function initCursorGlow() {
  if (window.matchMedia('(hover: none)').matches) return;

  const glowEl = document.createElement('div');
  glowEl.style.cssText = `
    position:fixed;pointer-events:none;z-index:9998;
    width:280px;height:280px;border-radius:50%;
    background:radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%);
    transform:translate(-50%,-50%);transition:opacity 0.4s;
  `;
  document.body.appendChild(glowEl);

  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function animateCursor() {
    cx += (mx - cx) * 0.1;
    cy += (my - cy) * 0.1;
    glowEl.style.left = cx + 'px';
    glowEl.style.top = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
})();


(function initParallax() {
  const heroBg = document.querySelector('.hero');
  if (!heroBg) return;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      const avatarFrame = document.querySelector('.avatar-frame');
      if (avatarFrame) avatarFrame.style.transform = `translateY(${-scrollY * 0.04}px)`;
    }
  }, { passive: true });
})();

(function initSkillStagger() {
  const chips = document.querySelectorAll('.skill-chip');
  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      chips.forEach((chip, i) => {
        chip.style.transitionDelay = `${i * 60}ms`;
        chip.style.opacity = '0';
        chip.style.transform = 'translateY(14px)';
        setTimeout(() => {
          chip.style.opacity = '1';
          chip.style.transform = 'translateY(0)';
          chip.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color 0.35s, color 0.35s, background 0.35s, box-shadow 0.35s';
        }, 10);
      });
      obs.disconnect();
    }
  }, { threshold: 0.3 });
  const skillSection = document.querySelector('.skills-grid');
  if (skillSection) obs.observe(skillSection);
})();

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.querySelectorAll('.hero .reveal-up, .hero .reveal-right').forEach(el => {
      el.classList.add('visible');
    });
  }, 100);
});