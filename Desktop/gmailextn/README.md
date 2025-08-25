# Firki - AI-Powered Recruitment Assistant

A streamlined Chrome extension that helps recruiters generate intelligent boolean search queries from Gmail job descriptions and redirect to LinkedIn for candidate sourcing.

## 🎯 Core Features

### 1. **Gmail Integration**
- Automatically detects when you're viewing job emails in Gmail
- Extracts job descriptions and requirements
- Works seamlessly within the Gmail interface

### 2. **AI-Powered Analysis**
- Uses Google Gemini API for intelligent skill extraction
- Identifies key technical skills and requirements
- Provides contextual information for specialized skills

### 3. **Boolean Search Generation**
- Creates optimized LinkedIn boolean search queries
- Focuses on technical skills (avoids location-based searches)
- Generates searches like: `"Workday" AND ("Data Conversion" OR "Data Migration")`

### 4. **LinkedIn Integration**
- One-click redirect to LinkedIn with generated search
- Opens search results in a new tab
- Streamlines the candidate sourcing workflow

## 🚀 User Flow

1. **First Time Use**: Click Firki button → Sign in with Gmail
2. **Daily Use**: Open job email → Click Firki → Generate boolean search → Click LinkedIn button
3. **Result**: Find relevant candidates on LinkedIn with optimized search

## 📁 Project Structure

```
gmailextn/
├── backend/                    # Python Flask backend
│   ├── app.py                 # Main Flask application
│   ├── services/              # Backend services
│   │   ├── boolean_generator.py
│   │   ├── context_analyzer.py
│   │   ├── dynamic_recruiter.py
│   │   ├── job_email_detector.py
│   │   └── skill_extractor.py
│   └── requirements.txt       # Python dependencies
├── gmail-extension/           # Chrome extension files
│   ├── manifest.json          # Extension configuration
│   ├── background.js          # Background service worker
│   ├── content.js             # Gmail page integration
│   ├── popup.html             # Extension popup UI
│   ├── popup.js               # Popup functionality
│   ├── auth.js                # Gmail authentication
│   ├── ui.js                  # Main sidebar UI
│   ├── config.js              # Configuration settings
│   ├── boolean-search.js      # Boolean search generation
│   ├── intelligent-jd-parser.js # Job description parsing
│   ├── skill-context-helper.js # Skill context information
│   ├── gemini-context-analyzer.js # AI-powered analysis
│   └── icons/                 # Extension icons
├── web-application/           # Next.js web application
│   ├── src/
│   │   ├── app/              # Next.js app directory
│   │   ├── components/       # React components
│   │   └── lib/              # Utility libraries
│   ├── package.json          # Node.js dependencies
│   └── tailwind.config.ts    # Tailwind CSS configuration
├── marketing-website/         # Simple marketing landing page
└── firki-extension-v2.0.4.zip # Packaged extension
```

## 🔧 Setup

### 1. **Install Extension**
- Load the extension folder in Chrome Developer Mode
- Navigate to `chrome://extensions/`
- Enable "Developer mode" and click "Load unpacked"
- Select the `gmail-extension` folder

### 2. **Configure API Keys**
- Open `gmail-extension/config.js`
- Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key
- Replace `YOUR_OPENAI_API_KEY_HERE` with your actual OpenAI API key
- Get your API keys from:
  - Gemini: https://makersuite.google.com/app/apikey
  - OpenAI: https://platform.openai.com/api-keys
- The extension will use AI-powered analysis for better results

### 3. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 4. **Web Application Setup**
```bash
cd web-application
npm install
npm run dev
```

### 5. **Use in Gmail**
- Open Gmail and navigate to a job email
- Click the Firki extension icon
- The sidebar will appear with job analysis and boolean search

## 💡 How It Works

### **Skill Extraction**
- Parses job descriptions using intelligent algorithms
- Identifies technical skills, platforms, and requirements
- Uses AI to infer skills from job titles when descriptions are minimal

### **Boolean Search Generation**
- Combines extracted skills with logical operators
- Prioritizes technical skills over general requirements
- Creates LinkedIn-optimized search queries

### **Context Analysis**
- Provides contextual information for specialized skills
- Explains where/how skills are typically used
- Helps recruiters understand unfamiliar technologies

## 🎨 UI Design

- **Clean, modern interface** with white and purple theme
- **Responsive sidebar** that integrates seamlessly with Gmail
- **Intuitive workflow** from job analysis to LinkedIn search
- **Professional appearance** suitable for business use

## 🔒 Privacy & Security

- **No data storage** of job descriptions or personal information
- **Local processing** of email content
- **Secure API calls** to Gemini for AI analysis
- **Gmail authentication** only for basic user verification

## 🚀 Future Enhancements

- User feedback collection for search quality
- Admin dashboard for usage analytics
- Integration with other job boards
- Advanced search optimization algorithms

## 📞 Support

For questions or issues, please refer to the extension's popup interface or check the browser console for debugging information.

---

**Firki** - Making recruitment sourcing faster, smarter, and more effective. 🎯
