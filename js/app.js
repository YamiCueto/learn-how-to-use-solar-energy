/* ═══════════════════════════════════════════════════
   app.js — navigation, progress tracking, lang toggle
═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── State ────────────────────────────────────────── */
  const TOTAL_MODULES = 6;
  const STORAGE_KEY   = 'solarlearn_progress';
  const LANG_KEY      = 'solarlearn_lang';

  let currentLang = localStorage.getItem(LANG_KEY) || 'es';

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
          pill.textContent = I18n.t(currentLang, 'pillDone');
        }
      }
    });
  }

  /* ── Language toggle ──────────────────────────────── */
  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);

    /* Update <html lang> */
    document.documentElement.lang = lang;

    /* Update all data-i18n elements */
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const val = I18n.t(lang, key);
      if (val !== key) el.textContent = val;
    });

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

  async function switchLang(lang) {
    await I18n.load(lang);
    applyLang(lang);
  }

  function initLangToggle() {
    if (langEnBtn) langEnBtn.addEventListener('click', () => switchLang('en'));
    if (langEsBtn) langEsBtn.addEventListener('click', () => switchLang('es'));
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

  /* ── Quiz Modal ───────────────────────────────────── */
  /**
   * initQuizModal(quizData, triggerBtnId)
   *
   * quizData: Array of { textKey, opts: [{key, ok}] }
   *   textKey  — i18n key for the question text
   *   opts     — array of {key (i18n key), ok (boolean: correct answer)}
   *
   * Creates and appends a modal to <body>, wires it to triggerBtnId.
   * Uses ESC to close, focus-traps inside the modal while open.
   */
  function initQuizModal(quizData, triggerBtnId) {
    const triggerBtn = document.getElementById(triggerBtnId);
    if (!triggerBtn || !quizData || !quizData.length) return;

    /* Update trigger subtitle with question count */
    const subEl = triggerBtn.querySelector('.quiz-trigger__sub');
    if (subEl) {
      subEl.textContent = `${quizData.length} ${I18n.t(currentLang, 'quizQuestions')}`;
    }

    /* ── Build modal DOM ── */
    const overlay = document.createElement('div');
    overlay.id = 'quizModal';
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'quizModalTitle');
    overlay.hidden = true;

    overlay.innerHTML = `
      <div class="modal" role="document">
        <div class="modal__header">
          <h2 class="modal__title" id="quizModalTitle"></h2>
          <div style="display:flex;align-items:center;gap:var(--sp-3)">
            <span class="modal__counter" id="quizCounter" aria-live="polite"></span>
            <button class="modal__close-btn" id="quizCloseBtn" aria-label="Cerrar">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="modal__body" id="quizBody"></div>
        <div class="modal__footer">
          <button class="btn btn--ghost btn--md" id="quizPrevBtn"></button>
          <button class="btn btn--amber btn--md" id="quizNextBtn"></button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    /* ── State ── */
    let currentQ = 0;
    let answered = new Array(quizData.length).fill(null); /* null | 'correct' | 'wrong' */

    /* ── Helpers ── */
    function t(key) { return I18n.t(currentLang, key); }

    function renderQuestion(idx) {
      const q         = quizData[idx];
      const isLast    = idx === quizData.length - 1;
      const isResult  = idx === quizData.length;

      /* header */
      document.getElementById('quizModalTitle').textContent = t('quizTitle');
      document.getElementById('quizCounter').textContent    =
        isResult ? '' : `${t('quizQuestion')} ${idx + 1} ${t('quizOf')} ${quizData.length}`;

      /* footer buttons */
      const prevBtn = document.getElementById('quizPrevBtn');
      const nextBtn = document.getElementById('quizNextBtn');
      prevBtn.textContent  = t('quizPrev');
      prevBtn.style.visibility = idx === 0 ? 'hidden' : 'visible';
      nextBtn.textContent  = isResult ? t('quizRetry') : (isLast ? t('quizFinish') : t('quizNext'));

      /* body */
      const body = document.getElementById('quizBody');

      if (isResult) {
        const score = answered.filter(a => a === 'correct').length;
        body.innerHTML = `
          <div class="modal-quiz-result">
            <div class="modal-quiz-score">${score} / ${quizData.length}</div>
            <p class="modal-quiz-score-label">${t('quizCorrectAnswers')}</p>
          </div>`;
        return;
      }

      const letters = ['A', 'B', 'C', 'D'];
      const optHTML  = q.opts.map((opt, i) => `
        <button class="modal-quiz-option${answered[idx] ? (opt.ok ? ' modal-quiz-option--correct' : (answered[idx] === String(i) ? ' modal-quiz-option--wrong' : '')) : ''}"
          data-opt="${i}" ${answered[idx] ? 'disabled' : ''} aria-pressed="${answered[idx] === String(i)}">
          <span class="modal-quiz-letter">${letters[i]}</span>
          <span>${t(opt.key)}</span>
        </button>`).join('');

      const fb = answered[idx]
        ? `<p class="modal-quiz-feedback ${answered[idx] === 'correct' ? 'modal-quiz-feedback--ok' : 'modal-quiz-feedback--err'}" aria-live="polite">${answered[idx] === 'correct' ? t('quizCorrectFb') : t('quizWrongFb')}</p>`
        : '<p class="modal-quiz-feedback" aria-live="polite"></p>';

      body.innerHTML = `<p class="modal-quiz-qtext">${t(q.textKey)}</p>${optHTML}${fb}`;

      /* Option click handlers */
      body.querySelectorAll('.modal-quiz-option').forEach(btn => {
        if (answered[idx]) return;
        btn.addEventListener('click', () => {
          const chosenIdx = btn.dataset.opt;
          const isOk      = q.opts[chosenIdx].ok;
          answered[idx]   = isOk ? 'correct' : chosenIdx;
          renderQuestion(idx);
        });
      });
    }

    /* ── Navigation ── */
    document.getElementById('quizPrevBtn').addEventListener('click', () => {
      if (currentQ > 0) { currentQ--; renderQuestion(currentQ); }
    });

    document.getElementById('quizNextBtn').addEventListener('click', () => {
      if (currentQ < quizData.length) {
        currentQ++;
        renderQuestion(currentQ);
      } else {
        /* Retry — reset */
        currentQ = 0;
        answered = new Array(quizData.length).fill(null);
        renderQuestion(0);
      }
    });

    /* ── Open / close ── */
    function openModal() {
      currentQ = 0;
      answered = new Array(quizData.length).fill(null);
      overlay.hidden = false;
      renderQuestion(0);
      /* Focus first focusable element */
      const first = overlay.querySelector('button, [tabindex]');
      if (first) first.focus();
    }

    function closeModal() {
      overlay.hidden = true;
      triggerBtn.focus();
    }

    triggerBtn.addEventListener('click', openModal);
    document.getElementById('quizCloseBtn').addEventListener('click', closeModal);

    /* Close on backdrop click */
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

    /* ESC to close + focus trap */
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key !== 'Tab') return;
      const focusable = Array.from(overlay.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ));
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    /* Re-render on language change */
    document.addEventListener('SolarLearnLangChange', () => {
      if (!overlay.hidden) renderQuestion(currentQ);
      if (subEl) subEl.textContent = `${quizData.length} ${I18n.t(currentLang, 'quizQuestions')}`;
    });
  }

  /* ── Init ─────────────────────────────────────────── */
  async function init() {
    /* Prevent flash of untranslated content */
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.15s ease';

    /* Load default locale + saved locale */
    await I18n.load('es');
    if (currentLang !== 'es') await I18n.load(currentLang);

    initLangToggle();
    initMobileSidebar();
    initBottomNav();
    initModuleCards();

    applyLang(currentLang);
    renderProgress();

    /* Draw default canvas diagram */
    if (typeof drawDC === 'function') drawDC();

    /* Signal module pages that i18n is ready */
    document.dispatchEvent(new CustomEvent('SolarLearnReady'));

    /* Reveal page */
    document.body.style.opacity = '1';
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
    applyLang(lang) {
      I18n.load(lang).then(() => {
        applyLang(lang);
        document.dispatchEvent(new CustomEvent('SolarLearnLangChange'));
      });
    },
    initQuizModal,
    get currentLang() { return currentLang; },
  };
})();
