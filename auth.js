// Authentication Module for Firki Gmail Extension
// Handles Gmail authentication and user management

(function() {
  'use strict';

  // Authentication Configuration
  const AUTH_CONFIG = {
    LOGIN_PROMPT_TIMEOUT: 15000,
    BADGE_COLOR_AUTHENTICATED: '#34a853',
    BADGE_COLOR_NOT_AUTHENTICATED: '#ffffff',
    BADGE_TEXT_AUTHENTICATED: '✓',
    BADGE_TEXT_NOT_AUTHENTICATED: ''
  };

  // Cached DOM queries for better performance
  let cachedUserElements = null;
  let lastUserCheck = 0;
  const USER_CHECK_THROTTLE = 5000; // Only check every 5 seconds

  // Check Gmail authentication status with caching
  async function checkGmailAuth() {
    try {
      const now = Date.now();
      if (now - lastUserCheck < USER_CHECK_THROTTLE) {
        // Return cached result if checked recently
        return cachedUserElements || { isAuthenticated: false, user: null };
      }
      
      lastUserCheck = now;
      
      // Check if user is logged into Gmail
      const gmailUser = getGmailUser();
      
      if (gmailUser) {
        console.log('✅ Gmail user authenticated:', gmailUser);
        cachedUserElements = { isAuthenticated: true, user: gmailUser };
        return cachedUserElements;
      } else {
        console.log('❌ No Gmail user found');
        cachedUserElements = { isAuthenticated: false, user: null };
        return cachedUserElements;
      }
    } catch (error) {
      console.error('❌ Gmail auth check failed:', error);
      return { isAuthenticated: false, user: null };
    }
  }

  // Get Gmail user information with optimized selectors
  function getGmailUser() {
    try {
      // Use more specific selectors to reduce DOM queries
      const selectors = [
        '[data-email]',
        '[aria-label*="Account"]',
        '[aria-label*="Google Account"]',
        '.gb_d',
        '.gb_e'
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          const email = element.getAttribute('data-email') || 
                       element.getAttribute('aria-label') ||
                       element.textContent;
          
          if (email && email.includes('@')) {
            return email.trim();
          }
        }
      }
      
      // Fallback: check for user avatar or account button
      const avatarElements = document.querySelectorAll('[aria-label*="Account"], [aria-label*="Google Account"]');
      for (const element of avatarElements) {
        const label = element.getAttribute('aria-label');
        if (label && label.includes('@')) {
          const email = label.split(' ').find(word => word.includes('@'));
          if (email) {
            return email;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting Gmail user:', error);
      return null;
    }
  }

  // Show Gmail login prompt
  function showGmailLoginPrompt() {
    // Remove existing prompt to avoid duplicates
    const existingPrompt = document.getElementById('firki-gmail-login-prompt');
    if (existingPrompt) {
      existingPrompt.remove();
    }

    // Create login prompt
    const prompt = document.createElement('div');
    prompt.id = 'firki-gmail-login-prompt';
    prompt.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 2px solid #4f46e5;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      max-width: 400px;
      text-align: center;
      font-family: 'Google Sans', Roboto, Arial, sans-serif;
    `;

    prompt.innerHTML = `
      <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 18px;">Sign in to Gmail</h3>
      <p style="margin: 0 0 20px 0; color: #64748b; font-size: 14px; line-height: 1.5;">
        To use Firki, please sign in to your Gmail account first.
      </p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="firki-signin-gmail" style="
          background: #4f46e5;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        ">Sign in with Gmail</button>
        <button id="firki-close-prompt" style="
          background: transparent;
          color: #64748b;
          border: 1px solid #d1d5db;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
        ">Close</button>
      </div>
    `;

    document.body.appendChild(prompt);

    // Add event listeners
    document.getElementById('firki-signin-gmail').addEventListener('click', () => {
      // Redirect to Gmail sign in
      window.open('https://accounts.google.com/signin', '_blank');
      prompt.remove();
    });

    document.getElementById('firki-close-prompt').addEventListener('click', () => {
      prompt.remove();
    });

    // Auto-remove after timeout
    setTimeout(() => {
      if (prompt.parentNode) {
        prompt.remove();
      }
    }, AUTH_CONFIG.LOGIN_PROMPT_TIMEOUT);

    return prompt;
  }

  // Handle logout
  async function handleLogout() {
    try {
      // Clear cached data
      cachedUserElements = null;
      lastUserCheck = 0;
      
      // Clear storage
      if (chrome.storage && chrome.storage.local) {
        await chrome.storage.local.remove(['isLoggedIn', 'username']);
      }
      
      // Update badge
      updateExtensionBadge(false);
      
      console.log('✅ User logged out successfully');
      return true;
    } catch (error) {
      console.error('❌ Logout failed:', error);
      return false;
    }
  }

  // Update extension badge
  function updateExtensionBadge(isLoggedIn) {
    try {
      if (chrome.action && chrome.action.setBadgeText) {
        chrome.action.setBadgeText({
          text: isLoggedIn ? AUTH_CONFIG.BADGE_TEXT_AUTHENTICATED : AUTH_CONFIG.BADGE_TEXT_NOT_AUTHENTICATED
        });
        chrome.action.setBadgeBackgroundColor({
          color: isLoggedIn ? AUTH_CONFIG.BADGE_COLOR_AUTHENTICATED : AUTH_CONFIG.BADGE_COLOR_NOT_AUTHENTICATED
        });
      }
    } catch (error) {
      console.error('Error updating badge:', error);
    }
  }

  // Get current authentication status
  async function getAuthStatus() {
    return await checkGmailAuth();
  }

  // Export functions for use in other scripts
  window.FirkiAuth = {
    checkGmailAuth,
    showGmailLoginPrompt,
    handleLogout,
    updateExtensionBadge,
    getAuthStatus
  };

  // Initialize
  console.log('✅ FirkiAuth module loaded');
})(); 