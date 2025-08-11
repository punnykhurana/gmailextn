// Firki Extension Configuration
const FIRKI_CONFIG = {
    // API Keys
    GEMINI_API_KEY: 'your_gemini_api_key_here',
    OPENAI_API_KEY: 'your_openai_api_key_here',
    
    // AI Models
    GEMINI_MODEL: 'gemini-2.2.5-flash-preview-05-20',
    OPENAI_MODEL: 'gpt-3.5-turbo',
    
    // Backend Configuration
    BACKEND_ENABLED: true,
    BACKEND_BASE_URL: 'https://your-backend-url.railway.app', // Replace with your deployed backend URL
    BACKEND_TIMEOUT: 10000,
    BACKEND_FALLBACK: true,
    
    // Analytics Configuration
    ANALYTICS_ENABLED: true,
    ANALYTICS_ENDPOINT: 'https://your-backend-url.railway.app/analytics', // Replace with your deployed backend URL
    
    // Feature Flags
    FEATURES: {
        AI_ANALYSIS: true,
        BOOLEAN_SEARCH: true,
        SKILL_EXTRACTION: true,
        CONTEXT_HELPER: true,
        ANALYTICS: true
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