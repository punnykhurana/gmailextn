// Boolean Search Logic for Gmail Job Sourcing Assistant
// Separated from UI logic for better maintainability

(function() {
  'use strict';

  // Boolean Search Configuration
  const BOOLEAN_CONFIG = {
    MAX_SKILLS_SIMPLE: 3,
    MAX_SKILLS_DETAILED: 4,
    MAX_MUST_HAVE_SKILLS: 2,
    MAX_OTHER_SKILLS: 3,
    MIN_SEARCH_LENGTH: 10,
    MAX_SEARCH_LENGTH: 500
  };

  // Priority skills for intelligent selection
  const PRIORITY_SKILLS = [
    // Programming Languages (highest priority - core requirement)
    'TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'C++', 'Swift', 'Kotlin', 'Go', 'Rust',
    // Frontend Frameworks (key for frontend roles)
    'React', 'Angular', 'Vue', 'Next.js', 'Svelte',
    // Backend Frameworks (key for backend roles)
    'Node.js', 'Express', 'Django', 'Spring', 'ASP.NET',
    // Cloud Platforms (important for modern development)
    'AWS', 'Azure', 'GCP', 'Firebase',
    // Databases (essential for full-stack)
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
    // Mobile Technologies (specific to mobile roles)
    'React Native', 'Flutter', 'iOS', 'Android',
    // DevOps Tools (important for modern workflows)
    'Docker', 'Kubernetes', 'CI/CD',
    // AI/ML (specialized roles)
    'AI', 'Machine Learning', 'TensorFlow', 'PyTorch',
    // APIs (essential for integration)
    'GraphQL', 'REST API',
    // Functional Programming (specialized)
    'ClojureScript', 'Clojure', 'Haskell', 'Scala'
  ];

  // Generic terms to filter out
  const GENERIC_TERMS = [
    'development', 'programming', 'coding', 'implementation',
    'testing', 'debugging', 'deployment', 'maintenance',
    'senior', 'junior', 'lead', 'principal', 'entry level',
    'remote', 'hybrid', 'onsite', 'location', 'experience',
    'frontend', 'backend', 'full stack', 'ui/ux', 'ui', 'ux',
    'web', 'mobile', 'cloud', 'database'
  ];

  // Implied skills to filter out
  const IMPLIED_SKILLS = [
    'Frontend', 'Backend', 'Full stack', 'UI/UX', 'UI', 'UX', 'Web', 'Mobile', 'Cloud', 'Database'
  ];

  // Must-have skills (core requirements)
  const MUST_HAVE_SKILLS = ['TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'C++'];

  // Enhanced skill consolidation rules with grouping
  const CONSOLIDATION_RULES = [
    // Spring Framework grouping
    { specific: ['SpringBoot', 'Spring Boot', 'SpringCloud', 'Spring Cloud', 'Spring'], group: 'Spring' },
    
    // REST API grouping
    { specific: ['RESTFul APIs', 'RESTFUL APIs', 'REST API', 'REST APIs', 'API'], group: 'REST API' },
    
    // Database grouping
    { specific: ['PostgreSQL', 'Postgres', 'MySQL', 'SQL Server'], group: 'SQL' },
    { specific: ['MongoDB', 'NoSQL'], group: 'MongoDB' },
    
    // Java ecosystem grouping
    { specific: ['Java', 'JUnit', 'Maven'], group: 'Java' },
    
    // DevOps grouping
    { specific: ['Kubernetes', 'Docker', 'Jenkins', 'GitHub Actions'], group: 'DevOps' },
    { specific: ['Git', 'GitHub', 'GitLab'], group: 'Git' },
    
    // Cloud platforms grouping
    { specific: ['AWS', 'Amazon Web Services'], group: 'AWS' },
    { specific: ['Azure', 'Microsoft Azure'], group: 'Azure' },
    { specific: ['GCP', 'Google Cloud'], group: 'GCP' },
    
    // Frontend frameworks grouping
    { specific: ['React', 'React.js', 'ReactJS'], group: 'React' },
    { specific: ['Angular', 'Angular.js', 'AngularJS'], group: 'Angular' },
    { specific: ['Vue', 'Vue.js', 'VueJS'], group: 'Vue' },
    
    // Backend frameworks grouping
    { specific: ['Node.js', 'NodeJS', 'Express'], group: 'Node.js' },
    { specific: ['Django', 'Flask'], group: 'Python' },
    
    // AI/ML grouping
    { specific: ['Machine Learning', 'ML', 'AI', 'Artificial Intelligence'], group: 'Machine Learning' },
    { specific: ['TensorFlow', 'PyTorch'], group: 'Deep Learning' },
    
    // Remove generic terms
    { specific: ['JavaScript', 'JS'], remove: 'JavaScript' },
    { specific: ['TypeScript', 'TS'], remove: 'TypeScript' },
    { specific: ['Python', 'Python3'], remove: 'Python' },
    { specific: ['C#', 'C Sharp'], remove: 'C#' },
    { specific: ['C++', 'C plus plus'], remove: 'C++' }
  ];

  // Cached results for better performance
  let cachedSearchResults = new Map();
  let lastSearchTime = 0;
  const SEARCH_CACHE_DURATION = 30000; // Cache for 30 seconds
  const SEARCH_THROTTLE = 2000; // Only search every 2 seconds

  // Extract skills from raw text
  function extractSkillsFromText(text) {
    try {
      if (!text || text.length < 50) {
        return [];
      }
      
      const skills = [];
      
      // Extract skills using technology patterns - improved with better matching
      const technologyPatterns = [
        // Data & Analytics
        { pattern: /(?:Power BI|PowerBI|powerbi)/gi, skill: 'Power BI' },
        { pattern: /(?:SQL|MySQL|PostgreSQL|postgres)/gi, skill: 'SQL' },
        { pattern: /(?:DAX|Data Analysis Expressions)/gi, skill: 'DAX' },
        { pattern: /(?:Tableau|Looker)/gi, skill: 'Tableau' },
        { pattern: /(?:Excel|Advanced Excel)/gi, skill: 'Excel' },
        { pattern: /(?:Data Visualization)/gi, skill: 'Data Visualization' },
        { pattern: /(?:ETL|Extract Transform Load)/gi, skill: 'ETL' },
        
        // Programming Languages
        { pattern: /(?:TypeScript|TS)/gi, skill: 'TypeScript' },
        { pattern: /(?:JavaScript|JS)/gi, skill: 'JavaScript' },
        { pattern: /(?:Python|Python3)/gi, skill: 'Python' },
        { pattern: /(?:Java)/gi, skill: 'Java' },
        { pattern: /(?:C#|C Sharp)/gi, skill: 'C#' },
        { pattern: /(?:C\+\+|C plus plus)/gi, skill: 'C++' },
        { pattern: /(?:Swift)/gi, skill: 'Swift' },
        { pattern: /(?:Kotlin)/gi, skill: 'Kotlin' },
        { pattern: /(?:Go|Golang)/gi, skill: 'Go' },
        { pattern: /(?:Rust)/gi, skill: 'Rust' },
        { pattern: /(?:R|R Programming)/gi, skill: 'R' },
        
        // Frontend Frameworks
        { pattern: /(?:React|React\.js)/gi, skill: 'React' },
        { pattern: /(?:Angular|Angular\.js)/gi, skill: 'Angular' },
        { pattern: /(?:Vue|Vue\.js)/gi, skill: 'Vue' },
        { pattern: /(?:Next\.js|NextJS)/gi, skill: 'Next.js' },
        { pattern: /(?:Svelte)/gi, skill: 'Svelte' },
        
        // Backend Frameworks
        { pattern: /(?:Node\.js|NodeJS|Nodejs)/gi, skill: 'Node.js' },
        { pattern: /(?:Express\.js|Express)/gi, skill: 'Express' },
        { pattern: /(?:Django)/gi, skill: 'Django' },
        { pattern: /(?:Spring|Spring Boot)/gi, skill: 'Spring' },
        { pattern: /(?:ASP\.NET|ASP\.NET Core)/gi, skill: 'ASP.NET' },
        { pattern: /(?:Laravel)/gi, skill: 'Laravel' },
        { pattern: /(?:Ruby on Rails|Rails)/gi, skill: 'Ruby on Rails' },
        
        // Cloud Platforms
        { pattern: /(?:AWS|Amazon Web Services)/gi, skill: 'AWS' },
        { pattern: /(?:Azure|Microsoft Azure)/gi, skill: 'Azure' },
        { pattern: /(?:GCP|Google Cloud|Google Cloud Platform)/gi, skill: 'GCP' },
        { pattern: /(?:Firebase)/gi, skill: 'Firebase' },
        { pattern: /(?:Heroku)/gi, skill: 'Heroku' },
        
        // Databases
        { pattern: /(?:PostgreSQL|Postgres)/gi, skill: 'PostgreSQL' },
        { pattern: /(?:MySQL)/gi, skill: 'MySQL' },
        { pattern: /(?:MongoDB|NoSQL)/gi, skill: 'MongoDB' },
        { pattern: /(?:Redis)/gi, skill: 'Redis' },
        { pattern: /(?:Oracle)/gi, skill: 'Oracle' },
        { pattern: /(?:SQL Server)/gi, skill: 'SQL Server' },
        { pattern: /(?:Redshift|Snowflake)/gi, skill: 'Redshift' },
        
        // Mobile Technologies
        { pattern: /(?:React Native)/gi, skill: 'React Native' },
        { pattern: /(?:Flutter)/gi, skill: 'Flutter' },
        { pattern: /(?:iOS)/gi, skill: 'iOS' },
        { pattern: /(?:Android)/gi, skill: 'Android' },
        
        // DevOps Tools
        { pattern: /(?:Docker)/gi, skill: 'Docker' },
        { pattern: /(?:Kubernetes|K8s)/gi, skill: 'Kubernetes' },
        { pattern: /(?:CI\/CD|CI CD|Continuous Integration)/gi, skill: 'CI/CD' },
        { pattern: /(?:Jenkins)/gi, skill: 'Jenkins' },
        { pattern: /(?:GitLab)/gi, skill: 'GitLab' },
        { pattern: /(?:GitHub Actions)/gi, skill: 'GitHub Actions' },
        { pattern: /(?:Git|GitHub|GitLab)/gi, skill: 'Git' },
        
        // AI & ML
        { pattern: /(?:Machine Learning|ML|AI)/gi, skill: 'Machine Learning' },
        { pattern: /(?:TensorFlow|PyTorch)/gi, skill: 'TensorFlow' },
        { pattern: /(?:Pandas|NumPy)/gi, skill: 'Pandas' },
        { pattern: /(?:Scikit-learn|Scikit)/gi, skill: 'Scikit-learn' },
        
        // APIs
        { pattern: /(?:GraphQL)/gi, skill: 'GraphQL' },
        { pattern: /(?:REST API|REST APIs|API)/gi, skill: 'REST API' },
        { pattern: /(?:SOAP)/gi, skill: 'SOAP' },
        { pattern: /(?:gRPC)/gi, skill: 'gRPC' },
        
        // Tools & Platforms
        { pattern: /(?:JIRA|Confluence)/gi, skill: 'JIRA' },
        { pattern: /(?:Agile|Scrum)/gi, skill: 'Agile' },
        { pattern: /(?:SAS|SPSS)/gi, skill: 'SAS' }
      ];
      
      // Check all patterns
      technologyPatterns.forEach(({ pattern, skill }) => {
        if (pattern.test(text)) {
          skills.push(skill);
        }
      });
      
      // Remove duplicates and return
      const uniqueSkills = [...new Set(skills)];
      console.log('🔍 Extracted skills from text:', uniqueSkills);
      return uniqueSkills;
      
    } catch (error) {
      console.error('❌ Error extracting skills from text:', error);
      return [];
    }
  }

  // Enhanced job title to skills mapping for inference
  const JOB_TITLE_SKILL_MAPPING = {
    // Workday roles
    'workday': {
      'data conversion': ['Workday', 'Data Conversion', 'Data Migration', 'ETL', 'HRIS'],
      'data migration': ['Workday', 'Data Migration', 'Data Conversion', 'ETL', 'HRIS'],
      'integration': ['Workday', 'Integration', 'API', 'REST', 'HRIS'],
      'developer': ['Workday', 'Workday Studio', 'Workday Extend', 'JavaScript', 'XML'],
      'consultant': ['Workday', 'HCM', 'Financial Management', 'HRIS', 'Business Process'],
      'administrator': ['Workday', 'HCM', 'Security', 'Business Process', 'Reporting']
    },
    
    // Salesforce roles
    'salesforce': {
      'developer': ['Salesforce', 'Apex', 'Lightning', 'SOQL', 'JavaScript'],
      'administrator': ['Salesforce', 'Lightning', 'Process Builder', 'Workflow', 'Reports'],
      'consultant': ['Salesforce', 'CRM', 'Business Process', 'Configuration', 'Integration'],
      'architect': ['Salesforce', 'Apex', 'Lightning', 'Integration', 'Architecture']
    },
    
    // React roles
    'react': {
      'developer': ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
      'frontend': ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
      'ui': ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'UI/UX']
    },
    
    // Python roles
    'python': {
      'developer': ['Python', 'Django', 'Flask', 'SQL', 'API'],
      'backend': ['Python', 'Django', 'Flask', 'SQL', 'API', 'REST'],
      'data': ['Python', 'Pandas', 'NumPy', 'SQL', 'Data Analysis'],
      'machine learning': ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Science']
    },
    
    // Java roles
    'java': {
      'developer': ['Java', 'Spring', 'Maven', 'SQL', 'REST API'],
      'backend': ['Java', 'Spring', 'Maven', 'SQL', 'REST API'],
      'spring': ['Java', 'Spring', 'Spring Boot', 'Maven', 'REST API']
    },
    
    // DevOps roles
    'devops': {
      'engineer': ['DevOps', 'Docker', 'Kubernetes', 'CI/CD', 'AWS'],
      'automation': ['DevOps', 'Automation', 'Jenkins', 'Docker', 'CI/CD']
    },
    
    // Data roles
    'data': {
      'engineer': ['Data Engineering', 'ETL', 'SQL', 'Python', 'Big Data'],
      'analyst': ['Data Analysis', 'SQL', 'Python', 'Excel', 'Tableau'],
      'scientist': ['Data Science', 'Python', 'Machine Learning', 'Statistics', 'SQL']
    },
    
    // Cloud roles
    'aws': {
      'engineer': ['AWS', 'Cloud', 'DevOps', 'Docker', 'Kubernetes'],
      'architect': ['AWS', 'Cloud Architecture', 'DevOps', 'Infrastructure']
    },
    
    'azure': {
      'engineer': ['Azure', 'Cloud', 'DevOps', 'Docker', 'Kubernetes'],
      'architect': ['Azure', 'Cloud Architecture', 'DevOps', 'Infrastructure']
    }
  };

  // Extract technical skills from job titles with intelligent inference
  function extractSkillsFromJobTitle(jobTitle) {
    if (!jobTitle) return [];
    
    const title = jobTitle.toLowerCase();
    const skills = [];
    
    // First, try exact matches from our mapping
    for (const [platform, roleMappings] of Object.entries(JOB_TITLE_SKILL_MAPPING)) {
      if (title.includes(platform)) {
        // Find the most specific role match
        for (const [role, skillList] of Object.entries(roleMappings)) {
          if (title.includes(role)) {
            console.log(`🎯 Found job title match: ${platform} + ${role}`);
            skills.push(...skillList);
            break; // Use the most specific match
          }
        }
        
        // If no specific role found, use general platform skills
        if (skills.length === 0) {
          console.log(`🎯 Found platform match: ${platform}`);
          skills.push(platform.charAt(0).toUpperCase() + platform.slice(1));
        }
        break; // Use the first platform match
      }
    }
    
    // Fallback: Common platforms and technologies
    if (skills.length === 0) {
      const platforms = ['workday', 'salesforce', 'sap', 'oracle', 'azure', 'aws', 'gcp', 'react', 'angular', 'vue', 'node.js', 'python', 'java', 'c#', 'sql'];
      
      // Common technical processes
      const processes = ['data conversion', 'data migration', 'integration', 'automation', 'etl', 'api', 'devops', 'ci/cd', 'testing', 'deployment'];
      
      // Check for platforms
      platforms.forEach(platform => {
        if (title.includes(platform)) {
          skills.push(platform.charAt(0).toUpperCase() + platform.slice(1));
        }
      });
      
      // Check for technical processes
      processes.forEach(process => {
        if (title.includes(process)) {
          skills.push(process.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
        }
      });
    }
    
    // Remove duplicates and return
    return [...new Set(skills)];
  }

  // Main Boolean search generation function with caching
  async function generateBooleanSearch(parsedJD, mode = 'simple') {
    console.log('🚀 Starting boolean search generation with NEW grouping logic');
    
    if (!parsedJD || !parsedJD.rawText) {
      console.log('⚠️ No parsed job description available for boolean search');
      return '';
    }

    // If skills array is empty, extract skills from raw text
    if (!parsedJD.skills || parsedJD.skills.length === 0) {
      console.log('🔍 Extracting skills from raw text...');
      parsedJD.skills = extractSkillsFromText(parsedJD.rawText);
      console.log('✅ Extracted skills:', parsedJD.skills);
    }

    // Create cache key
    const cacheKey = `${parsedJD.rawText?.substring(0, 100)}_${mode}`;
    const now = Date.now();
    
    // Check cache first
    if (cachedSearchResults.has(cacheKey)) {
      const cached = cachedSearchResults.get(cacheKey);
      if (now - cached.timestamp < SEARCH_CACHE_DURATION) {
        console.log('📋 Using cached boolean search result');
        return cached.result;
      }
    }

    // Throttle searches
    if (now - lastSearchTime < SEARCH_THROTTLE) {
      console.log('⏳ Search throttled, using fallback');
      return generateFallbackBooleanSearch(parsedJD, mode);
    }
    lastSearchTime = now;

    // Use AI-powered generation if available, otherwise fallback
    if (typeof generateAIBooleanSearch === 'function' && FIRKI_CONFIG.ENABLE_AI_BOOLEAN_GENERATION) {
      try {
        const result = await generateAIBooleanSearch(parsedJD, mode);
        
        // Cache the result
        cachedSearchResults.set(cacheKey, {
          result,
          timestamp: now
        });
        
        return result;
      } catch (error) {
        console.log('⚠️ AI boolean generation failed, using fallback:', error);
        const fallbackResult = generateFallbackBooleanSearch(parsedJD, mode);
        
        // Cache the fallback result
        cachedSearchResults.set(cacheKey, {
          result: fallbackResult,
          timestamp: now
        });
        
        return fallbackResult;
      }
    } else {
      const fallbackResult = generateFallbackBooleanSearch(parsedJD, mode);
      
      // Cache the fallback result
      cachedSearchResults.set(cacheKey, {
        result: fallbackResult,
        timestamp: now
      });
      
      return fallbackResult;
    }
  }

  // Fallback Boolean search generation (pattern-based)
  function generateFallbackBooleanSearch(parsedJD, mode = 'simple') {
    const { skills, suggestedSkills, aiSuggestions, rawText } = parsedJD;
    const cleanSkills = skills.filter(skill => skill && skill.trim().length > 0);
    const cleanSuggestedSkills = suggestedSkills.filter(skill => skill && skill.trim().length > 0);
    
    // Extract job title from the raw text
    const jobTitleMatch = rawText.match(/(?:Job Title|Position|Role):\s*([^\n\r]+)/i) || 
                         rawText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Developer|Engineer|Analyst|Specialist|Consultant|Administrator|Architect))/);
    const jobTitle = jobTitleMatch ? jobTitleMatch[1].trim() : '';
    
    console.log('🔍 Extracted job title:', jobTitle);
    
    // Extract skills from job title using intelligent inference
    const titleSkills = extractSkillsFromJobTitle(jobTitle);
    console.log('🔍 Skills inferred from job title:', titleSkills);
    
    // Determine if we should prioritize title-based skills
    const hasExplicitSkills = cleanSkills.length > 0 || cleanSuggestedSkills.length > 0;
    const hasTitleSkills = titleSkills.length > 0;
    
    console.log('🔍 Skill analysis:', {
      explicitSkills: cleanSkills.length,
      suggestedSkills: cleanSuggestedSkills.length,
      titleSkills: titleSkills.length,
      shouldUseTitleSkills: !hasExplicitSkills && hasTitleSkills
    });
    
    // Combine skills - prioritize title-based skills if JD doesn't have explicit skills
    let allSkills = [];
    
    if (!hasExplicitSkills && hasTitleSkills) {
      // Use title-based skills when JD doesn't mention specific skills
      console.log('🎯 Using title-based skills for boolean search');
      allSkills = [...titleSkills];
    } else {
      // Combine extracted skills with title skills
      allSkills = [...cleanSkills, ...titleSkills];
      if (cleanSuggestedSkills.length > 0) {
        // Add AI suggestions that aren't already in extracted skills
        const newSuggestedSkills = cleanSuggestedSkills.filter(skill => 
          !allSkills.some(extractedSkill => 
            extractedSkill.toLowerCase() === skill.toLowerCase()
          )
        );
        allSkills = [...allSkills, ...newSuggestedSkills];
        console.log('🔗 Combined skills:', { extracted: cleanSkills, titleSkills, suggested: newSuggestedSkills });
      }
    }
    
    // Consolidate similar and implied skills
    allSkills = consolidateSkills(allSkills);
    
    if (allSkills.length === 0) {
      return '';
    }

    // Filter out generic terms
    const filteredSkills = allSkills.filter(skill => {
      const skillLower = skill.toLowerCase();
      return !GENERIC_TERMS.some(term => skillLower.includes(term));
    });

    if (filteredSkills.length === 0) {
      return allSkills.slice(0, 3).join(' AND ');
    }

    // Select top 5 skills intelligently
    const selectedSkills = selectTopSkills(filteredSkills);
    const filteredSkillsForSearch = filterSkillsForSearch(selectedSkills);
    
    switch (mode) {
      case 'simple':
        // Targeted Search: Use top 2-3 skills with AND
        const topSkills = [...filteredSkillsForSearch.mustHaves, ...filteredSkillsForSearch.otherSkills].slice(0, BOOLEAN_CONFIG.MAX_SKILLS_SIMPLE);
        if (topSkills.length > 0) {
          // For specific job titles, create more targeted searches
          if (jobTitle.toLowerCase().includes('workday') && jobTitle.toLowerCase().includes('data conversion')) {
            return '"Workday" AND ("Data Conversion" OR "Data Migration")';
          }
          if (jobTitle.toLowerCase().includes('workday') && jobTitle.toLowerCase().includes('data migration')) {
            return '"Workday" AND ("Data Migration" OR "Data Conversion")';
          }
          if (jobTitle.toLowerCase().includes('workday') && jobTitle.toLowerCase().includes('integration')) {
            return '"Workday" AND ("Integration" OR "API")';
          }
          if (jobTitle.toLowerCase().includes('salesforce') && jobTitle.toLowerCase().includes('developer')) {
            return '"Salesforce" AND ("Apex" OR "Lightning")';
          }
          if (jobTitle.toLowerCase().includes('react') && jobTitle.toLowerCase().includes('developer')) {
            return '"React" AND "JavaScript"';
          }
          if (jobTitle.toLowerCase().includes('python') && jobTitle.toLowerCase().includes('developer')) {
            return '"Python" AND ("Django" OR "Flask")';
          }
          if (jobTitle.toLowerCase().includes('java') && jobTitle.toLowerCase().includes('developer')) {
            return '"Java" AND "Spring"';
          }
          if (jobTitle.toLowerCase().includes('devops') && jobTitle.toLowerCase().includes('engineer')) {
            return '"DevOps" AND ("Docker" OR "Kubernetes")';
          }
          
          return topSkills.map(skill => `"${skill}"`).join(' AND ');
        } else {
          return '';
        }
        
      case 'detailed':
        // Broad Search: Use top 3-4 skills with OR
        const broadSkills = [...filteredSkillsForSearch.mustHaves, ...filteredSkillsForSearch.otherSkills].slice(0, BOOLEAN_CONFIG.MAX_SKILLS_DETAILED);
        if (broadSkills.length > 0) {
          return broadSkills.map(skill => `"${skill}"`).join(' OR ');
        } else {
          return '';
        }
        
      default:
        const defaultSkills = [...filteredSkillsForSearch.mustHaves, ...filteredSkillsForSearch.otherSkills].slice(0, BOOLEAN_CONFIG.MAX_SKILLS_SIMPLE);
        return defaultSkills.map(skill => `"${skill}"`).join(' AND ');
    }
  }

  // Select top 5 skills intelligently with better prioritization
  function selectTopSkills(skills) {
    if (skills.length <= 5) {
      return skills;
    }
    
    // Enhanced priority skills for better selection
    const HIGH_PRIORITY_SKILLS = [
      // Core Programming Languages
      'Java', 'Python', 'JavaScript', 'TypeScript', 'C#', 'C++',
      // Popular Frameworks
      'Spring', 'React', 'Angular', 'Node.js', 'Django',
      // Databases
      'SQL', 'MongoDB', 'PostgreSQL', 'MySQL',
      // DevOps & Cloud
      'AWS', 'Azure', 'Kubernetes', 'Docker', 'Jenkins',
      // APIs & Communication
      'REST API', 'GraphQL', 'gRPC',
      // Specialized Technologies
      'Machine Learning', 'TensorFlow', 'Kafka', 'Redis'
    ];
    
    // Sort skills by priority
    const sortedSkills = skills.sort((a, b) => {
      const aIndex = HIGH_PRIORITY_SKILLS.findIndex(skill => 
        skill.toLowerCase().includes(a.toLowerCase()) ||
        a.toLowerCase().includes(skill.toLowerCase())
      );
      const bIndex = HIGH_PRIORITY_SKILLS.findIndex(skill => 
        skill.toLowerCase().includes(b.toLowerCase()) ||
        b.toLowerCase().includes(skill.toLowerCase())
      );
      
      // If both found, return by priority order
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      // If only one found, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      // If neither found, keep original order
      return 0;
    });
    
    // Take top 5 skills (max limit for better results)
    const topSkills = sortedSkills.slice(0, 5);
    
    console.log('🎯 Top 5 skills selected:', topSkills);
    return topSkills;
  }

  // Filter out implied skills and identify must-have skills
  function filterSkillsForSearch(skills) {
    // Filter out implied skills
    const filteredSkills = skills.filter(skill => 
      !IMPLIED_SKILLS.some(implied => 
        skill.toLowerCase().includes(implied.toLowerCase()) ||
        implied.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    // Identify must-have skills
    const mustHaves = filteredSkills.filter(skill => 
      MUST_HAVE_SKILLS.some(mustHave => 
        skill.toLowerCase().includes(mustHave.toLowerCase()) ||
        mustHave.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    // Other skills (non-must-have)
    const otherSkills = filteredSkills.filter(skill => 
      !mustHaves.includes(skill)
    );
    
    return {
      mustHaves: mustHaves.slice(0, BOOLEAN_CONFIG.MAX_MUST_HAVE_SKILLS),
      otherSkills: otherSkills.slice(0, BOOLEAN_CONFIG.MAX_OTHER_SKILLS)
    };
  }

      // Consolidate similar and implied skills with grouping
    function consolidateSkills(skills) {
      console.log('🔗 Starting skill consolidation with NEW grouping logic');
      if (skills.length <= 1) return skills;
    
    const consolidated = [...skills];
    const toRemove = new Set();
    const toAdd = new Set();
    
    // Apply consolidation rules
    CONSOLIDATION_RULES.forEach(rule => {
      const matchingSkills = consolidated.filter(skill => 
        rule.specific.some(specific => 
          skill.toLowerCase().includes(specific.toLowerCase()) ||
          specific.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      if (matchingSkills.length > 0) {
        if (rule.group) {
          // Group similar skills under one name
          matchingSkills.forEach(skill => toRemove.add(skill));
          toAdd.add(rule.group);
        } else if (rule.remove) {
          // Remove implied skill
          const impliedSkill = rule.remove;
          const index = consolidated.findIndex(s => 
            s.toLowerCase().includes(impliedSkill.toLowerCase())
          );
          if (index !== -1) {
            toRemove.add(consolidated[index]);
          }
        }
      }
    });
    
    // Remove consolidated skills and add grouped skills
    const filtered = consolidated.filter(skill => !toRemove.has(skill));
    const grouped = [...filtered, ...toAdd];
    
    // Remove duplicates
    const result = [...new Set(grouped)];
    
    console.log('🔗 Skill consolidation:', {
      original: skills,
      consolidated: result,
      removed: Array.from(toRemove),
      added: Array.from(toAdd)
    });
    
    return result;
  }

  // Validate and clean Boolean search query
  function validateBooleanQuery(query) {
    if (!query || query.trim().length === 0) {
      return '';
    }
    
    let cleanedQuery = query
      .replace(/\(\s*\)/g, '')
      .replace(/AND\s+AND/g, 'AND')
      .replace(/OR\s+OR/g, 'OR')
      .replace(/\s+/g, ' ')
      .trim();
    
    const unwantedInQuery = [
      'below', 'above', 'see', 'role', 'position',
      '6 Months', '8 years', 'years of', 'Months', 'hr', 'hours',
      'frontend', 'backend', 'full stack', 'ui/ux', 'ui', 'ux',
      'web', 'mobile', 'cloud', 'database'
    ];
    
    unwantedInQuery.forEach(phrase => {
      cleanedQuery = cleanedQuery.replace(new RegExp(phrase, 'gi'), '');
    });
    
    cleanedQuery = cleanedQuery
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ' ')
      .replace(/\s*\.\s*/g, ' ')
      .trim();
    
    return cleanedQuery;
  }

  // AI-powered Boolean search generation (if available)
  async function generateAIBooleanSearch(parsedJD, mode = 'simple') {
    // Use backend proxy so API keys remain server-side
    if (!FIRKI_CONFIG.BACKEND_ENABLED || !FIRKI_CONFIG.BACKEND_BASE_URL) {
      console.log('⏸️ Backend not configured, using fallback');
      return generateFallbackBooleanSearch(parsedJD, mode);
    }

    // Check rate limits
    if (typeof checkRateLimit === 'function' && !checkRateLimit()) {
      console.log('⏳ Skipping AI boolean generation due to rate limits');
      return generateFallbackBooleanSearch(parsedJD, mode);
    }

    const { rawText } = parsedJD;
    if (!rawText || rawText.length < 50) {
      console.log('⚠️ No job description available for AI boolean generation');
      return generateFallbackBooleanSearch(parsedJD, mode);
    }

    // Basic job title extraction (reuse fallback logic pattern)
    const jobTitleMatch = rawText.match(/(?:Job Title|Position|Role):\s*([^\n\r]+)/i) ||
                          rawText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Developer|Engineer|Analyst|Specialist|Consultant|Administrator|Architect))/);
    const jobTitle = jobTitleMatch ? jobTitleMatch[1].trim() : '';

    try {
      const resp = await fetch(`${FIRKI_CONFIG.BACKEND_BASE_URL}/api/analyze-jd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: jobTitle,
          job_description: rawText,
          mode
        })
      });

      if (!resp.ok) {
        throw new Error(`Backend error: ${resp.status}`);
      }

      const data = await resp.json();
      const aiQuery = data?.data?.boolean_search || '';

      if (aiQuery && aiQuery.length > BOOLEAN_CONFIG.MIN_SEARCH_LENGTH) {
        const validatedQuery = validateBooleanQuery(aiQuery);
        console.log('🤖 Backend AI generated boolean search:', validatedQuery);
        return validatedQuery;
      }

      console.log('⚠️ Backend returned invalid query, using fallback');
      return generateFallbackBooleanSearch(parsedJD, mode);
    } catch (error) {
      console.error('❌ Backend AI boolean generation failed:', error);
      return generateFallbackBooleanSearch(parsedJD, mode);
    }
  }

  // Clear cache periodically to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cachedSearchResults.entries()) {
      if (now - value.timestamp > SEARCH_CACHE_DURATION) {
        cachedSearchResults.delete(key);
      }
    }
  }, 60000); // Clean cache every minute

  // Export functions for use in other files
  window.BooleanSearch = {
    generateBooleanSearch,
    generateFallbackBooleanSearch,
    validateBooleanQuery,
    selectTopSkills,
    filterSkillsForSearch,
    consolidateSkills,
    extractSkillsFromText,
    extractSkillsFromJobTitle,
    BOOLEAN_CONFIG,
    PRIORITY_SKILLS,
    GENERIC_TERMS,
    IMPLIED_SKILLS,
    MUST_HAVE_SKILLS,
    CONSOLIDATION_RULES,
    VERSION: '2.0.0-with-grouping'
  };
  
  console.log('✅ BooleanSearch module loaded with NEW grouping logic v2.0.0');

})(); 