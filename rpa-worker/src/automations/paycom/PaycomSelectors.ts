/**
 * Paycom UI Selectors
 * 
 * IMPORTANT: These selectors are based on Paycom's current UI structure
 * and may need to be updated if Paycom changes their interface.
 * 
 * To update selectors:
 * 1. Open Paycom in a browser
 * 2. Use browser DevTools to inspect elements
 * 3. Update the selectors below
 * 4. Test with a staging account before deploying
 * 
 * Last Updated: 2025-11-05
 * Paycom Version: Unknown (update after verification)
 */

export const PaycomSelectors = {
  // Login page selectors
  login: {
    usernameInput: 'input[name="username"], input[id="username"], input[type="text"]',
    passwordInput: 'input[name="password"], input[id="password"], input[type="password"]',
    loginButton: 'button[type="submit"], input[type="submit"], button:has-text("Log In")',
    errorMessage: '.error-message, .alert-danger, [role="alert"]'
  },

  // Dashboard selectors
  dashboard: {
    mainContainer: '#dashboard, .dashboard-container, [data-testid="dashboard"]',
    userMenu: '.user-menu, #user-menu, [data-testid="user-menu"]',
    logoutButton: 'a:has-text("Logout"), button:has-text("Logout")'
  },

  // Navigation selectors
  navigation: {
    employeesMenu: 'a:has-text("Employees"), [href*="employees"], #employees-menu',
    onboardingMenu: 'a:has-text("Onboarding"), [href*="onboarding"]',
    reportsMenu: 'a:has-text("Reports"), [href*="reports"]'
  },

  // Employee search and profile
  employees: {
    searchInput: 'input[placeholder*="Search"], input[name="search"], #employee-search',
    searchButton: 'button:has-text("Search"), button[type="submit"]',
    searchResults: '.search-results, #search-results, [data-testid="search-results"]',
    firstResult: '.search-results > :first-child, .employee-row:first-child',
    profileContainer: '.employee-profile, #employee-profile, [data-testid="employee-profile"]',
    onboardingTab: 'a:has-text("Onboarding"), button:has-text("Onboarding"), [data-tab="onboarding"]'
  },

  // I-9 section selectors
  i9: {
    container: '.i9-container, #i9-section, [data-section="i9"]',
    documentsSection: '.i9-documents, #i9-documents, a:has-text("I-9 Documents")',
    uploadButton: 'button:has-text("Upload"), button:has-text("Add Document"), [data-action="upload"]',
    fileInput: 'input[type="file"]',
    idFileInput: 'input[type="file"][accept*="pdf"], input[type="file"][accept*="image"]',
    addIdDocumentButton: 'button:has-text("Add ID"), button:has-text("Upload ID")',
    uploadSuccess: '.upload-success, .success-message, [data-status="success"]',
    uploadedDocumentIndicator: '.document-uploaded, .file-uploaded, [data-uploaded="true"]',
    documentList: '.document-list > *, .uploaded-documents > *, [data-testid="document-item"]',
    saveButton: 'button:has-text("Save"), button[type="submit"]',
    cancelButton: 'button:has-text("Cancel")'
  },

  // Form fields (if needed for data entry)
  forms: {
    textInput: 'input[type="text"]',
    dateInput: 'input[type="date"], input[placeholder*="Date"]',
    selectDropdown: 'select',
    checkbox: 'input[type="checkbox"]',
    radioButton: 'input[type="radio"]',
    submitButton: 'button[type="submit"], input[type="submit"]'
  },

  // Common UI elements
  common: {
    loadingSpinner: '.loading, .spinner, [data-loading="true"]',
    errorMessage: '.error, .alert-danger, [role="alert"]',
    successMessage: '.success, .alert-success',
    modal: '.modal, [role="dialog"]',
    modalClose: '.modal-close, button:has-text("Close")',
    confirmButton: 'button:has-text("Confirm"), button:has-text("Yes")',
    cancelButton: 'button:has-text("Cancel"), button:has-text("No")'
  }
};

/**
 * Helper function to get selector with fallbacks
 * Tries multiple selectors in order until one is found
 */
export function getSelectorWithFallback(selectors: string): string {
  return selectors;
}

/**
 * Selector update log
 * Keep track of when selectors were last verified/updated
 */
export const SelectorUpdateLog = {
  lastVerified: '2025-11-05',
  verifiedBy: 'Initial Setup',
  notes: [
    'Selectors are placeholders and need to be verified against actual Paycom UI',
    'Use browser DevTools to inspect actual elements',
    'Test in staging environment before production use',
    'Consider using data-testid attributes if Paycom provides them'
  ],
  knownIssues: [
    'Selectors have not been verified against live Paycom instance',
    'May need to handle dynamic class names or IDs',
    'MFA/2FA handling not implemented'
  ]
};
