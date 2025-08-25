// Firki Extension Configuration
// IMPORTANT: Replace the placeholder API keys below with your actual keys
// Get your API keys from:
// - Gemini: https://makersuite.google.com/app/apikey
// - OpenAI: https://platform.openai.com/api-keys

const FIRKI_CONFIG = {
    // API Keys - Replace these with your actual API keys
    GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE', // Replace with your actual Gemini API key
    OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE', // Replace with your actual OpenAI API key
    
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