from typing import List, Dict, Any
import openai
import google.generativeai as genai
import os

class ContextAnalyzer:
    def __init__(self):
        # Initialize OpenAI
        openai.api_key = os.getenv('OPENAI_API_KEY')
        
        # Initialize Gemini
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Hardcoded context for common skills
        self.skill_context = {
            'workday': {
                'description': 'Workday HCM/HRIS platform for human capital management',
                'probing_question': 'Can you tell me about a time when you had to configure Workday business processes or security? What was the most challenging aspect?',
                'key_areas': ['HCM', 'HRIS', 'Business Process Configuration', 'Security', 'Data Conversion']
            },
            'salesforce': {
                'description': 'Salesforce CRM platform for customer relationship management',
                'probing_question': 'Can you describe a complex Salesforce integration you built? What was the "glue" that held everything together?',
                'key_areas': ['Apex', 'Lightning', 'SOQL', 'Integration', 'Custom Objects']
            },
            'react': {
                'description': 'React JavaScript library for building user interfaces',
                'probing_question': 'Can you tell me about a time when you had to optimize React performance? What was your approach and what were the results?',
                'key_areas': ['JavaScript', 'TypeScript', 'State Management', 'Performance', 'Component Architecture']
            },
            'python': {
                'description': 'Python programming language for backend development and data science',
                'probing_question': 'Can you describe a time when you had to integrate multiple Python services or APIs? What was the most challenging part?',
                'key_areas': ['Backend Development', 'API Integration', 'Data Processing', 'Automation', 'Testing']
            },
            'java': {
                'description': 'Java programming language for enterprise applications',
                'probing_question': 'Can you tell me about a time when you had to design a scalable Java architecture? What decisions did you make and why?',
                'key_areas': ['Spring Framework', 'Enterprise Architecture', 'Performance', 'Microservices', 'Testing']
            },
            'devops': {
                'description': 'DevOps practices for software development and operations',
                'probing_question': 'Can you describe a time when you had to automate a complex deployment process? What was the "glue" that made it work?',
                'key_areas': ['CI/CD', 'Infrastructure as Code', 'Monitoring', 'Automation', 'Cloud Platforms']
            },
            'aws': {
                'description': 'Amazon Web Services cloud computing platform',
                'probing_question': 'Can you tell me about a time when you had to design a multi-service AWS architecture? What was the most challenging integration point?',
                'key_areas': ['EC2', 'S3', 'Lambda', 'CloudFormation', 'VPC', 'Security']
            },
            'sql': {
                'description': 'Structured Query Language for database management',
                'probing_question': 'Can you describe a time when you had to optimize a complex SQL query? What was your approach and what were the performance improvements?',
                'key_areas': ['Database Design', 'Query Optimization', 'Data Modeling', 'Performance Tuning', 'ETL']
            }
        }

    def get_skill_context(self, skills: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get context and probing questions for skills"""
        context_list = []
        
        for skill in skills:
            skill_name = skill['name'].lower()
            context = self._get_context_for_skill(skill_name)
            
            if context:
                context_list.append({
                    'skill': skill['name'],
                    'context': context
                })
            else:
                # Generate context using AI if not found in hardcoded data
                try:
                    ai_context = self._generate_context_with_ai(skill['name'])
                    context_list.append({
                        'skill': skill['name'],
                        'context': ai_context
                    })
                except Exception as e:
                    print(f"AI context generation failed for {skill['name']}: {e}")
                    # Fallback to basic context
                    context_list.append({
                        'skill': skill['name'],
                        'context': {
                            'description': f'Technical skill: {skill["name"]}',
                            'probing_question': f'Can you tell me about your experience with {skill["name"]}? What was the most challenging project you worked on?',
                            'key_areas': [skill['name']]
                        }
                    })
        
        return context_list

    def _get_context_for_skill(self, skill_name: str) -> Dict[str, Any]:
        """Get hardcoded context for a skill"""
        # Direct match
        if skill_name in self.skill_context:
            return self.skill_context[skill_name]
        
        # Partial match
        for key, context in self.skill_context.items():
            if key in skill_name or skill_name in key:
                return context
        
        # Check for variations
        skill_variations = {
            'javascript': 'react',
            'js': 'react',
            'typescript': 'react',
            'ts': 'react',
            'spring': 'java',
            'hibernate': 'java',
            'docker': 'devops',
            'kubernetes': 'devops',
            'jenkins': 'devops',
            'git': 'devops',
            'hcm': 'workday',
            'hris': 'workday',
            'apex': 'salesforce',
            'lightning': 'salesforce',
            'soql': 'salesforce',
            'ec2': 'aws',
            's3': 'aws',
            'lambda': 'aws',
            'mysql': 'sql',
            'postgresql': 'sql',
            'mongodb': 'sql'
        }
        
        for variation, main_skill in skill_variations.items():
            if variation in skill_name:
                return self.skill_context[main_skill]
        
        return None

    def _generate_context_with_ai(self, skill_name: str) -> Dict[str, Any]:
        """Generate context using AI (Gemini first, then OpenAI)"""
        
        # Try Gemini first
        try:
            return self._generate_context_with_gemini(skill_name)
        except Exception as e:
            print(f"Gemini context generation failed: {e}")
        
        # Fallback to OpenAI
        try:
            return self._generate_context_with_openai(skill_name)
        except Exception as e:
            print(f"OpenAI context generation failed: {e}")
        
        # Return basic context if AI fails
        return {
            'description': f'Technical skill: {skill_name}',
            'probing_question': f'Can you tell me about your experience with {skill_name}? What was the most challenging project you worked on?',
            'key_areas': [skill_name]
        }

    def _generate_context_with_gemini(self, skill_name: str) -> Dict[str, Any]:
        """Generate context using Google Gemini"""
        prompt = f"""
        Provide context for the technical skill: {skill_name}
        
        Return a JSON object with:
        1. description: Brief description of what this skill is
        2. probing_question: ONE specific behavioral question to assess this skill (focus on integration/challenge scenarios)
        3. key_areas: List of 3-5 related technical areas
        
        Format:
        {{
            "description": "...",
            "probing_question": "...",
            "key_areas": ["...", "...", "..."]
        }}
        
        Make the probing question specific and focused on technical challenges or integration scenarios.
        """
        
        response = self.gemini_model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Try to extract JSON from response
        try:
            import json
            # Find JSON content in the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                context = json.loads(json_str)
                return context
        except Exception as e:
            print(f"JSON parsing failed: {e}")
        
        # Fallback to basic context
        return {
            'description': f'Technical skill: {skill_name}',
            'probing_question': f'Can you tell me about your experience with {skill_name}? What was the most challenging project you worked on?',
            'key_areas': [skill_name]
        }

    def _generate_context_with_openai(self, skill_name: str) -> Dict[str, Any]:
        """Generate context using OpenAI"""
        prompt = f"""
        Provide context for the technical skill: {skill_name}
        
        Return a JSON object with:
        1. description: Brief description of what this skill is
        2. probing_question: ONE specific behavioral question to assess this skill (focus on integration/challenge scenarios)
        3. key_areas: List of 3-5 related technical areas
        
        Format:
        {{
            "description": "...",
            "probing_question": "...",
            "key_areas": ["...", "...", "..."]
        }}
        
        Make the probing question specific and focused on technical challenges or integration scenarios.
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.3
        )
        
        response_text = response.choices[0].message.content.strip()
        
        # Try to extract JSON from response
        try:
            import json
            # Find JSON content in the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                context = json.loads(json_str)
                return context
        except Exception as e:
            print(f"JSON parsing failed: {e}")
        
        # Fallback to basic context
        return {
            'description': f'Technical skill: {skill_name}',
            'probing_question': f'Can you tell me about your experience with {skill_name}? What was the most challenging project you worked on?',
            'key_areas': [skill_name]
        }

    def get_skill_insights(self, skills: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Get insights about skill combinations and market trends"""
        insights = {
            'skill_combinations': [],
            'market_trends': [],
            'recommendations': []
        }
        
        skill_names = [skill['name'] for skill in skills]
        
        # Analyze skill combinations
        if len(skill_names) >= 2:
            insights['skill_combinations'].append({
                'skills': skill_names[:2],
                'description': f'Strong combination of {skill_names[0]} and {skill_names[1]}',
                'market_demand': 'High'
            })
        
        # Generate market insights using AI
        try:
            ai_insights = self._generate_market_insights_with_ai(skill_names)
            insights.update(ai_insights)
        except Exception as e:
            print(f"AI insights generation failed: {e}")
        
        return insights

    def _generate_market_insights_with_ai(self, skill_names: List[str]) -> Dict[str, Any]:
        """Generate market insights using AI"""
        skills_text = ', '.join(skill_names)
        
        try:
            prompt = f"""
            Provide market insights for these technical skills: {skills_text}
            
            Return a JSON object with:
            1. market_trends: List of 2-3 current market trends for these skills
            2. recommendations: List of 2-3 recommendations for skill development or job search
            
            Format:
            {{
                "market_trends": ["...", "..."],
                "recommendations": ["...", "..."]
            }}
            """
            
            response = self.gemini_model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Try to extract JSON
            import json
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                insights = json.loads(json_str)
                return insights
                
        except Exception as e:
            print(f"AI insights generation failed: {e}")
        
        # Fallback insights
        return {
            'market_trends': [
                f'High demand for {skill_names[0]} professionals',
                'Growing market for technical skills combination'
            ],
            'recommendations': [
                'Focus on practical project experience',
                'Stay updated with latest industry trends'
            ]
        }
