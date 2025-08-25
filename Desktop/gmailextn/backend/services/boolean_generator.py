from typing import List, Dict, Any
import openai
import google.generativeai as genai
import os
import re

class BooleanGenerator:
    def __init__(self):
        # Initialize OpenAI
        openai.api_key = os.getenv('OPENAI_API_KEY')
        
        # Initialize Gemini
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Hardcoded patterns for common job titles
        self.job_title_patterns = {
            'workday data conversion': '"Workday" AND ("Data Conversion" OR "Data Migration")',
            'workday developer': '"Workday" AND ("HCM" OR "HRIS" OR "Implementation")',
            'salesforce developer': '"Salesforce" AND ("Apex" OR "Lightning" OR "SOQL")',
            'react developer': '"React" AND ("JavaScript" OR "TypeScript" OR "Frontend")',
            'python developer': '"Python" AND ("Backend" OR "API" OR "Web Development")',
            'java developer': '"Java" AND ("Spring" OR "Backend" OR "Enterprise")',
            'devops engineer': '"DevOps" AND ("Docker" OR "Kubernetes" OR "CI/CD")',
            'data engineer': '"Data Engineering" AND ("SQL" OR "Python" OR "ETL")',
            'aws engineer': '"AWS" AND ("Cloud" OR "Infrastructure" OR "DevOps")'
        }

    def generate_boolean_search(self, skills: List[Dict[str, Any]], job_title: str = "") -> str:
        """Generate boolean search query from extracted skills"""
        print(f"DEBUG: BooleanGenerator.generate_boolean_search called with {len(skills)} skills")
        if not skills:
            return ""
        
        # Try to get AI-generated boolean string first if available
        if hasattr(skills, '__iter__') and len(skills) > 0:
            # Check if any skill has an AI-generated boolean string
            for skill in skills:
                if isinstance(skill, dict) and 'ai_boolean_string' in skill:
                    print(f"DEBUG: Found AI boolean string in skill: {skill['ai_boolean_string']}")
                    return skill['ai_boolean_string']
        
        # Fall back to traditional generation methods
        try:
            print(f"DEBUG: Trying Gemini boolean generation")
            # Try Gemini first
            result = self._generate_with_gemini(skills, job_title)
            print(f"DEBUG: Gemini boolean generation successful: {result}")
            return result
        except Exception as e:
            print(f"Gemini generation failed: {e}")
            try:
                print(f"DEBUG: Trying OpenAI boolean generation")
                # Try OpenAI next
                result = self._generate_with_openai(skills, job_title)
                print(f"DEBUG: OpenAI boolean generation successful: {result}")
                return result
            except Exception as e:
                print(f"OpenAI generation failed: {e}")
                try:
                    print(f"DEBUG: Trying rule-based generation")
                    # Try rule-based generation
                    result = self._generate_with_rules(skills, job_title)
                    print(f"DEBUG: Rule-based generation successful: {result}")
                    return result
                except Exception as e:
                    print(f"Rule-based generation failed: {e}")
                    # Final fallback
                    result = self._generate_fallback(skills)
                    print(f"DEBUG: Fallback generation successful: {result}")
                    return result

    def _generate_with_ai(self, skills: List[Dict[str, Any]], job_title: str) -> str:
        """Generate boolean search using AI (Gemini first, then OpenAI)"""
        
        # Try Gemini first
        try:
            return self._generate_with_gemini(skills, job_title)
        except Exception as e:
            print(f"Gemini boolean generation failed: {e}")
        
        # Fallback to OpenAI
        try:
            return self._generate_with_openai(skills, job_title)
        except Exception as e:
            print(f"OpenAI boolean generation failed: {e}")
        
        return ""

    def _generate_with_gemini(self, skills: List[Dict[str, Any]], job_title: str) -> str:
        """Generate boolean search using Google Gemini"""
        # Limit to top 4-5 skills for shorter boolean search
        skill_names = [skill['name'] for skill in skills[:5]]
        
        prompt = f"""
        Create a concise boolean search query for a recruiter to find candidates with these skills.
        
        Job Title: {job_title}
        Skills: {', '.join(skill_names)}
        
        Requirements:
        - Use ONLY 4-5 skills maximum
        - Group similar/related skills with OR operator
        - Use AND operator between different skill categories
        - Use quotes for multi-word terms
        - Make it recruiter-friendly and LinkedIn-compatible
        - Keep it short and focused
        - Avoid generic terms like "problem solving" or "communication"
        
        Example format: "Skill1" AND ("Skill2" OR "Skill3") AND "Skill4"
        
        Return only the boolean search query, no explanations.
        """
        
        response = self.gemini_model.generate_content(prompt)
        boolean_search = response.text.strip()
        
        # Clean up the response
        boolean_search = re.sub(r'^```.*?\n', '', boolean_search)
        boolean_search = re.sub(r'\n```$', '', boolean_search)
        
        return boolean_search

    def _generate_with_openai(self, skills: List[Dict[str, Any]], job_title: str) -> str:
        """Generate boolean search using OpenAI"""
        # Limit to top 4-5 skills for shorter boolean search
        skill_names = [skill['name'] for skill in skills[:5]]
        
        prompt = f"""
        Create a concise boolean search query for a recruiter to find candidates with these skills.
        
        Job Title: {job_title}
        Skills: {', '.join(skill_names)}
        
        Requirements:
        - Use ONLY 4-5 skills maximum
        - Group similar/related skills with OR operator
        - Use AND operator between different skill categories
        - Use quotes for multi-word terms
        - Make it recruiter-friendly and LinkedIn-compatible
        - Keep it short and focused
        - Avoid generic terms like "problem solving" or "communication"
        
        Example format: "Skill1" AND ("Skill2" OR "Skill3") AND "Skill4"
        
        Return only the boolean search query, no explanations.
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a recruitment expert who creates concise boolean search queries."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=100,
            temperature=0.3
        )
        
        boolean_search = response.choices[0].message.content.strip()
        
        # Clean up the response
        boolean_search = re.sub(r'^```.*?\n', '', boolean_search)
        boolean_search = re.sub(r'\n```$', '', boolean_search)
        
        return boolean_search

    def _generate_with_rules(self, skills: List[Dict[str, Any]], job_title: str) -> str:
        """Generate boolean search using rule-based logic"""
        
        # Check if we have a hardcoded pattern for this job title
        if job_title:
            job_title_lower = job_title.lower()
            for pattern, boolean_string in self.job_title_patterns.items():
                if pattern in job_title_lower:
                    return boolean_string
        
        # Rule-based generation based on skill types
        # Limit to top 4-5 skills for shorter boolean search
        skill_names = [skill['name'] for skill in skills[:5]]
        
        if len(skill_names) == 1:
            return f'"{skill_names[0]}"'
        
        if len(skill_names) == 2:
            return f'"{skill_names[0]}" AND "{skill_names[1]}"'
        
        if len(skill_names) == 3:
            return f'"{skill_names[0]}" AND "{skill_names[1]}" AND "{skill_names[2]}"'
        
        # Group related skills with OR, separate groups with AND
        primary_skills = skill_names[:2]
        secondary_skills = skill_names[2:]
        
        if secondary_skills:
            primary_part = f'"{primary_skills[0]}" AND "{primary_skills[1]}"'
            secondary_part = ' OR '.join([f'"{skill}"' for skill in secondary_skills])
            return f'{primary_part} AND ({secondary_part})'
        else:
            return f'"{primary_skills[0]}" AND "{primary_skills[1]}"'

    def _generate_fallback(self, skills: List[Dict[str, Any]]) -> str:
        """Generate a simple fallback boolean search"""
        # Limit to top 4-5 skills for shorter boolean search
        skill_names = [skill['name'] for skill in skills[:5]]
        
        if len(skill_names) == 1:
            return f'"{skill_names[0]}"'
        
        if len(skill_names) == 2:
            return f'"{skill_names[0]}" AND "{skill_names[1]}"'
        
        if len(skill_names) == 3:
            return f'"{skill_names[0]}" AND "{skill_names[1]}" AND "{skill_names[2]}"'
        
        # For 4-5 skills, group them logically
        primary = skill_names[0]
        secondary = skill_names[1:3]
        tertiary = skill_names[3:]
        
        if len(tertiary) == 0:
            # 4 skills: primary AND (secondary1 OR secondary2)
            secondary_part = ' OR '.join([f'"{skill}"' for skill in secondary])
            return f'"{primary}" AND ({secondary_part})'
        else:
            # 5 skills: primary AND (secondary1 OR secondary2) AND (tertiary1 OR tertiary2)
            secondary_part = ' OR '.join([f'"{skill}"' for skill in secondary])
            tertiary_part = ' OR '.join([f'"{skill}"' for skill in tertiary])
            return f'"{primary}" AND ({secondary_part}) AND ({tertiary_part})'

    def validate_boolean_search(self, boolean_search: str) -> Dict[str, Any]:
        """Validate and provide feedback on boolean search quality"""
        validation = {
            'is_valid': True,
            'issues': [],
            'suggestions': [],
            'score': 100
        }
        
        # Check for common issues
        if not boolean_search:
            validation['is_valid'] = False
            validation['issues'].append('Empty boolean search')
            validation['score'] = 0
            return validation
        
        # Check for balanced parentheses
        open_parens = boolean_search.count('(')
        close_parens = boolean_search.count(')')
        if open_parens != close_parens:
            validation['issues'].append('Unbalanced parentheses')
            validation['score'] -= 20
        
        # Check for proper AND/OR usage
        if 'AND' not in boolean_search and 'OR' not in boolean_search:
            validation['suggestions'].append('Consider using AND/OR operators for better precision')
            validation['score'] -= 10
        
        # Check for quoted terms
        quoted_terms = re.findall(r'"([^"]+)"', boolean_search)
        if not quoted_terms:
            validation['suggestions'].append('Use quotes around multi-word terms')
            validation['score'] -= 15
        
        # Check for location terms (should be avoided)
        location_terms = ['city', 'state', 'country', 'remote', 'onsite', 'hybrid']
        for term in location_terms:
            if term.lower() in boolean_search.lower():
                validation['issues'].append(f'Location term "{term}" detected - focus on technical skills')
                validation['score'] -= 25
        
        # Ensure score doesn't go below 0
        validation['score'] = max(0, validation['score'])
        
        return validation 