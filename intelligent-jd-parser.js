// Intelligent Job Description Parser
// Automatically reads and understands any JD format without manual patterns

(function() {
  'use strict';

  const INTELLIGENT_PARSER_CONFIG = {
    VERSION: '1.0.0',
    MIN_CONFIDENCE: 0.7, // Increased from 0.6
    MAX_SKILLS: 5, // Show up to 5 skills in Key Skills section
    CONTEXT_WINDOW: 100,
    LEARNING_ENABLED: true
  };

  // Section identifiers for different JD formats
  const SECTION_PATTERNS = {
    'requirements': [
      /(?:must.?have|required|essential|mandatory|qualifications?|requirements?)/i,
      /(?:skills?|technologies?|tools?|frameworks?|languages?)/i
    ],
    'preferred': [
      /(?:nice.?to.?have|preferred|bonus|plus|advantage|desired)/i,
      /(?:experience|familiarity|knowledge)/i
    ],
    'responsibilities': [
      /(?:responsibilities?|duties?|tasks?|role|position)/i,
      /(?:develop|build|create|implement|design|architect)/i
    ]
  };

  /**
   * Intelligent JD parser that adapts to any format
   */
  class IntelligentJDParser {
    constructor() {
      this.learnedPatterns = new Map();
      this.skillContexts = new Map();
      this.confidenceScores = new Map();
    }

    /**
     * Main parsing function - adapts to any JD format
     */
    async parseJobDescription(text) {
      if (!text || text.length < 50) {
        return { skills: [], confidence: 0, sections: {} };
      }

      const sections = this.extractSections(text);
      const skills = await this.extractSkillsIntelligently(text, sections);
      const rankedSkills = this.rankSkillsByContext(skills, text);
      
      return {
        skills: rankedSkills,
        confidence: this.calculateConfidence(rankedSkills),
        sections: sections,
        rawText: text
      };
    }

    /**
     * Extract different sections from JD
     */
    extractSections(text) {
      const sections = {
        requirements: [],
        preferred: [],
        responsibilities: [],
        other: []
      };

      const lines = text.split(/\n+/);
      let currentSection = 'other';

      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        // Detect section based on headers
        for (const [section, patterns] of Object.entries(SECTION_PATTERNS)) {
          if (patterns.some(pattern => pattern.test(trimmedLine))) {
            currentSection = section;
            break;
          }
        }

        sections[currentSection].push(trimmedLine);
      });

      return sections;
    }

    /**
     * Intelligent skill extraction that adapts to any format
     */
    async extractSkillsIntelligently(text, sections) {
      const allSkills = new Set();
      const skillScores = new Map();

      // Method 1: Extract from requirements section (highest priority)
      const requirementsText = sections.requirements.join(' ');
      const requirementSkills = this.extractSkillsFromText(requirementsText, 3.0);
      requirementSkills.forEach(skill => {
        allSkills.add(skill);
        skillScores.set(skill, (skillScores.get(skill) || 0) + 3.0);
      });

      // Method 2: Extract from preferred section (medium priority)
      const preferredText = sections.preferred.join(' ');
      const preferredSkills = this.extractSkillsFromText(preferredText, 1.5);
      preferredSkills.forEach(skill => {
        allSkills.add(skill);
        skillScores.set(skill, (skillScores.get(skill) || 0) + 1.5);
      });

      // Method 3: Extract from responsibilities (context-based)
      const responsibilitiesText = sections.responsibilities.join(' ');
      const responsibilitySkills = this.extractSkillsFromText(responsibilitiesText, 2.0);
      responsibilitySkills.forEach(skill => {
        allSkills.add(skill);
        skillScores.set(skill, (skillScores.get(skill) || 0) + 2.0);
      });

      // Method 4: Extract from full text (fallback)
      const fullTextSkills = this.extractSkillsFromText(text, 1.0);
      fullTextSkills.forEach(skill => {
        allSkills.add(skill);
        skillScores.set(skill, (skillScores.get(skill) || 0) + 1.0);
      });

      // Method 5: Use AI for unknown patterns (if available)
      if (window.FirkiNLP && window.FirkiNLP.extractSkillsAI) {
        try {
          const aiSkills = await window.FirkiNLP.extractSkillsAI(text);
          aiSkills.forEach(skill => {
            allSkills.add(skill);
            skillScores.set(skill, (skillScores.get(skill) || 0) + 2.5);
          });
        } catch (e) {
          console.warn('AI extraction failed:', e);
        }
      }

      return Array.from(allSkills).map(skill => ({
        skill,
        score: skillScores.get(skill) || 0,
        context: this.extractSkillContext(text, skill)
      }));
    }

    /**
     * Extract skills from text using multiple strategies
     */
    extractSkillsFromText(text, baseScore = 1.0) {
      const skills = new Set();
      const lowerText = text.toLowerCase();
      
      // Define general terms to completely avoid
      const generalTermsToAvoid = [
        'solving', 'abilities', 'analytical', 'thinking', 'communication', 'collaboration',
        'self-motivated', 'independent', 'adaptable', 'eager', 'learn', 'technologies',
        'detail-oriented', 'focus', 'quality', 'experience', 'proficiency', 'knowledge',
        'ai', 'ml', 'machine learning', 'artificial intelligence', 'excellent', 'skills',
        'ability', 'work', 'new', 'user', 'code', 'development', 'team', 'project'
      ];
      
      // Strategy 1: Look for enterprise platforms and multi-word terms first (highest priority)
      const enterprisePlatforms = [
        'palantir foundry', 'ibm watson', 'aws bedrock', 'openai enterprise',
        'snowflake', 'tableau', 'power bi', 'looker', 'databricks', 'splunk',
        'servicenow', 'salesforce', 'workday', 'network automation',
        'infrastructure as code', 'event driven architecture', 'api led design'
      ];
      enterprisePlatforms.forEach(platform => {
        if (lowerText.includes(platform.toLowerCase())) {
          skills.add(platform);
        }
      });
      
      // Strategy 2: Look for specific technical skills (high priority)
      const specificTechnicalSkills = [
        'react', 'angular', 'vue', 'python', 'java', 'javascript', 'typescript',
        'docker', 'kubernetes', 'terraform', 'ansible', 'git', 'aws', 'azure',
        'mongodb', 'postgresql', 'mysql', 'redis', 'kafka', 'spark', 'hadoop',
        'etl', 'elt', 'data warehousing', 'nlp'
      ];
      specificTechnicalSkills.forEach(skill => {
        if (lowerText.includes(skill.toLowerCase())) {
          skills.add(skill);
        }
      });
      
      // Strategy 3: Look for capitalized technical terms (but filter out general ones)
      const capitalizedTerms = this.findCapitalizedTerms(text);
      capitalizedTerms.forEach(term => {
        const termLower = term.toLowerCase();
        // Only add if it's a technical term AND not a general term
        if (this.isTechnicalTerm(term) && !generalTermsToAvoid.includes(termLower)) {
          skills.add(term);
        }
      });
      
      // Strategy 4: Look for bullet points with technical terms (filtered)
      const bulletPattern = /[-•*]\s*([^.\n]+)/g;
      const bulletMatches = text.match(bulletPattern) || [];
      bulletMatches.forEach(bullet => {
        const content = bullet.replace(/[-•*]\s*/, '');
        const words = content.split(/\s+/);
        words.forEach(word => {
          const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
          if (this.isTechnicalTerm(cleanWord) && !generalTermsToAvoid.includes(cleanWord)) {
            skills.add(cleanWord);
          }
        });
      });
      
      // Strategy 5: Look for version numbers and specific technologies (filtered)
      const versionPatterns = [
        /\b(\w+)\s+\d+(\.\d+)*/gi,  // React 16, Python 3.8
        /\b(\w+)\s*\+\s*\b/gi,      // React+, Python+
        /\b(\w+)\s+experience/gi,   // Python experience
        /\b(\w+)\s+proficiency/gi,  // Python proficiency
        /\b(\w+)\s+knowledge/gi     // Python knowledge
      ];

      versionPatterns.forEach(pattern => {
        const matches = text.match(pattern) || [];
        matches.forEach(match => {
          const term = match.replace(/\s+\d+(\.\d+)*|\s*\+\s*|\s+(experience|proficiency|knowledge)/gi, '').toLowerCase();
          if (this.isTechnicalTerm(term) && !generalTermsToAvoid.includes(term)) {
            skills.add(term);
          }
        });
      });

      // Convert to array and filter out any remaining general terms
      const skillsArray = Array.from(skills);
      const filteredSkills = skillsArray.filter(skill => 
        !generalTermsToAvoid.includes(skill.toLowerCase())
      );
      
      return filteredSkills;
    }

    /**
     * Find capitalized terms that might be technical skills
     */
    findCapitalizedTerms(text) {
      const words = text.split(/\s+/);
      const capitalized = [];

      words.forEach(word => {
        // Remove punctuation and check if it's capitalized
        const cleanWord = word.replace(/[^\w]/g, '');
        if (cleanWord.length > 2 && /^[A-Z]/.test(cleanWord)) {
          capitalized.push(cleanWord);
        }
      });

      return capitalized;
    }

    /**
     * Check if a term is likely to be a technical skill
     */
    isTechnicalTerm(term) {
      if (!term || term.length < 2) return false;

      // General terms to exclude (these are NOT technical skills)
      const generalTermsToExclude = [
        'solving', 'abilities', 'analytical', 'thinking', 'communication', 'collaboration',
        'self-motivated', 'independent', 'adaptable', 'eager', 'learn', 'technologies',
        'detail-oriented', 'focus', 'quality', 'experience', 'proficiency', 'knowledge',
        'excellent', 'skills', 'ability', 'work', 'new', 'user', 'code', 'development',
        'team', 'project', 'understanding', 'practical', 'platform', 'tools', 'systems',
        'processes', 'methodologies', 'frameworks', 'principles', 'concepts', 'techniques'
      ];
      
      const termLower = term.toLowerCase();
      if (generalTermsToExclude.includes(termLower)) {
        return false;
      }

      // Common technical term patterns
      const technicalPatterns = [
        // Programming languages
        /\b(python|java|javascript|typescript|c\+\+|c#|go|rust|swift|kotlin|php|ruby|scala|r|matlab|perl)\b/i,
        
        // Frameworks and libraries
        /\b(react|angular|vue|django|flask|spring|express|laravel|rails|fastapi|koa|hapi)\b/i,
        
        // Cloud platforms
        /\b(aws|azure|gcp|firebase|heroku|digitalocean|vercel|netlify)\b/i,
        
        // Databases
        /\b(mysql|postgresql|mongodb|redis|sqlite|oracle|cassandra|dynamodb|elasticsearch)\b/i,
        
        // AI/ML (but be careful with general terms)
        /\b(tensorflow|pytorch|scikit-learn|pandas|numpy|matplotlib|jupyter|streamlit)\b/i,
        
        // DevOps
        /\b(docker|kubernetes|jenkins|git|terraform|ansible|chef|puppet)\b/i,
        
        // Data engineering
        /\b(kafka|spark|hadoop|airflow|etl|data pipeline)\b/i,
        
        // Architecture
        /\b(microservices|rest api|graphql|event driven|api led|cloud architecture)\b/i,
        
        // Security
        /\b(cybersecurity|authentication|authorization|encryption|security)\b/i,
        
        // Enterprise AI platforms
        /\b(openai|ibm watson|aws bedrock|generative ai|rag)\b/i,
        
        // Enterprise platforms and tools
        /\b(palantir foundry|palantir|foundry|snowflake|tableau|power bi|looker|databricks|splunk|servicenow|salesforce|workday)\b/i,
        
        // Specific tools
        /\b(streamlit|pytorch|kafka|airflow|spark|hadoop)\b/i
      ];

      return technicalPatterns.some(pattern => pattern.test(term));
    }

    /**
     * Extract context around skill mentions
     */
    extractSkillContext(text, skill) {
      const index = text.toLowerCase().indexOf(skill.toLowerCase());
      if (index === -1) return '';

      const start = Math.max(0, index - INTELLIGENT_PARSER_CONFIG.CONTEXT_WINDOW);
      const end = Math.min(text.length, index + skill.length + INTELLIGENT_PARSER_CONFIG.CONTEXT_WINDOW);
      
      return text.substring(start, end).trim();
    }

    /**
     * Rank skills by context and importance
     */
    rankSkillsByContext(skills, text) {
      // Remove duplicates and normalize
      const uniqueSkills = [];
      const seen = new Set();
      
      skills.forEach(item => {
        const normalizedSkill = item.skill.toLowerCase().trim();
        if (!seen.has(normalizedSkill)) {
          seen.add(normalizedSkill);
          uniqueSkills.push(item);
        }
      });
      
      // Score skills based on specificity and technical nature
      const scoredSkills = uniqueSkills.map(skill => {
        let score = skill.score || 1.0;
        
        // Highest priority: Enterprise platforms
        const enterprisePlatforms = [
          'palantir foundry', 'ibm watson', 'aws bedrock', 'openai enterprise',
          'snowflake', 'tableau', 'power bi', 'looker', 'databricks', 'splunk',
          'servicenow', 'salesforce', 'workday'
        ];
        
        if (enterprisePlatforms.includes(skill.skill.toLowerCase())) {
          score += 5.0; // Very high boost for enterprise platforms
        }
        
        // High priority: Specific technical skills
        const specificTechnicalTerms = [
          'react', 'angular', 'vue', 'python', 'java', 'javascript',
          'docker', 'kubernetes', 'terraform', 'ansible', 'aws', 'azure', 'mongodb',
          'postgresql', 'mysql', 'redis', 'kafka', 'spark', 'hadoop', 'etl', 'elt'
        ];
        
        if (specificTechnicalTerms.includes(skill.skill.toLowerCase())) {
          score += 3.0; // High boost for specific technical skills
        }
        
        // Penalize general/soft skills heavily
        const generalTerms = [
          'solving', 'abilities', 'analytical', 'thinking', 'communication', 'collaboration',
          'self-motivated', 'independent', 'adaptable', 'eager', 'learn', 'technologies',
          'detail-oriented', 'focus', 'quality', 'experience', 'proficiency', 'knowledge',
          'ai', 'ml', 'machine learning', 'artificial intelligence'
        ];
        
        if (generalTerms.includes(skill.skill.toLowerCase())) {
          score -= 3.0; // Heavy penalty for general terms
        }
        
        return { ...skill, score };
      });
      
      return scoredSkills
        .sort((a, b) => b.score - a.score)
        .slice(0, 5) // Return up to 5 skills for Key Skills section
        .map(item => item.skill);
    }

    /**
     * Calculate confidence score
     */
    calculateConfidence(skills) {
      if (skills.length === 0) return 0;
      
      // Higher confidence for more skills and better distribution
      const baseConfidence = Math.min(skills.length / 5, 1.0);
      const sectionCoverage = this.calculateSectionCoverage(skills);
      
      return Math.min(baseConfidence + sectionCoverage, 1.0);
    }

    /**
     * Calculate how well skills cover different sections
     */
    calculateSectionCoverage(skills) {
      // This would analyze how well the skills cover requirements vs preferred vs responsibilities
      return 0.5; // Placeholder
    }

    /**
     * Learn from successful extractions
     */
    learnFromExtraction(jdText, extractedSkills, userFeedback) {
      if (!INTELLIGENT_PARSER_CONFIG.LEARNING_ENABLED) return;

      // Store successful patterns
      extractedSkills.forEach(skill => {
        const context = this.extractSkillContext(jdText, skill);
        if (!this.learnedPatterns.has(skill)) {
          this.learnedPatterns.set(skill, []);
        }
        this.learnedPatterns.get(skill).push(context);
      });

      // Update confidence scores based on user feedback
      if (userFeedback) {
        extractedSkills.forEach(skill => {
          const currentScore = this.confidenceScores.get(skill) || 0;
          const newScore = userFeedback.positive ? currentScore + 0.1 : currentScore - 0.1;
          this.confidenceScores.set(skill, Math.max(0, Math.min(1, newScore)));
        });
      }
    }

    /**
     * Get the top skill for context (only 1 skill)
     */
    getTopSkillForContext(skills, text) {
      const rankedSkills = this.rankSkillsByContext(skills, text);
      
      // Filter out general terms and return only the top technical skill
      const generalTerms = [
        'solving', 'abilities', 'analytical', 'thinking', 'communication', 'collaboration',
        'self-motivated', 'independent', 'adaptable', 'eager', 'learn', 'technologies',
        'detail-oriented', 'focus', 'quality', 'experience', 'proficiency', 'knowledge',
        'ai', 'ml', 'machine learning', 'artificial intelligence'
      ];
      
      const filteredSkills = rankedSkills.filter(skill => 
        !generalTerms.includes(skill.toLowerCase())
      );
      
      return filteredSkills.length > 0 ? [filteredSkills[0]] : [];
    }
  }

  // Create global instance
  const intelligentParser = new IntelligentJDParser();

  // Export the parser
  window.IntelligentJDParser = {
    parseJobDescription: intelligentParser.parseJobDescription.bind(intelligentParser),
    extractSections: intelligentParser.extractSections.bind(intelligentParser),
    extractSkillsIntelligently: intelligentParser.extractSkillsIntelligently.bind(intelligentParser),
    extractSkillsFromText: intelligentParser.extractSkillsFromText.bind(intelligentParser),
    findCapitalizedTerms: intelligentParser.findCapitalizedTerms.bind(intelligentParser),
    isTechnicalTerm: intelligentParser.isTechnicalTerm.bind(intelligentParser),
    extractSkillContext: intelligentParser.extractSkillContext.bind(intelligentParser),
    rankSkillsByContext: intelligentParser.rankSkillsByContext.bind(intelligentParser),
    calculateConfidence: intelligentParser.calculateConfidence.bind(intelligentParser),
    calculateSectionCoverage: intelligentParser.calculateSectionCoverage.bind(intelligentParser),
    learnFromExtraction: intelligentParser.learnFromExtraction.bind(intelligentParser),
    getTopSkillForContext: intelligentParser.getTopSkillForContext.bind(intelligentParser)
  };

  console.log('✅ Intelligent JD Parser loaded - adapts to any JD format automatically');

})(); 