/* ============================================================
   loader.js — Core functionality for Omniah Arafah's Portfolio
   
   Responsibilities:
   - Loads shared layout (sidebar, topbar, mobile nav)
   - Manages language switching (English/Arabic)
   - Manages dark/light mode toggle
   - Loads language-specific data files
   - Updates navigation, footer, and page content dynamically
   ============================================================ */

(async function () {
  
  // =========================================================================
  // 1. SHARED LAYOUT INJECTION
  // =========================================================================
  
  /**
   * Fetches the shared.html file and injects it into the #shared-container div.
   * This includes sidebar, topbar, and mobile navigation that appear on every page.
   * Only injects once — if the container already has content, it skips.
   */
  async function injectSharedLayout() {
    const container = document.getElementById('shared-container');
    
    // If container doesn't exist or already has content, skip injection
    if (!container || container.children.length > 0) return;

    try {
      const res = await fetch('shared.html');
      if (!res.ok) throw new Error('shared.html not found');
      const html = await res.text();
      container.innerHTML = html;
    } catch (e) {
      console.error('Failed to load shared layout:', e);
    }
  }

  // Inject shared layout first (browser caches after first load)
  await injectSharedLayout();

  
  // =========================================================================
  // 2. CONSTANTS & STATE
  // =========================================================================
  
  // localStorage keys for persisting user preferences
  const LANG_KEY = 'omniah_portfolio_lang';   // Stores current language ('en' or 'ar')
  const MODE_KEY = 'omniah_portfolio_mode';    // Stores current mode ('dark' or 'light')
  
  // Initialize current language from localStorage (defaults to English)
  let currentLang = localStorage.getItem(LANG_KEY) || 'en';
  window.currentLang = currentLang;           // Expose globally for other scripts


  // =========================================================================
  // 3. DARK / LIGHT MODE MANAGEMENT
  // =========================================================================
  
  /**
   * Applies the specified mode ('dark' or 'light') to the body element.
   * Also updates the brand logo icon accordingly.
   * 
   * @param {string} mode - 'light' or 'dark'
   */
  function applyMode(mode) {
    const brandLogo = document.querySelector('.topbar__brand-avatar');
    
    if (mode === 'light') {
      document.documentElement.classList.add('light-mode');
      if (brandLogo) brandLogo.src = 'assets/images/lightmode-icon.svg';
    } else {
      document.documentElement.classList.remove('light-mode');
      if (brandLogo) brandLogo.src = 'assets/images/darkmode-icon.svg';
    }
  }

  /**
   * Updates the mode toggle button's tooltip based on current state.
   * Tells user what will happen if they click (e.g., "Switch to Dark Mode").
   */
  function updateModeTooltip() {
    const modeToggle = document.getElementById('modeToggle');
    if (!modeToggle) return;
    
    const isLight = document.documentElement.classList.contains('light-mode');
    
    if (currentLang === 'ar') {
      modeToggle.setAttribute('data-tooltip', isLight ? 'الوضع الداكن' : 'الوضع الفاتح');
    } else {
      modeToggle.setAttribute('data-tooltip', isLight ? 'Dark Mode' : 'Light Mode');
    }
  }

  /**
   * Toggles between dark and light mode.
   * Saves preference to localStorage for persistence across sessions.
   */
  function toggleMode() {
    const isLight = document.documentElement.classList.contains('light-mode');
    const newMode = isLight ? 'dark' : 'light';
    localStorage.setItem(MODE_KEY, newMode);
    applyMode(newMode);
    updateModeTooltip();
  }

  /**
   * Initializes the mode toggle system:
   * - Restores saved mode from localStorage (defaults to dark)
   * - Attaches click event listener to mode toggle button
   * - Updates tooltip to reflect current state
   */
  function initModeToggle() {
    // Restore saved mode or default to dark
    const savedMode = localStorage.getItem(MODE_KEY) || 'dark';
    applyMode(savedMode);

    // Attach mode toggle button event
    const modeToggle = document.getElementById('modeToggle');
    if (modeToggle) {
      // Remove any existing listener to prevent duplicates on re-init
      modeToggle.removeEventListener('click', toggleMode);
      modeToggle.addEventListener('click', toggleMode);
      updateModeTooltip();
    }
  }

  // Initialize mode immediately on page load
  initModeToggle();


  // =========================================================================
  // 4. NAVIGATION TRANSLATIONS
  // =========================================================================
  
  /**
   * Translation map for all navigation elements.
   * Used to update text when switching between English and Arabic.
   */
  const navTexts = {
    en: {
      index: 'Home',
      about: 'About',
      projects: 'Projects',
      contact: 'Contact',
      resume: 'Resume',
    },
    ar: {
      index: 'الرئيسية',
      about: 'عنّي',
      projects: 'المشاريع',
      contact: 'تواصل',
      resume: 'السيرة الذاتية',
    }
  };

  /**
   * Updates all navigation elements with the specified language.
   * This includes:
   * - Sidebar link tooltips
   * - Topbar navigation link text
   * - Resume button text and link
   * - Language toggle button appearance
   * - Avatar image source
   * - Mode toggle tooltip
   * 
   * @param {string} lang - 'en' or 'ar'
   */
  function updateNavigation(lang) {
    const t = navTexts[lang] || navTexts.en;

    // Update sidebar link tooltips (appear on hover)
    document.querySelectorAll('.sidebar__link[data-page]').forEach(link => {
      const page = link.getAttribute('data-page');
      if (t[page]) link.setAttribute('data-tooltip', t[page]);
    });

    // Update topbar navigation link text
    document.querySelectorAll('.topbar__nav-link[data-page]').forEach(link => {
      const page = link.getAttribute('data-page');
      if (t[page]) link.textContent = t[page];
    });

    // Update resume button
    const resumeBtn = document.querySelector('.topbar__resume-btn');
    if (resumeBtn) {
      // Update button text
      const span = resumeBtn.querySelector('span');
      if (span) span.textContent = t.resume;
      
      // Update resume link from data
      const cvUrl = window.APP_DATA?.basics?.cvUrl || '#';
      const filename = cvUrl.split('/').pop();
      
      // Find the anchor element (button might be wrapped in <a> or be an <a> itself)
      let anchorEl = resumeBtn;
      if (resumeBtn.tagName.toLowerCase() !== 'a') {
        anchorEl = resumeBtn.querySelector('a');
      }
      if (anchorEl) {
        anchorEl.href = cvUrl;
        anchorEl.removeAttribute('download'); // Allow browser to handle PDF display
      }
    }

    // Update language toggle button
    const langBtn = document.getElementById('langToggle');
    if (langBtn) {
      const span = langBtn.querySelector('.lang-toggle__text');
      if (span) span.textContent = lang === 'ar' ? 'EN' : 'AR';
      langBtn.setAttribute('data-tooltip', lang === 'ar' ? 'English' : 'عربي');
    }

    // Update avatar image from data
    const avatar = document.querySelector('.sidebar__avatar-img');
    if (avatar && window.APP_DATA?.basics?.image) {
      avatar.src = window.APP_DATA.basics.image;
    }

    // Update mode toggle tooltip (depends on current language)
    updateModeTooltip();
  }


  // =========================================================================
  // 5. FOOTER UPDATE
  // =========================================================================
  
  /**
   * Updates the footer bar with translated content from the data file.
   * Handles the phrase, location, and copyright text.
   * 
   * @param {Object} data - The language-specific data object (APP_DATA)
   */
  function updateFooter(data) {
    if (!data) return;
    
    const basics = data.basics || {};
    const footer = data.footer || {};
    const year = new Date().getFullYear();
    const name = basics.name || '';
    const city = basics.location?.city || '';
    const country = basics.location?.country || '';
    
    // Update phrase (e.g., "Built with 💙 and intention")
    const footerPhrase = document.getElementById('footerPhrase');
    if (footerPhrase) {
      footerPhrase.textContent = footer.phrase || 'Built with 💙 and intention';
    }
    
    // Update location (e.g., "Alexandria, Egypt")
    const footerLocation = document.getElementById('footerLocation');
    if (footerLocation) {
      const locationText = (footer.location || '{city}, {country}')
        .replace('{city}', city)
        .replace('{country}', country);
      footerLocation.textContent = locationText;
    }
    
    // Update copyright (e.g., "© 2026 Omniah Arafah. All rights reserved.")
    const footerCopyright = document.getElementById('footerCopyright');
    if (footerCopyright) {
      const copyrightText = (footer.copyright || '© {year} {name}. All rights reserved.')
        .replace('{year}', year)
        .replace('{name}', name);
      footerCopyright.textContent = copyrightText;
    }
  }


  // =========================================================================
  // 6. DATA LOADING
  // =========================================================================
  
  /**
   * Fetches the language-specific JSON data file.
   * File naming convention: data_en.json, data_ar.json
   * Stores the result globally in window.APP_DATA for all other scripts to use.
   * 
   * @param {string} lang - 'en' or 'ar'
   */
  async function loadData(lang) {
    try {
      const res = await fetch(`data_${lang}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      window.APP_DATA = await res.json();
    } catch (err) {
      console.error('Failed to load data:', err);
      window.APP_DATA = null;
    }
  }

  // Load initial data for the current language
  await loadData(currentLang);


  // =========================================================================
  // 7. LANGUAGE SWITCHING
  // =========================================================================
  
  /**
   * Switches the entire portfolio to the specified language.
   * This is the main language change handler that:
   * - Persists the preference
   * - Updates HTML lang and dir attributes
   * - Reloads the appropriate data file
   * - Updates all navigation elements
   * - Re-renders page-specific content
   * - Updates the brand name in the topbar
   * - Updates the footer
   * 
   * @param {string} lang - 'en' or 'ar'
   */
  async function switchLanguage(lang) {
    // Don't do anything if the language is already set
    if (lang === currentLang) return;
    
    // Update state
    currentLang = lang;
    window.currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    
    // Update HTML attributes for RTL support
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Reload data for the new language
    await loadData(lang);

    // Update navigation elements
    updateNavigation(lang);

    // Re-render page-specific content (each page has its own render function)
    if (typeof window.renderHome === 'function') window.renderHome();
    if (typeof window.renderAbout === 'function') window.renderAbout();
    if (typeof window.buildFilters === 'function') window.buildFilters();
    if (typeof window.renderProjects === 'function') window.renderProjects();
    if (typeof window.renderContact === 'function') window.renderContact();

    // Update brand name in topbar
    const brandName = document.querySelector('.topbar__brand-name');
    const brandLink = document.querySelector('.topbar__brand');
    if (brandName && brandLink) {
      if (lang === 'ar') {
        brandName.textContent = 'أمنية عرفة';
        brandLink.setAttribute('aria-label', 'أمنية عرفة - الرئيسية');
      } else {
        brandName.textContent = 'Omniah Arafah';
        brandLink.setAttribute('aria-label', 'Omniah Arafah Home');
      }
    }

    // Update footer with new language data
    updateFooter(window.APP_DATA);
  }


  // =========================================================================
  // 8. EVENT LISTENERS
  // =========================================================================
  
  // Language toggle button — switches between English and Arabic
  document.getElementById('langToggle')?.addEventListener('click', () => {
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    switchLanguage(newLang);
  });


  // =========================================================================
  // 9. ACTIVE PAGE HIGHLIGHTING
  // =========================================================================
  
  // Determine current page from URL (e.g., "about" from "about.html")
  const currentPage = window.location.pathname.split('/').pop()?.replace('.html', '') || 'index';
  
  // Store current page on body for CSS targeting
  document.body.setAttribute('data-page', currentPage);
  
  // Highlight active navigation links (both sidebar and topbar)
  document.querySelectorAll('[data-page]').forEach(el => {
    if (el.getAttribute('data-page') === currentPage) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });


  // =========================================================================
  // 10. INITIAL SETUP
  // =========================================================================
  
  // Set initial HTML language and direction
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  
  // Update navigation with current language
  updateNavigation(currentLang);
  
  // Update footer with loaded data
  updateFooter(window.APP_DATA);

  // Dispatch event to notify page-specific scripts that data is ready
  window.dispatchEvent(new CustomEvent('appDataReady'));

})();