// UI Module for Firki Gmail Extension
// Handles all UI rendering, animations, and DOM manipulation
// EXPANDABLE UI VERSION

(function() {
  'use strict';

  // Add CSS for expandable UI
  const expandableStyles = `
    <style>

      /* The main container that will transform */
      .firki-container {
        position: fixed;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        /* Springy transition for the container's shape */
        transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        overflow: hidden;
        z-index: 10000;
      }

      /* --- Collapsed State (The Button) --- */
      .firki-container.collapsed {
        width: 120px;
        height: 50px;
        border-radius: 25px; /* Pill shape */
        background: linear-gradient(135deg, #3b82f6, #4f46e5);
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(26, 115, 232, 0.4);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
        -webkit-user-select: none;
      }

      /* Button hover state */
      .firki-container.collapsed:hover {
        background: linear-gradient(135deg, #2563eb, #4338ca);
        box-shadow: 0 8px 25px rgba(26, 115, 232, 0.5);
      }

      /* Button active/clicked state */
      .firki-container.collapsed:active {
        background: linear-gradient(135deg, #1d4ed8, #3730a3);
        box-shadow: 0 4px 15px rgba(26, 115, 232, 0.6);
        transform: scale(0.98);
      }

      /* Button focus state for accessibility */
      .firki-container.collapsed:focus {
        outline: 2px solid #60a5fa;
        outline-offset: 2px;
      }

      /* --- Expanded State (The Sidebar) --- */
      .firki-container.expanded {
        width: 400px;
        height: auto;
        max-height: 90vh;
        border-radius: 16px; /* Rounded rectangle */
        background: white;
        cursor: default;
        border: 1px solid #e2e8f0;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      }

      /* --- Minimized State (When expanded, but minimized) --- */
      .firki-container.minimized {
        width: 120px;
        height: 50px;
        border-radius: 25px; /* Pill shape */
        background: linear-gradient(135deg, #4f46e5, #3730a3);
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
        -webkit-user-select: none;
      }

      /* Minimized button hover state */
      .firki-container.minimized:hover {
        background: linear-gradient(135deg, #4338ca, #312e81);
        box-shadow: 0 8px 25px rgba(79, 70, 229, 0.5);
      }

      /* Minimized button active/clicked state */
      .firki-container.minimized:active {
        background: linear-gradient(135deg, #3730a3, #1e1b4b);
        box-shadow: 0 4px 15px rgba(79, 70, 229, 0.6);
        transform: scale(0.98);
      }

      /* Minimized button focus state for accessibility */
      .firki-container.minimized:focus {
        outline: 2px solid #a78bfa;
        outline-offset: 2px;
      }
      
      .firki-container.minimized .firki-sidebar-view {
        display: none;
      }
      
      .firki-container.minimized .firki-button-view {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: 0;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        gap: 6px;
        font-size: 14px;
        font-weight: 600;
      }
      
      .firki-container.minimized .firki-button-view:hover {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 25px;
      }

      .firki-container.minimized .firki-button-view:active {
        background: rgba(255, 255, 255, 0.15);
        transform: scale(0.98);
      }

      /* --- Content Visibility --- */
      
      /* The button view content */
      .firki-button-view {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        height: 100%;
        color: white;
        font-size: 16px;
        font-weight: 600;
        /* Fade out when expanding */
        transition: opacity 0.2s ease-in-out;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
      }

      /* Button view hover effect for collapsed state */
      .firki-container.collapsed .firki-button-view:hover {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 25px;
      }

      .firki-container.collapsed .firki-button-view:active {
        background: rgba(255, 255, 255, 0.15);
        transform: scale(0.98);
      }

      /* The full sidebar content */
      .firki-sidebar-view {
        width: 400px; /* Fixed width to prevent wrapping during transition */
        /* Fade in after container expands */
        transition: opacity 0.3s ease-in-out 0.2s;
      }

      /* Hide content based on container state */
      .firki-container.collapsed .firki-sidebar-view {
        opacity: 0;
        pointer-events: none;
        display: none;
      }

      .firki-container.expanded .firki-button-view {
        opacity: 0;
        pointer-events: none;
        height: 0; /* Collapse height to prevent interaction */
        display: none;
      }
    </style>
  `;

  // Inject styles
  if (!document.getElementById('firki-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'firki-styles';
    styleElement.innerHTML = expandableStyles;
    document.head.appendChild(styleElement);
  }

  // UI State Management
  let uiState = {
    containerInjected: false,
    isExpanded: false,
    isInitialized: false,
    isMinimized: false
  };

  /**
   * NEW FUNCTION: Checks if the user is currently in an email thread view.
   * Gmail uses specific selectors for the main email content area.
   */
  function isInEmailView() {
    // Selectors that are present when an email is open, but not in the main inbox list.
    const emailViewSelectors = [
      '.a3s', // Main email content div
      '.adn', // Another container for email content
      '.hP',   // The header of an open email
      '[data-message-id]' // An attribute present on email containers
    ];
    return emailViewSelectors.some(selector => document.querySelector(selector));
  }

  // Create expandable Firki container
  function createFirkiContainer() {
    const container = document.createElement('div');
    container.id = 'firki-container';
    container.className = 'firki-container collapsed';
    uiState.isExpanded = false;
    uiState.isInitialized = true;
    
    container.innerHTML = `
      <!-- Collapsed View: Just the button -->
      <div id="firki-button-view" class="firki-button-view">
        <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.5 2.54l2.6 1.53c.56-1.24.9-2.62.9-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.05.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/>
        </svg>
        <span>Firki</span>
      </div>

      <!-- Expanded View: The full sidebar -->
      <div id="firki-sidebar-view" class="firki-sidebar-view">
         <div style="background: white; color: #374151; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-radius: 12px 12px 0 0; border-bottom: 1px solid #e5e7eb;">
           <div style="display: flex; align-items: center; gap: 6px;">
             <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; color: #4f46e5;" viewBox="0 0 24 24" fill="currentColor">
               <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.5 2.54l2.6 1.53c.56-1.24.9-2.62.9-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.05.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/>
             </svg>
             <span style="font-weight: 600; font-size: 14px; color: #374151;">Firki</span>
           </div>
           <div style="display: flex; gap: 6px;">
             <button id="minimize-firki-btn" style="background: none; border: none; color: #6b7280; cursor: pointer; padding: 3px;">
               <svg xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
               </svg>
             </button>
             <button id="close-firki-btn" style="background: none; border: none; color: #6b7280; cursor: pointer; padding: 3px;">
               <svg xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
           </div>
         </div>

         <div style="padding: 16px; background: white; max-height: 70vh; overflow-y: auto;">
           <!-- Key Skills Section -->
           <div style="margin-bottom: 16px;">
             <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
               <div style="background-color: #dcfce7; border-radius: 9999px; padding: 3px;">
                 <svg xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px; color: #22c55e;" viewBox="0 0 20 20" fill="currentColor">
                   <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                 </svg>
               </div>
               <h2 style="font-size: 16px; font-weight: 600; color: #374151; margin: 0;">Key Skills:</h2>
             </div>
             <div style="display: flex; flex-wrap: wrap; gap: 8px;">
               <span style="color: #6b7280; font-size: 12px; font-style: italic;">Click to analyze job description...</span>
             </div>
           </div>

           <!-- Boolean Search Section -->
           <div style="margin-bottom: 16px;">
             <h2 style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">Boolean Search String</h2>
             <div style="position: relative;">
               <textarea readonly style="width: 100%; height: 50px; padding: 12px; padding-bottom: 32px; background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 6px; color: #374151; font-family: monospace; font-size: 11px; resize: none; outline: none;">Click the button above to generate boolean search...</textarea>
               <button id="copy-btn" style="position: absolute; bottom: 6px; right: 6px; padding: 6px; color: #9ca3af; background-color: #e5e7eb; border: none; border-radius: 4px; cursor: pointer;">
                 <svg style="width: 14px; height: 14px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                 </svg>
               </button>
             </div>
             <a id="linkedin-btn" href="#" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 12px; background-color: #4f46e5; color: white; font-weight: 600; border-radius: 6px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); text-decoration: none; margin-top: 12px; font-size: 14px;">
               <svg xmlns="http://www.w3.org/2000/svg" style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
               Search on LinkedIn
             </a>
           </div>
         </div>
      </div>
    `;

    // Add event listeners
    const buttonView = container.querySelector('#firki-button-view');
    const minimizeBtn = container.querySelector('#minimize-firki-btn');
    const closeBtn = container.querySelector('#close-firki-btn');
    const copyBtn = container.querySelector('#copy-btn');
    const linkedinBtn = container.querySelector('#linkedin-btn');

    buttonView.addEventListener('click', async () => {
      // Only generate content and expand if not already expanded
      if (!uiState.isExpanded) {
        await generateDynamicContent();
      }
      toggleFirkiPanel();
    });
    minimizeBtn.addEventListener('click', () => {
      const container = document.getElementById('firki-container');
      if (container) {
        container.classList.toggle('minimized');
        uiState.isMinimized = !uiState.isMinimized;
        
        // Update minimize button icon
        const icon = minimizeBtn.querySelector('svg');
        if (uiState.isMinimized) {
          icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />';
        } else {
          icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />';
        }
      }
    });
    closeBtn.addEventListener('click', () => {
      // Just collapse the panel, don't remove it
      toggleFirkiPanel();
    });
    copyBtn.addEventListener('click', () => {
      const textarea = container.querySelector('textarea');
      if (textarea) {
        navigator.clipboard.writeText(textarea.value);
      }
    });
    linkedinBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const textarea = container.querySelector('textarea');
      if (textarea) {
        const searchQuery = textarea.value;
        window.open('https://www.linkedin.com/search/results/people/?keywords=' + encodeURIComponent(searchQuery), '_blank');
      }
    });

    return container;
  }

  // Toggle between button and sidebar
  function toggleFirkiPanel() {
    const container = document.getElementById('firki-container');
    if (!container) return;

    // Toggle the classes that define the state
    container.classList.toggle('expanded');
    container.classList.toggle('collapsed');
    uiState.isExpanded = !uiState.isExpanded;
    
    console.log('🔄 Toggled Firki panel. Expanded:', uiState.isExpanded, 'Container classes:', container.className);
  }

  /**
   * MODIFIED: This function now checks if it's in an email view before injecting.
   */
  function injectFirkiContainer() {
    if (document.getElementById('firki-container')) return;

    // Only inject if we are in an email view
    if (isInEmailView()) {
      const container = createFirkiContainer();
      document.body.appendChild(container);
      uiState.containerInjected = true;
      uiState.isExpanded = false; // Ensure it starts collapsed
      console.log('✅ Firki container injected in collapsed state');
    }
  }

  function removeFirkiContainer() {
    const container = document.getElementById('firki-container');
    if (container) {
      container.remove();
      uiState.containerInjected = false;
    }
  }

  /**
   * NEW: Generate dynamic content based on email content
   */
  async function generateDynamicContent() {
    try {
      console.log('🔍 Generating dynamic content...');
      
      // Extract job description from email content
      const jobDescription = extractJobDescriptionFromEmail();
      console.log('📧 Job description length:', jobDescription.length);
      
      // Get email metadata for smart detection
      const emailSubject = document.querySelector('h2[data-thread-perm-id]')?.textContent || '';
      const emailSender = document.querySelector('.gD')?.getAttribute('email') || '';
      
          // Smart detection: Check if this is a job email first
    // Add a small delay to ensure email content is fully loaded
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const detectionResult = await window.detectJobEmail(jobDescription, emailSubject, emailSender);
    console.log('🔍 Job email detection result:', detectionResult);
      
      // If not a job email, show a different message
      if (!detectionResult.is_job_email) {
        console.log('📧 Not a job email, showing non-job message');
        updateUIWithNonJobMessage(detectionResult);
        return;
      } else {
        console.log('📧 Confirmed job email, proceeding with analysis');
      }
      
      // Try Gemini analysis first if available
      let geminiSkills = [];
      let geminiContext = null;
      
      console.log('🚀 Starting analysis for confirmed job email...');
      
      if (window.GeminiContextAnalyzer && window.FIRKI_CONFIG?.ENABLE_GEMINI_CONTEXT_ANALYSIS) {
        console.log('🤖 Attempting Gemini analysis...');
        try {
          const geminiResult = await window.GeminiContextAnalyzer.analyzeJd(jobDescription);
          if (geminiResult) {
            console.log('✅ Gemini analysis successful:', geminiResult);
            const processedResult = window.GeminiContextAnalyzer.processAnalysisResult(geminiResult);
            if (processedResult) {
              geminiSkills = processedResult.skills.map(s => s.name);
              geminiContext = processedResult.context;
              console.log('🤖 Gemini skills:', geminiSkills);
              console.log('🤖 Gemini context:', geminiContext);
            }
          }
        } catch (error) {
          console.error('❌ Gemini analysis failed:', error);
        }
      }
      
      // Extract skills from email content using intelligent parser (fallback)
      const fallbackSkills = await extractSkillsFromEmail();
      console.log('📋 Fallback extracted skills:', fallbackSkills);
      
      // Use Gemini skills if available, otherwise use fallback
      const skills = geminiSkills.length > 0 ? geminiSkills : fallbackSkills;
      console.log('📋 Final skills to use:', skills);
      
      // Create parsed JD object for boolean search module
      const parsedJD = {
        rawText: jobDescription,
        skills: skills,
        suggestedSkills: [],
        aiSuggestions: []
      };
      
      // Wait for BooleanSearch module to be available
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!window.BooleanSearch && attempts < maxAttempts) {
        console.log(`⏳ Waiting for BooleanSearch module... (${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      // Use the content.js generateBooleanSearch function that handles backend logic
      let booleanSearch = '';
      let backendSkills = null;
      
      try {
        // Call the content.js function that handles backend + fallback logic
        booleanSearch = await window.generateBooleanSearch(parsedJD, 'simple');
        
        // Check if we have backend skills available
        if (window.lastBackendResult && window.lastBackendResult.data && window.lastBackendResult.data.skills) {
          backendSkills = window.lastBackendResult.data.skills.map(skill => 
            typeof skill === 'object' ? skill.name : skill
          );
        }
      } catch (error) {
        console.error('❌ Content.js generateBooleanSearch error:', error);
        // Fallback to local BooleanSearch module
        if (window.BooleanSearch && window.BooleanSearch.generateBooleanSearch) {
          booleanSearch = await window.BooleanSearch.generateBooleanSearch(parsedJD, 'simple');
        } else {
          booleanSearch = generateFallbackBooleanSearch(parsedJD);
        }
      }
      
      // If boolean search is empty or failed, use fallback
      if (!booleanSearch || booleanSearch.trim() === '') {
        console.log('⚠️ Boolean search failed, using fallback');
        booleanSearch = generateFallbackBooleanSearch(parsedJD);
      }
      

      
      // Use backend skills if available, otherwise use local skills
      const finalSkills = backendSkills || skills;
      
      // Update the UI with dynamic content and Gemini context
      updateUIWithDynamicContent(finalSkills, booleanSearch, geminiContext);
      
    } catch (error) {
      console.error('❌ Error generating dynamic content:', error);
      // Fallback to default content
      updateUIWithDynamicContent(['Power BI', 'SQL', 'DAX'], '("Power BI" AND "SQL")');
    }
  }

  /**
   * Update UI for non-job emails
   */
  function updateUIWithNonJobMessage(detectionResult) {
    console.log('🔄 Updating UI with non-job message:', detectionResult);
    
    const container = document.getElementById('firki-container');
    if (!container) {
      console.error('❌ Firki container not found');
      return;
    }
    
    console.log('🔍 Container found, checking structure:', container);
    console.log('🔍 Container children:', container.children);
    console.log('🔍 Container innerHTML:', container.innerHTML);
    console.log('🔍 Container classList:', container.classList);
    console.log('🔍 Container id:', container.id);
    
    // Find the sidebar view which contains the content
    const sidebarView = container.querySelector('#firki-sidebar-view');
    if (!sidebarView) {
      console.error('❌ Firki sidebar view not found');
      return;
    }
    
    // Find the content area (the div with padding: 16px)
    const contentArea = sidebarView.querySelector('div[style*="padding: 16px"]');
    if (!contentArea) {
      console.error('❌ Content area not found in sidebar view');
      return;
    }
    
    const confidence = Math.round(detectionResult.confidence * 100);
    
    contentArea.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #666;">
        <div style="font-size: 16px; margin-bottom: 10px; color: #999;">
          📧 This doesn't appear to be a job-related email
        </div>
        <div style="font-size: 12px; color: #999; margin-bottom: 15px;">
          Confidence: ${confidence}%
        </div>
        <div style="font-size: 12px; color: #666; line-height: 1.4;">
          Firki analyzes job descriptions to extract skills and generate boolean searches for LinkedIn.
          <br><br>
          <strong>Looking for:</strong> Job postings, recruitment emails, position descriptions
        </div>
      </div>
    `;
    
    console.log('✅ Non-job message HTML updated');
    
    // Show the container
    container.classList.add('expanded');
    uiState.isExpanded = true;
    
    console.log('✅ Container expanded for non-job message');
  }

  /**
   * Extract job description from the current email content
   */
  function extractJobDescriptionFromEmail() {
    let jobDescription = document.querySelector('.a3s')?.textContent || '';
    
    // Filter out email headers and forwarding information
    const emailHeaderPatterns = [
      /---------- Forwarded message ---------/gi,
      /From:.*?\n/gi,
      /To:.*?\n/gi,
      /Subject:.*?\n/gi,
      /Date:.*?\n/gi,
      /Sent:.*?\n/gi,
      /Received:.*?\n/gi
    ];
    
    emailHeaderPatterns.forEach(pattern => {
      jobDescription = jobDescription.replace(pattern, '');
    });
    
    // Clean up extra whitespace
    jobDescription = jobDescription.replace(/\n\s*\n/g, '\n').trim();
    return jobDescription;
  }

  /**
   * Extract skills from the current email content using intelligent parser
   */
  async function extractSkillsFromEmail() {
    const emailContent = document.querySelector('.a3s')?.textContent || '';
    console.log('📧 Email content length:', emailContent.length);
    console.log('📧 Email content preview:', emailContent.substring(0, 200) + '...');
    
    // Use the intelligent parser if available
    if (window.IntelligentJDParser && window.IntelligentJDParser.parseJobDescription) {
      console.log('🧠 Using Intelligent JD Parser for skill extraction');
      try {
        const result = await window.IntelligentJDParser.parseJobDescription(emailContent);
        console.log('🧠 Intelligent parser result:', result);
        
        if (result && result.skills && result.skills.length > 0) {
          console.log('🧠 Extracted skills from intelligent parser:', result.skills);
          return result.skills;
        }
      } catch (error) {
        console.error('❌ Intelligent parser failed:', error);
      }
    }
    
    // Fallback to BooleanSearch module if intelligent parser not available
    if (window.BooleanSearch && window.BooleanSearch.extractSkillsFromText) {
      console.log('🔍 Using BooleanSearch module for skill extraction (fallback)');
      const skills = window.BooleanSearch.extractSkillsFromText(emailContent);
      console.log('🔍 BooleanSearch extracted skills:', skills);
      return skills;
    }
    
    // Final fallback to basic patterns
    console.log('⚠️ Using basic skill patterns (fallback)');
    const basicSkills = extractBasicSkills(emailContent);
    console.log('⚠️ Basic extracted skills:', basicSkills);
    return basicSkills;
  }

  /**
   * Basic skill extraction as final fallback
   */
  function extractBasicSkills(emailContent) {
    const skills = new Set();
    
    // Basic technical term patterns
    const basicPatterns = [
      /\b(python|java|javascript|typescript|react|angular|vue|aws|azure|sql|mongodb|docker|kubernetes)\b/gi
    ];
    
    basicPatterns.forEach(pattern => {
      const matches = emailContent.match(pattern) || [];
      matches.forEach(match => {
        skills.add(match.toLowerCase());
      });
    });
    
    return Array.from(skills);
  }

  /**
   * Fallback boolean search generation
   */
  function generateFallbackBooleanSearch(parsedJD) {
    const skills = parsedJD.skills || [];
    
    console.log('🔄 Fallback boolean search - skills:', skills);
    
    if (skills.length === 0) {
      console.log('⚠️ No skills found, using default');
      return '("Power BI" AND "SQL")';
    }
    
    // Use AND for targeted search (better results)
    const selectedSkills = skills.slice(0, 3);
    const booleanSearch = selectedSkills.map(skill => `"${skill}"`).join(' AND ');
    console.log('🔄 Fallback boolean search result:', booleanSearch);
    return booleanSearch;
  }

  /**
   * Update UI with dynamic content
   */
  async function updateUIWithDynamicContent(skills, booleanSearch, geminiContext) {
    const container = document.getElementById('firki-container');
    if (!container) return;
    
    console.log('🔍 DEBUG: Original skills received:', skills);
    console.log('🤖 DEBUG: Gemini context received:', geminiContext);
    
    // Limit skills to maximum 5 and clean them
    const limitedSkills = skills.slice(0, 5).map(skill => 
      skill.replace(/[,\s]+$/, '').trim() // Remove trailing commas and whitespace
    );
    
    console.log('🔍 DEBUG: Limited skills:', limitedSkills);
    
    // Update skills section
    const skillsContainer = container.querySelector('.firki-sidebar-view div[style*="flex-wrap"]');
    if (skillsContainer) {
      skillsContainer.innerHTML = limitedSkills.map(skill => 
        `<span style="background-color: #f3f4f6; color: #374151; font-size: 12px; font-weight: 500; padding: 6px 12px; border-radius: 9999px; border: 1px solid #d1d5db; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">${skill}</span>`
      ).join('');
    }
    
    // Update boolean search textarea
    const textarea = container.querySelector('textarea');
    if (textarea) {
      textarea.value = booleanSearch;
    }
    
    // Handle context generation - prioritize Gemini context if available
    let helpfulItems = [];
    
    if (geminiContext) {
      console.log('🤖 Using Gemini context:', geminiContext);
      helpfulItems.push(geminiContext);
    } else if (window.SkillContextHelper && limitedSkills.length > 0) {
      console.log('🧠 SkillContextHelper available, generating helpful questions for:', limitedSkills);
      
      // Get the job description for dynamic recognition
      let jobDescription = document.querySelector('.a3s')?.textContent || '';
      
      // Filter out email headers and forwarding information
      const emailHeaderPatterns = [
        /---------- Forwarded message ---------/gi,
        /From:.*?\n/gi,
        /To:.*?\n/gi,
        /Subject:.*?\n/gi,
        /Date:.*?\n/gi,
        /Sent:.*?\n/gi,
        /Received:.*?\n/gi
      ];
      
      emailHeaderPatterns.forEach(pattern => {
        jobDescription = jobDescription.replace(pattern, '');
      });
      
      // Clean up extra whitespace
      jobDescription = jobDescription.replace(/\n\s*\n/g, '\n').trim();
      
      // Use the first key skill for context (simple logic)
      const firstSkill = limitedSkills[0];
      const contextSkills = firstSkill ? [firstSkill] : [];
      console.log('🔍 DEBUG: Using first skill for context:', firstSkill);
      
      // Use simple context lookup instead of complex generation
      if (firstSkill && window.SkillContextHelper && window.SkillContextHelper.getSimpleSkillContext) {
        const context = window.SkillContextHelper.getSimpleSkillContext(firstSkill);
        if (context) {
          helpfulItems.push(context);
          console.log('🔍 DEBUG: Found simple context for:', firstSkill);
        } else {
          console.log('🔍 DEBUG: No simple context found for:', firstSkill);
        }
      }
      
      // Fallback to complex generation if simple lookup fails
      if (helpfulItems.length === 0) {
        helpfulItems = await window.SkillContextHelper.generateHelpfulQuestions(contextSkills, jobDescription);
        console.log('🧠 Generated helpful items (fallback):', helpfulItems);
      }
      
      // Final fallback: If still no context and first skill is Palantir Foundry, create it manually
      if (helpfulItems.length === 0 && firstSkill && firstSkill.toLowerCase().includes('palantir foundry')) {
        console.log('🔍 DEBUG: Creating final fallback context for Palantir Foundry');
        helpfulItems.push({
          skill: 'Palantir Foundry',
          description: 'Enterprise data integration and analytics platform',
          category: 'Data Platform',
          context: 'Primarily used by government agencies and large enterprises for data integration and analytics',
          probingQuestions: [],
          relatedSkills: []
        });
      }
    }
    
    // Create and insert context section if we have helpful items
    if (helpfulItems.length > 0) {
      console.log('🧠 Creating helpful questions HTML...');
      
      let helpfulHTML;
      if (geminiContext) {
        // Use Gemini context format
        helpfulHTML = `
          <div style="margin-bottom: 16px;">
            <h2 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #374151;">Context:</h2>
            <div style="background: #f9fafb; border-radius: 6px; padding: 10px; margin-bottom: 6px; border: 1px solid #e5e7eb;">
              <span style="background-color: #e0e7ff; color: #3730a3; padding: 2px 4px; border-radius: 3px; font-weight: 600;">${geminiContext.skill}</span> (${geminiContext.category}) - ${geminiContext.context}
            </div>
          </div>
        `;
      } else {
        // Use existing SkillContextHelper format
        helpfulHTML = window.SkillContextHelper.createHelpfulQuestionsHTML(helpfulItems);
      }
      
      console.log('🧠 Helpful HTML created:', helpfulHTML.substring(0, 200) + '...');
      
      // Check if context section already exists and remove it
      const existingContexts = container.querySelectorAll('h2');
      existingContexts.forEach(h2 => {
        if (h2.textContent === 'Context:') {
          const contextSection = h2.closest('div[style*="margin-bottom: 16px"]');
          if (contextSection) {
            contextSection.remove();
            console.log('🧠 Removed existing context section');
          }
        }
      });
      
      // Insert helpful questions section after the boolean search section
      const textarea = container.querySelector('textarea');
      if (textarea) {
        const booleanSearchSection = textarea.closest('div[style*="margin-bottom: 16px"]');
        if (booleanSearchSection) {
          const helpfulDiv = document.createElement('div');
          helpfulDiv.innerHTML = helpfulHTML;
          booleanSearchSection.parentNode.insertBefore(helpfulDiv.firstElementChild, booleanSearchSection.nextSibling);
          console.log('🧠 Helpful questions section inserted successfully');
        } else {
          // Fallback: insert at the end of the main content area
          const mainContent = container.querySelector('div[style*="max-height: 70vh"]');
          if (mainContent) {
            const helpfulDiv = document.createElement('div');
            helpfulDiv.innerHTML = helpfulHTML;
            mainContent.appendChild(helpfulDiv.firstElementChild);
            console.log('🧠 Helpful questions section inserted at end of main content (fallback)');
          } else {
            console.error('❌ Could not find main content area for fallback insertion');
          }
        }
      } else {
        // Fallback: insert at the end of the main content area
        const mainContent = container.querySelector('div[style*="max-height: 70vh"]');
        if (mainContent) {
          const helpfulDiv = document.createElement('div');
          helpfulDiv.innerHTML = helpfulHTML;
          mainContent.appendChild(helpfulDiv.firstElementChild);
          console.log('🧠 Helpful questions section inserted at end of main content (fallback)');
        } else {
          console.error('❌ Could not find main content area for fallback insertion');
        }
      }
    } else {
      console.log('🧠 No helpful items generated');
    }
  }

  /**
   * Create active skill tag with blue styling
   */
  function createActiveSkillTag(skill) {
    return `<span style="background-color: #e0e7ff; color: #4f46e5; font-size: 12px; font-weight: 500; padding: 6px 12px; border-radius: 9999px; border: 1px solid #c7d2fe; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">${skill}</span>`;
  }

  /**
   * Create inactive skill tag with gray styling
   */
  function createInactiveSkillTag(skill) {
    return `<span style="background-color: #f3f4f6; color: #374151; font-size: 12px; font-weight: 500; padding: 6px 12px; border-radius: 9999px; border: 1px solid #d1d5db; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">${skill}</span>`;
  }

  /**
   * NEW: This observer watches for changes in the Gmail UI and shows/hides
   * the Firki container accordingly.
   */
  function setupMutationObserver() {
    const observer = new MutationObserver(() => {
      if (isInEmailView()) {
        // If we are in an email view, ensure the container is injected.
        injectFirkiContainer();
      } else {
        // Only remove container if we're definitely not in an email view
        // and the container is not currently expanded (user might be using it)
        const container = document.getElementById('firki-container');
        if (container && !uiState.isExpanded) {
          removeFirkiContainer();
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }



  // Export functions
  window.FirkiUI = {
    injectFirkiContainer,
    toggleFirkiPanel,
    setupMutationObserver,
    createFirkiContainer,
    // Add missing functions that content.js expects
    injectUserIcon: () => console.log('User icon injection not available'),
    showResultsPanel: (content) => {
      console.log('🎯 Showing results panel with content:', content);
      // Don't automatically expand - let user click the button
      console.log('⚠️ showResultsPanel called but not auto-expanding');
    },
    testUI: () => {
      console.log('🧪 Testing UI functionality...');
      const container = document.getElementById('firki-container');
      console.log('Container exists:', !!container);
      if (container) {
        console.log('Container classes:', container.className);
        console.log('UI state isExpanded:', uiState.isExpanded);
      }
      console.log('✅ UI test completed');
    }
  };



})();