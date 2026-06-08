/* ============================================================
   about.js — About Page Renderer
   
   Responsibilities:
   - Renders all about page content from APP_DATA
   - Handles bio, education, certifications, languages, and focus areas
   - Supports language switching via re-rendering
   - Reacts to 'appDataReady' event for initial load
   ============================================================ */

/**
 * Main render function for the About page.
 * Extracts data from window.APP_DATA and populates all about page elements.
 * Called on initial page load and whenever the language is switched.
 */
function renderAbout() {
  // =========================================================================
  // 1. SAFETY CHECK — Ensure data is available
  // =========================================================================
  if (!window.APP_DATA) return;
  
  // Destructure data for cleaner access
  const d = window.APP_DATA;              // Full data object
  const a = d.about || {};                // About-specific translations
  const basics = d.basics || {};           // Personal information
  const edu = d.education?.[0] || {};      // First education entry
  const languages = d.languages || [];      // Languages array
  const focus = a.focuses || [];            // Current focus areas


  // =========================================================================
  // 2. HEADER SECTION — Name, label, and avatar
  // =========================================================================
  
  // Update name (e.g., "Omniah Arafah")
  const nameEl = document.getElementById('aboutName');
  if (nameEl) nameEl.textContent = basics.name || '';
  
  // Update professional label/title
  const labelEl = document.getElementById('aboutLabel');
  if (labelEl) labelEl.textContent = basics.label || '';
  
  // Update avatar image
  const imgEl = document.querySelector('.about-header__img');
  if (imgEl) imgEl.src = basics.image || '';


  // =========================================================================
  // 3. SECTION HEADINGS — Translated section titles
  // =========================================================================
  
  // "My Story" heading
  const storyHeading = document.getElementById('myStoryHeading');
  if (storyHeading) storyHeading.textContent = a.myStory || '';
  
  // "Education & Certifications" heading
  const eduHeading = document.getElementById('educationHeading');
  if (eduHeading) eduHeading.textContent = a.educationTitle || '';


  // =========================================================================
  // 4. BIOGRAPHY SECTION — Personal summary/background
  // =========================================================================
  
  const bioText = document.getElementById('bioText');
  if (bioText) bioText.textContent = basics.summary || '';


  // =========================================================================
  // 5. EDUCATION CARD — University degree information
  // =========================================================================
  
  // Degree type (e.g., "Bachelor of Science")
  const degreeEl = document.getElementById('eduDegree');
  if (degreeEl) degreeEl.textContent = edu.studyType || 'Bachelor of Science';
  
  // Graduation date (e.g., "2026")
  const datesEl = document.getElementById('eduDates');
  if (datesEl) datesEl.textContent = `${edu.endDate}` || '2022 – 2026';
  
  // Area of study and institution (e.g., "Statistics — Alexandria University")
  const detailEl = document.getElementById('eduDetail');
  if (detailEl) {
    const area = edu.area || 'Statistics, Minor in Computer Science';
    const institution = edu.institution || 'Alexandria University';
    detailEl.innerHTML = `${area} — <strong>${institution}</strong>`;
  }
  
  // Course tags (e.g., "Machine Learning", "Data Mining")
  const coursesEl = document.getElementById('eduCourses');
  if (coursesEl && edu.courses) {
    coursesEl.innerHTML = edu.courses
      .map(course => `<span class="course-tag">${course}</span>`)
      .join('');
  }


  // =========================================================================
  // 6. CERTIFICATIONS SECTION — Professional certificates
  // =========================================================================
  
  const certContainer = document.getElementById('certContainer');
  if (certContainer && d.certifications) {
    // Generate certification cards dynamically from all entries
    certContainer.innerHTML = d.certifications
      .map(cert => `
        <div class="edu-card edu-card--cert">
          <div class="edu-card__header">
            <span class="edu-card__degree">${cert.name}</span>
            <span class="edu-card__date">${cert.issuer}</span>
          </div>
          <p class="edu-card__detail">${cert.summary}</p>
        </div>
      `)
      .join('');
  }


  // =========================================================================
  // 7. LANGUAGES & FOCUS SECTION — Side-by-side cards
  // =========================================================================
  
  const extraGrid = document.getElementById('extraGrid');
  if (extraGrid) {
    extraGrid.innerHTML = `
      <!-- Languages Card -->
      <div class="extra-card">
        <h3>${a.languagesTitle || 'Languages'}</h3>
        <ul>
          ${languages
            .map(lang => `<li>${lang.language} — ${lang.fluency}</li>`)
            .join('')}
        </ul>
      </div>
      
      <!-- Current Focus Card -->
      <div class="extra-card">
        <h3>${a.focusTitle || 'Current Focus'}</h3>
        <ul>
          ${focus
            .map(item => `<li>${item}</li>`)
            .join('')}
        </ul>
      </div>
    `;
  }
}


// =========================================================================
// 8. EVENT LISTENERS & INITIALIZATION
// =========================================================================

// Listen for the 'appDataReady' event (dispatched by loader.js after data loads)
window.addEventListener('appDataReady', renderAbout);

// If data is already loaded when this script runs, render immediately
// (This handles cases where loader.js finishes before about.js executes)
if (window.APP_DATA) renderAbout();

// Expose renderAbout globally so loader.js can call it on language switch
window.renderAbout = renderAbout;