// Simple Analytics for Firki Extension
// Tracks usage patterns for beta testing

(function() {
  'use strict';

  // Analytics configuration
  const ANALYTICS_CONFIG = {
    ENABLED: true, // Default to enabled, will be updated when config loads
    ENDPOINT: 'http://localhost:5001/analytics', // Default endpoint
    BATCH_SIZE: 10, // Send data in batches
    FLUSH_INTERVAL: 30000, // 30 seconds
    SESSION_TIMEOUT: 1800000, // 30 minutes
  };

  // Update config when FIRKI_CONFIG becomes available
  function updateAnalyticsConfig() {
    if (window.FIRKI_CONFIG) {
      ANALYTICS_CONFIG.ENABLED = window.FIRKI_CONFIG.ANALYTICS_ENABLED !== false;
      ANALYTICS_CONFIG.ENDPOINT = window.FIRKI_CONFIG.ANALYTICS_ENDPOINT || ANALYTICS_CONFIG.ENDPOINT;
    }
  }

  // Analytics data storage
  let analyticsQueue = [];
  let sessionId = null;
  let lastActivity = Date.now();
  let isFlushing = false;

  // Initialize analytics
  function initAnalytics() {
    // Update config first
    updateAnalyticsConfig();
    
    console.log('📊 Analytics config:', {
      enabled: ANALYTICS_CONFIG.ENABLED,
      endpoint: ANALYTICS_CONFIG.ENDPOINT,
      batchSize: ANALYTICS_CONFIG.BATCH_SIZE,
      flushInterval: ANALYTICS_CONFIG.FLUSH_INTERVAL
    });
    
    if (!ANALYTICS_CONFIG.ENABLED) {
      console.log('📊 Analytics disabled, not initializing');
      return;
    }
    
    sessionId = generateSessionId();
    startPeriodicFlush();
    trackEvent('extension_loaded', { version: '2.0.0' });
    
    console.log('📊 Analytics initialized with session:', sessionId);
  }

  // Generate unique session ID
  function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Track an event
  function trackEvent(eventName, data = {}) {
    if (!ANALYTICS_CONFIG.ENABLED) {
      console.log('📊 Analytics disabled, skipping event:', eventName);
      return;
    }

    const event = {
      event: eventName,
      timestamp: Date.now(),
      sessionId: sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      data: data
    };

    analyticsQueue.push(event);
    console.log('📊 Event queued:', eventName, data, 'Queue size:', analyticsQueue.length);
    
    // Flush if queue is full
    if (analyticsQueue.length >= ANALYTICS_CONFIG.BATCH_SIZE) {
      console.log('📊 Queue full, flushing analytics');
      flushAnalytics();
    }
  }

  // Track page views
  function trackPageView(pageName) {
    trackEvent('page_view', { page: pageName });
  }

  // Track feature usage
  function trackFeatureUsage(featureName, success = true, error = null) {
    trackEvent('feature_used', {
      feature: featureName,
      success: success,
      error: error ? error.message : null
    });
  }

  // Track AI performance
  function trackAIPerformance(operation, duration, success, method) {
    trackEvent('ai_performance', {
      operation: operation,
      duration: duration,
      success: success,
      method: method
    });
  }

  // Track search generation
  function trackSearchGeneration(jobType, skillsCount, booleanLength, method) {
    trackEvent('search_generated', {
      jobType: jobType,
      skillsCount: skillsCount,
      booleanLength: booleanLength,
      method: method
    });
  }

  // Track user interactions
  function trackUserInteraction(action, element) {
    trackEvent('user_interaction', {
      action: action,
      element: element
    });
  }

  // Flush analytics data to server
  async function flushAnalytics() {
    if (isFlushing || analyticsQueue.length === 0) return;
    
    isFlushing = true;
    const eventsToSend = [...analyticsQueue];
    analyticsQueue = [];

    console.log('📊 Flushing analytics data:', {
      endpoint: ANALYTICS_CONFIG.ENDPOINT,
      eventsCount: eventsToSend.length,
      events: eventsToSend.map(e => ({ event: e.event, data: e.data }))
    });

    try {
      const response = await fetch(ANALYTICS_CONFIG.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: eventsToSend,
          sessionId: sessionId,
          timestamp: Date.now()
        })
      });

      if (response.ok) {
        console.log('📊 Analytics data sent successfully');
      } else {
        console.warn('⚠️ Failed to send analytics data:', response.status, response.statusText);
        // Re-queue failed events
        analyticsQueue.unshift(...eventsToSend);
      }
    } catch (error) {
      console.warn('⚠️ Analytics flush failed:', error);
      // Re-queue failed events
      analyticsQueue.unshift(...eventsToSend);
    } finally {
      isFlushing = false;
    }
  }

  // Start periodic flush
  function startPeriodicFlush() {
    setInterval(() => {
      flushAnalytics();
    }, ANALYTICS_CONFIG.FLUSH_INTERVAL);
  }

  // Track session activity
  function updateActivity() {
    lastActivity = Date.now();
  }

  // Check if session is still active
  function isSessionActive() {
    return (Date.now() - lastActivity) < ANALYTICS_CONFIG.SESSION_TIMEOUT;
  }

  // Get analytics summary
  function getAnalyticsSummary() {
    return {
      sessionId: sessionId,
      eventsInQueue: analyticsQueue.length,
      lastActivity: lastActivity,
      isSessionActive: isSessionActive()
    };
  }

  // Public API
  window.FirkiAnalytics = {
    init: initAnalytics,
    trackEvent: trackEvent,
    trackPageView: trackPageView,
    trackFeatureUsage: trackFeatureUsage,
    trackAIPerformance: trackAIPerformance,
    trackSearchGeneration: trackSearchGeneration,
    trackUserInteraction: trackUserInteraction,
    updateActivity: updateActivity,
    getSummary: getAnalyticsSummary,
    flush: flushAnalytics,
    updateConfig: updateAnalyticsConfig
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalytics);
  } else {
    initAnalytics();
  }

  // Track activity on user interactions
  document.addEventListener('click', updateActivity);
  document.addEventListener('keypress', updateActivity);
  document.addEventListener('scroll', updateActivity);

  console.log('📊 Analytics module loaded');
})();
