/* ═══════════════════════════════════════════════════
   app.js — navigation, progress tracking, lang toggle
═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── State ────────────────────────────────────────── */
  const TOTAL_MODULES = 6;
  const STORAGE_KEY   = 'solarlearn_progress';
  const LANG_KEY      = 'solarlearn_lang';

  let currentLang = localStorage.getItem(LANG_KEY) || 'en';

  /* ── DOM refs ─────────────────────────────────────── */
  const progressFill   = document.getElementById('progressFill');
  const navProgress    = document.getElementById('navProgress');
  const statPercent    = document.getElementById('statPercent');
  const statDone       = document.getElementById('statDone');
  const menuBtn        = document.getElementById('menuBtn');
  const mobileSidebar  = document.getElementById('mobileSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const langEnBtn      = document.getElementById('langEn');
  const langEsBtn      = document.getElementById('langEs');

  /* ── Progress ─────────────────────────────────────── */
  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveProgress(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* storage unavailable */ }
  }

  function renderProgress() {
    const data  = getProgress();
    const done  = Object.values(data).filter(Boolean).length;
    const pct   = Math.round((done / TOTAL_MODULES) * 100);

    if (progressFill)  progressFill.style.width = pct + '%';
    if (navProgress)   navProgress.setAttribute('aria-valuenow', pct);
    if (statPercent)   statPercent.textContent = pct + '%';
    if (statDone)      statDone.textContent = done;

    /* Update module card states */
    document.querySelectorAll('[data-module]').forEach(el => {
      const mod = parseInt(el.dataset.module, 10);
      if (data[mod]) {
        el.classList.add('module-card--done');
        el.classList.remove('module-card--locked');
        const pill = el.querySelector('.pill');
        if (pill) {
          pill.className = 'pill pill--done';
          pill.textContent = i18n[currentLang].pillDone;
        }
      }
    });
  }

  /* ── Language toggle ──────────────────────────────── */
  function applyLang(lang) {
    if (!i18n[lang]) return;
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);

    /* Update <html lang> */
    document.documentElement.lang = lang;

    /* Update all data-i18n elements */
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (i18n[lang][key] !== undefined) {
        el.textContent = i18n[lang][key];
      }
    });

    /* Update <title> */
    if (i18n[lang].pageTitle) {
      document.title = i18n[lang].pageTitle;
    }

    /* Toggle button active state */
    if (langEnBtn && langEsBtn) {
      langEnBtn.classList.toggle('lang-toggle__btn--active', lang === 'en');
      langEnBtn.setAttribute('aria-pressed', lang === 'en');
      langEsBtn.classList.toggle('lang-toggle__btn--active', lang === 'es');
      langEsBtn.setAttribute('aria-pressed', lang === 'es');
    }

    /* Re-render progress labels that may have changed */
    renderProgress();
  }

  function initLangToggle() {
    if (langEnBtn) langEnBtn.addEventListener('click', () => applyLang('en'));
    if (langEsBtn) langEsBtn.addEventListener('click', () => applyLang('es'));
  }

  /* ── Mobile sidebar ───────────────────────────────── */
  function openSidebar() {
    if (!mobileSidebar) return;
    mobileSidebar.classList.add('sidebar--open');
    mobileSidebar.removeAttribute('aria-hidden');
    sidebarOverlay && sidebarOverlay.classList.add('sidebar-overlay--visible');
    menuBtn && menuBtn.setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    if (!mobileSidebar) return;
    mobileSidebar.classList.remove('sidebar--open');
    mobileSidebar.setAttribute('aria-hidden', 'true');
    sidebarOverlay && sidebarOverlay.classList.remove('sidebar-overlay--visible');
    menuBtn && menuBtn.setAttribute('aria-expanded', 'false');
  }

  function initMobileSidebar() {
    menuBtn        && menuBtn.addEventListener('click', openSidebar);
    sidebarOverlay && sidebarOverlay.addEventListener('click', closeSidebar);

    /* Close on Escape */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeSidebar();
    });
  }

  /* ── Bottom nav active state ──────────────────────── */
  function initBottomNav() {
    document.querySelectorAll('.bottom-nav__item').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bottom-nav__item').forEach(b => {
          b.classList.remove('bottom-nav__item--active');
          b.removeAttribute('aria-current');
        });
        btn.classList.add('bottom-nav__item--active');
        btn.setAttribute('aria-current', 'page');
      });
    });
  }

  /* ── Module card click (navigate) ─────────────────── */
  function initModuleCards() {
    document.querySelectorAll('.module-card:not(.module-card--locked)').forEach(card => {
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const mod = card.dataset.module;
          if (mod) window.location.href = `pages/module${mod}.html`;
        }
      });
    });
  }

  /* ── Init ─────────────────────────────────────────── */
  function init() {
    initLangToggle();
    initMobileSidebar();
    initBottomNav();
    initModuleCards();

    /* Apply saved language */
    applyLang(currentLang);

    /* Render progress from localStorage */
    renderProgress();

    /* Draw default canvas diagram */
    if (typeof drawDC === 'function') drawDC();
  }

  document.addEventListener('DOMContentLoaded', init);

  /* ── Public API (used by module pages) ────────────── */
  window.SolarLearn = {
    markModuleDone(moduleNumber) {
      const data = getProgress();
      data[moduleNumber] = true;
      saveProgress(data);
      renderProgress();
    },
    isModuleDone(moduleNumber) {
      return !!getProgress()[moduleNumber];
    },
    applyLang,
    get currentLang() { return currentLang; },
  };
})();
