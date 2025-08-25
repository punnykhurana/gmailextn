// Skill Context Helper - Provides contextual information and probing questions for unfamiliar skills
// Helps recruiters understand technologies and ask better interview questions

(function() {
  'use strict';

  const SKILL_CONTEXT_DATABASE = {
    // Enterprise AI & Data Platforms
    'palantir foundry': {
      description: 'Enterprise data integration and analytics platform',
      category: 'Data Platform',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Primarily used by government agencies and large enterprises for data integration and analytics',
      relatedSkills: ['ETL', 'Data Integration', 'Data Modeling', 'Analytics', 'Enterprise Software']
    },

    'ibm watson': {
      description: 'AI and machine learning platform',
      category: 'AI Platform',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Enterprise AI platform used by Fortune 500 companies for NLP, computer vision, and predictive analytics',
      relatedSkills: ['Machine Learning', 'NLP', 'AI', 'Predictive Analytics', 'Computer Vision']
    },

    'aws bedrock': {
      description: 'Amazon\'s managed service for foundation models',
      category: 'AI Platform',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Used by companies building generative AI applications and RAG systems',
      relatedSkills: ['Generative AI', 'RAG', 'Prompt Engineering', 'Foundation Models', 'AWS']
    },

    'openai enterprise': {
      description: 'Enterprise version of OpenAI\'s AI services',
      category: 'AI Platform',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Enterprise-grade AI used by companies requiring enhanced security and support for GPT models',
      relatedSkills: ['GPT', 'Generative AI', 'NLP', 'API Integration', 'Text Generation']
    },

    // Data Engineering & Analytics
    'etl': {
      description: 'Extract, Transform, Load data processing',
      category: 'Data Engineering',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Core data engineering process used across all industries for data pipeline development',
      relatedSkills: ['Data Pipeline', 'Data Integration', 'Data Warehousing', 'Apache Airflow', 'Informatica']
    },

    'workday': {
      description: 'Enterprise HR and finance management platform',
      category: 'Enterprise Platform',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Used by large enterprises for HR, payroll, and financial management',
      relatedSkills: ['HRIS', 'Payroll', 'Financial Management', 'Enterprise Software', 'Workday Studio']
    },

    'servicenow': {
      description: 'IT service management and workflow automation platform',
      category: 'Enterprise Platform',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Used by enterprises for IT service management, workflow automation, and digital transformation',
      relatedSkills: ['ITSM', 'Workflow Automation', 'Service Management', 'Enterprise Software', 'Digital Transformation']
    },

    'elt': {
      description: 'Extract, Load, Transform data processing',
      category: 'Data Engineering',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Modern data approach used by companies with cloud data warehouses like Snowflake',
      relatedSkills: ['dbt', 'Snowflake', 'Data Modeling', 'SQL', 'Cloud Data Warehouse']
    },

    'python': {
      description: 'Programming language for data science and automation',
      category: 'Programming Language',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Widely used for data science, automation, and backend development across all industries',
      relatedSkills: ['Data Science', 'Automation', 'Backend Development', 'Machine Learning', 'Scripting']
    },

    'java': {
      description: 'Enterprise programming language',
      category: 'Programming Language',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Enterprise programming language used by large companies for scalable applications',
      relatedSkills: ['Enterprise Development', 'Spring Framework', 'Microservices', 'Scalable Applications', 'Backend Development']
    },

    'data warehousing': {
      description: 'Centralized data storage for analytics',
      category: 'Data Engineering',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Essential for companies with large-scale data analytics and reporting needs',
      relatedSkills: ['Snowflake', 'BigQuery', 'Redshift', 'Data Modeling', 'SQL']
    },

    // Cloud & Architecture
    'cloud architecture': {
      description: 'Design of cloud-based systems',
      category: 'Architecture',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Critical for companies migrating to cloud or building scalable applications',
      relatedSkills: ['Microservices', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP']
    },

    'event driven architecture': {
      description: 'System design based on event processing',
      category: 'Architecture',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Used by companies requiring real-time processing and microservices communication',
      relatedSkills: ['Apache Kafka', 'RabbitMQ', 'Event Sourcing', 'Microservices', 'Real-time Processing']
    },

    'api led design': {
      description: 'Design approach centered around APIs',
      category: 'Architecture',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Essential for companies building scalable, reusable services and integrations',
      relatedSkills: ['REST API', 'GraphQL', 'API Gateway', 'Microservices', 'OAuth']
    },

    // AI & Machine Learning
    'generative ai': {
      description: 'AI systems that generate content',
      category: 'AI/ML',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Revolutionizing content creation, used by companies in marketing, media, and product development',
      relatedSkills: ['GPT', 'BERT', 'Prompt Engineering', 'RAG', 'Fine-tuning']
    },

    'rag': {
      description: 'Retrieval-Augmented Generation',
      category: 'AI/ML',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Used by companies building AI applications that need access to specific knowledge bases',
      relatedSkills: ['Vector Database', 'Embeddings', 'Knowledge Base', 'Conversational AI', 'Similarity Search']
    },

    // Network Automation Specific
    'network automation': {
      description: 'Automating network configuration and management',
      category: 'Networking',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Critical for large enterprises and service providers managing complex network infrastructure',
      relatedSkills: ['Python', 'Ansible', 'Terraform', 'Network APIs', 'DevOps']
    },

    'infrastructure as code': {
      description: 'Managing infrastructure through code',
      category: 'DevOps',
      probingQuestions: [
        'Can you tell me about a time when you had to integrate multiple automation tools together? What was the "glue" that held everything together?'
      ],
      context: 'Essential for companies practicing DevOps and managing cloud infrastructure at scale',
      relatedSkills: ['Terraform', 'CloudFormation', 'Ansible', 'Git', 'DevOps']
    }
  };

  /**
   * Get contextual information for a skill
   */
  function getSkillContext(skill) {
    const normalizedSkill = skill.toLowerCase().trim();
    
    // Direct match
    if (SKILL_CONTEXT_DATABASE[normalizedSkill]) {
      return SKILL_CONTEXT_DATABASE[normalizedSkill];
    }
    
    // Partial match
    for (const [key, value] of Object.entries(SKILL_CONTEXT_DATABASE)) {
      if (normalizedSkill.includes(key) || key.includes(normalizedSkill)) {
        return value;
      }
    }
    
    // No match found
    return null;
  }

  /**
   * Simple function to get context for a single skill
   */
  function getSimpleSkillContext(skill) {
    if (!skill) return null;
    
    const skillLower = skill.toLowerCase();
    const context = SKILL_CONTEXT_DATABASE[skillLower];
    
    if (context) {
      return {
        skill: skill,
        description: context.description,
        category: context.category,
        context: context.context,
        probingQuestions: [],
        relatedSkills: []
      };
    }
    
    return null;
  }

  /**
   * Generate helpful questions for unfamiliar skills
   */
  async function generateHelpfulQuestions(skills, jobDescription) {
    // Filter out general terms first
    const generalTermsToExclude = [
      'solving', 'abilities', 'analytical', 'thinking', 'communication', 'collaboration',
      'self-motivated', 'independent', 'adaptable', 'eager', 'learn', 'technologies',
      'detail-oriented', 'focus', 'quality', 'experience', 'proficiency', 'knowledge',
      'ai', 'ml', 'machine learning', 'artificial intelligence', 'excellent', 'skills',
      'ability', 'work', 'new', 'user', 'code', 'development', 'team', 'project'
    ];
    
    const filteredSkills = skills.filter(skill => 
      !generalTermsToExclude.includes(skill.toLowerCase())
    );
    
    if (filteredSkills.length === 0) {
      console.log('🧠 No specific technical skills found after filtering');
      return [];
    }
    
    // Use dynamic recognition if available
    if (window.DynamicSkillRecognition && window.DynamicSkillRecognition.identifyUnfamiliarSkills) {
      try {
        const unfamiliarSkills = await window.DynamicSkillRecognition.identifyUnfamiliarSkills(jobDescription, filteredSkills);
        const helpfulItems = [];
        
        // Prioritize enterprise platforms and specific technical skills
        const enterprisePlatforms = [
          'palantir foundry', 'ibm watson', 'aws bedrock', 'openai enterprise',
          'snowflake', 'tableau', 'power bi', 'looker', 'databricks', 'splunk',
          'servicenow', 'salesforce', 'workday'
        ];
        
        // Filter and prioritize skills
        const prioritizedSkills = unfamiliarSkills.filter(skill => {
          const skillLower = skill.skill.toLowerCase();
          // Prioritize enterprise platforms
          if (enterprisePlatforms.includes(skillLower)) {
            return true;
          }
          // Include other technical skills but exclude general terms
          return !generalTermsToExclude.includes(skillLower);
        });
        
        // Sort by priority (enterprise platforms first)
        prioritizedSkills.sort((a, b) => {
          const aIsEnterprise = enterprisePlatforms.includes(a.skill.toLowerCase());
          const bIsEnterprise = enterprisePlatforms.includes(b.skill.toLowerCase());
          if (aIsEnterprise && !bIsEnterprise) return -1;
          if (!aIsEnterprise && bIsEnterprise) return 1;
          return 0;
        });
        
        // Take only the first (most relevant) skill
        const topSkill = prioritizedSkills[0];
        if (topSkill) {
          const context = window.DynamicSkillRecognition.generateProbingQuestion(topSkill, topSkill.context);
          
          helpfulItems.push({
            skill: topSkill.skill,
            description: topSkill.category,
            category: topSkill.category,
            context: context,
            probingQuestions: [], // No questions needed
            relatedSkills: [] // No related skills needed
          });
        }
        
        return helpfulItems;
      } catch (error) {
        console.error('❌ Dynamic recognition failed:', error);
        // Fall back to legacy method
      }
    }
    
    // Legacy fallback method (keeping for backward compatibility)
    const commonSkills = new Set([
      'python', 'ansible', 'terraform', 'git', 'javascript', 'typescript', 
      'react', 'angular', 'vue', 'java', 'sql', 'aws', 'azure', 'gcp',
      'docker', 'kubernetes', 'jenkins', 'github', 'gitlab'
      // Note: Enterprise platforms like 'palantir foundry', 'ibm watson', etc. are NOT in this list
      // so they will show helpful questions
    ]);
    
    const helpfulItems = [];
    
    // Only process the first skill that's not common
    for (const skill of filteredSkills) {
      const skillLower = skill.toLowerCase();
      if (!commonSkills.has(skillLower)) {
        const context = SKILL_CONTEXT_DATABASE[skillLower];
        if (context) {
          helpfulItems.push({
            skill: skill,
            description: context.description,
            category: context.category,
            context: context.context,
            probingQuestions: context.probingQuestions,
            relatedSkills: context.relatedSkills
          });
          break; // Only add the first relevant skill
        }
      }
    }
    
    return helpfulItems;
  }

  /**
   * Create HTML for helpful questions section
   */
  function createHelpfulQuestionsHTML(helpfulItems) {
    if (helpfulItems.length === 0) {
      return '';
    }

    let html = `
      <div style="margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
          <h2 style="font-size: 14px; font-weight: 600; color: #374151; margin: 0;">Context:</h2>
        </div>
    `;

    helpfulItems.forEach(item => {
      html += `
        <div style="background: #f9fafb; border-radius: 6px; padding: 10px; margin-bottom: 6px; border: 1px solid #e5e7eb;">
          <p style="color: #374151; font-size: 12px; margin: 0; line-height: 1.3; font-weight: 500;">
            <span style="background-color: #e0e7ff; color: #3730a3; padding: 2px 4px; border-radius: 3px; font-weight: 600;">${item.skill}</span> (${item.category}) - ${item.context}
          </p>
        </div>
      `;
    });

    html += `</div>`;
    return html;
  }

  // Export functions
  window.SkillContextHelper = {
    getSkillContext,
    generateHelpfulQuestions,
    createHelpfulQuestionsHTML,
    SKILL_CONTEXT_DATABASE,
    getSimpleSkillContext
  };

  console.log('✅ Skill Context Helper loaded - provides contextual help for unfamiliar skills');

})(); 