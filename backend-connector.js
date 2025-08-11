// Backend Connector for Firki Extension
// Handles communication with Python Flask backend
// Falls back to local logic if backend is unavailable

(function() {
  'use strict';

  // Backend API endpoints
  const BACKEND_ENDPOINTS = {
    ANALYZE_JD: '/api/analyze-jd',
    HEALTH_CHECK: '/health'
  };

  // Backend connector class
  class BackendConnector {
    constructor() {
      this.isAvailable = false;
      this.lastHealthCheck = 0;
      this.healthCheckInterval = 30000; // 30 seconds
      this.retryAttempts = 3;
      this.retryDelay = 1000; // 1 second
    }

    /**
     * Initialize backend connection
     */
    async initialize() {
      try {
        await this.checkHealth();
        console.log('✅ Backend connector initialized successfully');
      } catch (error) {
        console.warn('⚠️ Backend connector initialization failed, will use fallback:', error.message);
        this.isAvailable = false;
      }
    }

    /**
     * Check if backend is healthy and available
     */
    async checkHealth() {
      if (Date.now() - this.lastHealthCheck < this.healthCheckInterval) {
        return this.isAvailable;
      }

      try {
        const response = await this.makeRequest(BACKEND_ENDPOINTS.HEALTH_CHECK, 'GET');
        this.isAvailable = response && response.status === 'healthy';
        this.lastHealthCheck = Date.now();
        
        if (this.isAvailable) {
          console.log('✅ Backend is healthy and available');
        } else {
          console.warn('⚠️ Backend health check failed');
        }
        
        return this.isAvailable;
      } catch (error) {
        console.warn('⚠️ Backend health check failed:', error.message);
        this.isAvailable = false;
        this.lastHealthCheck = Date.now();
        return false;
      }
    }

    /**
     * Analyze job description using backend
     */
    async analyzeJobDescription(jobDescription, jobTitle = '') {
      if (!FIRKI_CONFIG.BACKEND_ENABLED) {
        throw new Error('Backend integration is disabled');
      }

      // Check health before making request
      await this.checkHealth();
      
      if (!this.isAvailable) {
        throw new Error('Backend is not available');
      }

      try {
        const payload = {
          job_description: jobDescription,
          job_title: jobTitle
        };

        const response = await this.makeRequest(BACKEND_ENDPOINTS.ANALYZE_JD, 'POST', payload);
        
        if (response && response.success) {
          console.log('✅ Backend analysis successful:', response);
          return this.transformBackendResponse(response);
        } else {
          throw new Error(response?.error || 'Backend analysis failed');
        }
      } catch (error) {
        console.error('❌ Backend analysis failed:', error);
        throw error;
      }
    }

    /**
     * Transform backend response to match extension format
     */
    transformBackendResponse(backendResponse) {
      const data = backendResponse.data;
      
      return {
        skills: data.skills || [],
        booleanSearch: data.boolean_search || '',
        aiContext: data.ai_context || '',
        extractionMethod: data.extraction_method || 'backend_ai',
        aiBooleanUsed: data.ai_boolean_used || false,
        confidence: data.confidence || 0.8,
        source: 'backend_ai',
        success: true
      };
    }

    /**
     * Make HTTP request to backend
     */
    async makeRequest(endpoint, method = 'GET', data = null) {
      const url = `${FIRKI_CONFIG.BACKEND_BASE_URL}${endpoint}`;
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: FIRKI_CONFIG.BACKEND_TIMEOUT
      };

      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }

      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error(`❌ Backend request failed (${endpoint}):`, error);
        throw error;
      }
    }

    /**
     * Retry request with exponential backoff
     */
    async retryRequest(endpoint, method, data, attempt = 1) {
      try {
        return await this.makeRequest(endpoint, method, data);
      } catch (error) {
        if (attempt < this.retryAttempts) {
          console.log(`🔄 Retrying request (attempt ${attempt + 1}/${this.retryAttempts})`);
          await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
          return this.retryRequest(endpoint, method, data, attempt + 1);
        }
        throw error;
      }
    }

    /**
     * Delay utility function
     */
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get backend status
     */
    getStatus() {
      return {
        isAvailable: this.isAvailable,
        lastHealthCheck: this.lastHealthCheck,
        baseUrl: FIRKI_CONFIG.BACKEND_BASE_URL,
        enabled: FIRKI_CONFIG.BACKEND_ENABLED
      };
    }
  }

  // Create global instance
  window.BackendConnector = new BackendConnector();

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.BackendConnector.initialize();
    });
  } else {
    window.BackendConnector.initialize();
  }

  console.log('🚀 Backend connector loaded');
})();
