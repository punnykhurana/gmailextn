# Firki AI Backend - Python Version

This is a Python backend implementation of the Firki AI skill extraction and boolean search generation system. It provides the same functionality as the JavaScript version but with enhanced NLP capabilities and AI integration.

## Features

- **Multi-Strategy Skill Extraction**: Uses AI (Gemini/OpenAI), NLP (spaCy), and rule-based approaches
- **Intelligent Boolean Search Generation**: Creates recruiter-friendly boolean search queries
- **Context Analysis**: Provides probing questions and skill context for interviews
- **Fallback Mechanisms**: Works even when AI services are unavailable
- **RESTful API**: Flask-based endpoints for easy integration

## Architecture

```
python_backend/
├── app.py                 # Main Flask application
├── services/
│   ├── skill_extractor.py    # Skill extraction logic
│   ├── boolean_generator.py  # Boolean search generation
│   └── context_analyzer.py   # Skill context and probing questions
├── test_backend.py        # Test script
└── requirements.txt       # Python dependencies
```

## Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Download spaCy model:**
   ```bash
   python -m spacy download en_core_web_sm
   ```

3. **Set up environment variables** (optional, for AI features):
   ```bash
   export OPENAI_API_KEY="your_openai_key"
   export GEMINI_API_KEY="your_gemini_key"
   ```

## Usage

### 1. Test the Backend (Recommended First Step)

```bash
cd python_backend
python test_backend.py
```

This will test all functionality without requiring API keys.

### 2. Start the Flask Server

```bash
cd python_backend
python app.py
```

The server will start on `http://localhost:5000`

### 3. API Endpoints

- `GET /health` - Health check
- `POST /api/analyze-jd` - Analyze job description and extract skills
- `POST /api/generate-boolean` - Generate boolean search from skills
- `POST /api/skill-context` - Get context for specific skills

### 4. Example API Usage

```bash
# Analyze a job description
curl -X POST http://localhost:5000/api/analyze-jd \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Looking for a Workday Data Conversion Specialist with HCM experience",
    "job_title": "Workday Data Conversion Specialist"
  }'
```

## Key Advantages Over JavaScript Version

### 1. **Enhanced NLP Capabilities**
- **spaCy Integration**: Advanced named entity recognition and dependency parsing
- **NLTK Support**: Comprehensive natural language processing tools
- **TextBlob**: Sentiment analysis and part-of-speech tagging

### 2. **Multiple AI Fallback Strategies**
- **Primary**: Google Gemini (fastest, most cost-effective)
- **Secondary**: OpenAI GPT (high quality, reliable)
- **Tertiary**: Rule-based NLP extraction
- **Fallback**: Keyword matching and job title inference

### 3. **Better Skill Extraction**
- **Pattern Recognition**: Regex-based technical term detection
- **Entity Recognition**: Identifies technologies, frameworks, and tools
- **Context Awareness**: Understands skill relationships and hierarchies

### 4. **Intelligent Boolean Generation**
- **AI-Powered**: Generates contextually appropriate boolean queries
- **Validation**: Checks for balanced parentheses and proper syntax
- **Recruiter-Friendly**: Optimized for LinkedIn and ATS systems

### 5. **Rich Context Analysis**
- **Probing Questions**: One specific behavioral question per skill
- **Skill Descriptions**: Clear explanations of technical competencies
- **Key Areas**: Related technical domains and sub-skills

## Performance Characteristics

- **With AI APIs**: 2-5 seconds response time, highest accuracy
- **NLP Only**: 1-2 seconds response time, good accuracy
- **Fallback Mode**: <1 second response time, basic accuracy
- **Memory Usage**: ~200MB (includes spaCy model)
- **CPU Usage**: Low during idle, moderate during processing

## Error Handling

The system gracefully degrades when services are unavailable:
1. **API Keys Missing**: Falls back to NLP and rule-based approaches
2. **AI Service Down**: Automatically switches to alternative methods
3. **Model Loading Failures**: Uses basic keyword matching
4. **Network Issues**: Continues with local processing

## Testing

The `test_backend.py` script provides comprehensive testing:
- Skill extraction with various job descriptions
- Boolean search generation and validation
- Context analysis and probing questions
- Fallback functionality testing

## Future Enhancements

- **Model Caching**: Cache AI responses for similar queries
- **Batch Processing**: Handle multiple job descriptions simultaneously
- **Custom Training**: Fine-tune models on domain-specific data
- **Performance Metrics**: Track accuracy and response times
- **API Rate Limiting**: Intelligent throttling for AI services

## Troubleshooting

### Common Issues

1. **spaCy Model Not Found**
   ```bash
   python -m spacy download en_core_web_sm
   ```

2. **NLTK Data Missing**
   ```bash
   python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
   ```

3. **Import Errors**
   - Ensure you're in the `python_backend` directory
   - Check that all `__init__.py` files exist
   - Verify Python path includes current directory

4. **AI Services Not Working**
   - Check API keys in environment variables
   - Verify internet connectivity
   - Check API service status

### Performance Issues

- **Slow Response**: Check if AI services are responding
- **High Memory**: Restart the application periodically
- **CPU Spikes**: Monitor during heavy processing

## Comparison with JavaScript Version

| Feature | JavaScript | Python |
|---------|------------|---------|
| **NLP Capabilities** | Basic | Advanced (spaCy, NLTK) |
| **AI Integration** | Single API | Multiple APIs + Fallbacks |
| **Skill Extraction** | Pattern-based | AI + NLP + Rules |
| **Boolean Generation** | Template-based | AI + Rules + Validation |
| **Context Analysis** | Limited | Rich + Probing Questions |
| **Performance** | Fast | Moderate (AI overhead) |
| **Dependencies** | Light | Heavy (ML models) |
| **Deployment** | Browser extension | Server/API |

## Conclusion

The Python backend provides significantly enhanced NLP and AI capabilities compared to the JavaScript version, making it ideal for:
- **Production environments** requiring high accuracy
- **Research and development** of new features
- **Integration with existing Python systems**
- **Advanced skill analysis** and market insights

For browser extension use, the JavaScript version remains more appropriate due to its lightweight nature and client-side execution.
