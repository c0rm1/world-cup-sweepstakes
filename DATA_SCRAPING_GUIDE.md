# World Cup 2026 Data Scraping Guide

## Overview
This guide explains how to scrape World Cup 2026 match data from FIFA.com to update your sweepstakes tracker.

## Data Sources from FIFA.com

### Primary URL
**Main Page:** `https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026`

**Fixtures & Results:** `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums`

### Key Data Available
- ✅ Live match results
- ✅ Group standings
- ✅ Match fixtures and schedules
- ✅ Team statistics (goals, cards, etc.)
- ✅ Knockout bracket progression

## Scraping Methods

### Option 1: FIFA Official API (Recommended)
FIFA likely exposes data through their internal APIs. You can inspect network requests:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to FIFA World Cup 2026 pages
4. Look for XHR/Fetch requests to endpoints like:
   - `*.fifa.com/api/*`
   - `gameday-prod.fifa.mangodev.co.uk/*`
   - Look for JSON responses with match data

### Option 2: Web Scraping with Python

#### Required Libraries
```bash
pip install requests beautifulsoup4 selenium
```

#### Basic Scraping Script
```python
import requests
from bs4 import BeautifulSoup
import json

# Example: Scraping match data
def scrape_fifa_matches():
    url = "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Parse match data (structure will vary)
    # Look for match containers, scores, team names
    
    return matches

# For dynamic content, use Selenium
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

def scrape_with_selenium():
    driver = webdriver.Chrome()
    driver.get("https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026")
    
    # Wait for content to load
    WebDriverWait(driver, 10).until(
        lambda d: d.find_element(By.CLASS_NAME, "match-container")
    )
    
    # Extract data
    matches = driver.find_elements(By.CLASS_NAME, "match-item")
    
    driver.quit()
    return matches
```

### Option 3: Alternative APIs

#### API-Football (api-football.com)
- Free tier: 100 requests/day
- Endpoint: `https://v3.football.api-sports.io/`
- Requires API key (free registration)

```python
import requests

API_KEY = "your_api_key_here"
headers = {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io'
}

# Get World Cup fixtures
url = "https://v3.football.api-sports.io/fixtures"
params = {
    'league': 1,  # World Cup league ID
    'season': 2026
}

response = requests.get(url, headers=headers, params=params)
data = response.json()
```

#### TheSportsDB API (Free)
```python
# Get World Cup events
url = "https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=4429"
response = requests.get(url)
matches = response.json()
```

## Data Structure Needed

Based on your [`script.js`](script.js:1), you need:

```javascript
{
  "groups": {
    "A": {
      "teams": [
        {
          "code": "USA",
          "played": 3,
          "won": 2,
          "drawn": 1,
          "lost": 0,
          "goalsFor": 5,
          "goalsAgainst": 2,
          "points": 7,
          "yellowCards": 3
        }
      ]
    }
  },
  "matches": [
    {
      "matchNum": 1,
      "team1": "USA",
      "team2": "MEX",
      "score1": 2,
      "score2": 1,
      "group": "A",
      "round": "group"
    }
  ]
}
```

## Integration Steps

### 1. Create Data Fetcher Script
```javascript
// fetch-data.js
async function fetchWorldCupData() {
    const response = await fetch('YOUR_API_ENDPOINT');
    const data = await response.json();
    
    // Transform to your format
    const transformedData = transformData(data);
    
    // Save to file or update directly
    return transformedData;
}
```

### 2. Update Your script.js
Add a data refresh function:

```javascript
async function updateMatchData() {
    try {
        const response = await fetch('data/worldcup-data.json');
        const data = await response.json();
        
        // Update groups
        Object.assign(groups, data.groups);
        
        // Update matches
        matches = data.matches;
        
        // Re-render
        renderGroups();
        renderKnockoutBracket();
        renderLeagueTable();
    } catch (error) {
        console.error('Failed to update data:', error);
    }
}

// Call on page load and periodically
document.addEventListener('DOMContentLoaded', () => {
    updateMatchData();
    setInterval(updateMatchData, 300000); // Every 5 minutes
});
```

### 3. Automated Updates

#### Using GitHub Actions
Create `.github/workflows/update-data.yml`:

```yaml
name: Update World Cup Data

on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: pip install requests beautifulsoup4
      
      - name: Scrape data
        run: python scrape-worldcup.py
      
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add data/worldcup-data.json
          git commit -m "Update World Cup data" || exit 0
          git push
```

## Legal & Ethical Considerations

⚠️ **Important:**
- Check FIFA.com's `robots.txt` and Terms of Service
- Respect rate limits (don't hammer the server)
- Add delays between requests (1-2 seconds minimum)
- Use proper User-Agent headers
- Consider using official APIs when available
- Cache data to minimize requests

## Recommended Approach

**For your use case, I recommend:**

1. **Start with API-Football** (free tier)
   - Most reliable
   - Structured data
   - Legal and supported

2. **Fallback to FIFA.com scraping** if needed
   - Use Selenium for dynamic content
   - Implement proper error handling
   - Cache aggressively

3. **Manual updates** as last resort
   - Create a simple admin interface
   - Update JSON file manually after matches

## Next Steps

1. Choose your data source
2. Set up scraping script
3. Create data transformation logic
4. Integrate with your existing site
5. Set up automated updates
6. Test thoroughly before tournament starts

## Sample Data File Structure

Create `data/worldcup-data.json`:
```json
{
  "lastUpdated": "2026-06-15T12:00:00Z",
  "groups": { ... },
  "matches": [ ... ],
  "knockoutBracket": { ... }
}
```

## Questions?

If you need help with:
- Setting up specific scraping scripts
- API integration
- Automated deployment
- Data transformation

Just ask!