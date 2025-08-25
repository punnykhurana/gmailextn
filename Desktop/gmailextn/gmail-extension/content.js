// Content script for Gmail Job Sourcing Assistant
// Handles business logic and coordinates between modules

(function() {
  'use strict';

  // Performance monitoring
  let performanceMetrics = {
    loadTime: 0,
    domQueries: 0,
    memoryUsage: 0
  };

  // Wait for Gmail to load with timeout
  function waitForGmail() {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max
      
      const checkGmail = () => {
        attempts++;
        
        // Check for Gmail-specific elements
        const gmailElements = document.querySelectorAll('[role="main"], .zA, .zF');
        
        if (gmailElements.length > 0) {
          performanceMetrics.loadTime = Date.now() - startTime;
          console.log(`✅ Gmail loaded in ${performanceMetrics.loadTime}ms`);
          resolve();
        } else if (attempts >= maxAttempts) {
          console.warn('⚠️ Gmail not detected, continuing anyway');
          resolve();
        } else {
          setTimeout(checkGmail, 1000);
        }
      };
      
      // Initial delay to let Gmail start loading
      setTimeout(checkGmail, 2000);
    });
  }

  // Wait for dependencies with timeout
  function waitForDependencies() {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 10;
      
      const checkDependencies = () => {
        attempts++;
        
        // Check if all modules are available
        if (window.FirkiAuth && window.BooleanSearch && window.FirkiUI && window.IntelligentJDParser) {
          console.log('✅ All dependencies loaded successfully');
          
          // Update analytics config if available
          if (window.FirkiAnalytics && window.FirkiAnalytics.updateConfig) {
            window.FirkiAnalytics.updateConfig();
          }
          
          // Update Gemini config if available
          if (window.GeminiContextAnalyzer && window.GeminiContextAnalyzer.updateConfig) {
            window.GeminiContextAnalyzer.updateConfig();
          }
          
          // Initialize analytics if available
          if (window.FirkiAnalytics && window.FirkiAnalytics.init) {
            window.FirkiAnalytics.init();
          }
          
          resolve();
        } else {
          console.log(`⏳ Waiting for dependencies... (attempt ${attempts}/${maxAttempts})`);
          console.log('FirkiAuth available:', !!window.FirkiAuth);
          console.log('BooleanSearch available:', !!window.BooleanSearch);
          console.log('FirkiUI available:', !!window.FirkiUI);
          console.log('IntelligentJDParser available:', !!window.IntelligentJDParser);
          console.log('FirkiAnalytics available:', !!window.FirkiAnalytics);
          console.log('GeminiContextAnalyzer available:', !!window.GeminiContextAnalyzer);
          
          if (attempts >= maxAttempts) {
            console.warn('⚠️ Dependencies not fully loaded, creating fallbacks');
            createFallbackAuth();
            createFallbackBooleanSearch();
            createFallbackUI();
            createFallbackIntelligentJDParser();
            resolve();
      } else {
            setTimeout(checkDependencies, 1000);
          }
        }
      };
      
      setTimeout(checkDependencies, 1000);
    });
  }

  // Fallback functions for when modules are not available
  function createFallbackAuth() {
    if (!window.FirkiAuth) {
      console.warn('⚠️ Creating fallback auth module');
      window.FirkiAuth = {
        checkGmailAuth: async () => ({ isAuthenticated: true, user: 'fallback@example.com' }),
        showGmailLoginPrompt: () => console.log('Login prompt not available'),
        handleLogout: async () => true,
        updateExtensionBadge: () => {},
        getAuthStatus: async () => ({ isAuthenticated: true, user: 'fallback@example.com' })
      };
    }
  }

  function createFallbackBooleanSearch() {
    if (!window.BooleanSearch) {
      console.warn('⚠️ Creating fallback boolean search module');
      window.BooleanSearch = {
        generateBooleanSearch: async () => 'fallback search',
        validateBooleanQuery: (query) => query || '',
        generateFallbackBooleanSearch: () => 'fallback search'
      };
    }
  }

  function createFallbackUI() {
    if (!window.FirkiUI) {
      console.warn('⚠️ Creating fallback UI module');
      window.FirkiUI = {
        injectFirkiButton: () => console.log('UI injection not available'),
        injectUserIcon: () => console.log('User icon injection not available'),
        showResultsPanel: () => console.log('Results panel not available'),
        hideResultsPanel: () => {},
        updateUserIconStatus: () => {}
      };
    }
  }

  function createFallbackIntelligentJDParser() {
    if (!window.IntelligentJDParser) {
      console.warn('⚠️ Creating fallback Intelligent JD parser module');
      window.IntelligentJDParser = {
        parseJobDescription: () => 'fallback job description',
        cleanJobDescription: (text) => text || '',
        extractKeywords: () => ['fallback', 'keywords'],
        generateFallbackBooleanSearch: () => 'fallback search',
        isInEmailView: () => true
      };
    }
  }

  // Check authentication before allowing sourcing
  async function checkAuthentication() {
    try {
      if (window.FirkiAuth && window.FirkiAuth.checkAuthentication) {
        return await window.FirkiAuth.checkAuthentication();
      } else {
        console.warn('⚠️ FirkiAuth module not available, allowing sourcing anyway');
        return true; // Allow sourcing if auth module is not available
          }
            } catch (error) {
      console.error('❌ Authentication check failed:', error);
      return true; // Allow sourcing on error
    }
  }

  // Parse job description from Gmail
  function parseJobDescription() {
    try {
      if (window.IntelligentJDParser && window.IntelligentJDParser.parseJobDescription) {
        return window.IntelligentJDParser.parseJobDescription();
      } else {
        console.error('❌ IntelligentJDParser module not available');
      return null;
      }
    } catch (error) {
      console.error('❌ Error parsing job description:', error);
      return null;
    }
  }
  
  // Detect if email is job-related before analysis
  async function detectJobEmail(emailContent, subject = "", sender = "") {
    try {
      if (window.BackendConnector && FIRKI_CONFIG.BACKEND_ENABLED) {
        const response = await fetch(`${FIRKI_CONFIG.BACKEND_BASE_URL}/api/detect-job-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email_content: emailContent,
            subject: subject,
            sender: sender
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          return result.data;
        }
      }
    } catch (error) {
      console.warn('Job email detection failed, using client-side detection:', error);
    }
    
    // Client-side fallback detection
    return clientSideJobDetection(emailContent, subject, sender);
  }
  
  // Client-side job email detection (fallback)
  function clientSideJobDetection(emailContent, subject = "", sender = "") {
    const emailLower = emailContent.toLowerCase();
    const subjectLower = subject.toLowerCase();
    const senderLower = sender.toLowerCase();
    
    let score = 0;
    const maxScore = 100;
    
    // Job keywords (more specific)
    const jobKeywords = [
      'job', 'position', 'role', 'opportunity', 'opening', 'vacancy',
      'hiring', 'recruiting', 'candidate', 'applicant', 'resume',
      'interview', 'career', 'employment', 'contract',
      'full-time', 'part-time', 'remote', 'onsite', 'hybrid',
      'developer', 'engineer', 'analyst', 'manager', 'specialist',
      'coordinator', 'assistant', 'director', 'lead', 'senior',
      'junior', 'entry-level', 'mid-level', 'experienced',
      'consultant', 'seeking'
    ];
    
    // Job patterns (strong, specific indicators)
    const jobPatterns = [
      'minimum qualifications', 'must-have', 'job description', 
      'what you will bring', 'pay rate', 'bill rate', 'role details:',
      'interview type:', 'requirements:', 'qualifications:', 
      'responsibilities:', 'experience required', 'skills needed', 
      'tech stack', 'technologies:', 'client need', 'client summary',
      'key details:', 'looking for', 'currently looking for',
      'support our client', 'software engineer', 'backend developer',
      'frontend developer', 'full stack developer'
    ];
    
    // Check keywords (lower weight for individual keywords)
    jobKeywords.forEach(keyword => {
      if (emailLower.includes(keyword)) score += 1;
    });
    
    // Check patterns (higher weight for specific patterns)
    jobPatterns.forEach(pattern => {
      if (emailLower.includes(pattern)) {
        // Extra high weight for the most specific job indicators
        if (['minimum qualifications', 'must-have', 'job description', 'what you will bring', 'pay rate', 'bill rate', 'role details:', 'interview type:'].includes(pattern)) {
          score += 15;
        } else {
          score += 8;
        }
      }
    });
    
    // Check for client mentions
    if (emailLower.includes('client:') || emailLower.includes('client need')) {
      score += 15;
    }
    
    // Check for rate mentions
    if (emailLower.includes('bill rate') || emailLower.includes('hourly rate')) {
      score += 8;
    }
    
    // Check for duration mentions
    if (emailLower.includes('duration:') || emailLower.includes('contract length')) {
      score += 6;
    }
    
    // Strong indicators for job emails
    if (emailLower.includes('looking for') && (emailLower.includes('developer') || emailLower.includes('engineer'))) {
      score += 20;
    }
    
    if (emailLower.includes('support our client')) {
      score += 15;
    }
    
    if (emailLower.includes('key details:')) {
      score += 10;
    }
    
    if (emailLower.includes('software engineer')) {
      score += 12;
    }
    
    if (emailLower.includes('currently looking for')) {
      score += 18;
    }
    
    // Check subject line
    if (subjectLower.includes('job') || subjectLower.includes('position') || 
        subjectLower.includes('hiring') || subjectLower.includes('opportunity')) {
      score += 8;
    }
    
    // Check sender
    if (senderLower.includes('recruiter') || senderLower.includes('talent') || 
        senderLower.includes('hr') || senderLower.includes('hiring')) {
      score += 3;
    }
    
    // Technical skills mentioned (indicates job posting)
    const techSkills = ['react', 'python', 'java', 'javascript', 'aws', 'docker', 'kubernetes', 'sql', 'node.js', 'angular', 'vue', 'shopify', 'salesforce'];
    const techCount = techSkills.filter(skill => emailLower.includes(skill)).length;
    if (techCount >= 2) {
      score += techCount * 2;
    }
    
    // Negative indicators (reduce score for non-job emails)
    const negativeIndicators = [
      'newsletter', 'news', 'update', 'announcement', 'blog', 'article',
      'read more', 'click here', 'subscribe', 'unsubscribe', 'marketing',
      'promotion', 'offer', 'discount', 'sale', 'event', 'webinar',
      'conference', 'meeting', 'invitation', 'reminder', 'notification'
    ];
    
    negativeIndicators.forEach(indicator => {
      if (emailLower.includes(indicator)) {
        score -= 3; // Reduce score for newsletter/marketing content
      }
    });
    
    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    const confidence = Math.min(score / maxScore, 1.0);
    const isJob = confidence >= 0.25; // Slightly higher threshold for better precision
    
    console.log('🔍 Client-side detection result:', { isJob, confidence, score, emailLength: emailContent.length });
    
    // Log specific matches for debugging
    const matches = [];
    jobKeywords.forEach(keyword => {
      if (emailLower.includes(keyword)) {
        matches.push(keyword);
      }
    });
    if (matches.length > 0) {
      console.log('🔍 Keyword matches found:', matches);
    }
    
    // Log negative indicators
    const negativeMatches = [];
    negativeIndicators.forEach(indicator => {
      if (emailLower.includes(indicator)) {
        negativeMatches.push(indicator);
      }
    });
    if (negativeMatches.length > 0) {
      console.log('❌ Negative indicators found:', negativeMatches);
    }
    
    return {
      is_job_email: isJob,
      confidence: confidence,
      context: {},
      detection_details: { method: 'client_side' }
    };
  }

  // Generate boolean search
  async function generateBooleanSearch(parsedJD, mode = 'simple') {
    const startTime = Date.now();
    let success = false;
    let method = 'unknown';
    let skillsCount = 0;
    let booleanLength = 0;
    
    try {
      // First, try to use the backend if available
      if (window.BackendConnector && FIRKI_CONFIG.BACKEND_ENABLED) {
        try {
          const backendResult = await window.BackendConnector.analyzeJobDescription(parsedJD);
          
          if (backendResult && backendResult.success) {
            
            // Store the backend result for display (transform back to expected format)
            window.lastBackendResult = {
              success: true,
              data: {
                skills: backendResult.skills || [],
                boolean_search: backendResult.booleanSearch || '',
                extraction_method: backendResult.extractionMethod || 'ai_dynamic_analysis',
                ai_context: backendResult.aiContext || '',
                ai_boolean_used: backendResult.aiBooleanUsed || false
              }
            };
            
            // Track analytics
            success = true;
            method = 'backend_ai';
            skillsCount = backendResult.skills?.length || 0;
            booleanLength = backendResult.booleanSearch?.length || 0;
            
            // Track search generation
            if (window.FirkiAnalytics) {
              console.log('📊 Tracking search generation:', { skillsCount, booleanLength, method });
              window.FirkiAnalytics.trackSearchGeneration('job_description', skillsCount, booleanLength, method);
              window.FirkiAnalytics.trackAIPerformance('search_generation', Date.now() - startTime, true, method);
            } else {
              console.warn('⚠️ FirkiAnalytics not available for tracking');
            }
            
            return backendResult.booleanSearch || '';
          }
        } catch (backendError) {
          console.warn('⚠️ Backend analysis failed, falling back to local logic:', backendError.message);
          method = 'backend_failed';
          
          // Show backend error notification
          showNotification('AI service unavailable, using local analysis', 'info');
        }
      }
      
      // Fallback to local BooleanSearch module
      if (window.BooleanSearch && window.BooleanSearch.generateBooleanSearch) {
        // Convert raw text to the format expected by BooleanSearch module
        const jobDescriptionObj = {
          rawText: parsedJD,
          skills: [], // Will be extracted by the BooleanSearch module
          suggestedSkills: [],
          aiSuggestions: null
        };
        
        console.log('🔍 Using local BooleanSearch module:', {
          hasRawText: !!jobDescriptionObj.rawText,
          textLength: jobDescriptionObj.rawText?.length || 0
        });
        
        const result = await window.BooleanSearch.generateBooleanSearch(jobDescriptionObj, mode);
        
        // Track analytics
        success = !!result;
        method = 'local_boolean_search';
        booleanLength = result?.length || 0;
        
        // Track search generation
        if (window.FirkiAnalytics) {
          console.log('📊 Tracking local search generation:', { skillsCount, booleanLength, method });
          window.FirkiAnalytics.trackSearchGeneration('job_description', skillsCount, booleanLength, method);
          window.FirkiAnalytics.trackAIPerformance('search_generation', Date.now() - startTime, success, method);
        } else {
          console.warn('⚠️ FirkiAnalytics not available for local tracking');
        }
        
        return result;
      } else {
        console.error('❌ BooleanSearch module not available');
        method = 'no_module';
        
        // Track analytics
        if (window.FirkiAnalytics) {
          window.FirkiAnalytics.trackAIPerformance('search_generation', Date.now() - startTime, false, method);
        }
        
        return '';
      }
    } catch (error) {
      console.error('❌ Error generating boolean search:', error);
      
      // Fallback: generate a simple search based on common keywords
      try {
        console.log('🔄 Using fallback boolean search generation');
        if (window.IntelligentJDParser && window.IntelligentJDParser.generateFallbackBooleanSearch) {
          const fallbackSearch = window.IntelligentJDParser.generateFallbackBooleanSearch(parsedJD);
          if (fallbackSearch) {
            console.log('✅ Fallback search generated successfully');
            
            // Track analytics
            success = true;
            method = 'fallback';
            booleanLength = fallbackSearch?.length || 0;
            
            if (window.FirkiAnalytics) {
              console.log('📊 Tracking fallback search generation:', { skillsCount, booleanLength, method });
              window.FirkiAnalytics.trackSearchGeneration('job_description', skillsCount, booleanLength, method);
              window.FirkiAnalytics.trackAIPerformance('search_generation', Date.now() - startTime, success, method);
            } else {
              console.warn('⚠️ FirkiAnalytics not available for fallback tracking');
            }
            
            return fallbackSearch;
          }
        }
      } catch (fallbackError) {
        console.error('❌ Fallback search also failed:', fallbackError);
        method = 'fallback_failed';
      }
      
      // Track final failure
      if (window.FirkiAnalytics) {
        window.FirkiAnalytics.trackAIPerformance('search_generation', Date.now() - startTime, false, method);
      }
      
      return '';
    }
  }

  // Handle sourcing click
  async function handleSourcingClick() {
    try {
      // Track feature usage
      if (window.FirkiAnalytics) {
        window.FirkiAnalytics.trackFeatureUsage('sourcing_clicked');
      }
      
      console.log('🚀 Starting job sourcing...');
      console.log('🔍 Checking module availability:');
      console.log('- FirkiAuth:', !!window.FirkiAuth);
      console.log('- FirkiUI:', !!window.FirkiUI);
      console.log('- IntelligentJDParser:', !!window.IntelligentJDParser);
      console.log('- BooleanSearch:', !!window.BooleanSearch);
      
      // Check authentication
      const isAuthenticated = await checkAuthentication();
      console.log('🔐 Authentication result:', isAuthenticated);
      
      if (!isAuthenticated) {
        console.log('❌ Authentication required - showing login prompt');
        // Track authentication failure
        if (window.FirkiAnalytics) {
          window.FirkiAnalytics.trackFeatureUsage('authentication_failed', false, 'Not authenticated');
        }
        
        // Show login prompt instead of error
        if (window.FirkiAuth && window.FirkiAuth.showGmailLoginPrompt) {
          window.FirkiAuth.showGmailLoginPrompt();
        } else {
          showError('Please sign in to Gmail to use Firki');
        }
        return;
      }
      
      // Parse job description
      console.log('📄 Parsing job description...');
      const jobDescription = parseJobDescription();
      console.log('📄 Job description result:', jobDescription ? 'Found' : 'Not found');
      
      if (!jobDescription) {
        // Track job description parsing failure
        if (window.FirkiAnalytics) {
          window.FirkiAnalytics.trackFeatureUsage('job_description_parsing', false, 'No job description found');
        }
        
        showError('No job description found in this email. Please make sure you are viewing an email with job details.', 'no_job_description');
        return;
      }
      
      // Show loading state
      console.log('⏳ Showing loading state...');
      showLoading('Analyzing job description...');
      
      // Generate boolean search
      console.log('🔍 Generating boolean search...');
      const booleanSearch = await generateBooleanSearch(jobDescription, 'simple');
      console.log('🔍 Boolean search result:', booleanSearch ? 'Generated' : 'Failed');
      
      if (!booleanSearch) {
        // Track search generation failure
        if (window.FirkiAnalytics) {
          window.FirkiAnalytics.trackFeatureUsage('search_generation', false, 'Failed to generate search');
        }
        
        showError('Failed to generate search query. Please try again.');
        return;
      }
      
      // Track successful search generation
      if (window.FirkiAnalytics) {
        window.FirkiAnalytics.trackFeatureUsage('search_generation', true);
      }
      
      // Show results
      console.log('📊 Showing results...');
      showResults(booleanSearch, jobDescription);
      
      } catch (error) {
      console.error('❌ Error in sourcing:', error);
      
      // Track error
      if (window.FirkiAnalytics) {
        window.FirkiAnalytics.trackFeatureUsage('sourcing_error', false, error.message);
      }
      showError('An error occurred while sourcing. Please try again.');
    }
  }

  // Handle user icon click
  async function handleUserIconClick() {
    try {
      if (window.FirkiAuth && window.FirkiAuth.checkGmailAuth) {
        const authStatus = await window.FirkiAuth.checkGmailAuth();
        
        if (authStatus.isAuthenticated) {
          // Show logout menu
          showLogoutMenu(authStatus.user);
        } else {
          // Show login prompt
          if (window.FirkiAuth.showGmailLoginPrompt) {
            window.FirkiAuth.showGmailLoginPrompt();
          }
        }
      }
    } catch (error) {
      console.error('❌ Error handling user icon click:', error);
    }
  }

  // Show loading state
  function showLoading(message) {
    try {
      if (window.FirkiUI && window.FirkiUI.showResultsPanel) {
        const loadingContent = `
          <div style="text-align: center; padding: 40px 20px;">
            <div style="margin-bottom: 16px;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="#1a73e8"/>
      </svg>
            </div>
            <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #1a1a1a;">${message}</h3>
            <div style="color: #5f6368; font-size: 14px;">Please wait...</div>
          </div>
        `;
        window.FirkiUI.showResultsPanel(loadingContent);
      }
    } catch (error) {
      console.error('❌ Error showing loading:', error);
    }
  }

  // Show results
  function showResults(booleanSearch, jobDescription) {
    try {
      if (window.FirkiUI && window.FirkiUI.showResultsPanel) {
        // Check if we have backend results to display
        const backendResult = window.lastBackendResult;
        const isBackendResult = backendResult && backendResult.success;
        const backendData = backendResult?.data;
        
        let resultsContent = `
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #1a1a1a;">Boolean Search Results</h3>
        `;
        
        // Add backend info if available
        if (isBackendResult && backendData) {
          resultsContent += `
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="#0ea5e9"/>
                </svg>
                <span style="font-size: 12px; color: #0ea5e9; font-weight: 600;">AI-Powered Analysis</span>
              </div>
              <div style="font-size: 12px; color: #0369a1; line-height: 1.4;">
                <strong>Extraction Method:</strong> ${backendData.extraction_method || 'AI Dynamic Analysis'}<br>
                <strong>AI Boolean Used:</strong> ${backendData.ai_boolean_used ? 'Yes' : 'No'}<br>
                <strong>AI Context:</strong> ${backendData.ai_context || 'Not available'}
              </div>
            </div>
          `;
        }
        
        // Add skills section if available
        if (isBackendResult && backendData && backendData.skills && backendData.skills.length > 0) {
          const topSkills = backendData.skills.slice(0, 8); // Show more skills
          resultsContent += `
            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 8px; font-weight: 600;">Extracted Skills:</div>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${topSkills.map(skill => {
                  const skillName = typeof skill === 'object' ? skill.name : skill;
                  return `
                    <span style="
                      background: #e2e8f0;
                      color: #475569;
                      padding: 4px 8px;
                      border-radius: 12px;
                      font-size: 11px;
                      font-weight: 500;
                    ">${skillName}</span>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }
        
        // Add boolean search section
        resultsContent += `
          <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 8px; font-weight: 600;">Generated Search Query:</div>
            <textarea readonly style="
              width: 100%;
              min-height: 80px;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 12px;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 12px;
              line-height: 1.4;
              resize: vertical;
              background: white;
            ">${booleanSearch}</textarea>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="navigator.clipboard.writeText('${booleanSearch.replace(/'/g, "\\'")}')" style="
              background: #1a73e8;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 8px 16px;
              font-size: 12px;
              cursor: pointer;
              flex: 1;
            ">Copy Query</button>
            <button onclick="window.open('https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(booleanSearch)}', '_blank')" style="
              background: #0077b5;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 8px 16px;
              font-size: 12px;
              cursor: pointer;
              flex: 1;
            ">Search LinkedIn</button>
          </div>
        `;
        
        window.FirkiUI.showResultsPanel(resultsContent);
      }
    } catch (error) {
      console.error('❌ Error showing results:', error);
    }
  }







  // Show error
  function showError(message) {
    try {
      if (window.FirkiUI && window.FirkiUI.showResultsPanel) {
        const errorContent = `
          <div style="text-align: center; padding: 40px 20px;">
            <div style="margin-bottom: 16px; color: #dc2626;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#dc2626"/>
              </svg>
            </div>
            <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #1a1a1a;">Error</h3>
            <div style="color: #5f6368; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">${message}</div>
            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; text-align: left; margin-bottom: 20px;">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 8px; font-weight: 600;">Troubleshooting:</div>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #64748b; line-height: 1.5;">
                <li>Make sure you're signed in to Gmail</li>
                <li>Open an email with job details</li>
                <li>Try refreshing the page</li>
                <li>Check your internet connection</li>
              </ul>
            </div>
            <button onclick="window.location.reload()" style="
              background: #1a73e8;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 12px 24px;
              font-size: 14px;
              cursor: pointer;
              width: 100%;
            ">Try Again</button>
          </div>
        `;
        window.FirkiUI.showResultsPanel(errorContent);
      }
    } catch (error) {
      console.error('❌ Error showing error:', error);
    }
  }



  // Show logout menu
  function showLogoutMenu(userEmail) {
    try {
      if (window.FirkiUI && window.FirkiUI.showResultsPanel) {
        const logoutContent = `
          <div style="text-align: center; padding: 40px 20px;">
            <div style="margin-bottom: 16px;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#34a853"/>
              </svg>
            </div>
            <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #1a1a1a;">Logged In</h3>
            <div style="color: #5f6368; font-size: 14px; margin-bottom: 20px;">${userEmail}</div>
            <button onclick="window.FirkiAuth && window.FirkiAuth.handleLogout && window.FirkiAuth.handleLogout()" style="
              background: #dc2626;
      color: white;
      border: none;
              border-radius: 6px;
              padding: 12px 24px;
      font-size: 14px;
      cursor: pointer;
              width: 100%;
            ">Logout</button>
          </div>
        `;
        window.FirkiUI.showResultsPanel(logoutContent);
      }
    } catch (error) {
      console.error('❌ Error showing logout menu:', error);
    }
  }

  // Monitor performance
  function monitorPerformance() {
    setInterval(() => {
      try {
        const memory = performance.memory;
        performanceMetrics.memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0;
        
        console.log('📊 Performance Metrics:', {
          loadTime: performanceMetrics.loadTime + 'ms',
          domQueries: performanceMetrics.domQueries,
          memoryUsage: performanceMetrics.memoryUsage.toFixed(2) + 'MB'
        });
      } catch (error) {
        console.error('❌ Error monitoring performance:', error);
      }
    }, 30000); // Log every 30 seconds
  }









  // Initialize UI with business logic
  function initializeUI() {
    try {
      console.log('🎯 Initializing UI (simplified)...');
      console.log('🔍 Available modules:');
      console.log('- window.FirkiAuth:', !!window.FirkiAuth);
      console.log('- window.FirkiUI:', !!window.FirkiUI);
      console.log('- window.IntelligentJDParser:', !!window.IntelligentJDParser);
      console.log('- window.BooleanSearch:', !!window.BooleanSearch);
      
      // Set up event handlers
      if (window.FirkiUI) {
        console.log('✅ FirkiUI module found');
        
        // Inject UI elements (don't override click handlers for now)
        window.FirkiUI.injectFirkiContainer();
        if (window.FirkiUI.injectUserIcon) {
          window.FirkiUI.injectUserIcon();
        } else {
          console.log('⚠️ injectUserIcon not available, skipping...');
        }
        
        // Set up mutation observer for dynamic content
        if (window.FirkiUI.setupMutationObserver) {
          window.FirkiUI.setupMutationObserver();
        }
        
        console.log('✅ UI initialized successfully (simplified)');
        
        // Test UI functionality
        setTimeout(() => {
          if (window.FirkiUI.testUI) {
            console.log('🧪 Running UI test...');
            window.FirkiUI.testUI();
          }
        }, 2000);
        
      } else {
        console.warn('⚠️ FirkiUI module not found');
      }
    } catch (error) {
      console.error('❌ Error initializing UI:', error);
    }
  }

  // Main initialization
  async function init() {
    try {
      console.log('🚀 Initializing Firki extension...');
      
      // Wait for Gmail to load
      await waitForGmail();
      
      // Wait for dependencies
      await waitForDependencies();
      
      // Initialize UI
      initializeUI();
      
      // Initialize analytics
      if (window.FirkiAnalytics && window.FirkiAnalytics.init) {
        window.FirkiAnalytics.init();
      }
      
      // Start performance monitoring
      monitorPerformance();
      
      console.log('✅ Firki extension initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing extension:', error);
    }
  }

  // Make functions globally accessible
  window.generateBooleanSearch = generateBooleanSearch;
  window.detectJobEmail = detectJobEmail;


  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(); 
