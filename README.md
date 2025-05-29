# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/4acd0a21-d415-4346-8fad-2cb5602ee44c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4acd0a21-d415-4346-8fad-2cb5602ee44c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4acd0a21-d415-4346-8fad-2cb5602ee44c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# YouTube Video Processing Setup

## Google YouTube Data API v3 Configuration

To enable proper YouTube transcript extraction, you need to set up the Google YouTube Data API:

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **YouTube Data API v3**

### 2. Create API Key
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Copy the generated API key
4. (Optional) Restrict the key to YouTube Data API v3 for security

### 3. Configure in Supabase
Add the API key to your Supabase Edge Function environment:

```bash
# In your Supabase dashboard, go to Settings > Edge Functions
# Add this environment variable:
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 4. Features Enabled
With the API key configured, your YouTube processing will:
- ✅ Extract real video titles and descriptions  
- ✅ Access caption/transcript data when available
- ✅ Handle multiple transcript languages
- ✅ Fallback to page scraping if API fails
- ✅ Support YouTube Shorts URLs
- ✅ Better error handling and logging

### 5. Without API Key
The system will still work without an API key by:
- Using page scraping methods
- Extracting basic video information
- Attempting transcript extraction from page data
- Providing fallback content when transcripts aren't available

### 6. Deploy Edge Function
Deploy the enhanced YouTube processing function to Supabase:

```bash
# Deploy the enhanced YouTube processing function
supabase functions deploy process-youtube

# Set the environment variable (if you have the API key)
supabase secrets set YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 7. Testing the Implementation
You can test the enhanced YouTube processing by:
1. Going to your project's Overview section
2. Using the "Import New" tab
3. Adding a YouTube video URL (regular videos or Shorts)
4. Monitoring the console logs for transcript extraction details

The system will automatically:
- Extract video title and description
- Attempt multiple transcript extraction methods
- Generate embeddings for all content
- Provide detailed feedback about transcript availability

## 💰 Cost Optimization

Your implementation is designed to be **cost-effective**:

### Free Daily Quota
- **10,000 units/day** free with Google API
- **Video metadata:** ~1 unit per video  
- **Most videos:** Only use 1 unit (just metadata)
- **~10,000 videos/day** within free tier

### Built-in Cost Optimizations
1. **🚀 Smart Caching:** Videos are cached - no repeat API calls
2. **🆓 Free Transcript Extraction:** Uses page scraping instead of expensive caption API
3. **📊 Minimal API Usage:** Only fetches essential metadata via API
4. **⚡ Fallback Strategy:** Works completely free without API key

### Expected Costs
- **0-10,000 videos/month:** $0 (free tier)
- **10,000+ videos/month:** ~$0.10 per 1,000 additional videos
- **Example:** 50,000 videos/month = ~$4/month

### Usage Monitoring
Monitor your API usage at [Google Cloud Console → APIs & Services → YouTube Data API v3](https://console.cloud.google.com/)

---
