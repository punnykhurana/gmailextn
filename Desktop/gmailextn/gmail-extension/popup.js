// Popup script for Firki Gmail Extension
// Shows authentication status and basic user info

(function() {
  'use strict';

  // DOM Elements
  const authStatus = document.getElementById('authStatus');
  const authStatusText = document.getElementById('authStatusText');
  const userEmail = document.getElementById('userEmail');
  const refreshAuthBtn = document.getElementById('refreshAuthBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const statusMessage = document.getElementById('statusMessage');
  
  // Backend DOM Elements
  const backendStatus = document.getElementById('backendStatus');
  const backendStatusText = document.getElementById('backendStatusText');
  const backendUrl = document.getElementById('backendUrl');
  const refreshBackendBtn = document.getElementById('refreshBackendBtn');
  const toggleBackendBtn = document.getElementById('toggleBackendBtn');

  // Initialize popup
  document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    checkBackendStatus();
    setupEventListeners();
  });

  // Check authentication status
  async function checkAuthStatus() {
    try {
      // Get stored auth data
      const authData = await chrome.storage.local.get(['isLoggedIn', 'username']);
      
      // Check current Gmail authentication
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      if (currentTab && currentTab.url && currentTab.url.includes('mail.google.com')) {
        // Inject script to check Gmail auth
        const results = await chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          function: checkGmailAuthInPage
        });
        
        if (results && results[0] && results[0].result) {
          const authResult = results[0].result;
          
          if (authResult.isAuthenticated) {
            showAuthenticatedState(authResult.user);
          } else {
            showNotAuthenticatedState();
          }
        } else {
          showNotAuthenticatedState();
        }
      } else {
        showNotAuthenticatedState();
      }
      
    } catch (error) {
      console.error('Error checking auth status:', error);
      showNotAuthenticatedState();
    }
  }

  // Function to check Gmail auth in the page context
  function checkGmailAuthInPage() {
    if (window.FirkiAuth && window.FirkiAuth.checkGmailAuth) {
      return window.FirkiAuth.checkGmailAuth();
    }
    return { isAuthenticated: false, user: null };
  }

  // Setup event listeners
  function setupEventListeners() {
    // Refresh auth status
    refreshAuthBtn.addEventListener('click', checkAuthStatus);
    
    // Logout button
    logoutBtn.addEventListener('click', handleLogout);
    
    // Backend buttons
    refreshBackendBtn.addEventListener('click', checkBackendStatus);
    toggleBackendBtn.addEventListener('click', toggleBackend);
  }

  // Show authenticated state
  function showAuthenticatedState(email) {
    authStatus.className = 'auth-status authenticated';
    authStatusText.textContent = 'Authenticated';
    userEmail.textContent = `Logged in as: ${email}`;
    userEmail.style.display = 'block';
    logoutBtn.style.display = 'block';
    
    // Update extension badge
    updateExtensionBadge(true);
  }

  // Show not authenticated state
  function showNotAuthenticatedState() {
    authStatus.className = 'auth-status not-authenticated';
    authStatusText.textContent = 'Not Authenticated';
    userEmail.style.display = 'none';
    logoutBtn.style.display = 'none';
    
    // Update extension badge
    updateExtensionBadge(false);
  }

  // Check backend status
  async function checkBackendStatus() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      if (currentTab && currentTab.url && currentTab.url.includes('mail.google.com')) {
        // Inject script to check backend status
        const results = await chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          function: checkBackendStatusInPage
        });
        
        if (results && results[0] && results[0].result) {
          const backendResult = results[0].result;
          
          if (backendResult.isAvailable) {
            showBackendAvailableState(backendResult);
          } else {
            showBackendUnavailableState();
          }
        } else {
          showBackendUnavailableState();
        }
      } else {
        showBackendUnavailableState();
      }
      
    } catch (error) {
      console.error('Error checking backend status:', error);
      showBackendUnavailableState();
    }
  }

  // Function to check backend status in the page context
  function checkBackendStatusInPage() {
    if (window.BackendConnector && window.BackendConnector.getStatus) {
      return window.BackendConnector.getStatus();
    }
    return { isAvailable: false, baseUrl: 'Not available' };
  }

  // Show backend available state
  function showBackendAvailableState(backendInfo) {
    backendStatus.className = 'auth-status authenticated';
    backendStatusText.textContent = 'Connected';
    backendUrl.textContent = `Backend: ${backendInfo.baseUrl}`;
    backendUrl.style.display = 'block';
    toggleBackendBtn.textContent = 'Disable Backend';
    toggleBackendBtn.style.display = 'block';
  }

  // Show backend unavailable state
  function showBackendUnavailableState() {
    backendStatus.className = 'auth-status not-authenticated';
    backendStatusText.textContent = 'Not Connected';
    backendUrl.textContent = 'Backend: Not available';
    backendUrl.style.display = 'block';
    toggleBackendBtn.textContent = 'Enable Backend';
    toggleBackendBtn.style.display = 'block';
  }

  // Toggle backend on/off
  async function toggleBackend() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      if (currentTab && currentTab.url && currentTab.url.includes('mail.google.com')) {
        // Inject script to toggle backend
        const results = await chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          function: toggleBackendInPage
        });
        
        if (results && results[0] && results[0].result) {
          showSuccess('Backend setting updated successfully');
          checkBackendStatus(); // Refresh status
        }
      }
    } catch (error) {
      console.error('Error toggling backend:', error);
      showError('Failed to update backend setting');
    }
  }

  // Function to toggle backend in the page context
  function toggleBackendInPage() {
    if (window.FIRKI_CONFIG) {
      window.FIRKI_CONFIG.BACKEND_ENABLED = !window.FIRKI_CONFIG.BACKEND_ENABLED;
      return { success: true, enabled: window.FIRKI_CONFIG.BACKEND_ENABLED };
    }
    return { success: false };
  }

  // Handle logout
  async function handleLogout() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      if (currentTab && currentTab.url && currentTab.url.includes('mail.google.com')) {
        // Inject script to handle logout
        await chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          function: handleLogoutInPage
        });
      }
      
      // Clear local storage
      await chrome.storage.local.remove(['isLoggedIn', 'username']);
      
      showNotAuthenticatedState();
      showSuccess('Successfully logged out');
      
    } catch (error) {
      console.error('Error during logout:', error);
      showError('Logout failed: ' + error.message);
    }
  }

  // Function to handle logout in the page context
  function handleLogoutInPage() {
    if (window.FirkiAuth && window.FirkiAuth.handleLogout) {
      return window.FirkiAuth.handleLogout();
    }
    return true;
  }

  // Show success message
  function showSuccess(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'status success';
    statusMessage.style.display = 'block';
    
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 3000);
  }

  // Show error message
  function showError(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'status error';
    statusMessage.style.display = 'block';
    
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 5000);
  }

  // Update extension badge
  function updateExtensionBadge(isLoggedIn) {
    if (chrome.action && chrome.action.setBadgeText) {
      if (isLoggedIn) {
        chrome.action.setBadgeText({ text: '✓' });
        chrome.action.setBadgeBackgroundColor({ color: '#34a853' });
      } else {
        chrome.action.setBadgeText({ text: '' });
      }
    }
  }
})(); 