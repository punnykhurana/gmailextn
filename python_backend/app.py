from flask import Flask, request, jsonify
from flask_cors import CORS
from services.skill_extractor import SkillExtractor
from services.boolean_generator import BooleanGenerator
from dotenv import load_dotenv
import os
import json
from datetime import datetime

load_dotenv()

app = Flask(__name__)
skill_extractor = SkillExtractor()
CORS(app)
analytics_data = []

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "Firki AI Backend"})

@app.route('/analytics', methods=['POST'])
def collect_analytics():
    try:
        data = request.get_json()
        if not data or 'events' not in data:
            return jsonify({'error': 'Invalid data format'}), 400
        
        # Add timestamp to each event
        for event in data['events']:
            event['timestamp'] = datetime.now().isoformat()
        
        analytics_data.extend(data['events'])
        
        # Keep only last 1000 events to prevent memory issues
        if len(analytics_data) > 1000:
            analytics_data[:] = analytics_data[-1000:]
        
        return jsonify({'success': True, 'events_processed': len(data['events'])})
    except Exception as e:
        print(f"Error collecting analytics: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/analytics/summary', methods=['GET'])
def get_analytics_summary():
    try:
        total_events = len(analytics_data)
        
        # Group by session
        sessions = {}
        for event in analytics_data:
            session_id = event.get('sessionId', 'unknown')
            if session_id not in sessions:
                sessions[session_id] = {'start': event.get('timestamp'), 'events': 0}
            sessions[session_id]['events'] += 1
        
        # Count search generation events
        search_events = [e for e in analytics_data if e.get('eventName') == 'search_generation']
        ai_events = [e for e in analytics_data if e.get('eventName') == 'ai_performance']
        
        # Feature usage breakdown
        feature_usage = {}
        for event in analytics_data:
            feature = event.get('eventName', 'unknown')
            feature_usage[feature] = feature_usage.get(feature, 0) + 1
        
        return jsonify({
            'total_events': total_events,
            'sessions': len(sessions),
            'search_generated': len(search_events),
            'ai_performance': len(ai_events),
            'feature_usage': feature_usage,
            'last_updated': datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Error getting analytics summary: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-jd', methods=['POST'])
def analyze_job_description():
    try:
        data = request.get_json()
        job_title = data.get('job_title', '')
        job_description = data.get('job_description', '')
        
        if not job_description:
            return jsonify({'error': 'Job description is required'}), 400
        
        skills = skill_extractor.extract_skills(job_description, job_title)
        ai_context = ""
        ai_boolean = ""
        
        try:
            from services.dynamic_recruiter import DynamicRecruiterTool
            dynamic_tool = DynamicRecruiterTool()
            ai_result = dynamic_tool.analyze_job_dynamically(job_description, job_title)
            
            if ai_result.get('extractionMethod') == 'ai_dynamic_analysis':
                ai_context = ai_result.get('keySkillContext', '')
                ai_boolean = ai_result.get('booleanString', '')
        except Exception as e:
            print(f"Dynamic recruiter tool failed: {e}")
        
        if ai_boolean:
            boolean_search = ai_boolean
        else:
            boolean_generator = BooleanGenerator()
            boolean_search = boolean_generator.generate_boolean_search(skills, job_title)
        
        response = {
            'success': True,
            'data': {
                'skills': skills,
                'boolean_search': boolean_search,
                'extraction_method': skill_extractor.last_method_used,
                'ai_context': ai_context,
                'ai_boolean_used': bool(ai_boolean)
            }
        }
        return jsonify(response)
    except Exception as e:
        print(f"Error analyzing job description: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Use production settings
    app.run(host='0.0.0.0', port=port) 