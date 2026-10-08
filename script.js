/* =========================================================
   PORTFOLIO — script.js
   Qorong'i rejim, mobil menyu, faol bo'lim belgisi,
   hero naqshi yorishi, email nusxalash.
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  /* ---------- 1. Ism va bosh harflar (faqat HTML'dagi ismni o'zgartirsangiz yetadi) ---------- */
  const nameEl = $('.hero__name');
  if (nameEl) {
    const fullName = nameEl.textContent.trim();
    const initials = fullName
      .split(/\s+/)
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    $$('[data-name]').forEach((el) => (el.textContent = fullName));
    $$('[data-initials]').forEach((el) => (el.textContent = initials));
  }

  /* ---------- 2. Qorong'i / yorug' rejim ---------- */
  const themeBtn = $('#theme-toggle');
  const themeMeta = $('meta[name="theme-color"]');

  const applyTheme = (theme, save = false) => {
    root.setAttribute('data-theme', theme);
    themeBtn.setAttribute('aria-pressed', String(theme === 'dark'));
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#0a1413' : '#0f766e');
    if (save) {
      try { localStorage.setItem('theme', theme); } catch (e) { /* xotira yopiq bo'lsa e'tibor bermaymiz */ }
    }
  };

  applyTheme(root.getAttribute('data-theme') || 'light');

  themeBtn.addEventListener('click', () => {
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
  });

  /* ---------- 3. Mobil menyu ---------- */
  const header = $('.site-header');
  const menuBtn = $('#menu-toggle');

  const setMenu = (open) => {
    header.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Menyuni yopish' : 'Menyuni ochish');
  };

  menuBtn.addEventListener('click', () => setMenu(!header.classList.contains('nav-open')));
  $$('.nav a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- 4. Sarlavha chizig'i va faol bo'lim ---------- */
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const links = new Map($$('.nav a').map((a) => [a.getAttribute('href').slice(1), a]));
  const setActive = (id) => {
    links.forEach((a, key) => {
      if (key === id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); }),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    $$('main section[id]').forEach((section) => spy.observe(section));
  }

  /* ---------- 5. Hero: sichqoncha atrofida naqsh yorishadi ---------- */
  const hero = $('.hero');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (hero && !reduceMotion) {
    let frame = 0;
    hero.addEventListener('pointermove', (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        hero.style.setProperty('--my', `${e.clientY - rect.top}px`);
        frame = 0;
      });
    });
  }

  /* ---------- 6. Rasm yo'q bo'lsa — bosh harflar ko'rinib turadi ---------- */
  const avatar = $('.avatar img');
  if (avatar) {
    const removeIfBroken = () => { if (avatar.complete && avatar.naturalWidth === 0) avatar.remove(); };
    avatar.addEventListener('error', () => avatar.remove());
    removeIfBroken();
  }

  /* ---------- 7. Ikonka yuklanmasa — harf bilan almashtiriladi ---------- */
  $$('.skill img').forEach((img) => {
    const swap = () => {
      const fallback = document.createElement('span');
      fallback.className = 'skill__fallback';
      fallback.setAttribute('aria-hidden', 'true');
      fallback.textContent = $('.skill__name', img.closest('.skill')).textContent.trim()[0];
      img.replaceWith(fallback);
    };
    img.addEventListener('error', swap, { once: true });
    if (img.complete && img.naturalWidth === 0) swap();
  });

  /* ---------- 8. Emailni nusxalash ---------- */
  const toast = $('#toast');
  let toastTimer;
  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  };

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  };

  $$('.copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await copyText(btn.dataset.copy);
        showToast('Email nusxalandi');
      } catch (e) {
        showToast('Nusxalab bo\'lmadi, qo\'lda belgilab oling');
      }
    });
  });

  /* ---------- 9. Footerdagi yil ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
