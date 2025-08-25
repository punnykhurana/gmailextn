import re
from typing import Dict, List, Tuple

class JobEmailDetector:
    """
    Lightweight service to detect if an email is job-related
    before performing heavy AI analysis.
    """
    
    def __init__(self):
        # Job-related keywords and patterns
        self.job_keywords = [
            'job', 'position', 'role', 'opportunity', 'opening', 'vacancy',
            'hiring', 'recruiting', 'candidate', 'applicant', 'resume',
            'interview', 'career', 'employment', 'work', 'contract',
            'full-time', 'part-time', 'remote', 'onsite', 'hybrid',
            'developer', 'engineer', 'analyst', 'manager', 'specialist',
            'coordinator', 'assistant', 'director', 'lead', 'senior',
            'junior', 'entry-level', 'mid-level', 'experienced',
            'consultant', 'looking for', 'currently looking', 'seeking',
            'support our client', 'client need', 'client summary'
        ]
        
        # Company/recruiter indicators
        self.recruiter_indicators = [
            'recruiter', 'talent', 'hr', 'human resources', 'hiring manager',
            'recruitment', 'staffing', 'agency', 'headhunter', 'sourcer'
        ]
        
        # Job description patterns (strong, specific indicators)
        self.job_patterns = [
            r'minimum\s+qualifications',
            r'must-have',
            r'job\s+description',
            r'what\s+you\s+will\s+bring',
            r'pay\s+rate',
            r'bill\s+rate',
            r'role\s+details:',
            r'interview\s+type:',
            r'requirements:',
            r'qualifications:',
            r'responsibilities:',
            r'experience\s+required',
            r'skills\s+needed',
            r'tech\s+stack',
            r'technologies:',
            r'client\s+need',
            r'client\s+summary',
            r'key\s+details:',
            r'looking\s+for\s+.*\s+developer',
            r'looking\s+for\s+.*\s+engineer',
            r'currently\s+looking\s+for',
            r'support\s+our\s+client',
            r'software\s+engineer',
            r'backend\s+developer',
            r'frontend\s+developer',
            r'full\s+stack\s+developer'
        ]
        
        # Email subject patterns
        self.subject_patterns = [
            r'job\s+opportunity',
            r'position\s+available',
            r'hiring\s+.*\s+developer',
            r'hiring\s+.*\s+engineer',
            r'new\s+role',
            r'career\s+opportunity',
            r'job\s+opening',
            r'vacancy',
            r'position\s+opening'
        ]
    
    def is_job_email(self, email_content: str, subject: str = "", sender: str = "") -> Tuple[bool, float, Dict]:
        """
        Determine if an email is job-related.
        
        Args:
            email_content: Full email content
            subject: Email subject line
            sender: Sender email/name
            
        Returns:
            Tuple of (is_job_email, confidence_score, detection_details)
        """
        email_lower = email_content.lower()
        subject_lower = subject.lower()
        sender_lower = sender.lower()
        
        score = 0.0
        max_score = 100.0
        details = {
            'keyword_matches': [],
            'pattern_matches': [],
            'subject_matches': [],
            'sender_indicators': []
        }
        
        # Check for job keywords in content
        for keyword in self.job_keywords:
            if keyword in email_lower:
                score += 2.0
                details['keyword_matches'].append(keyword)
        
        # Check for job patterns
        for pattern in self.job_patterns:
            if re.search(pattern, email_lower):
                # Extra high weight for the most specific job indicators
                if pattern in [r'minimum\s+qualifications', r'must-have', r'job\s+description', r'what\s+you\s+will\s+bring', r'pay\s+rate', r'bill\s+rate', r'role\s+details:', r'interview\s+type:']:
                    score += 15.0
                else:
                    score += 5.0
                details['pattern_matches'].append(pattern)
        
        # Check subject line
        for pattern in self.subject_patterns:
            if re.search(pattern, subject_lower):
                score += 8.0
                details['subject_matches'].append(pattern)
        
        # Check sender indicators
        for indicator in self.recruiter_indicators:
            if indicator in sender_lower:
                score += 3.0
                details['sender_indicators'].append(indicator)
        
        # Additional heuristics
        if 'client:' in email_lower or 'client need' in email_lower:
            score += 15.0
            details['pattern_matches'].append('client_mention')
        
        if 'bill rate' in email_lower or 'hourly rate' in email_lower:
            score += 8.0
            details['pattern_matches'].append('rate_mention')
        
        if 'duration:' in email_lower or 'contract length' in email_lower:
            score += 6.0
            details['pattern_matches'].append('duration_mention')
        
        # Strong indicators for job emails
        if 'looking for' in email_lower and ('developer' in email_lower or 'engineer' in email_lower):
            score += 20.0
            details['pattern_matches'].append('looking_for_developer')
        
        if 'support our client' in email_lower:
            score += 15.0
            details['pattern_matches'].append('support_client')
        
        if 'key details:' in email_lower:
            score += 10.0
            details['pattern_matches'].append('key_details')
        
        if 'software engineer' in email_lower:
            score += 12.0
            details['pattern_matches'].append('software_engineer')
        
        # Check for technical skills mentioned
        tech_skills = ['react', 'python', 'java', 'javascript', 'aws', 'docker', 'kubernetes', 'sql', 'node.js', 'angular', 'vue', 'shopify', 'salesforce']
        tech_count = sum(1 for skill in tech_skills if skill in email_lower)
        if tech_count >= 2:
            score += tech_count * 2.0
            details['keyword_matches'].extend([skill for skill in tech_skills if skill in email_lower])
        
        # Normalize score
        confidence = min(score / max_score, 1.0)
        
        # Determine if it's a job email (threshold can be adjusted)
        is_job = confidence >= 0.2  # Lower threshold to 20% for better detection
        
        return is_job, confidence, details
    
    def get_job_context(self, email_content: str) -> Dict:
        """
        Extract basic job context for quick preview.
        """
        email_lower = email_content.lower()
        context = {
            'job_title': '',
            'company': '',
            'location': '',
            'duration': '',
            'rate': ''
        }
        
        # Try to extract job title
        title_patterns = [
            r'position:\s*([^\n]+)',
            r'role:\s*([^\n]+)',
            r'job\s+title:\s*([^\n]+)',
            r'hiring\s+([^,\n]+)',
            r'looking\s+for\s+([^,\n]+)'
        ]
        
        for pattern in title_patterns:
            match = re.search(pattern, email_lower)
            if match:
                context['job_title'] = match.group(1).strip().title()
                break
        
        # Try to extract company
        company_patterns = [
            r'client:\s*([^\n]+)',
            r'company:\s*([^\n]+)',
            r'client\s+summary.*?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'
        ]
        
        for pattern in company_patterns:
            match = re.search(pattern, email_lower)
            if match:
                context['company'] = match.group(1).strip()
                break
        
        # Try to extract location
        location_patterns = [
            r'location:\s*([^\n]+)',
            r'remote',
            r'onsite',
            r'hybrid'
        ]
        
        for pattern in location_patterns:
            match = re.search(pattern, email_lower)
            if match:
                context['location'] = match.group(1).strip() if match.groups() else pattern
                break
        
        # Try to extract duration
        duration_patterns = [
            r'duration:\s*([^\n]+)',
            r'contract\s+length:\s*([^\n]+)',
            r'(\d+\s*(?:months?|weeks?|years?))'
        ]
        
        for pattern in duration_patterns:
            match = re.search(pattern, email_lower)
            if match:
                context['duration'] = match.group(1).strip()
                break
        
        # Try to extract rate
        rate_patterns = [
            r'bill\s+rate:\s*([^\n]+)',
            r'hourly\s+rate:\s*([^\n]+)',
            r'(\$\d+(?:-\d+)?\s*(?:per\s+hour|hr|hourly))'
        ]
        
        for pattern in rate_patterns:
            match = re.search(pattern, email_lower)
            if match:
                context['rate'] = match.group(1).strip()
                break
        
        return context

# Example usage
if __name__ == "__main__":
    detector = JobEmailDetector()
    
    # Test job email
    test_email = """
    Client: Nordic Naturals
    
    Nordic Naturals sells vitamins and supplements including animal oils, fish oils, and marine animal oils. Their products are for the skin, bones, and joints.
    
    Location: 100% remote manager is based in Watsonville
    Duration: 4 - 5 months (could extend)
    Bill Rate: 60 to 65/hr
    Part-time Hours: 20 - 30 a week
    
    Client Need Summary - Web Developer (Part-Time Contract)
    
    The client is seeking a senior-level front-end web developer to support their main website.
    
    Current Tech Stack:
    - CMS: WordPress
    - eCommerce: Shopify
    - Frontend: GatsbyJS - they will be moving to Hydrogen soon
    """
    
    is_job, confidence, details = detector.is_job_email(test_email, "Web Developer Position - React/Shopify")
    context = detector.get_job_context(test_email)
    
    print(f"Is Job Email: {is_job}")
    print(f"Confidence: {confidence:.2%}")
    print(f"Context: {context}")
    print(f"Details: {details}")
