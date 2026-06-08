/* ============================================================
   index.js — Home Page Renderer
   
   Responsibilities:
   - Renders all home page content from APP_DATA
   - Handles hero section (badge, title, subtitle, CTAs)
   - Generates stats grid dynamically from data
   - Updates mission statement and title
   - Supports language switching via re-rendering
   - Reacts to 'appDataReady' event for initial load
   ============================================================ */

/**
 * Main render function for the Home page.
 * Extracts data from window.APP_DATA and populates all home page elements.
 * Called on initial page load and whenever the language is switched.
 */
function renderHome() {
  // =========================================================================
  // 1. SAFETY CHECK — Ensure data is available
  // =========================================================================
  if (!window.APP_DATA) return;
  
  // Destructure data for cleaner access
  const d = window.APP_DATA;          // Full data object
  const h = d.home;                   // Home page translations (headings, CTAs, etc.)


  // =========================================================================
  // 2. HERO BADGE — Small label above the main title
  // =========================================================================
  
  /**
   * Updates the hero badge text (e.g., "Aspiring Data Scientist").
   * Targets the last span inside .hero__badge element.
   * The first span is typically the animated dot indicator.
   */
  const badgeSpan = document.querySelector('.hero__badge span:last-child');
  if (badgeSpan && h?.badge) {
    badgeSpan.textContent = h.badge;
  }


  // =========================================================================
  // 3. HERO TITLE — Two-line main heading
  // =========================================================================
  
  /**
   * Updates both lines of the hero title.
   * Line 1: Normal weight (e.g., "Turning Data Into")
   * Line 2: Accent/gold color (e.g., "Ethical, Impact-Driven Solutions")
   * 
   * CSS selector explanation:
   * - :not(.hero__title-line--accent) targets the first line
   * - .hero__title-line--accent targets the second line with gold styling
   */
  const titleLine1 = document.querySelector('.hero__title-line:not(.hero__title-line--accent)');
  const titleLine2 = document.querySelector('.hero__title-line--accent');
  
  if (titleLine1 && h?.titleLine1) {
    titleLine1.textContent = h.titleLine1;
  }
  if (titleLine2 && h?.titleLine2) {
    titleLine2.textContent = h.titleLine2;
  }


  // =========================================================================
  // 4. HERO SUBTITLE — Descriptive text below the title
  // =========================================================================
  
  /**
   * Updates the hero subtitle paragraph.
   * This is the longer descriptive text explaining the value proposition.
   */
  const subtitle = document.querySelector('.hero__subtitle');
  if (subtitle && h?.subtitle) {
    subtitle.textContent = h.subtitle;
  }


  // =========================================================================
  // 5. CALL-TO-ACTION BUTTONS — Primary and secondary buttons
  // =========================================================================
  
  /**
   * Updates both CTA button texts.
   * Primary button: "Explore My Work" (solid/accent style)
   * Secondary button: "Learn More About Me" (outline style)
   * 
   * CSS selector explanation:
   * - .btn--primary: The filled/solid button
   * - .btn--outline: The outlined/transparent button
   */
  const ctaWork = document.querySelector('.btn--primary');     // "Explore My Work"
  const ctaAbout = document.querySelector('.btn--outline');     // "Learn More About Me"
  
  if (ctaWork && h?.ctaWork) {
    ctaWork.textContent = h.ctaWork;
  }
  if (ctaAbout && h?.ctaAbout) {
    ctaAbout.textContent = h.ctaAbout;
  }


  // =========================================================================
  // 6. STATS GRID — Dynamic statistics cards
  // =========================================================================
  
  /**
   * Generates the statistics grid from data.
   * Each stat card shows:
   * - A large value (e.g., "7+", "92.9%")
   * - A label (e.g., "Projects", "Top Model Recall")
   * 
   * Features:
   * - Highlight class for special stats (e.g., the recall percentage)
   * - Staggered fade-in animation (each card delays by 0.1s)
   * - Plus sign or percentage indicator after the value
   */
  const statsGrid = document.getElementById('statsGrid');
  if (statsGrid && d.basics?.stats) {
    const statsData = d.basics.stats;
    
    // Build each stat card dynamically
    statsGrid.innerHTML = statsData.map((stat, i) => `
      <div class="stat-card${stat.highlight ? ' stat-card--highlight' : ''}"
           style="animation: fadeInUp 0.5s ease forwards; animation-delay: ${i * 0.1}s">
        <span class="stat-card__value">
          ${stat.value}<span class="stat-card__plus">${stat.plus || '+'}</span>
        </span>
        <span class="stat-card__label">${stat.label}</span>
      </div>
    `).join('');
  }


  // =========================================================================
  // 7. MISSION SECTION — Personal mission statement
  // =========================================================================
  
  /**
   * Updates the mission statement text.
   * This is the core purpose/mission that drives the work.
   * Example: "To live life intentionally as a devoted believer..."
   */
  const missionEl = document.querySelector('.mission-card__text');
  if (missionEl && d?.basics?.mission) {
    missionEl.textContent = d.basics.mission;
  }

  /**
   * Updates the mission section title/heading.
   * This is the label above the mission statement.
   */
  const missionTitle = document.querySelector('.mission-card__title');
  if (missionTitle && h?.missionTitle) {
    missionTitle.textContent = h.missionTitle;
  }
}


// =========================================================================
// 8. EVENT LISTENERS & INITIALIZATION
// =========================================================================

// Listen for the 'appDataReady' event (dispatched by loader.js after data loads)
window.addEventListener('appDataReady', renderHome);

// Call immediately in case data is already loaded
// This handles the case where loader.js finishes before index.js executes
renderHome();

// Expose renderHome globally so loader.js can call it on language switch
window.renderHome = renderHome;