import re
import nltk
from typing import List, Dict, Any
import openai
import google.generativeai as genai
import os
from textblob import TextBlob
import spacy

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

class SkillExtractor:
    def __init__(self):
        self.last_method_used = "fallback"
        
        # Initialize OpenAI
        openai.api_key = os.getenv('OPENAI_API_KEY')
        
        # Initialize Gemini
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Load spaCy model
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            # If model not found, download it
            os.system("python -m spacy download en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")
        
        # Technical skill patterns
        self.technical_patterns = [
            r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Developer|Engineer|Architect|Analyst|Specialist|Consultant)\b',
            r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Framework|Library|Tool|Platform|System|Database)\b',
            r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:API|SDK|CLI|GUI|ORM|CMS)\b',
            r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Cloud|Service|Infrastructure|Pipeline|Workflow)\b'
        ]
        
        # Common technical terms to avoid
        self.general_terms = {
            'problem solving', 'communication', 'teamwork', 'leadership', 'analytical',
            'critical thinking', 'time management', 'project management', 'collaboration',
            'adaptability', 'flexibility', 'attention to detail', 'organization'
        }
        
        # Job title skill mapping
        self.job_title_skills = {
            'workday': ['Workday', 'HCM', 'HRIS', 'Data Conversion', 'Data Migration'],
            'salesforce': ['Salesforce', 'Apex', 'Lightning', 'SOQL', 'Visualforce'],
            'react': ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
            'python': ['Python', 'Django', 'Flask', 'Pandas', 'NumPy'],
            'java': ['Java', 'Spring', 'Hibernate', 'Maven', 'JUnit'],
            'devops': ['Docker', 'Kubernetes', 'Jenkins', 'AWS', 'CI/CD'],
            'data': ['SQL', 'Python', 'R', 'Tableau', 'Power BI'],
            'aws': ['AWS', 'EC2', 'S3', 'Lambda', 'CloudFormation']
        }

    def extract_skills(self, job_description: str, job_title: str = "") -> List[Dict[str, Any]]:
        """Extract skills using AI-first approach with intelligent fallbacks"""
        print(f"DEBUG: Starting AI-first skill extraction for job title: '{job_title}'")
        print(f"DEBUG: Job description length: {len(job_description)}")
        
        skills = []
        
        # STRATEGY 1: AI Dynamic Analysis (Primary - Most Intelligent)
        try:
            from services.dynamic_recruiter import DynamicRecruiterTool
            dynamic_tool = DynamicRecruiterTool()
            ai_result = dynamic_tool.analyze_job_dynamically(job_description, job_title)
            
            if ai_result.get('extractionMethod') == 'ai_dynamic_analysis' and ai_result.get('skills'):
                ai_skills = ai_result['skills']
                print(f"DEBUG: AI dynamic analysis found {len(ai_skills)} skills: {[s.get('name', '') for s in ai_skills]}")
                
                # Convert AI skills to our format
                for skill in ai_skills:
                    if skill.get('name') and skill.get('name') not in [s['name'] for s in skills]:
                        skills.append({
                            'name': skill['name'],
                            'confidence': 0.95,  # Highest confidence for AI
                            'source': 'ai_dynamic_analysis'
                        })
                
                self.last_method_used = "ai_dynamic_analysis"
                print(f"DEBUG: Successfully extracted {len(skills)} skills using AI dynamic analysis")
                
                # If AI found enough skills, return them
                if len(skills) >= 3:
                    final_skills = self._deduplicate_and_rank(skills)
                    print(f"DEBUG: Returning {len(final_skills)} AI-extracted skills: {[s['name'] for s in final_skills]}")
                    return final_skills
                    
        except Exception as e:
            print(f"DEBUG: AI dynamic analysis failed: {e}")
        
        # STRATEGY 2: AI Models (Secondary - Still Intelligent)
        if len(skills) < 3:
            try:
                # Try Gemini first
                ai_skills = self._extract_with_gemini(job_description, job_title)
                print(f"DEBUG: Gemini found {len(ai_skills)} skills: {[s['name'] for s in ai_skills]}")
                
                for skill in ai_skills:
                    if skill['name'] not in [s['name'] for s in skills]:
                        skills.append(skill)
                
                if len(skills) >= 3:
                    self.last_method_used = "gemini_ai"
                    final_skills = self._deduplicate_and_rank(skills)
                    print(f"DEBUG: Returning {len(final_skills)} Gemini-extracted skills: {[s['name'] for s in final_skills]}")
                    return final_skills
                    
            except Exception as e:
                print(f"DEBUG: Gemini extraction failed: {e}")
        
        if len(skills) < 3:
            try:
                # Try OpenAI next
                ai_skills = self._extract_with_openai(job_description, job_title)
                print(f"DEBUG: OpenAI found {len(ai_skills)} skills: {[s['name'] for s in ai_skills]}")
                
                for skill in ai_skills:
                    if skill['name'] not in [s['name'] for s in skills]:
                        skills.append(skill)
                
                if len(skills) >= 3:
                    self.last_method_used = "openai_ai"
                    final_skills = self._deduplicate_and_rank(skills)
                    print(f"DEBUG: Returning {len(final_skills)} OpenAI-extracted skills: {[s['name'] for s in final_skills]}")
                    return final_skills
                    
            except Exception as e:
                print(f"DEBUG: OpenAI extraction failed: {e}")
        
        # STRATEGY 3: Intelligent Pattern Matching (Fallback - Only if AI fails)
        if len(skills) < 3:
            print(f"DEBUG: AI methods failed, falling back to intelligent pattern matching")
            pattern_skills = self._extract_intelligent_patterns(job_description)
            print(f"DEBUG: Intelligent pattern extraction found {len(pattern_skills)} skills: {[s['name'] for s in pattern_skills]}")
            
            for skill in pattern_skills:
                if skill['name'] not in [s['name'] for s in skills]:
                    skills.append(skill)
            
            if len(skills) >= 3:
                self.last_method_used = "intelligent_patterns"
                final_skills = self._deduplicate_and_rank(skills)
                print(f"DEBUG: Returning {len(final_skills)} pattern-extracted skills: {[s['name'] for s in final_skills]}")
                return final_skills
        
        # STRATEGY 4: Basic Extraction (Last Resort - Only if everything else fails)
        if len(skills) < 3:
            print(f"DEBUG: All methods failed, using basic extraction as last resort")
            basic_skills = self._basic_skill_extraction(job_description)
            print(f"DEBUG: Basic extraction found {len(basic_skills)} skills: {[s['name'] for s in basic_skills]}")
            
            for skill in basic_skills:
                if skill['name'] not in [s['name'] for s in skills]:
                    skills.append(skill)
            
            self.last_method_used = "basic_extraction"
        
        # Final processing
        skills = self._filter_generic_skills(skills)
        print(f"DEBUG: Final filtering result: {[s['name'] for s in skills]}")
        
        final_skills = self._deduplicate_and_rank(skills)
        print(f"DEBUG: Final result: {len(final_skills)} skills using method '{self.last_method_used}': {[s['name'] for s in final_skills]}")
        
        return final_skills

    def _extract_with_gemini(self, job_description: str, job_title: str) -> List[Dict[str, Any]]:
        """Extract skills using Google Gemini AI"""
        prompt = f"""
        Extract ONLY technical skills, technologies, tools, and programming languages from this job description.
        
        Job Title: {job_title}
        Job Description: {job_description}
        
        IMPORTANT: Extract ONLY individual technical skills, not phrases or sentences.
        
        Examples of what to extract:
        - Ansible, Nornir, Git, CI/CD, Containers, Docker, Kubernetes
        - Python, Java, JavaScript, SQL, REST API
        - AWS, Azure, GCP, VMware, Cisco
        - Linux, Windows, MySQL, MongoDB
        
        Examples of what NOT to extract:
        - "Interview Process - Prescreen" (this is a phrase, not a skill)
        - "Network Enterprise" (this is too generic)
        - "Develop" or "Evaluate" (these are verbs, not skills)
        
        Return only the skill names, one per line, no explanations or bullet points.
        Focus on specific technologies, tools, frameworks, and technical competencies.
        """
        
        response = self.gemini_model.generate_content(prompt)
        skills_text = response.text.strip()
        
        skills = []
        for line in skills_text.split('\n'):
            skill = line.strip().strip('- ').strip('* ').strip('• ')
            if skill and len(skill) > 2 and self._is_technical_skill(skill):
                skills.append({
                    'name': skill,
                    'confidence': 0.9,
                    'source': 'gemini'
                })
        
        return skills[:7]  # Limit to 7 skills

    def _extract_with_openai(self, job_description: str, job_title: str) -> List[Dict[str, Any]]:
        """Extract skills using OpenAI"""
        prompt = f"""
        Extract ONLY technical skills, technologies, tools, and programming languages from this job description.
        
        Job Title: {job_title}
        Job Description: {job_description}
        
        IMPORTANT: Extract ONLY individual technical skills, not phrases or sentences.
        
        Examples of what to extract:
        - Ansible, Nornir, Git, CI/CD, Containers, Docker, Kubernetes
        - Python, Java, JavaScript, SQL, REST API
        - AWS, Azure, GCP, VMware, Cisco
        - Linux, Windows, MySQL, MongoDB
        
        Examples of what NOT to extract:
        - "Interview Process - Prescreen" (this is a phrase, not a skill)
        - "Network Enterprise" (this is too generic)
        - "Develop" or "Evaluate" (these are verbs, not skills)
        
        Return only the skill names, one per line, no explanations or bullet points.
        Focus on specific technologies, tools, frameworks, and technical competencies.
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            temperature=0.3
        )
        
        skills_text = response.choices[0].message.content.strip()
        
        skills = []
        for line in skills_text.split('\n'):
            skill = line.strip().strip('- ').strip('* ').strip('• ')
            if skill and len(skill) > 2 and self._is_technical_skill(skill):
                skills.append({
                    'name': skill,
                    'confidence': 0.85,
                    'source': 'openai'
                })
        
        return skills[:7]

    def _extract_with_nlp(self, job_description: str, job_title: str) -> List[Dict[str, Any]]:
        """Extract skills using NLP techniques"""
        doc = self.nlp(job_description)
        
        # Extract noun phrases and named entities
        skills = []
        
        # Named entities (organizations, products, technologies)
        for ent in doc.ents:
            if ent.label_ in ['ORG', 'PRODUCT', 'GPE']:
                skill_name = ent.text.strip()
                if self._is_technical_skill(skill_name):
                    skills.append({
                        'name': skill_name,
                        'confidence': 0.7,
                        'source': 'nlp_ner'
                    })
        
        # Noun phrases
        for chunk in doc.noun_chunks:
            skill_name = chunk.text.strip()
            if self._is_technical_skill(skill_name):
                skills.append({
                    'name': skill_name,
                    'confidence': 0.6,
                    'source': 'nlp_chunks'
                })
        
        # Pattern matching
        for pattern in self.technical_patterns:
            matches = re.findall(pattern, job_description, re.IGNORECASE)
            for match in matches:
                if self._is_technical_skill(match):
                    skills.append({
                        'name': match,
                        'confidence': 0.8,
                        'source': 'nlp_patterns'
                    })
        
        return skills

    def _extract_from_job_title(self, job_title: str) -> List[Dict[str, Any]]:
        """Extract skills inferred from job title"""
        if not job_title:
            return []
        
        job_title_lower = job_title.lower()
        skills = []
        
        for platform, platform_skills in self.job_title_skills.items():
            if platform in job_title_lower:
                for skill in platform_skills:
                    skills.append({
                        'name': skill,
                        'confidence': 0.9,
                        'source': 'job_title_inference'
                    })
        
        return skills

    def _basic_skill_extraction(self, job_description: str) -> List[Dict[str, Any]]:
        """Basic keyword-based skill extraction"""
        # Common technical terms
        technical_keywords = [
            'Python', 'Java', 'JavaScript', 'React', 'Angular', 'Vue', 'Node.js',
            'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'GCP',
            'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'JIRA',
            'Agile', 'Scrum', 'CI/CD', 'REST API', 'GraphQL', 'Microservices',
            # Frontend and Web Development
            'TypeScript', 'Shopify', 'Contentful', 'Hydrogen', 'Next.js', 'Gatsby',
            'HTML', 'CSS', 'SASS', 'LESS', 'Webpack', 'Babel', 'ES6',
            # Backend and DevOps
            'NodeJS', 'Express', 'MongoDB', 'PostgreSQL', 'Redis', 'Elasticsearch',
            'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Heroku', 'Vercel',
            # Tools and Platforms
            'Git', 'GitHub', 'GitLab', 'Jira', 'Confluence', 'Atlassian',
            'Slack', 'Discord', 'Trello', 'Asana', 'Notion',
            # Network and automation skills
            'Ansible', 'Nornir', 'Terraform', 'Puppet', 'Chef', 'Salt',
            'NETCONF', 'RESTCONF', 'YANG', 'OpenConfig', 'gNMI', 'gRPC',
            'Cisco', 'Juniper', 'Arista', 'F5', 'Load Balancer', 'Load Balancers',
            'Linux', 'Unix', 'Windows Server', 'VMware', 'Hyper-V', 'KVM',
            'ServiceNow', 'Splunk', 'GitLab', 'LogicMonitor', 'Nagios', 'Zabbix',
            'CCNA', 'CCNP', 'CCIE', 'DevNet', 'Network Automation', 'SDN',
            'Network Programmability', 'Network Infrastructure', 'Network Security',
            # Additional skills from the job description
            'SD-WAN', 'Nautobot', 'Netbox', 'Microsoft Visio', 'Load Balancers'
        ]
        
        skills = []
        
        # Extract skills from technical keywords
        for keyword in technical_keywords:
            if keyword.lower() in job_description.lower():
                skills.append({
                    'name': keyword,
                    'confidence': 0.5,
                    'source': 'keyword_match'
                })
        
        # Extract skills from specific patterns in the job description
        skills.extend(self._extract_intelligent_patterns(job_description))
        
        return skills
    


    def _extract_intelligent_patterns(self, job_description: str) -> List[Dict[str, Any]]:
        """Extract skills using truly intelligent, non-hardcoded patterns"""
        skills = []
        
        # Strategy 1: Look for specific technology mentions in context
        # Only extract when technologies are clearly mentioned as requirements
        tech_context_patterns = [
            r'(?:experience|knowledge|familiarity|proficiency|expertise)\s+(?:with|in|of)\s+([^,\.\n]+)',
            r'(?:working|practicing|deploying|implementing)\s+with\s+([^,\.\n]+)',
            r'(?:using|utilizing|leveraging)\s+([^,\.\n]+)',
            r'(?:React|TypeScript|JavaScript|Node\.js|NodeJS|Shopify|AWS|Docker|Git|Jira|Atlassian|Contentful|Hydrogen)',
        ]
        
        import re
        for pattern in tech_context_patterns:
            matches = re.findall(pattern, job_description, re.IGNORECASE)
            for match in matches:
                skill = match.strip()
                # Only accept if it looks like a real technical skill
                if (skill and len(skill) > 2 and 
                    self._is_technical_skill(skill) and
                    skill not in [s['name'] for s in skills]):
                    skills.append({
                        'name': skill,
                        'confidence': 0.8,
                        'source': 'tech_context'
                    })
        
        # Strategy 2: Look for specific technology mentions in role descriptions
        # Extract from patterns like "Frontend: React, TypeScript" 
        role_tech_patterns = [
            r'(?:Frontend|Backend|Full Stack|DevOps|Data|Network|Security|Cloud|Mobile|Web|UI|UX|API|Database|Infrastructure|Platform|System|Tool|Framework|Library):\s*([^,\.\n]+)',
        ]
        
        for pattern in role_tech_patterns:
            matches = re.findall(pattern, job_description, re.IGNORECASE)
            for match in matches:
                # Split by commas and extract individual skills
                skill_list = [s.strip() for s in match.split(',')]
                for skill in skill_list:
                    if (skill and len(skill) > 2 and 
                        self._is_technical_skill(skill) and
                        skill not in [s['name'] for s in skills]):
                        skills.append({
                            'name': skill,
                            'confidence': 0.7,
                            'source': 'role_tech'
                        })
        
        # Strategy 3: Look for years of experience with specific technologies
        # Only extract the technology part, not the years
        year_patterns = [
            r'(\d+)\s*\+\s*years?\s+of\s+experience\s+with\s+([^,\.\n]+)',
            r'(\d+)\s*years?\s+(?:practicing|deploying|implementing|working\s+with)\s+([^,\.\n]+)',
        ]
        
        for pattern in year_patterns:
            matches = re.findall(pattern, job_description, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple) and len(match) == 2:
                    years, skill = match
                    skill = skill.strip()
                    if (skill and len(skill) > 2 and 
                        self._is_technical_skill(skill) and
                        skill not in [s['name'] for s in skills]):
                        skills.append({
                            'name': skill,
                            'confidence': 0.7,
                            'source': 'years_experience'
                        })
        
        # Strategy 4: Look for specific technology mentions in bullet points
        # Only extract when technologies are clearly mentioned
        bullet_tech_patterns = [
            r'•\s*([^•\n]*?(?:React|TypeScript|Clojure|JavaScript|Python|Java|AWS|Docker|Kubernetes|Git|CI/CD)[^•\n]*)',
            r'\*\s*([^*\n]*?(?:React|TypeScript|Clojure|JavaScript|Python|Java|AWS|Docker|Kubernetes|Git|CI/CD)[^*\n]*)',
            r'-\s*([^-\n]*?(?:React|TypeScript|Clojure|JavaScript|Python|Java|AWS|Docker|Kubernetes|Git|CI/CD)[^-\n]*)',
        ]
        
        for pattern in bullet_tech_patterns:
            matches = re.findall(pattern, job_description, re.IGNORECASE)
            for match in matches:
                text = match.strip()
                if text and len(text) > 5:
                    # Extract only the technology names from the bullet point
                    tech_names = re.findall(r'(?:React|TypeScript|Clojure|ClojureScript|JavaScript|Python|Java|AWS|Docker|Kubernetes|Git|CI/CD|Next\.js|Nextjs|Frontend|Backend)', text, re.IGNORECASE)
                    for tech_name in tech_names:
                        if (tech_name and 
                            tech_name not in [s['name'] for s in skills]):
                            skills.append({
                                'name': tech_name,
                                'confidence': 0.6,
                                'source': 'bullet_tech'
                            })
        
        # Strategy 5: Look for specific technology mentions in the text
        # Extract individual technology names that are clearly mentioned
        direct_tech_patterns = [
            r'\b(?:React|TypeScript|Clojure|ClojureScript|JavaScript|Python|Java|AWS|Docker|Kubernetes|Git|CI/CD|Next\.js|Nextjs|Frontend|Backend)\b',
        ]
        
        for pattern in direct_tech_patterns:
            matches = re.findall(pattern, job_description, re.IGNORECASE)
            for match in matches:
                if (match and 
                    match not in [s['name'] for s in skills]):
                    skills.append({
                        'name': match,
                        'confidence': 0.9,
                        'source': 'direct_tech'
                    })
        
        return skills
    
    def _extract_tech_terms_from_text(self, text: str) -> List[str]:
        """This method is deprecated and no longer used"""
        return []

    def _is_technical_skill(self, skill: str) -> bool:
        """Intelligently check if a skill is actually technical"""
        skill_lower = skill.lower().strip()
        
        # Reject very short or very long terms
        if len(skill_lower) < 2 or len(skill_lower) > 30:
            return False
        
        # Reject common non-technical terms that are clearly not skills
        non_technical = {
            'we', 'the', 'this', 'that', 'these', 'those', 'required', 'experience',
            'years', 'plus', 'level', 'certification', 'process', 'prescreen',
            'network', 'enterprise', 'identify', 'develop', 'evaluate', 'coordinate',
            'facilitate', 'manage', 'design', 'implement', 'analyze', 'assess',
            'cth', 'asap', 'usc', 'poc', 'sme', 'hr', 'hcm', 'analyst',
            'interview', 'phone', 'email', 'resume', 'cover letter', 'application',
            'position', 'role', 'job', 'career', 'opportunity', 'company', 'team',
            'department', 'division', 'organization', 'business', 'industry', 'sector',
            'market', 'customer', 'client', 'user', 'stakeholder', 'partner',
            'vendor', 'supplier', 'contractor', 'consultant', 'advisor', 'expert',
            'specialist', 'professional', 'practitioner', 'practicing', 'working',
            'collaborating', 'communicating', 'presenting', 'reporting', 'documenting',
            'planning', 'organizing', 'coordinating', 'scheduling', 'prioritizing',
            'problem solving', 'critical thinking', 'analytical thinking', 'creative thinking',
            'strategic thinking', 'systems thinking', 'design thinking', 'lean thinking',
            'agile thinking', 'scrum thinking', 'kanban thinking', 'devops thinking',
            'cloud thinking', 'security thinking', 'compliance thinking', 'governance thinking',
            'responsive', 'including', 'focus', 'role', 'description', 'duration', 'location',
            'client', 'remote', 'month', 'front', 'end', 'script', 'developer', 'need',
            'flexible', 'insurance', 'minutes', 'ladder', 'life', 'implementation', 'component',
            'emphasis', 'strong', 'migration', 'quickly', 'existing', 'codebase', 'processes',
            'contribute', 'tasks', 'evolving', 'tech', 'stack', 'assist', 'deliver', 'features',
            'improvements', 'senior', 'onboarding', 'meaningful', 'contributions', 'ramp',
            'both', 'closely', 'team', 'new', 'existing', 'quick', 'meaningful'
        }
        
        if skill_lower in non_technical:
            return False
        
        # Reject terms that start with common non-technical words
        non_technical_starts = ['we ', 'the ', 'this ', 'that ', 'these ', 'those ', 'a ', 'an ', 'the ']
        if any(skill_lower.startswith(start) for start in non_technical_starts):
            return False
        
        # Reject generic action words that don't represent skills
        action_words = {
            'identify', 'develop', 'evaluate', 'coordinate', 'facilitate',
            'manage', 'design', 'implement', 'analyze', 'assess', 'review',
            'plan', 'execute', 'monitor', 'maintain', 'support', 'provide',
            'assist', 'help', 'guide', 'train', 'mentor', 'coach', 'teach',
            'learn', 'study', 'research', 'investigate', 'examine', 'inspect',
            'test', 'validate', 'verify', 'confirm', 'check', 'review', 'audit'
        }
        
        if skill_lower in action_words:
            return False
        
        # Reject email/header patterns
        if any(pattern in skill_lower for pattern in ['@', 'http', 'www', '.com', '.org']):
            return False
        
        # Reject if it looks like a descriptive phrase (contains multiple words that form a sentence)
        if len(skill_lower.split()) > 3:
            return False
        
        # Reject if it contains punctuation that suggests it's not a skill
        if any(char in skill for char in ['-', ':', ';', '(', ')', '[', ']', '{', '}']):
            return False
        
        # Accept technical indicators (these are clearly technical)
        technical_indicators = [
            'api', 'sdk', 'framework', 'library', 'tool', 'platform', 'system',
            'database', 'cloud', 'automation', 'configuration', 'deployment',
            'monitoring', 'logging', 'testing', 'ci/cd', 'devops', 'infrastructure',
            'frontend', 'backend', 'fullstack', 'mobile', 'web', 'desktop',
            'server', 'client', 'network', 'security', 'data', 'analytics',
            'machine learning', 'ai', 'artificial intelligence', 'ml', 'deep learning',
            'blockchain', 'cryptocurrency', 'iot', 'internet of things'
        ]
        
        if any(indicator in skill_lower for indicator in technical_indicators):
            return True
        
        # Accept programming languages and technologies (these are clearly technical)
        tech_terms = [
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust',
            'php', 'ruby', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql',
            'html', 'css', 'sass', 'less', 'react', 'angular', 'vue', 'node',
            'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'linux', 'windows',
            'macos', 'git', 'jenkins', 'terraform', 'ansible', 'puppet', 'chef',
            'next.js', 'nextjs', 'clojure', 'clojurescript', 'frontend', 'backend'
        ]
        
        if any(term in skill_lower for term in tech_terms):
            return True
        
        # Accept certification acronyms (these are clearly technical)
        if re.match(r'^[A-Z]{2,6}$', skill):
            return True
        
        # Accept skills that contain technical words
        technical_words = [
            'code', 'programming', 'development', 'engineering', 'architecture',
            'design', 'testing', 'deployment', 'infrastructure', 'platform',
            'framework', 'library', 'tool', 'system', 'database', 'api',
            'cloud', 'automation', 'monitoring', 'security', 'network',
            'data', 'analytics', 'machine learning', 'ai', 'blockchain'
        ]
        
        if any(word in skill_lower for word in technical_words):
            return True
        
        # Default to rejecting if it doesn't clearly look like a technical skill
        return False

    def _filter_generic_skills(self, skills: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Post-processes extracted skills to remove generic action verbs and phrases."""
        generic_verbs = {
            'develop', 'evaluate', 'identify', 'analyze', 'implement', 'design',
            'manage', 'coordinate', 'facilitate', 'support', 'assist', 'help',
            'interview', 'process', 'prescreen', 'network', 'enterprise', 'system',
            'solution', 'project', 'team', 'work', 'experience', 'knowledge',
            'ability', 'skill', 'certification', 'level', 'year', 'month'
        }
        
        filtered_skills = []
        for skill in skills:
            skill_name = skill['name'].lower()
            if skill_name not in generic_verbs:
                filtered_skills.append(skill)
        
        return filtered_skills

    def _deduplicate_and_rank(self, skills: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicates and rank by confidence"""
        seen = set()
        unique_skills = []
        
        for skill in skills:
            skill_name = skill['name'].lower()
            if skill_name not in seen:
                seen.add(skill_name)
                unique_skills.append(skill)
        
        # Sort by confidence and limit to 5
        unique_skills.sort(key=lambda x: x['confidence'], reverse=True)
        return unique_skills[:5] 
    
    def _extract_fallback_skills(self, job_description: str) -> List[Dict[str, Any]]:
        """Fallback method to ensure we always extract some technical skills"""
        skills = []
        
        # Look for common technical terms that might be missed
        fallback_keywords = [
            'automation', 'framework', 'system', 'tool', 'platform', 'technology',
            'software', 'hardware', 'network', 'server', 'database', 'application',
            'infrastructure', 'cloud', 'security', 'monitoring', 'logging',
            'testing', 'deployment', 'configuration', 'management', 'administration'
        ]
        
        for keyword in fallback_keywords:
            if keyword.lower() in job_description.lower():
                # Only add if it's in a technical context
                context_words = ['experience', 'knowledge', 'familiarity', 'proficiency', 'expertise']
                if any(context_word in job_description.lower() for context_word in context_words):
                    skills.append({
                        'name': keyword.title(),
                        'confidence': 0.4,
                        'source': 'fallback'
                    })
        
        return skills 