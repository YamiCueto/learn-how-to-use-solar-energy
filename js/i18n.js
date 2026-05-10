const I18n = (() => {
  'use strict';

  const _cache = {};
  const CHUNKS = ['common', 'module1', 'module2', 'module3', 'module4', 'module5', 'module6'];

  function _base() {
    return document.documentElement.dataset.i18nBase || '.';
  }

  async function load(lang) {
    if (_cache[lang]) return _cache[lang];
    const base = _base();
    const results = await Promise.all(
      CHUNKS.map(chunk =>
        fetch(`${base}/locales/${lang}/${chunk}.json`)
          .then(r => r.ok ? r.json() : {})
          .catch(() => ({}))
      )
    );
    _cache[lang] = Object.assign({}, ...results);
    return _cache[lang];
  }

  function t(lang, key) {
    if (_cache[lang] && _cache[lang][key] !== undefined) return _cache[lang][key];
    if (_cache['es'] && _cache['es'][key] !== undefined) return _cache['es'][key];
    return key;
  }

  return { load, t };
})();

/* Node / test compat */
if (typeof module !== 'undefined') module.exports = I18n;
