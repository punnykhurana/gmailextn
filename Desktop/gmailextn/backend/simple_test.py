#!/usr/bin/env python3
"""
Simple test script for skill extraction without complex dependencies
"""

import re
import json

def extract_skills_simple(job_description: str) -> list:
    """Simple skill extraction using regex patterns"""
    
    # Define relevant skills for the job description
    relevant_skills = [
        'React', 'TypeScript', 'JavaScript', 'Node.js', 'NodeJS', 
        'Shopify', 'Contentful', 'Hydrogen', 'AWS', 'Docker', 
        'Git', 'Jira', 'Atlassian', 'HTML', 'CSS', 'SQL'
    ]
    
    # Convert job description to lowercase for matching
    jd_lower = job_description.lower()
    
    # Extract skills that are mentioned in the job description
    found_skills = []
    for skill in relevant_skills:
        if skill.lower() in jd_lower:
            found_skills.append(skill)
    
    # Also look for patterns like "experience with X" or "knowledge of X"
    patterns = [
        r'experience\s+(?:with|in|of)\s+([^,\.\n]+)',
        r'knowledge\s+(?:of|in)\s+([^,\.\n]+)',
        r'familiarity\s+(?:with|in)\s+([^,\.\n]+)',
        r'proficiency\s+(?:with|in)\s+([^,\.\n]+)',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, jd_lower)
        for match in matches:
            # Clean up the match
            skill = match.strip()
            if len(skill) > 2 and skill not in found_skills:
                # Check if it's a relevant skill
                for relevant_skill in relevant_skills:
                    if relevant_skill.lower() in skill:
                        found_skills.append(relevant_skill)
                        break
    
    return list(set(found_skills))  # Remove duplicates

def generate_boolean_search(skills: list) -> str:
    """Generate a boolean search string from skills"""
    if not skills:
        return ""
    
    # Group related skills
    frontend_skills = ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS']
    backend_skills = ['Node.js', 'NodeJS', 'SQL']
    platform_skills = ['Shopify', 'Contentful', 'Hydrogen']
    devops_skills = ['AWS', 'Docker', 'Git']
    
    # Build boolean search
    boolean_parts = []
    
    # Add frontend skills
    frontend_found = [s for s in skills if s in frontend_skills]
    if frontend_found:
        if len(frontend_found) == 1:
            boolean_parts.append(f'"{frontend_found[0]}"')
        else:
            skill_quotes = [f'"{s}"' for s in frontend_found]
            boolean_parts.append(f'({" OR ".join(skill_quotes)})')
    
    # Add backend skills
    backend_found = [s for s in skills if s in backend_skills]
    if backend_found:
        if len(backend_found) == 1:
            boolean_parts.append(f'"{backend_found[0]}"')
        else:
            skill_quotes = [f'"{s}"' for s in backend_found]
            boolean_parts.append(f'({" OR ".join(skill_quotes)})')
    
    # Add platform skills
    platform_found = [s for s in skills if s in platform_skills]
    if platform_found:
        if len(platform_found) == 1:
            boolean_parts.append(f'"{platform_found[0]}"')
        else:
            skill_quotes = [f'"{s}"' for s in platform_found]
            boolean_parts.append(f'({" OR ".join(skill_quotes)})')
    
    # Add devops skills
    devops_found = [s for s in skills if s in devops_skills]
    if devops_found:
        if len(devops_found) == 1:
            boolean_parts.append(f'"{devops_found[0]}"')
        else:
            skill_quotes = [f'"{s}"' for s in devops_found]
            boolean_parts.append(f'({" OR ".join(skill_quotes)})')
    
    # Add experience level
    boolean_parts.append('("senior" OR "5+ years" OR "5 years")')
    
    return ' AND '.join(boolean_parts)

def test_skill_extraction():
    """Test the skill extraction with the job description from the image"""
    
    job_description = """
    Client Need Summary - Web Developer (Part-Time Contract)
    
    Part time Hours: 20 – 30 a week
    Interview times - 2 slots: Tuesday, 8/26 at 2pm and 2:30pm
    
    The client is seeking a senior-level front-end web developer to support their main website, team member.
    
    Future Tech Stack:
    - CMS: Contentful
    - eCommerce: Shopify Plus
    - Frontend: Hydrogen (Shopify's React-based framework)
    
    Role Details:
    - Focus: 75-80% front-end development - JavaScript/Typescript
    - Experience with React/NodeJS/TypeScript
    - Experience with Hydrogen or other CMS is ideal
    - Familiarity with Jira, Git, and independent project work is important
    - Backend DevOps knowledge (AWS, Docker, shell operations)
    - Experience with Atlassian tools
    
    RESPONSIBILITIES:
    - Custom Shopify apps development
    - Marketing and fulfillment tools
    - Backend tools and hosting management
    - SQL/ORM database operations
    """
    
    print("Testing skill extraction...")
    print("=" * 50)
    print("Job Description:")
    print(job_description)
    print("=" * 50)
    
    # Extract skills
    skills = extract_skills_simple(job_description)
    print(f"Extracted Skills: {skills}")
    
    # Generate boolean search
    boolean_search = generate_boolean_search(skills)
    print(f"Boolean Search: {boolean_search}")
    
    # Expected results
    expected_skills = ['React', 'TypeScript', 'Shopify', 'NodeJS', 'AWS', 'Docker', 'Git', 'Jira', 'Contentful', 'Hydrogen']
    print(f"Expected Skills: {expected_skills}")
    
    # Check accuracy
    correct_skills = [s for s in skills if s in expected_skills]
    accuracy = len(correct_skills) / len(expected_skills) * 100 if expected_skills else 0
    print(f"Accuracy: {accuracy:.1f}% ({len(correct_skills)}/{len(expected_skills)} correct)")
    
    return {
        'skills': skills,
        'boolean_search': boolean_search,
        'accuracy': accuracy
    }

if __name__ == "__main__":
    result = test_skill_extraction()
    print("\n" + "=" * 50)
    print("FINAL RESULT:")
    print(json.dumps(result, indent=2))
