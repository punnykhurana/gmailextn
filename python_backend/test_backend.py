#!/usr/bin/env python3
"""
Test script for the Firki AI Backend
Run this to test the skill extraction and boolean generation without starting the Flask server
"""

import os
import sys
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.skill_extractor import SkillExtractor
from services.boolean_generator import BooleanGenerator
from services.context_analyzer import ContextAnalyzer

def test_skill_extraction():
    """Test skill extraction functionality"""
    print("=== Testing Skill Extraction ===")
    
    extractor = SkillExtractor()
    
    # Test case 1: Workday job description
    workday_jd = """
    We are looking for a Workday Data Conversion Specialist to join our team.
    The ideal candidate will have experience with Workday HCM, data migration,
    ETL processes, and SQL. Knowledge of HRIS systems and business process
    configuration is required.
    """
    
    print(f"Job Description: {workday_jd.strip()}")
    skills = extractor.extract_skills(workday_jd, "Workday Data Conversion Specialist")
    print(f"Extracted Skills: {skills}")
    print(f"Method Used: {extractor.last_method_used}")
    print()

def test_boolean_generation():
    """Test boolean search generation"""
    print("=== Testing Boolean Generation ===")
    
    generator = BooleanGenerator()
    
    # Test skills
    test_skills = [
        {'name': 'Workday', 'confidence': 0.9, 'source': 'test'},
        {'name': 'HCM', 'confidence': 0.8, 'source': 'test'},
        {'name': 'Data Migration', 'confidence': 0.85, 'source': 'test'},
        {'name': 'SQL', 'confidence': 0.7, 'source': 'test'}
    ]
    
    boolean_search = generator.generate_search(test_skills, "Workday Data Conversion Specialist")
    print(f"Skills: {[s['name'] for s in test_skills]}")
    print(f"Boolean Search: {boolean_search}")
    
    # Validate the boolean search
    validation = generator.validate_boolean_search(boolean_search)
    print(f"Validation Score: {validation['score']}/100")
    if validation['issues']:
        print(f"Issues: {validation['issues']}")
    if validation['suggestions']:
        print(f"Suggestions: {validation['suggestions']}")
    print()

def test_context_analysis():
    """Test context analysis functionality"""
    print("=== Testing Context Analysis ===")
    
    analyzer = ContextAnalyzer()
    
    # Test skills
    test_skills = [
        {'name': 'Workday', 'confidence': 0.9, 'source': 'test'},
        {'name': 'Python', 'confidence': 0.8, 'source': 'test'}
    ]
    
    context = analyzer.get_skill_context(test_skills)
    print(f"Skills: {[s['name'] for s in test_skills]}")
    
    for skill_context in context:
        print(f"\nSkill: {skill_context['skill']}")
        print(f"Description: {skill_context['context']['description']}")
        print(f"Probing Question: {skill_context['context']['probing_question']}")
        print(f"Key Areas: {', '.join(skill_context['context']['key_areas'])}")
    
    print()

def test_fallback_functionality():
    """Test fallback functionality when AI services are not available"""
    print("=== Testing Fallback Functionality ===")
    
    # Test without API keys
    os.environ.pop('OPENAI_API_KEY', None)
    os.environ.pop('GEMINI_API_KEY', None)
    
    extractor = SkillExtractor()
    generator = BooleanGenerator()
    analyzer = ContextAnalyzer()
    
    # Test skill extraction
    test_jd = "Looking for a React Developer with JavaScript and TypeScript experience."
    skills = extractor.extract_skills(test_jd, "React Developer")
    print(f"Fallback Skills: {skills}")
    print(f"Fallback Method: {extractor.last_method_used}")
    
    # Test boolean generation
    boolean_search = generator.generate_search(skills, "React Developer")
    print(f"Fallback Boolean: {boolean_search}")
    
    # Test context analysis
    context = analyzer.get_skill_context(skills)
    print(f"Fallback Context: {len(context)} skills analyzed")
    print()

def main():
    """Run all tests"""
    print("🚀 Starting Firki AI Backend Tests\n")
    
    try:
        test_skill_extraction()
        test_boolean_generation()
        test_context_analysis()
        test_fallback_functionality()
        
        print("✅ All tests completed successfully!")
        print("\nTo start the Flask server, run:")
        print("cd python_backend && python app.py")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
