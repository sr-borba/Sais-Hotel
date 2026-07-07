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

// ── Carousel: arraste com mouse (desktop) ───────────────────────────
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

  // ── Mouse sobre o carrossel: wheel rola na horizontal; ao chegar no ──
  // ── início/fim, devolve o controle para o scroll normal da página. ──
  track.addEventListener('wheel', e => {
    const isHorizontal = getComputedStyle(track).overflowX === 'auto' && track.scrollWidth > track.clientWidth;
    if (!isHorizontal) return; // lista vertical no mobile: scroll da página normalmente
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // gesto já horizontal: deixa o navegador cuidar

    const max = track.scrollWidth - track.clientWidth;
    const atStart = track.scrollLeft <= 1;
    const atEnd = track.scrollLeft >= max - 1;
    const goingForward = e.deltaY > 0;
    if ((goingForward && atEnd) || (!goingForward && atStart)) return; // no limite: página assume o scroll

    e.preventDefault();
    // scroll-snap briga com incrementos pixel a pixel (o navegador "puxa" de volta
    // pro card mais próximo) — por isso avançamos um card inteiro por gesto, com
    // um cooldown pra não disparar várias vezes durante a mesma rolagem contínua.
    if (track.dataset.wheeling) return;
    track.dataset.wheeling = '1';
    const card = track.querySelector('.gcard');
    const gap = 24;
    const step = card ? card.getBoundingClientRect().width + gap : 360;
    track.scrollBy({ left: goingForward ? step : -step, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    setTimeout(() => { delete track.dataset.wheeling; }, 500);
  }, { passive: false });
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
