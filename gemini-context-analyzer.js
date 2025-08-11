// Gemini Context Analyzer - AI-powered job description analysis
// Uses Google's Gemini API to extract skills and provide context

(function() {
  'use strict';

  // Configuration
  const GEMINI_CONFIG = {
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent',
    MODEL: 'gemini-2.5-flash-preview-05-20',
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.3
  };

  // Update config when FIRKI_CONFIG becomes available
  function updateGeminiConfig() {
    if (window.FIRKI_CONFIG) {
      GEMINI_CONFIG.API_URL = window.FIRKI_CONFIG.GEMINI_API_URL || GEMINI_CONFIG.API_URL;
      GEMINI_CONFIG.MODEL = window.FIRKI_CONFIG.GEMINI_MODEL || GEMINI_CONFIG.MODEL;
      GEMINI_CONFIG.MAX_TOKENS = window.FIRKI_CONFIG.GEMINI_MAX_TOKENS || GEMINI_CONFIG.MAX_TOKENS;
      GEMINI_CONFIG.TEMPERATURE = window.FIRKI_CONFIG.GEMINI_TEMPERATURE || GEMINI_CONFIG.TEMPERATURE;
    }
  }

  // Cache for API responses
  const analysisCache = new Map();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Analyzes the Job Description using the Gemini API.
   * @param {string} jdText - The job description text.
   * @returns {Promise<Object>} Analysis result with skills and key skill context.
   */
  async function analyzeJd(jdText) {
    const apiKey = window.FIRKI_CONFIG?.GEMINI_API_KEY;
    
    if (!jdText || !apiKey) {
      console.error('❌ Missing required parameters: jdText or GEMINI_API_KEY in config');
      return null;
    }

    // Check cache first
    const cacheKey = `${jdText.substring(0, 100)}_${apiKey.substring(0, 10)}`;
    const now = Date.now();
    
    if (analysisCache.has(cacheKey)) {
      const cached = analysisCache.get(cacheKey);
      if (now - cached.timestamp < CACHE_DURATION) {
        console.log('📋 Using cached Gemini analysis result');
        return cached.result;
      }
    }

    // 1. Set up the prompt for the AI
    const prompt = `
        Your Role: You are an expert-level Talent Acquisition Partner with 15 years of experience.
        Your Task: Analyze the job description below. Identify the key skills and the single most critical aspect of the role.
        Output Requirement: Return a JSON object with two keys: "skills" (an array of objects with "name" and "selected" properties) and "keySkill" (an object with "name" and "context" properties).
        
        Guidelines:
        - Extract 5-7 most relevant technical skills from the job title and description
        - Focus on specific technologies, platforms, and technical processes
        - For the keySkill, choose the most critical/unique skill
        - Provide context that explains where/how this skill is used
        - Avoid implied skills like "Frontend", "Backend", "Full Stack", "UI/UX", "UI", "UX" - these are role descriptions, not technical skills
        - Pay special attention to job titles that indicate specific technical processes (e.g., "Data Conversion", "Data Migration", "Integration", "Automation")
        - Extract both the platform/technology AND the specific technical process/skill
        - IMPORTANT: If the job description doesn't explicitly mention technical skills, infer them from the job title using industry knowledge
        
        Examples:
        - "Workday Data Conversion Developer" → skills: ["Workday", "Data Conversion", "Data Migration", "ETL", "HRIS"]
        - "React Frontend Developer" → skills: ["React", "JavaScript", "TypeScript", "HTML", "CSS"]
        - "AWS DevOps Engineer" → skills: ["AWS", "DevOps", "Docker", "Kubernetes", "CI/CD"]
        - "Salesforce Developer" → skills: ["Salesforce", "Apex", "Lightning", "SOQL", "JavaScript"]
        - "Python Data Analyst" → skills: ["Python", "Pandas", "SQL", "Data Analysis", "Excel"]
        
        Job Description to Analyze:
        ${jdText}
    `;

    // 2. Prepare the payload for the Gemini API
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        // This schema forces the AI to return data in the exact structure we need
        responseSchema: {
          type: "OBJECT",
          properties: {
            "skills": {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  "name": { "type": "STRING" },
                  "selected": { "type": "BOOLEAN" }
                }
              }
            },
            "keySkill": {
              type: "OBJECT",
              properties: {
                "name": { "type": "STRING" },
                "context": { "type": "STRING" }
              }
            }
          }
        }
      }
    };

    // 3. Make the API call
    try {
        console.log('🤖 Making Gemini API call for JD analysis...');
        
        const apiUrl = `${GEMINI_CONFIG.API_URL}?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Gemini API request failed with status ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
            throw new Error('Invalid response structure from Gemini API');
        }
        
        const jsonText = result.candidates[0].content.parts[0].text;
        const aiData = JSON.parse(jsonText);

        console.log('✅ Gemini analysis successful:', aiData);

        // Cache the result
        analysisCache.set(cacheKey, {
          result: aiData,
          timestamp: now
        });

        return aiData;

    } catch (error) {
        console.error("❌ Error analyzing JD with Gemini:", error);
        return null;
    }
  }

  /**
   * Process the Gemini analysis result and format it for the UI
   * @param {Object} aiData - The raw analysis data from Gemini
   * @returns {Object} Formatted data for UI consumption
   */
  function processAnalysisResult(aiData) {
    if (!aiData || !aiData.skills || !aiData.keySkill) {
      console.error('❌ Invalid analysis data structure');
      return null;
    }

    // Format skills for UI
    const formattedSkills = aiData.skills.map(skill => ({
      name: skill.name,
      selected: skill.selected || false,
      isKey: skill.name === aiData.keySkill.name,
      enrichedContext: skill.name === aiData.keySkill.name ? aiData.keySkill.context : null
    }));

    // Create context data
    const contextData = {
      skill: aiData.keySkill.name,
      description: 'Technical skill',
      category: 'Technology',
      context: aiData.keySkill.context,
      probingQuestions: [],
      relatedSkills: []
    };

    return {
      skills: formattedSkills,
      context: contextData
    };
  }

  /**
   * Clear the analysis cache
   */
  function clearCache() {
    analysisCache.clear();
    console.log('🗑️ Gemini analysis cache cleared');
  }

  /**
   * Get cache statistics
   */
  function getCacheStats() {
    return {
      size: analysisCache.size,
      entries: Array.from(analysisCache.entries()).map(([key, value]) => ({
        key: key.substring(0, 50) + '...',
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp
      }))
    };
  }

  // Export functions for use in other files
  window.GeminiContextAnalyzer = {
    analyzeJd,
    processAnalysisResult,
    clearCache,
    getCacheStats,
    updateConfig: updateGeminiConfig,
    GEMINI_CONFIG,
    VERSION: '1.0.0'
  };

  console.log('✅ GeminiContextAnalyzer module loaded v1.0.0');

})(); 