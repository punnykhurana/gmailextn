// Background service worker for Firki Gmail Extension

// Check if Chrome extension APIs are available
if (typeof chrome !== 'undefined' && chrome.runtime) {
  // Handle extension installation
  if (chrome.runtime.onInstalled) {
    chrome.runtime.onInstalled.addListener(() => {
      console.log('Firki Gmail Extension installed');
    });
  }

  // Handle extension icon click
  if (chrome.action && chrome.action.onClicked) {
    chrome.action.onClicked.addListener((tab) => {
      if (tab.url && tab.url.includes('mail.google.com')) {
        // Open popup
        if (chrome.action.setPopup) {
          chrome.action.setPopup({ popup: 'popup.html' });
        }
      }
    });
  }

  // Listen for messages from content script
  if (chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Background received message:', request.action);
      
      switch (request.action) {
        case 'checkAuthStatus':
          handleCheckAuthStatus(sendResponse);
          return true; // Keep message channel open for async response
          
        case 'extractJD':
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ error: 'Unknown action' });
      }
    });
  }
} else {
  console.warn('Chrome extension APIs not available in background script');
}

// Authentication state
let authState = {
  isAuthenticated: false,
  userInfo: null
};

function handleCheckAuthStatus(sendResponse) {
  console.log('🔍 Background: Checking auth status...');
  
  // For now, return basic status
  // In a real implementation, you would check actual Gmail authentication
  sendResponse({ 
    isAuthenticated: authState.isAuthenticated, 
    userInfo: authState.userInfo 
  });
} 