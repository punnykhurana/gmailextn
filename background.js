// Background service worker for Firki Gmail Extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Firki Gmail Extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('mail.google.com')) {
    // Open popup
    chrome.action.setPopup({ popup: 'popup.html' });
  }
});

// Authentication state
let authState = {
  isAuthenticated: false,
  userInfo: null
};

// Listen for messages from content script
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

function handleCheckAuthStatus(sendResponse) {
  console.log('🔍 Background: Checking auth status...');
  
  // For now, return basic status
  // In a real implementation, you would check actual Gmail authentication
  sendResponse({ 
    isAuthenticated: authState.isAuthenticated, 
    userInfo: authState.userInfo 
  });
} 