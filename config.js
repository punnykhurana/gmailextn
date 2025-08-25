// Firki Extension Configuration
const FIRKI_CONFIG = {
    // API Keys - Set these manually or use a different approach for browser
    GEMINI_API_KEY: 'your_gemini_api_key_here',
    OPENAI_API_KEY: 'your_openai_api_key_here',
    
    // AI Models
    GEMINI_MODEL: 'gemini-2.2.5-flash-preview-05-20',
    OPENAI_MODEL: 'gpt-3.5-turbo',
    
    // Backend Configuration - UPDATED WITH ACTUAL RAILWAY URL
    BACKEND_ENABLED: true,
    BACKEND_BASE_URL: 'https://gmailextn-production.up.railway.app',
    BACKEND_TIMEOUT: 10000,
    BACKEND_FALLBACK: true,
    
    // Analytics Configuration - DISABLED TO PREVENT FETCH ERRORS
    ANALYTICS_ENABLED: false, // Set to false to disable analytics completely
    ANALYTICS_ENDPOINT: 'https://gmailextn-production.up.railway.app/analytics',
    
    // Feature Flags
    FEATURES: {
        AI_ANALYSIS: true,
        BOOLEAN_SEARCH: true,
        SKILL_EXTRACTION: true,
        CONTEXT_HELPER: true,
        ANALYTICS: false // Also disable analytics feature
    },
    
    // UI Configuration
    UI: {
        BUTTON_STYLE: 'modern',
        ANIMATIONS: true,
        SOUND_EFFECTS: false
    },
    
    // LinkedIn Integration
    LINKEDIN: {
        ENABLED: false,
        CONTACT_API_KEY: 'your_contact_api_key_here'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FIRKI_CONFIG;
} else {
    window.FIRKI_CONFIG = FIRKI_CONFIG;
} 