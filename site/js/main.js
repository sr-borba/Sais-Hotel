const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Lenis: scroll suave/inercial (igual à referência), desativado ──
// ── automaticamente se o usuário preferir menos movimento.          ──
let lenis = null;
if (!prefersReducedMotion && window.Lenis) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true, touchMultiplier: 1.1 });
  const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);

  // Links de âncora usam o mesmo scroll suave do Lenis, não o salto nativo
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      const target = id.length > 1 ? document.querySelector(id) : document.body;
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -68 });
    });
  });
}

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

// ── Carousel de acomodações: Splide.js ──────────────────────────────
// ── Lib madura (arraste, wheel, teclado, acessibilidade e o "release" ──
// ── de scroll no limite já resolvidos por ela, testados em produção  ──
// ── — em vez de reimplementar isso na mão de novo).                  ──
const acomSplideEl = document.getElementById('acomSplide');
if (acomSplideEl && window.Splide) {
  new Splide(acomSplideEl, {
    type: 'slide',
    perPage: 2.3,
    gap: '1.5rem',
    padding: 0,
    arrows: false,
    pagination: false,
    drag: false, // DESATIVADO temporariamente p/ diagnóstico
    wheel: false, // DESATIVADO temporariamente p/ diagnóstico
    keyboard: 'global',
    speed: prefersReducedMotion ? 0 : 400,
    breakpoints: {
      1080: { perPage: 1.15 },
      600: { perPage: 1.05 },
    },
  }).mount();
}

// ── Scroll reveal, com stagger sequencial dentro de cada grid ──
// ── (30-50ms por item, como o Framer Motion whileInView da referência) ──
document.querySelectorAll('.cards-grid, .testi-grid').forEach(grid => {
  [...grid.children].forEach((child, i) => {
    if (child.hasAttribute('data-reveal')) child.style.transitionDelay = `${Math.min(i * 60, 240)}ms`;
  });
});

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

// ── Scroll: nav "scrolled" + parallax do hero e das seções feature-bg, ──
// ── tudo num único loop (Lenis quando ativo, senão scroll nativo)      ──
const nav = document.getElementById('nav');
const heroImg = document.querySelector('.hero-img');
const parallaxMedia = document.querySelectorAll('.feature-bg__media');
if (nav || (!prefersReducedMotion && (heroImg || parallaxMedia.length))) {
  const update = y => {
    if (nav) nav.classList.toggle('scrolled', y > 60);
    if (!prefersReducedMotion) {
      if (heroImg) heroImg.style.transform = `scale(1.08) translateY(${y * 0.12}px)`;
      parallaxMedia.forEach(media => {
        const rect = media.closest('.feature-bg').getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * 0.15;
        media.style.transform = `translateY(${offset}px) scale(1.12)`;
      });
    }
  };
  if (lenis) {
    lenis.on('scroll', ({ scroll }) => update(scroll));
  } else {
    let ticking = false;
    const onScroll = () => { update(window.scrollY); ticking = false; };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
  }
  update(window.scrollY);
}
