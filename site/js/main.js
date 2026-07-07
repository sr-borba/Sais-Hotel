const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Mobile menu ─────────────────────────────────────────
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');
if (burger && mobileMenu) {
  const openMenu = () => {
    mobileMenu.classList.add('is-open');
    burger.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };
  const closeMenu = () => {
    mobileMenu.classList.remove('is-open');
    burger.classList.remove('is-open');
    document.body.style.overflow = '';
  };
  burger.addEventListener('click', () => {
    mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

// ── Hero entrance ───────────────────────────────────────
const heroSection = document.querySelector('.hero-section');
if (heroSection) requestAnimationFrame(() => heroSection.classList.add('is-ready'));

// ── Vídeos de fundo: autoplay via JS (respeita reduced-motion), ──
// ── vídeos abaixo da dobra só carregam/tocam ao entrar em tela.  ──
const heroVideo = document.getElementById('heroVideo');
if (heroVideo && !prefersReducedMotion) {
  heroVideo.muted = true;
  heroVideo.play().catch(() => {});
}

const deferredVideos = document.querySelectorAll('video.feature-bg__media[preload="none"]');
if (deferredVideos.length) {
  const videoObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        if (!prefersReducedMotion) {
          if (!video.dataset.loaded) { video.load(); video.dataset.loaded = 'true'; }
          video.muted = true;
          video.play().catch(() => {});
        }
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.2 });
  deferredVideos.forEach(v => videoObs.observe(v));
}

// ── Carousel: arraste com mouse (desktop). Sem sequestro de wheel — ──
// ── rolagem vertical da página nunca é interceptada pelo carrossel. ──
document.querySelectorAll('.testi-track, .carousel-track').forEach(track => {
  let isDown = false, startX, scrollStart;
  track.addEventListener('mousedown', e => {
    isDown = true; startX = e.pageX; scrollStart = track.scrollLeft;
    track.style.userSelect = 'none';
  });
  window.addEventListener('mouseup', () => { isDown = false; track.style.userSelect = ''; });
  window.addEventListener('mousemove', e => {
    if (!isDown) return;
    track.scrollLeft = scrollStart - (e.pageX - startX);
  });

  // ── Teclado: setas esquerda/direita rolam o carrossel focado ──
  track.addEventListener('keydown', e => {
    const card = track.querySelector('.gcard, .testi-card');
    const gap = 24;
    const step = card ? (card.getBoundingClientRect().width + gap) : 360;
    if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: step, behavior: prefersReducedMotion ? 'auto' : 'smooth' }); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({ left: -step, behavior: prefersReducedMotion ? 'auto' : 'smooth' }); }
  });
});

document.querySelectorAll('.carousel-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const track = document.getElementById(btn.dataset.track);
    if (!track) return;
    const dir = parseInt(btn.dataset.dir, 10);
    const card = track.querySelector('.gcard, .testi-card');
    const gap = 24;
    const step = card ? (card.getBoundingClientRect().width + gap) : 360;
    track.scrollBy({ left: dir * step, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
});

// ── Scroll reveal ───────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

// ── Scroll: nav "scrolled" + parallax leve do hero, em um único rAF ──
const nav = document.getElementById('nav');
const heroImg = document.querySelector('.hero-img');
if (nav || (heroImg && !prefersReducedMotion)) {
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 60);
    if (heroImg && !prefersReducedMotion) {
      heroImg.style.transform = `scale(1.08) translateY(${y * 0.12}px)`;
    }
    ticking = false;
  };
  const requestTick = () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  };
  window.addEventListener('scroll', requestTick, { passive: true });
  onScroll();
}
