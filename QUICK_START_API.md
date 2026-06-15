# 🚀 Quick Start: API-Football Integration

## What You Have Now

✅ **Python scraper** ([`scrape-worldcup.py`](scrape-worldcup.py:1)) - Fetches live World Cup data  
✅ **GitHub Actions workflow** ([`.github/workflows/update-data.yml`](.github/workflows/update-data.yml:1)) - Auto-updates every 30 minutes  
✅ **Data directory** (`data/`) - Stores match results and standings  
✅ **Setup guide** ([`API_FOOTBALL_SETUP.md`](API_FOOTBALL_SETUP.md:1)) - Detailed instructions  

## 3-Step Setup

### Step 1: Get Your Free API Key (2 minutes)

1. Go to **https://www.api-football.com/**
2. Click **"Sign Up"** and choose the **FREE plan**
3. Verify your email
4. Copy your API key from the dashboard

### Step 2: Add API Key to GitHub (1 minute)

1. Go to your GitHub repo: **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Name: `API_FOOTBALL_KEY`
4. Value: Paste your API key
5. Click **"Add secret"**

### Step 3: Test It! (1 minute)

**Option A: Test Locally**
```bash
# Install Python dependency
pip install requests

# Edit scrape-worldcup.py and add your API key on line 13
# Then run:
python3 scrape-worldcup.py
```

**Option B: Test on GitHub**
1. Go to **Actions** tab in your repo
2. Click **"Update World Cup Data"** workflow
3. Click **"Run workflow"** → **"Run workflow"**
4. Wait ~30 seconds
5. Check if `data/worldcup-data.json` was updated

## How It Works

```
┌─────────────────┐
│  API-Football   │  ← Free API with World Cup data
└────────┬────────┘
         │
         │ Every 30 minutes
         ↓
┌─────────────────┐
│ GitHub Actions  │  ← Runs scrape-worldcup.py automatically
└────────┬────────┘
         │
         │ Updates
         ↓
┌─────────────────┐
│ worldcup-data   │  ← JSON file with latest results
│     .json       │
└────────┬────────┘
         │
         │ Loads on page
         ↓
┌─────────────────┐
│  Your Website   │  ← Shows live data to users
└─────────────────┘
```

## What Gets Updated Automatically

- ✅ Match scores (as games finish)
- ✅ Group standings (points, goals, etc.)
- ✅ Match status (scheduled, live, finished)
- ✅ Knockout bracket progression

## Free Plan Limits

- **100 requests per day**
- Running every 30 minutes = **48 requests/day** ✅
- Plenty of headroom for the entire tournament!

## Customization

### Change Update Frequency

Edit [`.github/workflows/update-data.yml`](.github/workflows/update-data.yml:6):

```yaml
# Every 15 minutes (96 requests/day)
- cron: '*/15 * * * *'

# Every hour (24 requests/day)
- cron: '0 * * * *'

# Only during match hours (customize times)
- cron: '*/30 12-22 * * *'  # 12pm-10pm UTC
```

### Add More Data

The API provides tons of data! Edit [`scrape-worldcup.py`](scrape-worldcup.py:1) to add:
- Player statistics
- Team lineups
- Match events (goals, cards, substitutions)
- Head-to-head records

See [API-Football docs](https://www.api-football.com/documentation-v3) for all endpoints.

## Troubleshooting

### "API request failed"
- ✅ Check your API key is correct in GitHub Secrets
- ✅ Verify you haven't exceeded 100 requests/day
- ✅ Wait a few minutes and try again

### "No data appearing on site"
- ✅ Make sure `data/worldcup-data.json` exists
- ✅ Check browser console for errors (F12)
- ✅ Verify the file is being served (visit: `https://your-site.com/data/worldcup-data.json`)

### "Workflow not running"
- ✅ Check Actions tab for errors
- ✅ Verify `API_FOOTBALL_KEY` secret is set
- ✅ Make sure workflow file is in `.github/workflows/`

## Next Steps

1. **Test the scraper** - Run it locally or trigger GitHub Action
2. **Verify data format** - Check `data/worldcup-data.json` looks correct
3. **Update your site** - Modify [`script.js`](script.js:1) to load the JSON data
4. **Monitor during tournament** - Check Actions tab to see updates happening

## Files Created

```
sweepstakes/
├── scrape-worldcup.py          # Main scraper script
├── requirements.txt             # Python dependencies
├── .gitignore                   # Ignore Python cache files
├── data/
│   └── worldcup-data.json      # Live match data (auto-updated)
├── .github/
│   └── workflows/
│       └── update-data.yml     # GitHub Actions automation
├── API_FOOTBALL_SETUP.md       # Detailed setup guide
└── QUICK_START_API.md          # This file!
```

## Support

- 📖 **Detailed Guide**: [`API_FOOTBALL_SETUP.md`](API_FOOTBALL_SETUP.md:1)
- 🌐 **API Docs**: https://www.api-football.com/documentation-v3
- 💬 **Need Help?** Just ask!

---

**Ready?** Get your API key and let's go! 🚀⚽