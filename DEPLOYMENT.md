# 🚀 Firki Extension Deployment Guide

## **Step 1: Deploy Python Backend**

### Option A: Railway (Recommended - Free Tier)
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub"
3. Connect your GitHub account and select this repository
4. Add environment variables:
   - `GEMINI_API_KEY` = your Gemini API key
   - `OPENAI_API_KEY` = your OpenAI API key
   - `PORT` = 5000
5. Deploy and copy the generated URL (e.g., `https://firki-backend.railway.app`)

### Option B: Render (Alternative - Free Tier)
1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub and select this repository
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `python app.py`
6. Add environment variables (same as Railway)
7. Deploy and copy the URL

## **Step 2: Update Frontend Configuration**

1. Open `config.js`
2. Replace `https://your-backend-url.railway.app` with your actual backend URL
3. Add your API keys:
   ```javascript
   GEMINI_API_KEY: 'your_actual_gemini_key',
   OPENAI_API_KEY: 'your_actual_openai_key',
   ```

## **Step 3: Package Chrome Extension**

1. Create a ZIP file with these files:
   ```
   manifest.json
   content.js
   ui.js
   popup.html
   popup.js
   config.js
   auth.js
   background.js
   boolean-search.js
   skill-context-helper.js
   intelligent-jd-parser.js
   gemini-context-analyzer.js
   backend-connector.js
   analytics.js
   icons/
   ```

2. Name it `firki-extension.zip`

## **Step 4: Install Extension for Beta Testers**

### For Each Beta Tester:
1. Send them the `firki-extension.zip` file
2. Ask them to:
   - Unzip the file
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked" and select the unzipped folder
   - The extension should appear in their extensions list

## **Step 5: Test the Deployment**

1. **Backend Test**: Visit `https://your-backend-url.railway.app/health`
   - Should return: `{"status": "healthy", "service": "Firki AI Backend"}`

2. **Extension Test**:
   - Open Gmail
   - Look for the Firki button (✉️) in the top-right
   - Click it and test with a job description

## **Step 6: Monitor Analytics**

1. Visit `https://your-backend-url.railway.app/analytics-dashboard.html`
2. This shows usage statistics from your beta testers

## **Troubleshooting**

### Backend Issues:
- Check Railway/Render logs for errors
- Verify environment variables are set correctly
- Test locally first: `python app.py`

### Extension Issues:
- Check Chrome DevTools console for errors
- Verify backend URL in `config.js`
- Test with a simple job description

### Common Problems:
- **CORS errors**: Backend URL not set correctly
- **API errors**: Missing or invalid API keys
- **Extension not loading**: Missing files in ZIP

## **Next Steps After Beta**

1. Collect feedback from your 10 testers
2. Fix any issues found
3. Prepare for Chrome Web Store submission
4. Set up proper domain and SSL certificates
5. Consider upgrading to paid hosting for production

## **Security Notes**

- Never commit API keys to GitHub
- Use environment variables for all sensitive data
- Consider rate limiting for production
- Monitor usage to avoid API cost overruns
