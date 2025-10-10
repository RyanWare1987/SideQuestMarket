/**
 * Contact Form Module
 * Handles form validation, submission, and user feedback
 * 
 * Contact form integrated with Formspree for email delivery.
 * Form submissions are sent to thesidequestmarket@gmail.com via Formspree.
 */

class ContactForm {
  constructor() {
    this.form = document.querySelector('.contact-form');
    this.nameInput = document.getElementById('contact-name');
    this.emailInput = document.getElementById('contact-email');
    this.messageInput = document.getElementById('contact-message');
    this.submitBtn = document.querySelector('.form-submit-btn');
    this.statusDiv = document.querySelector('.form-status');

    // Form configuration (using Formspree for email delivery)

    this.validationRules = {
      name: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s'-]+$/
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      message: {
        required: true,
        minLength: 10,
        maxLength: 1000
      }
    };

    this.init();
  }

  init() {
    if (!this.form) return;

    this.initializeEmailJS();
    this.bindEvents();
    this.setupAccessibility();
  }

  initializeEmailJS() {
    // Initialize EmailJS when the library is loaded
    if (typeof emailjs !== 'undefined') {
      emailjs.init(this.emailJSConfig.userID);
    } else {
      // If EmailJS isn't loaded yet, wait for it
      const checkEmailJS = () => {
        if (typeof emailjs !== 'undefined') {
          emailjs.init(this.emailJSConfig.userID);
        } else {
          setTimeout(checkEmailJS, 100);
        }
      };
      checkEmailJS();
    }
  }

