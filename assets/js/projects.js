/* ============================================================
   projects.js — Projects Page Renderer & Filter System
   
   Responsibilities:
   - Renders project cards from APP_DATA.projects
   - Builds dynamic filter bar from project keywords
   - Handles multi-select filtering with toggle logic
   - Supports image slider for multiple images per project
   - Sorts featured projects to the top
   - Initializes slider navigation (arrows, dots, swipe, keyboard)
   - Supports language switching via re-rendering
   - Reacts to 'appDataReady' event for initial load
   ============================================================ */

(function () {
  
  // =========================================================================
  // 1. STATE — Track active filters
  // =========================================================================
  
  /**
   * Set of currently active filter keywords.
   * Uses a Set for O(1) lookup performance.
   * 'all' is the default state (no filter applied).
   * When specific filters are selected, 'all' is removed.
   * If all specific filters are deselected, reverts to 'all'.
   */
  let activeFilters = new Set(['all']);


  // =========================================================================
  // 2. MAIN RENDER FUNCTION — Builds the entire projects grid
  // =========================================================================
  
  /**
   * Main render function for the Projects page.
   * Handles the complete rendering pipeline:
   * 1. Updates page headings
   * 2. Filters projects based on active filter keywords
   * 3. Sorts featured projects to the top
   * 4. Generates project cards with image sliders
   * 5. Initializes slider interactions
   * 
   * Called on initial load, filter changes, and language switches.
   */
  function renderProjects() {
    // ── Safety check: Ensure data is available ──
    if (!window.APP_DATA) return;
    
    const projects = window.APP_DATA.projects || [];
    const page = window.APP_DATA.projectsPage || {};
    const grid = document.getElementById('projectsGrid');
    const emptyState = document.getElementById('projectsEmpty');
    
    // Exit if the grid element doesn't exist on the page
    if (!grid) return;

    
    // ── Update page headings ──────────────────────────────
    document.getElementById('projectsHeading').textContent = page.heading || 'My Projects';
    document.getElementById('projectsSubtitle').textContent = page.subtitle || '';
    document.getElementById('emptyMessage').textContent = page.emptyMessage || 'No projects match.';

    
    // ── Apply keyword filters ─────────────────────────────
    /**
     * Filtering logic:
     * - If 'all' is active: show every project
     * - Otherwise: show projects that have AT LEAST ONE matching keyword
     *   (OR logic — project matches if any of its keywords match any active filter)
     */
    let filtered = projects;
    if (!activeFilters.has('all')) {
      filtered = projects.filter(p =>
        (p.keywords || []).some(kw => activeFilters.has(kw))
      );
    }

    
    // ── Sort: Featured projects appear first ──────────────
    /**
     * Sorting logic:
     * - Returns -1 to move 'a' up (before 'b')
     * - Returns 1 to move 'b' up (before 'a')
     * - Returns 0 to keep original relative order
     * 
     * This is a stable sort — non-featured projects maintain their order.
     */
    filtered.sort((a, b) => {
      const aFeatured = a.featured === true;
      const bFeatured = b.featured === true;
      
      if (aFeatured && !bFeatured) return -1; // 'a' is featured, move it up
      if (!aFeatured && bFeatured) return 1;  // 'b' is featured, move it up
      return 0;                               // Both same status, keep original order
    });

    
    // ── Handle empty state ────────────────────────────────
    /**
     * If no projects match the current filters:
     * - Clear the grid
     * - Show the empty state message with icon
     * Otherwise:
     * - Hide the empty state
     * - Proceed to render project cards
     */
    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }
    if (emptyState) emptyState.style.display = 'none';

    
    // ── Build project cards ───────────────────────────────
    /**
     * Each project card contains:
     * - Image or image slider
     * - Category label
     * - Project name
     * - Achievement highlight (if available)
     * - Description
     * - Keyword tags
     * - GitHub link (if available)
     * - Featured badge (if featured)
     * 
     * Animation: Staggered fade-in (each card delayed by 0.06s)
     */
    grid.innerHTML = filtered.map((p, i) => {
      // Generate keyword tags HTML
      const keywordsHTML = (p.keywords || []).map(kw =>
        `<span class="project-card__keyword">${kw}</span>`
      ).join('');

      // Featured badge (only for featured projects)
      const featuredBadge = p.featured
        ? `<span class="project-card__featured-badge">★ ${page.featuredBadge || 'Featured'}</span>`
        : '';

      // GitHub link (only if URL exists)
      const githubLink = p.url
        ? `<a href="${p.url}" target="_blank" rel="noopener" class="project-card__link">${page.viewOnGithub || 'View on GitHub →'}</a>`
        : '';

      return `
        <div class="project-card" style="animation: fadeInUp 0.4s ease forwards; animation-delay: ${i * 0.06}s; position: relative;">
          ${renderImageSlider(p, page)}
          <div class="project-card__body">
            <span class="project-card__category">${p.category || ''}</span>
            <h3 class="project-card__name">${p.name}</h3>
            ${p.achievement ? `<p class="project-card__achievement">🏆 ${p.achievement}</p>` : ''}
            <p class="project-card__description">${p.description || ''}</p>
            <div class="project-card__keywords">${keywordsHTML}</div>
            ${githubLink}
          </div>
        </div>
      `;
    }).join('');

    // Initialize slider interactions after cards are in the DOM
    initAllSliders();
  }


  // =========================================================================
  // 3. IMAGE SLIDER RENDERER — Single or multiple images per project
  // =========================================================================
  
  /**
   * Renders the image section for a project card.
   * Handles three scenarios:
   * 1. No images — Shows a placeholder
   * 2. Single image — Simple <img> tag
   * 3. Multiple images — Full slider with navigation
   * 
   * @param {Object} project - The project data object
   * @param {Object} page - The projects page translations
   * @returns {string} HTML string for the image section
   */
  function renderImageSlider(project, page) {
    // Normalize image data: string → array, or keep array as-is
    let images = [];
    if (typeof project.image === 'string' && project.image) {
      images = [project.image];
    } else if (Array.isArray(project.image) && project.image.length > 0) {
      images = project.image;
    }

    // ── Scenario 1: No images at all ──────────────────────
    if (images.length === 0) {
      return `<div class="project-card__image">
        <span style="color:var(--text-dim);font-size:0.8rem;">${page.noPreview || '📊 No Preview'}</span>
      </div>`;
    }

    // ── Scenario 2: Single image (no slider needed) ───────
    if (images.length === 1) {
      return `
        <div class="project-card__image">
          <img src="${images[0]}" alt="${project.name}" loading="lazy" 
               onerror="this.parentElement.innerHTML='<span style=\\'color:var(--text-dim)\\'>${page.noPreview || '📊 No Preview'}</span>'">
          ${project.featured ? `<span class="project-card__featured-badge">★ ${page.featuredBadge || 'Featured'}</span>` : ''}
        </div>
      `;
    }

    // ── Scenario 3: Multiple images (full slider) ─────────
    /**
     * Slider structure:
     * - slider__track: Contains all slides (only one visible at a time)
     * - slider__arrow--prev/next: Navigation arrows (appear on hover)
     * - slider__dots: Dot indicators for each image
     * - slider__counter: Shows "1/3", "2/3", etc.
     * - Featured badge: Overlaid in top-left corner
     */
    
    // Generate unique ID for this slider instance
    const sliderId = `slider-${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate slides (first slide is active by default)
    const slidesHTML = images.map((img, idx) => `
      <div class="slider__slide ${idx === 0 ? 'slider__slide--active' : ''}" data-slide="${idx}">
        <img src="${img}" alt="${project.name} - Image ${idx + 1}" loading="${idx === 0 ? 'lazy' : 'lazy'}"
             onerror="this.style.display='none'">
      </div>
    `).join('');

    // Generate dot indicators
    const dotsHTML = images.map((_, idx) => `
      <button class="slider__dot ${idx === 0 ? 'slider__dot--active' : ''}" 
              data-slide="${idx}" aria-label="Go to image ${idx + 1}"></button>
    `).join('');

    return `
      <div class="project-card__image project-card__slider" id="${sliderId}">
        <div class="slider__track">
          ${slidesHTML}
        </div>
        <!-- Previous arrow -->
        <button class="slider__arrow slider__arrow--prev" aria-label="Previous image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <!-- Next arrow -->
        <button class="slider__arrow slider__arrow--next" aria-label="Next image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <!-- Dot indicators -->
        <div class="slider__dots">
          ${dotsHTML}
        </div>
        <!-- Featured badge (overlaid) -->
        ${project.featured ? `<span class="project-card__featured-badge">★ ${page.featuredBadge || 'Featured'}</span>` : ''}
        <!-- Image counter (e.g., "1/3") -->
        <div class="slider__counter">1/${images.length}</div>
      </div>
    `;
  }


  // =========================================================================
  // 4. SLIDER INITIALIZATION — Add interactivity to all sliders
  // =========================================================================
  
  /**
   * Initializes all image sliders on the page.
   * Each slider gets:
   * - Arrow button navigation (previous/next)
   * - Dot indicator navigation (click to jump)
   * - Touch/swipe support for mobile devices
   * - Keyboard navigation (arrow keys when focused)
   * - Image counter updates
   * 
   * Uses a data attribute (data-initialized) to prevent duplicate initialization.
   */
  function initAllSliders() {
    document.querySelectorAll('.project-card__slider').forEach(slider => {
      // Skip if already initialized (prevents duplicate event listeners)
      if (slider.dataset.initialized) return;
      slider.dataset.initialized = 'true';
      
      const id = slider.id;
      if (!id) return;
      
      // Gather slider elements
      const slides = slider.querySelectorAll('.slider__slide');
      const dots = slider.querySelectorAll('.slider__dot');
      const counter = slider.querySelector('.slider__counter');
      const prevBtn = slider.querySelector('.slider__arrow--prev');
      const nextBtn = slider.querySelector('.slider__arrow--next');
      
      // State tracking
      let currentSlide = 0;
      const totalSlides = slides.length;
      
      /**
       * Navigates to a specific slide by index.
       * Updates active states on slides and dots, and updates the counter.
       * 
       * @param {number} index - The target slide index (0-based)
       */
      function goToSlide(index) {
        // Remove active state from current slide and dot
        slides[currentSlide].classList.remove('slider__slide--active');
        dots[currentSlide].classList.remove('slider__dot--active');
        
        // Update current index
        currentSlide = index;
        
        // Add active state to new slide and dot
        slides[currentSlide].classList.add('slider__slide--active');
        dots[currentSlide].classList.add('slider__dot--active');
        
        // Update image counter (e.g., "2/3")
        if (counter) {
          counter.textContent = `${currentSlide + 1}/${totalSlides}`;
        }
      }
      
      /**
       * Advances to the next slide.
       * Wraps around to the first slide after the last one.
       */
      function nextSlide() {
        const next = (currentSlide + 1) % totalSlides;
        goToSlide(next);
      }
      
      /**
       * Goes back to the previous slide.
       * Wraps around to the last slide from the first one.
       */
      function prevSlide() {
        const prev = (currentSlide - 1 + totalSlides) % totalSlides;
        goToSlide(prev);
      }
      
      // ── Arrow button events ────────────────────────────
      if (nextBtn) nextBtn.addEventListener('click', nextSlide);
      if (prevBtn) prevBtn.addEventListener('click', prevSlide);
      
      // ── Dot indicator events ───────────────────────────
      dots.forEach(dot => {
        dot.addEventListener('click', () => {
          const index = parseInt(dot.dataset.slide);
          goToSlide(index);
        });
      });
      
      // ── Touch/swipe support for mobile ─────────────────
      let touchStartX = 0;
      let touchEndX = 0;
      
      // Record starting touch position
      slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true }); // passive: true improves scroll performance
      
      // Detect swipe direction on touch end
      slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        
        // Minimum 50px swipe distance to trigger navigation
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            nextSlide(); // Swiped left → next image
          } else {
            prevSlide(); // Swiped right → previous image
          }
        }
      });
      
      // ── Keyboard navigation for accessibility ──────────
      slider.setAttribute('tabindex', '0'); // Make slider focusable
      slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault(); // Prevent page scrolling
          prevSlide();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault(); // Prevent page scrolling
          nextSlide();
        }
      });
    });
  }


  // =========================================================================
  // 5. FILTER BAR BUILDER — Dynamic filter buttons from project keywords
  // =========================================================================
  
  /**
   * Builds the filter bar dynamically from all unique keywords across projects.
   * 
   * Process:
   * 1. Collect all keywords from all projects
   * 2. Remove duplicates using a Set
   * 3. Sort alphabetically
   * 4. Create "All" button (always first, active by default)
   * 5. Create individual keyword buttons
   */
  function buildFilters() {
    if (!window.APP_DATA) return;
    
    const projects = window.APP_DATA.projects || [];
    const page = window.APP_DATA.projectsPage || {};
    
    // Collect all unique keywords across all projects
    const keywordSet = new Set();
    projects.forEach(p => (p.keywords || []).forEach(kw => keywordSet.add(kw)));
    const allKeywords = Array.from(keywordSet).sort();

    const filterBar = document.getElementById('filterBar');
    if (!filterBar) return;
    filterBar.innerHTML = '';

    // ── "All" button (shows all projects) ──────────────────
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-tag filter-tag--active';
    allBtn.setAttribute('data-filter', 'all');
    allBtn.textContent = page.filterAll || 'All';
    allBtn.addEventListener('click', () => handleFilter('all', allBtn));
    filterBar.appendChild(allBtn);

    // ── Individual keyword buttons ─────────────────────────
    allKeywords.forEach(kw => {
      const btn = document.createElement('button');
      btn.className = 'filter-tag';
      btn.setAttribute('data-filter', kw);
      btn.textContent = kw;
      btn.addEventListener('click', () => handleFilter(kw, btn));
      filterBar.appendChild(btn);
    });
  }


  // =========================================================================
  // 6. FILTER HANDLER — Toggle filter state and re-render
  // =========================================================================
  
  /**
   * Handles filter button clicks with multi-select toggle logic.
   * 
   * Behavior:
   * - Clicking "All": Resets to show all projects
   * - Clicking a keyword: Toggles that keyword on/off
   * - If all keywords are deselected: Automatically reverts to "All"
   * - Multiple keywords can be active simultaneously (OR logic)
   * 
   * @param {string} value - The filter value ('all' or a keyword)
   * @param {HTMLElement} btn - The clicked button element
   */
  function handleFilter(value, btn) {
    if (value === 'all') {
      // Reset to show all projects
      activeFilters = new Set(['all']);
    } else {
      // Remove 'all' when specific filters are selected
      activeFilters.delete('all');
      
      // Toggle the clicked keyword
      if (activeFilters.has(value)) {
        activeFilters.delete(value); // Remove if already active
      } else {
        activeFilters.add(value);    // Add if not active
      }
      
      // If nothing is selected, revert to 'all'
      if (activeFilters.size === 0) {
        activeFilters = new Set(['all']);
      }
    }

    // Update visual state of all filter buttons
    document.querySelectorAll('.filter-tag').forEach(tag => {
      if (activeFilters.has(tag.getAttribute('data-filter'))) {
        tag.classList.add('filter-tag--active');
      } else {
        tag.classList.remove('filter-tag--active');
      }
    });

    // Re-render the projects grid with new filter state
    renderProjects();
  }


  // =========================================================================
  // 7. EVENT LISTENERS & INITIALIZATION
  // =========================================================================
  
  // Listen for the 'appDataReady' event (dispatched by loader.js after data loads)
  window.addEventListener('appDataReady', () => {
    buildFilters();
    renderProjects();
  });

  // If data is already loaded when this script runs, initialize immediately
  if (window.APP_DATA) {
    buildFilters();
    renderProjects();
  }

  // Expose renderProjects globally so loader.js can call it on language switch
  window.renderProjects = renderProjects;

})();