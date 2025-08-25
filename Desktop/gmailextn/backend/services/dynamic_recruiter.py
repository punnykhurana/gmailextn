import google.generativeai as genai
import json
import os
from typing import Dict, List, Any, Optional

class DynamicRecruiterTool:
    def __init__(self):
        # Configure your AI model
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        # Try newer model names first, fallback to older ones
        try:
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        except:
            try:
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            except:
                self.model = genai.GenerativeModel('gemini-pro')

    def analyze_job_dynamically(self, job_description: str, job_title: str = "") -> Dict[str, Any]:
        """
        Uses AI to dynamically analyze a job description and generate
        skills, context, and a boolean string.
        """
        # Enhanced prompt for better AI understanding
        prompt = f"""
        Analyze the following job description from the perspective of an expert technical recruiter.
        Focus on identifying TECHNICAL skills, tools, technologies, and frameworks that would be relevant for candidate sourcing.
        
        Job Title: {job_title if job_title else "Not specified"}
        Job Description: "{job_description}"

        Think like a recruiter who needs to find candidates on LinkedIn, Indeed, or other platforms.
        Identify skills that are:
        1. Technical and specific (e.g., "Python", "React", "AWS", "Docker")
        2. Relevant for the role
        3. Commonly searched by recruiters
        
        Return your analysis as a single JSON object with the following structure:
        {{
          "skills": [
            {{"name": "SkillName", "confidence": 0.9, "source": "ai_analysis"}},
            {{"name": "AnotherSkill", "confidence": 0.8, "source": "ai_analysis"}}
          ],
          "keySkillContext": "A single, insightful sentence explaining the most critical technical requirement.",
          "booleanString": "A concise boolean search string with proper AND/OR grouping, using only 4-5 skills maximum. Format: (\\"Skill A\\" OR \\"Skill B\\") AND \\"Skill C\\" AND (\\"Skill D\\" OR \\"Skill E\\")",
          "aiQuestions": [
            "A specific, technical question about the most important skill or technology mentioned in the job description.",
            "A behavioral or experience-based question relevant to the role and company context."
          ],
          "extractionMethod": "ai_dynamic_analysis"
        }}

        Important guidelines:
        - Focus on TECHNICAL skills only (programming languages, tools, frameworks, platforms)
        - Avoid generic terms like "problem solving", "communication", "teamwork"
        - Limit to 4-5 most important skills for the boolean search
        - Group related skills with OR operator
        - Use AND between different skill categories
        - Make the boolean search recruiter-friendly and LinkedIn-compatible
        
        For AI Questions:
        - Generate 2 specific, relevant questions for this role
        - First question should be technical/skill-based (e.g., "Can you walk me through your experience with React hooks and state management?")
        - Second question should be behavioral/experience-based (e.g., "Tell me about a challenging e-commerce project you worked on and how you handled it.")
        - Questions should be specific to the technologies and context mentioned in the job description
        - Make questions actionable and interview-ready
        """

        try:
            # Call the AI to get the structured data
            response = self.model.generate_content(prompt)
            
            # Parse the AI response
            if response.text:
                # Clean up the response text (remove markdown formatting if present)
                clean_text = response.text.strip()
                if clean_text.startswith('```json'):
                    clean_text = clean_text[7:]
                if clean_text.endswith('```'):
                    clean_text = clean_text[:-3]
                clean_text = clean_text.strip()
                
                analysis = json.loads(clean_text)
                
                # Validate the response structure
                if self._validate_ai_response(analysis):
                    print(f"DEBUG: AI response validated successfully: {analysis}")
                    return analysis
                else:
                    print(f"DEBUG: AI response validation failed: {analysis}")
                    raise ValueError("AI response structure validation failed")
            else:
                raise ValueError("Empty response from AI model")
                
        except Exception as e:
            print(f"AI analysis failed: {e}")
            # Return a structured error response
            return {
                "skills": [],
                "keySkillContext": f"Could not analyze the job description. Error: {str(e)}",
                "booleanString": "",
                "aiQuestions": [
                    "What technical challenges have you faced in your previous roles?",
                    "How do you approach learning new technologies?"
                ],
                "extractionMethod": "ai_failed",
                "error": str(e)
            }

    def _validate_ai_response(self, response: Dict[str, Any]) -> bool:
        """Validate that the AI response has the expected structure"""
        required_keys = ['skills', 'keySkillContext', 'booleanString']
        
        if not all(key in response for key in required_keys):
            return False
        
        if not isinstance(response['skills'], list):
            return False
        
        # Validate skills structure
        for skill in response['skills']:
            if not isinstance(skill, dict) or 'name' not in skill:
                return False
        
        # Validate questions if present
        if 'aiQuestions' in response:
            if not isinstance(response['aiQuestions'], list) or len(response['aiQuestions']) != 2:
                return False
            for question in response['aiQuestions']:
                if not isinstance(question, str) or len(question.strip()) < 10:
                    return False
        
        # Ensure extractionMethod is set
        if 'extractionMethod' not in response:
            response['extractionMethod'] = 'ai_dynamic_analysis'
        
        return True

    def generate_fallback_boolean(self, skills: List[str]) -> str:
        """Generate a fallback boolean search if AI fails"""
        if not skills:
            return ""
        
        # Limit to 4-5 skills
        skills = skills[:5]
        
        if len(skills) == 1:
            return f'"{skills[0]}"'
        elif len(skills) == 2:
            return f'"{skills[0]}" AND "{skills[1]}"'
        elif len(skills) == 3:
            return f'"{skills[0]}" AND "{skills[1]}" AND "{skills[2]}"'
        elif len(skills) == 4:
            return f'"{skills[0]}" AND ("{skills[1]}" OR "{skills[2]}") AND "{skills[3]}"'
        else:  # 5 skills
            return f'"{skills[0]}" AND ("{skills[1]}" OR "{skills[2]}") AND ("{skills[3]}" OR "{skills[4]}")'

# Example usage and testing
if __name__ == "__main__":
    # Test the tool
    try:
        tool = DynamicRecruiterTool()
        
        # Test job description
        test_jd = """
        We are looking for a Workday Data Conversion Specialist to join our team. 
        The ideal candidate will have experience with Workday HCM, data migration, 
        ETL processes, and SQL. Knowledge of HRIS systems and business process 
        configuration is required. Experience with data validation, testing, and 
        documentation is preferred.
        """
        
        result = tool.analyze_job_dynamically(test_jd, "Workday Data Conversion Specialist")
        
        print("AI Generated Skills:", [skill['name'] for skill in result['skills']])
        print("AI Generated Context:", result['keySkillContext'])
        print("AI Generated Boolean String:", result['booleanString'])
        print("Extraction Method:", result.get('extractionMethod', 'unknown'))
        
    except Exception as e:
        print(f"Error testing DynamicRecruiterTool: {e}")