  bindEvents() {
    // Real-time validation on input
    this.nameInput.addEventListener('input', () => this.validateField('name'));
    this.nameInput.addEventListener('blur', () => this.validateField('name'));

    this.emailInput.addEventListener('input', () => this.validateField('email'));
    this.emailInput.addEventListener('blur', () => this.validateField('email'));

    this.messageInput.addEventListener('input', () => this.validateField('message'));
    this.messageInput.addEventListener('blur', () => this.validateField('message'));

    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Prevent form submission on Enter in text inputs (but allow in textarea)
    this.nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.emailInput.focus();
      }
    });

    this.emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.messageInput.focus();
      }
    });

    // Network status monitoring
    window.addEventListener('online', () => {
      if (this.statusDiv.textContent.includes('internet connection')) {
        this.clearStatus();
      }
    });

    window.addEventListener('offline', () => {
      if (this.submitBtn.disabled && this.submitBtn.classList.contains('loading')) {
        this.setLoadingState(false);
        this.showStatus('No internet connection. Please check your connection and try again.', 'error');
      }
    });
  }

  setupAccessibility() {
    // Ensure proper ARIA attributes are set
    this.nameInput.setAttribute('aria-required', 'true');
    this.emailInput.setAttribute('aria-required', 'true');
    this.messageInput.setAttribute('aria-required', 'true');

    // Set up error message associations (preserve existing describedby)
    const nameDescribedBy = this.nameInput.getAttribute('aria-describedby') || 'name-error';
    const emailDescribedBy = this.emailInput.getAttribute('aria-describedby') || 'email-error';
    const messageDescribedBy = this.messageInput.getAttribute('aria-describedby') || 'message-error';

    this.nameInput.setAttribute('aria-describedby', nameDescribedBy);
    this.emailInput.setAttribute('aria-describedby', emailDescribedBy);
    this.messageInput.setAttribute('aria-describedby', messageDescribedBy);

    // Announce form purpose to screen readers
    if (window.keyboardNavigation) {
      window.keyboardNavigation.announceToScreenReader('Contact form loaded. All fields are required.', 'polite');
    }
  }

  validateField(fieldName) {
    const input = this[`${fieldName}Input`];
    const value = input.value.trim();
    const rules = this.validationRules[fieldName];
    const errorElement = document.getElementById(`${fieldName}-error`);
    const formGroup = input.closest('.form-group');

    let isValid = true;
    let errorMessage = '';

    // Required validation
    if (rules.required && !value) {
      isValid = false;
      errorMessage = `${this.capitalizeFirst(fieldName)} is required.`;
    }
    // Length validation
    else if (value && rules.minLength && value.length < rules.minLength) {
      isValid = false;
      errorMessage = `${this.capitalizeFirst(fieldName)} must be at least ${rules.minLength} characters.`;
    }
    else if (value && rules.maxLength && value.length > rules.maxLength) {
      isValid = false;
      errorMessage = `${this.capitalizeFirst(fieldName)} must not exceed ${rules.maxLength} characters.`;
    }
    // Pattern validation
    else if (value && rules.pattern && !rules.pattern.test(value)) {
      isValid = false;
      if (fieldName === 'email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (fieldName === 'name') {
        errorMessage = 'Name can only contain letters, spaces, hyphens, and apostrophes.';
      }
    }

    // Update UI based on validation result
    this.updateFieldUI(input, formGroup, errorElement, isValid, errorMessage);

    // Update form submission state
    this.updateSubmitButton();

    return isValid;
  }

  updateFieldUI(input, formGroup, errorElement, isValid, errorMessage) {
    // Remove existing classes
    input.classList.remove('error', 'success');
    formGroup.classList.remove('has-error', 'has-success');

    if (input.value.trim()) {
      if (isValid) {
        input.classList.add('success');
        formGroup.classList.add('has-success');
        errorElement.textContent = '';
        input.setAttribute('aria-invalid', 'false');

        // Announce success to screen readers
        if (window.keyboardNavigation) {
          const fieldName = input.name || input.id.replace('contact-', '');
          window.keyboardNavigation.announceToScreenReader(`${fieldName} is valid`, 'polite');
        }
      } else {
        input.classList.add('error');
        formGroup.classList.add('has-error');
        errorElement.textContent = errorMessage;
        input.setAttribute('aria-invalid', 'true');

        // Announce error to screen readers
        if (window.keyboardNavigation) {
          window.keyboardNavigation.announceToScreenReader(`Error: ${errorMessage}`, 'assertive');
        }
      }
    } else {
      // Field is empty - remove validation classes but keep error if it was focused and left empty
      errorElement.textContent = errorMessage;
      if (errorMessage) {
        input.classList.add('error');
        formGroup.classList.add('has-error');
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.setAttribute('aria-invalid', 'false');
      }
    }
  }

  validateForm() {
    const nameValid = this.validateField('name');
    const emailValid = this.validateField('email');
    const messageValid = this.validateField('message');

    return nameValid && emailValid && messageValid;
  }

  updateSubmitButton() {
    const isFormValid = this.isFormValid();
    this.submitBtn.disabled = !isFormValid;

    if (isFormValid) {
      this.submitBtn.setAttribute('aria-describedby', '');
    } else {
      this.submitBtn.setAttribute('aria-describedby', 'form-validation-message');
    }
  }

  isFormValid() {
    const nameValue = this.nameInput.value.trim();
    const emailValue = this.emailInput.value.trim();
    const messageValue = this.messageInput.value.trim();

    const nameValid = nameValue &&
      nameValue.length >= this.validationRules.name.minLength &&
      nameValue.length <= this.validationRules.name.maxLength &&
      this.validationRules.name.pattern.test(nameValue);

    const emailValid = emailValue &&
      this.validationRules.email.pattern.test(emailValue);

    const messageValid = messageValue &&
      messageValue.length >= this.validationRules.message.minLength &&
      messageValue.length <= this.validationRules.message.maxLength;

    return nameValid && emailValid && messageValid;
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Clear any existing status messages
    this.clearStatus();

    // Validate entire form
    if (!this.validateForm()) {
      this.showStatus('Please correct the errors above before submitting.', 'error');

      // Focus on first invalid field
      const firstError = this.form.querySelector('.error');
      if (firstError) {
        firstError.focus();
      }
      return;
    }

    // Show loading state
    this.setLoadingState(true);
    this.showStatus('Sending your message...', 'loading');

    // Submit form via Formspree
    try {
      await this.submitViaFormspree();
    } catch (error) {
      console.error('Form submission failed:', error);
      this.handleSubmissionError(error);
    }
  }

  async submitViaFormspree() {
    // Create FormData object from the form
    const formData = new FormData(this.form);

    // Submit to Formspree
    const response = await fetch(this.form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    // Handle successful submission
    if (response.ok) {
      this.setLoadingState(false);
      this.showStatus('Thank you for your message! We\'ll get back to you soon.', 'success');
      this.resetForm();

      // Log success for development
      console.log('Email sent successfully via Formspree');
      return; // Exit successfully
    } else {
      // Handle error response
      let errorMessage = 'Failed to send email';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (jsonError) {
        // If response isn't JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
  }

  handleSubmissionError(error) {
    this.setLoadingState(false);

    let errorMessage = 'Sorry, there was a problem sending your message. ';

    // Handle specific error types
    if (error.message.includes('EmailJS service is not available')) {
      errorMessage += 'The email service is temporarily unavailable.';
    } else if (error.status === 400) {
      errorMessage += 'Please check your information and try again.';
    } else if (error.status === 403) {
      errorMessage += 'Service access denied. Please contact us directly.';
    } else if (error.status >= 500) {
      errorMessage += 'Server error. Please try again in a few minutes.';
    } else if (!navigator.onLine) {
      errorMessage += 'Please check your internet connection and try again.';
    } else {
      errorMessage += 'Please try again or contact us directly.';
    }

    this.showStatus(errorMessage, 'error');

    // Add retry button for network errors
    if (!navigator.onLine || error.status >= 500) {
      this.addRetryButton();
    } else {
      // Add fallback contact information for persistent errors
      this.addFallbackContact();
    }

    // Log error for development
    console.error('Form submission error:', error);
  }

  addRetryButton() {
    // Check if retry button already exists
    if (this.form.querySelector('.retry-button')) return;

    const retryButton = document.createElement('button');
    retryButton.type = 'button';
    retryButton.className = 'retry-button';
    retryButton.textContent = 'Try Again';
    retryButton.style.cssText = `
      margin-top: var(--space-3);
      padding: var(--space-2) var(--space-4);
      background-color: var(--color-primary-purple);
      color: var(--color-pure-white);
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    `;

    retryButton.addEventListener('click', () => {
      retryButton.remove();
      this.clearStatus();

      // Retry form submission
      const formData = {
        name: this.nameInput.value.trim(),
        email: this.emailInput.value.trim(),
        message: this.messageInput.value.trim(),
        timestamp: new Date().toISOString(),
        source: 'website'
      };

      this.setLoadingState(true);
      this.showStatus('Sending your message...', 'loading');
      this.submitViaEmailJS(formData);
    });

    this.statusDiv.appendChild(retryButton);
  }

  addFallbackContact() {
    // Check if fallback info already exists
    if (this.form.querySelector('.fallback-contact')) return;

    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'fallback-contact';
    fallbackDiv.style.cssText = `
      margin-top: var(--space-3);
      padding: var(--space-3);
      background-color: rgba(107, 70, 193, 0.05);
      border-radius: var(--radius-md);
      border-left: 4px solid var(--color-primary-purple);
      font-size: var(--font-size-sm);
      line-height: var(--line-height-relaxed);
    `;

    fallbackDiv.innerHTML = `
      <strong>Alternative Contact:</strong><br>
      You can also reach us directly at:<br>
      <a href="mailto:info@sidequestmarket.com" style="color: var(--color-primary-purple); text-decoration: none;">
        info@sidequestmarket.com
      </a>
    `;

    this.statusDiv.appendChild(fallbackDiv);
  }

  setLoadingState(isLoading) {
    this.submitBtn.disabled = isLoading;

    if (isLoading) {
      this.submitBtn.classList.add('loading');
      this.submitBtn.textContent = 'Sending...';
      this.submitBtn.setAttribute('aria-label', 'Sending message, please wait');
    } else {
      this.submitBtn.classList.remove('loading');
      this.submitBtn.textContent = 'Send Message';
      this.submitBtn.setAttribute('aria-label', 'Send message');
    }
  }

  showStatus(message, type) {
    this.statusDiv.textContent = message;
    this.statusDiv.className = `form-status ${type}`;

    // Set appropriate ARIA attributes
    if (type === 'error') {
      this.statusDiv.setAttribute('role', 'alert');
    } else {
      this.statusDiv.setAttribute('role', 'status');
    }

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        this.clearStatus();
      }, 5000);
    }
  }

  clearStatus() {
    this.statusDiv.textContent = '';
    this.statusDiv.className = 'form-status';
    this.statusDiv.removeAttribute('role');
  }

  resetForm() {
    this.form.reset();

    // Clear all validation states
    const inputs = [this.nameInput, this.emailInput, this.messageInput];
    inputs.forEach(input => {
      input.classList.remove('error', 'success');
      input.setAttribute('aria-invalid', 'false');

      const formGroup = input.closest('.form-group');
      formGroup.classList.remove('has-error', 'has-success');

      const errorElement = input.getAttribute('aria-describedby');
      if (errorElement) {
        // Handle multiple IDs in aria-describedby
        const errorIds = errorElement.split(' ');
        errorIds.forEach(id => {
          const element = document.getElementById(id);
          if (element) {
            element.textContent = '';
          }
        });
      }
    });

    this.updateSubmitButton();
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Initialize contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ContactForm();
});