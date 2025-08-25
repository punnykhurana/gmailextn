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

## 📁 File Structure

```
gmailextn/
├── manifest.json              # Chrome extension configuration
├── background.js              # Background service worker
├── content.js                 # Gmail page integration
├── popup.html                 # Extension popup UI
├── popup.js                   # Popup functionality
├── auth.js                    # Gmail authentication
├── ui.js                      # Main sidebar UI
├── config.js                  # Configuration settings
├── boolean-search.js          # Boolean search generation
├── intelligent-jd-parser.js   # Job description parsing
├── skill-context-helper.js    # Skill context information
├── gemini-context-analyzer.js # AI-powered analysis
└── icons/                     # Extension icons
```

## 🔧 Setup

### 1. **Install Extension**
- Load the extension folder in Chrome Developer Mode
- Navigate to `chrome://extensions/`
- Enable "Developer mode" and click "Load unpacked"

### 2. **Configure API Keys**
- Add your Gemini API key in `config.js`
- The extension will use AI-powered analysis for better results

### 3. **Use in Gmail**
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