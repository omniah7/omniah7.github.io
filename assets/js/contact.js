/* ============================================================
   contact.js — Contact Page Renderer & Email Handler
   
   Responsibilities:
   - Renders all contact page text from APP_DATA.contactPage
   - Initializes EmailJS for form submission
   - Handles form validation and submission
   - Provides user feedback (loading, success, error states)
   - Supports language switching via re-rendering
   - Reacts to 'appDataReady' event for initial load
   ============================================================ */

/**
 * Main render function for the Contact page.
 * Extracts data from window.APP_DATA.contactPage and populates all elements.
 * Also initializes the form submission handler with EmailJS.
 * Called on initial page load and whenever the language is switched.
 */
function renderContact() {
  // =========================================================================
  // 1. SAFETY CHECK — Ensure data is available
  // =========================================================================
  if (!window.APP_DATA) return;
  
  const c = window.APP_DATA.contactPage;
  if (!c) return; // Exit if contact page data is missing


  // =========================================================================
  // 2. HELPER FUNCTIONS — Safe DOM manipulation
  // =========================================================================
  
  /**
   * Safely sets text content of an element by ID.
   * Prevents errors if the element doesn't exist (e.g., during development).
   * 
   * @param {string} id - The DOM element ID
   * @param {string} text - The text content to set
   */
  const setElementText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  /**
   * Safely sets placeholder attribute of an input element by ID.
   * Prevents errors if the element doesn't exist.
   * 
   * @param {string} id - The DOM element ID
   * @param {string} placeholder - The placeholder text to set
   */
  const setElementPlaceholder = (id, placeholder) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = placeholder;
  };


  // =========================================================================
  // 3. PAGE HEADER — Heading and subtitle
  // =========================================================================
  
  setElementText('contactHeading', c.heading);
  setElementText('contactSubtitle', c.subtitle);


  // =========================================================================
  // 4. CONTACT FORM — Labels and placeholders
  // =========================================================================
  
  // Form field labels
  setElementText('nameLabel', c.form.nameLabel);
  setElementText('emailLabel', c.form.emailLabel);
  setElementText('subjectLabel', c.form.subjectLabel);
  setElementText('messageLabel', c.form.messageLabel);

  // Form field placeholders (greyed-out example text inside inputs)
  setElementPlaceholder('name', c.form.namePlaceholder);
  setElementPlaceholder('email', c.form.emailPlaceholder);
  setElementPlaceholder('subject', c.form.subjectPlaceholder);
  setElementPlaceholder('message', c.form.messagePlaceholder);

  // Submit button text
  setElementText('submitBtn', c.form.submitBtn);


  // =========================================================================
  // 5. CONTACT LINKS — Display text and button labels
  // =========================================================================
  
  setElementText('emailDisplay', c.links.email);
  setElementText('emailBtn', c.links.emailBtn);
  setElementText('githubDisplay', c.links.github);
  setElementText('githubBtn', c.links.githubBtn);
  setElementText('linkedinDisplay', c.links.linkedin);
  setElementText('linkedinBtn', c.links.linkedinBtn);
  setElementText('locationDisplay', c.links.location);


  // =========================================================================
  // 6. EMAILJS INITIALIZATION — Set up email service
  // =========================================================================
  
  /**
   * Initialize EmailJS with your Public Key.
   * 
   * IMPORTANT: Replace "z0JMdLNKZzqKROsaB" with your actual key from:
   * EmailJS Dashboard → Account → API Keys → Public Key
   * 
   * The public key is safe to expose in client-side code.
   * The private key should NEVER be used here — keep it server-side only.
   */
  emailjs.init("z0JMdLNKZzqKROsaB");


  // =========================================================================
  // 7. FORM SUBMISSION HANDLER — Send email via EmailJS
  // =========================================================================
  
  /**
   * Attaches a submit event listener to the contact form.
   * Handles the complete submission lifecycle:
   * 1. Prevents default form submission (no page reload)
   * 2. Disables the submit button to prevent double-clicks
   * 3. Shows loading feedback to the user
   * 4. Sends form data via EmailJS
   * 5. Shows success or error feedback
   * 6. Re-enables the submit button
   * 7. Auto-clears feedback message after 5 seconds
   */
  document.getElementById('contactForm')?.addEventListener('submit', function (e) {
    // Prevent the browser's default form submission (page reload)
    e.preventDefault();

    // Get DOM elements for feedback and button state
    const feedback = document.getElementById('formFeedback');
    const submitBtn = document.getElementById('submitBtn');
    
    // Detect current language for bilingual feedback messages
    const lang = window.currentLang || 'en';

    // ── Disable button to prevent duplicate submissions ──
    if (submitBtn) submitBtn.disabled = true;

    // ── Show loading indicator ───────────────────────────
    if (feedback) {
      feedback.textContent = lang === 'ar' ? 'جاري الإرسال...' : 'Sending...';
      feedback.className = 'form-feedback form-feedback--loading';
    }

    /**
     * Send form data using EmailJS.
     * 
     * IMPORTANT: Replace these values with your actual credentials:
     * - service_8ix9txc: From EmailJS Dashboard → Email Services
     * - template_jtlfoym: From EmailJS Dashboard → Email Templates
     * 
     * The 'this' keyword refers to the form element itself,
     * which EmailJS uses to extract all form field values automatically.
     */
    emailjs.sendForm('service_8ix9txc', 'template_jtlfoym', this)
      .then(() => {
        // ── Success: Show confirmation message ────────────
        if (feedback) {
          // Get localized success message from the data attribute
          const msg = feedback.getAttribute('data-feedback') || 'Message sent!';
          feedback.textContent = msg;
          feedback.className = 'form-feedback form-feedback--success';
        }
        // Clear all form fields after successful submission
        this.reset();
      })
      .catch((error) => {
        // ── Error: Show failure message ───────────────────
        console.error('EmailJS Delivery Exception Fail:', error);
        if (feedback) {
          feedback.textContent = lang === 'ar'
            ? 'عذرًا، فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.'
            : 'Failed to send message. Please try again directly.';
          feedback.className = 'form-feedback form-feedback--error';
        }
      })
      .finally(() => {
        // ── Cleanup: Re-enable button regardless of outcome ──
        if (submitBtn) submitBtn.disabled = false;
        
        // Auto-clear feedback message after 5 seconds
        setTimeout(() => {
          if (feedback) feedback.textContent = '';
        }, 5000);
      });
  });
}


// =========================================================================
// 8. EVENT LISTENERS & INITIALIZATION
// =========================================================================

// Listen for the 'appDataReady' event (dispatched by loader.js after data loads)
window.addEventListener('appDataReady', renderContact);

// If data is already loaded when this script runs, render immediately
// (This handles cases where loader.js finishes before contact.js executes)
if (window.APP_DATA) renderContact();

// Expose renderContact globally so loader.js can call it on language switch
window.renderContact = renderContact;